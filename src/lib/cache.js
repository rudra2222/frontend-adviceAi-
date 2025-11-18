/**
 * LocalStorage Cache Manager
 * Provides utilities for caching and retrieving data from localStorage
 */

const CACHE_PREFIX = "adviseai_cache_";
const CACHE_EXPIRY_SUFFIX = "_expiry";
const DEFAULT_TTL = 1000 * 60 * 60; // 1 hour in milliseconds

/**
 * Set cache with optional TTL
 * @param {string} key - Cache key
 * @param {*} value - Value to cache (will be stringified)
 * @param {number} ttl - Time to live in milliseconds (default: 1 hour)
 */
export const setCache = (key, value, ttl = DEFAULT_TTL) => {
    try {
        const cacheKey = CACHE_PREFIX + key;
        const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;

        localStorage.setItem(cacheKey, JSON.stringify(value));
        localStorage.setItem(expiryKey, Date.now() + ttl);
    } catch (error) {
        console.warn(`Failed to set cache for key "${key}":`, error);
    }
};

/**
 * Get cache if it exists and hasn't expired
 * @param {string} key - Cache key
 * @returns {*} Cached value or null if expired/not found
 */
export const getCache = (key) => {
    try {
        const cacheKey = CACHE_PREFIX + key;
        const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;

        const expiry = localStorage.getItem(expiryKey);

        // Check if cache has expired
        if (!expiry || Date.now() > parseInt(expiry)) {
            // Clean up expired cache
            localStorage.removeItem(cacheKey);
            localStorage.removeItem(expiryKey);
            return null;
        }

        const cached = localStorage.getItem(cacheKey);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.warn(`Failed to get cache for key "${key}":`, error);
        return null;
    }
};

/**
 * Check if cache exists and is valid
 * @param {string} key - Cache key
 * @returns {boolean} True if cache exists and hasn't expired
 */
export const hasValidCache = (key) => {
    try {
        const cacheKey = CACHE_PREFIX + key;
        const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;

        const expiry = localStorage.getItem(expiryKey);

        if (!expiry || Date.now() > parseInt(expiry)) {
            return false;
        }

        return localStorage.getItem(cacheKey) !== null;
    } catch (error) {
        console.warn(`Failed to check cache for key "${key}":`, error);
        return false;
    }
};

/**
 * Remove specific cache
 * @param {string} key - Cache key
 */
export const removeCache = (key) => {
    try {
        const cacheKey = CACHE_PREFIX + key;
        const expiryKey = cacheKey + CACHE_EXPIRY_SUFFIX;

        localStorage.removeItem(cacheKey);
        localStorage.removeItem(expiryKey);
    } catch (error) {
        console.warn(`Failed to remove cache for key "${key}":`, error);
    }
};

/**
 * Clear all app caches
 */
export const clearAllCache = () => {
    try {
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
        console.warn("Failed to clear all cache:", error);
    }
};

/**
 * Get cache with fallback to async fetch function
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Async function to fetch data if cache is invalid
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<*>} Cached or freshly fetched data
 */
export const getCacheOrFetch = async (key, fetchFn, ttl = DEFAULT_TTL) => {
    const cached = getCache(key);

    if (cached !== null) {
        return cached;
    }

    try {
        const data = await fetchFn();
        setCache(key, data, ttl);
        return data;
    } catch (error) {
        console.error(`Failed to fetch data for key "${key}":`, error);
        throw error;
    }
};

/**
 * Cache keys for the app
 */
export const CACHE_KEYS = {
    // Auth
    AUTH_USER: "auth_user",

    // Chat
    CONVERSATIONS: "conversations",
    CRITICAL_CONVERSATIONS: "critical_conversations",
    MESSAGES: (conversationId) => `messages_${conversationId}`,

    // Labels
    LABELS: "labels",
    CONVERSATION_LABELS: "conversation_labels",

    // Media
    MEDIA: (mediaId) => `media_${mediaId}`,
    MEDIA_INDEX: "media_index",
};

/**
 * Cache TTL durations
 */
export const CACHE_TTL = {
    SHORT: 1000 * 5, // 5 seconds
    MEDIUM: 1000 * 60 * 5, // 5 minutes
    LONG: 1000 * 60 * 60, // 1 hour
    VERY_LONG: 1000 * 60 * 60 * 24, // 24 hours
};
