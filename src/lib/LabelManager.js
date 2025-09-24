/**
 * LabelManager: Persistent, scalable chat label storage using IndexedDB + LRU cache.
 * Requirements: See prompt above.
 */

import { openDB } from "idb";

class LRUCache {
	constructor(maxSize = 100) {
		this.maxSize = maxSize;
		this.cache = new Map();
	}
	get(key) {
		if (!this.cache.has(key)) return undefined;
		const value = this.cache.get(key);
		this.cache.delete(key);
		this.cache.set(key, value);
		return value;
	}
	set(key, value) {
		if (this.cache.has(key)) this.cache.delete(key);
		else if (this.cache.size >= this.maxSize) {
			const oldestKey = this.cache.keys().next().value;
			this.cache.delete(oldestKey);
		}
		this.cache.set(key, value);
	}
	delete(key) {
		this.cache.delete(key);
	}
	clear() {
		this.cache.clear();
	}
	keys() {
		return Array.from(this.cache.keys());
	}
}

export class LabelManager {
	constructor({
		cacheSize = 100,
		pageSize = 50,
		cleanupFrequencyDays = 90,
		maxStorageWarningMB = 50,
		dbVersion = 1,
	} = {}) {
		this.cacheSize = cacheSize;
		this.pageSize = pageSize;
		this.cleanupFrequencyDays = cleanupFrequencyDays;
		this.maxStorageWarningMB = maxStorageWarningMB;
		this.dbVersion = dbVersion;
		this.cache = new LRUCache(cacheSize);
		this.dbPromise = this._initDB();
		this.syncQueue = [];
		this.isOnline = navigator.onLine;
		window.addEventListener("online", () => (this.isOnline = true));
		window.addEventListener("offline", () => (this.isOnline = false));
		this._startCleanup();
	}

	async _initDB() {
		try {
			return await openDB("ChatLabelsDB", this.dbVersion, {
				upgrade(db, oldVersion, newVersion, transaction) {
					if (!db.objectStoreNames.contains("labels")) {
						const store = db.createObjectStore("labels", {
							keyPath: "id",
							autoIncrement: true,
						});
						store.createIndex("n", "n", { unique: false }); // name
						store.createIndex("t", "t", { unique: false }); // createdAt
						store.createIndex("cat", "cat", { unique: false }); // category
						store.createIndex("lu", "lu", { unique: false }); // lastUsed
					}
					if (!db.objectStoreNames.contains("associations")) {
						db.createObjectStore("associations", {
							keyPath: "id",
							autoIncrement: true,
						});
					}
					if (!db.objectStoreNames.contains("metadata")) {
						db.createObjectStore("metadata", { keyPath: "key" });
					}
				},
			});
		} catch (err) {
			console.error("IndexedDB init error:", err);
			throw new Error("Failed to initialize label database.");
		}
	}

	// Data compression: short keys, remove empty/nulls
	_compressLabel(label) {
		const compressed = {};
		if (label.name) compressed.n = label.name;
		if (label.color) compressed.c = label.color;
		if (label.createdAt) compressed.t = label.createdAt;
		if (label.category) compressed.cat = label.category;
		if (label.lastUsed) compressed.lu = label.lastUsed;
		if (
			label.contacts &&
			Array.isArray(label.contacts) &&
			label.contacts.length
		)
			compressed.contacts = label.contacts;
		return compressed;
	}

	// Decompress for UI
	_decompressLabel(obj) {
		return {
			id: obj.id,
			name: obj.n,
			color: obj.c,
			createdAt: obj.t,
			category: obj.cat,
			lastUsed: obj.lu,
			contacts: obj.contacts || [],
		};
	}

	// Add single label
	async addLabel(label) {
		const db = await this.dbPromise;
		const compressed = this._compressLabel({
			...label,
			createdAt: label.createdAt || Date.now(),
			lastUsed: Date.now(),
		});
		const id = await db.add("labels", compressed);
		this.cache.set(id, compressed);
		return id;
	}

	// Bulk add labels
	async addLabels(labels) {
		const db = await this.dbPromise;
		const tx = db.transaction("labels", "readwrite");
		const store = tx.objectStore("labels");
		const ids = [];
		for (const label of labels) {
			const compressed = this._compressLabel({
				...label,
				createdAt: label.createdAt || Date.now(),
				lastUsed: Date.now(),
			});
			const id = await store.add(compressed);
			this.cache.set(id, compressed);
			ids.push(id);
		}
		await tx.done;
		return ids;
	}

	// Get label by id (cache first)
	async getLabel(id) {
		const cached = this.cache.get(id);
		if (cached) return this._decompressLabel({ ...cached, id });
		const db = await this.dbPromise;
		const obj = await db.get("labels", id);
		if (obj) this.cache.set(id, obj);
		return obj ? this._decompressLabel({ ...obj, id }) : null;
	}

	// Get labels paginated
	async getLabels(page = 0) {
		const db = await this.dbPromise;
		const tx = db.transaction("labels");
		const store = tx.objectStore("labels");
		const labels = [];
		let cursor = await store.openCursor();
		let skipped = 0;
		let count = 0;
		while (cursor && count < this.pageSize) {
			if (skipped < page * this.pageSize) {
				skipped++;
			} else {
				labels.push(
					this._decompressLabel({
						...cursor.value,
						id: cursor.primaryKey,
					})
				);
				count++;
			}
			cursor = await cursor.continue();
		}
		return labels;
	}

	// Search labels by name/category
	async searchLabels(query) {
		const db = await this.dbPromise;
		const tx = db.transaction("labels");
		const store = tx.objectStore("labels");
		const index = store.index("n");
		const results = [];
		let cursor = await index.openCursor();
		while (cursor) {
			if (
				cursor.value.n?.toLowerCase().includes(query.toLowerCase()) ||
				(cursor.value.cat &&
					cursor.value.cat
						.toLowerCase()
						.includes(query.toLowerCase()))
			) {
				results.push(
					this._decompressLabel({
						...cursor.value,
						id: cursor.primaryKey,
					})
				);
			}
			cursor = await cursor.continue();
		}
		return results;
	}

	// Associate contacts with label (lazy loaded)
	async associateContacts(labelId, contactIds) {
		const db = await this.dbPromise;
		const obj = await db.get("labels", labelId);
		if (!obj) throw new Error("Label not found");
		obj.contacts = Array.from(
			new Set([...(obj.contacts || []), ...contactIds])
		);
		obj.lu = Date.now();
		await db.put("labels", obj);
		this.cache.set(labelId, obj);
	}

	// Remove label
	async removeLabel(labelId) {
		const db = await this.dbPromise;
		await db.delete("labels", labelId);
		this.cache.delete(labelId);
	}

	// Background cleanup of old/unused labels
	_startCleanup() {
		setInterval(async () => {
			const db = await this.dbPromise;
			const tx = db.transaction("labels", "readwrite");
			const store = tx.objectStore("labels");
			const now = Date.now();
			let cursor = await store.openCursor();
			while (cursor) {
				const lastUsed = cursor.value.lu || cursor.value.t || 0;
				if (
					now - lastUsed >
					this.cleanupFrequencyDays * 24 * 60 * 60 * 1000
				) {
					cursor.delete();
				}
				cursor = await cursor.continue();
			}
			await tx.done;
		}, this.cleanupFrequencyDays * 24 * 60 * 60 * 1000);
	}

	// Debounced save (for bulk ops)
	_debounceSave = (() => {
		let timer = null;
		return (fn, delay = 500) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(fn, delay);
		};
	})();

	// Migration from localStorage
	async migrateFromLocalStorage() {
		if (!window.localStorage) return;
		const raw = localStorage.getItem("chatLabels");
		if (!raw) return;
		try {
			const arr = JSON.parse(raw);
			if (Array.isArray(arr)) await this.addLabels(arr);
			localStorage.removeItem("chatLabels");
		} catch (e) {
			console.warn("Migration failed:", e);
		}
	}

	// Quota exceeded error handling
	async checkStorageQuota() {
		if (!navigator.storage || !navigator.storage.estimate) return;
		const { quota, usage } = await navigator.storage.estimate();
		const usageMB = usage / (1024 * 1024);
		if (usageMB > this.maxStorageWarningMB) {
			alert(
				`Warning: label storage usage is high (${usageMB.toFixed(
					2
				)}MB). Please delete unused labels.`
			);
		}
	}

	// Database corruption recovery
	async recoverCorruption() {
		try {
			await this._initDB();
		} catch (e) {
			alert("Label database corrupted. Attempting recovery...");
			indexedDB.deleteDatabase("ChatLabelsDB");
			await this._initDB();
		}
	}

	// Version management for schema updates
	async upgradeSchema(newVersion) {
		if (newVersion <= this.dbVersion) return;
		this.dbVersion = newVersion;
		this.dbPromise = this._initDB();
	}

	// Graceful fallback if IndexedDB not supported
	static isSupported() {
		return !!window.indexedDB;
	}
}

export default LabelManager;
