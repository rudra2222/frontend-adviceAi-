/**
 * Media Cache Manager
 * Handles caching of media files (images, videos, audio) to localStorage/IndexedDB
 */

import { CACHE_KEYS, CACHE_TTL } from "./cache";
import { axiosInstance } from "./axios";

// Use IndexedDB for large media files
const DB_NAME = "adviseai_media_cache";
const STORE_NAME = "media_files";
const DB_VERSION = 1;

let dbInstance = null;

/**
 * Initialize IndexedDB for media storage
 */
export const initializeMediaDB = async () => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.warn("Failed to open IndexedDB:", request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, {
                    keyPath: "id",
                });
                objectStore.createIndex("url", "url", { unique: true });
                objectStore.createIndex("timestamp", "timestamp", {
                    unique: false,
                });
            }
        };
    });
};

/**
 * Cache media file to IndexedDB
 * @param {string} mediaId - Unique media identifier
 * @param {string} url - Original URL of the media
 * @param {Blob} blob - Media blob data
 * @param {string} mimeType - MIME type of the media
 * @param {number} ttl - Time to live in milliseconds
 */
export const cacheMediaFile = async (mediaId, url, blob, mimeType, ttl) => {
    try {
        const db = await initializeMediaDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);

        const expiresAt = Date.now() + ttl;

        const mediaRecord = {
            id: mediaId,
            url,
            blob,
            mimeType,
            timestamp: Date.now(),
            expiresAt,
        };

        const request = objectStore.put(mediaRecord);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(mediaRecord);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn("Failed to cache media file:", error);
        throw error;
    }
};

/**
 * Get cached media file from IndexedDB
 * @param {string} mediaId - Unique media identifier
 * @returns {Promise<Blob|null>} Media blob or null if not found/expired
 */
export const getCachedMediaFile = async (mediaId) => {
    try {
        const db = await initializeMediaDB();
        const transaction = db.transaction([STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.get(mediaId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const record = request.result;

                if (!record) {
                    resolve(null);
                    return;
                }

                // Check if expired
                if (record.expiresAt && Date.now() > record.expiresAt) {
                    // Delete expired record
                    deleteCachedMediaFile(mediaId);
                    resolve(null);
                    return;
                }

                resolve(record.blob);
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn("Failed to get cached media file:", error);
        return null;
    }
};

/**
 * Get blob URL for cached media (for <img>, <video>, <audio> src)
 * @param {string} mediaId - Unique media identifier
 * @returns {Promise<string|null>} Object URL or null if not cached
 */
export const getCachedMediaBlobUrl = async (mediaId) => {
    try {
        const blob = await getCachedMediaFile(mediaId);
        if (blob) {
            return URL.createObjectURL(blob);
        }
        return null;
    } catch (error) {
        console.warn("Failed to get media blob URL:", error);
        return null;
    }
};

/**
 * Delete cached media file
 * @param {string} mediaId - Unique media identifier
 */
export const deleteCachedMediaFile = async (mediaId) => {
    try {
        const db = await initializeMediaDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.delete(mediaId);

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn("Failed to delete cached media file:", error);
    }
};

/**
 * Check if media is cached
 * @param {string} mediaId - Unique media identifier
 * @returns {Promise<boolean>} True if cached and valid
 */
export const isMediaCached = async (mediaId) => {
    try {
        const blob = await getCachedMediaFile(mediaId);
        return blob !== null;
    } catch (error) {
        return false;
    }
};

/**
 * Download and cache media file
 * @param {string} mediaId - Unique media identifier
 * @param {string} url - URL to download from
 * @param {string} mimeType - MIME type (optional)
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<Blob>} Downloaded and cached blob
 */
export const downloadAndCacheMedia = async (
    mediaId,
    url,
    mimeType = "application/octet-stream",
    ttl = CACHE_TTL.VERY_LONG
) => {
    try {
        // Check if already cached
        const cached = await getCachedMediaFile(mediaId);
        if (cached) {
            return cached;
        }

        // Download the file with authentication
        const response = await axiosInstance.get(url, {
            responseType: "blob",
            withCredentials: true,
        });

        const blob = response.data;

        // Cache it
        await cacheMediaFile(mediaId, url, blob, mimeType, ttl);

        return blob;
    } catch (error) {
        console.error("Failed to download and cache media:", error);
        throw error;
    }
};

/**
 * Get cache size in bytes
 * @returns {Promise<number>} Total cached media size in bytes
 */
export const getMediaCacheSize = async () => {
    try {
        const db = await initializeMediaDB();
        const transaction = db.transaction([STORE_NAME], "readonly");
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const records = request.result;
                let totalSize = 0;

                records.forEach((record) => {
                    if (record.blob) {
                        totalSize += record.blob.size;
                    }
                });

                resolve(totalSize);
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn("Failed to get cache size:", error);
        return 0;
    }
};

/**
 * Clear expired media files
 * @returns {Promise<number>} Number of files deleted
 */
export const clearExpiredMedia = async () => {
    try {
        const db = await initializeMediaDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.getAll();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                const records = request.result;
                let deletedCount = 0;

                records.forEach((record) => {
                    if (record.expiresAt && Date.now() > record.expiresAt) {
                        objectStore.delete(record.id);
                        deletedCount++;
                    }
                });

                resolve(deletedCount);
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn("Failed to clear expired media:", error);
        return 0;
    }
};

/**
 * Clear all cached media files
 */
export const clearAllMediaCache = async () => {
    try {
        const db = await initializeMediaDB();
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const objectStore = transaction.objectStore(STORE_NAME);
        const request = objectStore.clear();

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn("Failed to clear media cache:", error);
    }
};

/**
 * Format bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Generate unique media ID based on URL
 * @param {string} url - Media URL
 * @returns {string} Unique ID
 */
export const generateMediaId = (url) => {
    // Use URL hash to create a unique ID
    const hash = url.split("").reduce((acc, char) => {
        return (acc << 5) - acc + char.charCodeAt(0);
    }, 0);
    return `media_${Math.abs(hash)}`;
};

// Re-export CACHE_TTL for convenience
export { CACHE_TTL } from "./cache";
