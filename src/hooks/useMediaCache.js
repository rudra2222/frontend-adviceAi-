import { useState, useCallback, useEffect, useRef } from "react";
import {
    downloadAndCacheMedia,
    getCachedMediaBlobUrl,
    isMediaCached,
    generateMediaId,
    CACHE_TTL,
} from "../lib/mediaCache";
import toast from "react-hot-toast";

/**
 * Hook for managing media caching
 * @param {string} mediaUrl - Original media URL
 * @param {string} mimeType - MIME type of media
 * @param {number} ttl - Cache TTL
 * @returns {Object} Cache state and methods
 */
export const useMediaCache = (mediaUrl, mimeType, ttl = CACHE_TTL.LONG) => {
    const [cachedUrl, setCachedUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCached, setIsCached] = useState(false);
    const [error, setError] = useState(null);
    const isCachingRef = useRef(false); // Prevent multiple concurrent caching calls

    const mediaId = generateMediaId(mediaUrl);

    // Check if media is already cached on mount and load cached URL
    useEffect(() => {
        const checkCache = async () => {
            try {
                const cached = await isMediaCached(mediaId);
                setIsCached(cached);

                if (cached) {
                    const blobUrl = await getCachedMediaBlobUrl(mediaId);
                    if (blobUrl) {
                        setCachedUrl(blobUrl);
                    }
                }
            } catch (err) {
                console.error("Error checking cache:", err);
            }
        };

        checkCache();

        // Cleanup blob URL on unmount
        return () => {
            if (cachedUrl && cachedUrl.startsWith("blob:")) {
                URL.revokeObjectURL(cachedUrl);
            }
        };
    }, [mediaId]);

    // Download and cache media
    const cacheMedia = useCallback(async () => {
        // Prevent multiple concurrent caching calls
        if (isCachingRef.current || (isCached && cachedUrl)) {
            return cachedUrl || mediaUrl;
        }

        isCachingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const blob = await downloadAndCacheMedia(
                mediaId,
                mediaUrl,
                mimeType,
                ttl
            );

            const blobUrl = URL.createObjectURL(blob);
            setCachedUrl(blobUrl);
            setIsCached(true);
            //toast.success("Media cached successfully!");

            return blobUrl;
        } catch (err) {
            const errorMessage = "Failed to download media";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Error caching media:", err);
            throw err;
        } finally {
            setIsLoading(false);
            isCachingRef.current = false;
        }
    }, [mediaId, mediaUrl, mimeType, ttl, isCached, cachedUrl]);

    return {
        cachedUrl: cachedUrl || mediaUrl, // Use cached blob URL or fallback to original URL for display
        originalUrl: mediaUrl, // Always provide original URL as fallback
        isCached,
        isLoading,
        error,
        cacheMedia,
        mediaId,
    };
};
