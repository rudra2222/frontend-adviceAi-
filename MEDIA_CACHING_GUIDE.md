# Media Caching Implementation Guide

## Overview

Media files (images, videos, audio) are now cached in the browser using IndexedDB for large file storage and automatic blob URL management. This enables offline access to previously viewed media and significantly improves loading performance.

## Features

-   **IndexedDB Storage**: Large media files are stored in IndexedDB (not localStorage)
-   **Automatic Expiration**: Cached media expires after a configurable TTL
-   **Overlay Download Button**: Users can cache media before playing/viewing
-   **Cache Status Indicator**: Visual indicator showing if media is cached
-   **Automatic Cache Check**: Checks cache on component mount
-   **Smart Fallback**: Falls back to original URL if cache unavailable

## Architecture

### Media Cache Utilities (`src/lib/mediaCache.js`)

Core functions for managing media cache:

```javascript
// Cache a media file
await cacheMediaFile(mediaId, url, blob, mimeType, ttl);

// Retrieve cached file
const blob = await getCachedMediaFile(mediaId);

// Check if cached
const isCached = await isMediaCached(mediaId);

// Download and cache
const blob = await downloadAndCacheMedia(mediaId, url, mimeType, ttl);

// Get blob URL for src attributes
const blobUrl = await getCachedMediaBlobUrl(mediaId);

// Delete cached file
await deleteCachedMediaFile(mediaId);

// Clear all media cache
await clearAllMediaCache();

// Get cache size
const bytes = await getMediaCacheSize();

// Clear expired media
const count = await clearExpiredMedia();
```

### Media Cache Hook (`src/hooks/useMediaCache.js`)

React hook for easy integration:

```javascript
const { isCached, isLoading, error, cacheMedia, cachedUrl } = useMediaCache(
    mediaUrl,
    mimeType,
    ttlInMilliseconds
);

// Cache media on demand
await cacheMedia();
```

## Component Integration

### MediaViewer Component

-   **Image Media**: Shows cache download button on hover (if not cached)
-   **Video Media**: Shows cache download button or play button (depending on cache status)
-   **Audio Media**: Direct playback (no caching button in preview)
-   **Cached Indicator**: Green "Cached" badge when media is cached

```jsx
const { isCached, isLoading, cacheMedia } = useMediaCache(src, "image/jpeg");

// In JSX
{
    !isCached && <button onClick={cacheMedia}>Cache</button>;
}
{
    isCached && <span>Cached</span>;
}
```

### ImageModal Component

-   **Cache Button**: Blue "Cache" button in header (if not cached)
-   **Download Button**: Download button always available
-   **Share Button**: Native share functionality

```jsx
{
    !isCached && (
        <button onClick={cacheMedia} disabled={isLoading}>
            <HardDrive className="w-5 h-5" />
        </button>
    );
}
```

### VideoModal Component

-   **Cache Button**: Blue "Cache" button in header (if not cached)
-   **Download Button**: Download button always available
-   **Share Button**: Native share functionality
-   **Full Controls**: Standard video player controls while caching

## Storage

### IndexedDB Structure

```
Database: adviseai_media_cache
ObjectStore: media_files

Record Structure:
{
    id: "media_unique_id",
    url: "https://...",
    blob: Blob,
    mimeType: "image/jpeg",
    timestamp: 1700000000000,
    expiresAt: 1700003600000
}

Indices:
- url (unique)
- timestamp
```

### Storage Limits

-   IndexedDB per origin: ~50-100 MB (varies by browser)
-   Available storage can be managed via `getMediaCacheSize()`
-   Expired files are automatically cleaned up
-   Manual cleanup via `clearAllMediaCache()`

## Usage Examples

### Basic Caching in Components

```jsx
import { useMediaCache } from "@/hooks/useMediaCache";

function MyComponent({ imageUrl }) {
    const { isCached, isLoading, cacheMedia } = useMediaCache(
        imageUrl,
        "image/jpeg"
    );

    return (
        <div>
            <img src={imageUrl} alt="My image" />
            {!isCached && (
                <button onClick={cacheMedia} disabled={isLoading}>
                    {isLoading ? "Caching..." : "Cache Image"}
                </button>
            )}
            {isCached && <span>✓ Cached</span>}
        </div>
    );
}
```

### Manual Cache Management

```jsx
import {
    downloadAndCacheMedia,
    getCachedMediaFile,
    clearAllMediaCache,
    getMediaCacheSize,
    formatBytes,
} from "@/lib/mediaCache";

// Download and cache a specific file
const blob = await downloadAndCacheMedia(
    "media_123",
    "https://example.com/video.mp4",
    "video/mp4"
);

// Get cache size
const bytes = await getMediaCacheSize();
console.log(`Cache size: ${formatBytes(bytes)}`);

// Clear all on logout
await clearAllMediaCache();
```

### Generating Blob URLs

```jsx
import {
    getCachedMediaBlobUrl,
    downloadAndCacheMedia,
} from "@/lib/mediaCache";

// Cache the media
await downloadAndCacheMedia(mediaId, url, mimeType);

// Get blob URL for use in src
const blobUrl = await getCachedMediaBlobUrl(mediaId);

// Use in image/video/audio tags
<img src={blobUrl} alt="Cached image" />
<video src={blobUrl} controls />
<audio src={blobUrl} controls />
```

## Cache TTL Configuration

Default TTL values (configurable):

```javascript
CACHE_TTL.SHORT; // 5 seconds    - Testing
CACHE_TTL.MEDIUM; // 5 minutes    - Session data
CACHE_TTL.LONG; // 1 hour       - Images, videos
CACHE_TTL.VERY_LONG; // 24 hours     - Infrequently accessed
```

Use custom TTL:

```javascript
const { cacheMedia } = useMediaCache(
    url,
    mimeType,
    60 * 60 * 24 * 7 * 1000 // 7 days
);
```

## Performance Optimization

### Lazy Loading

Media caching happens on-demand, not automatically:

```jsx
// Only cache when user clicks
<button onClick={cacheMedia}>Download for offline</button>
```

### Blob URL Management

-   Blob URLs are created efficiently
-   Automatically cleanup on unmount (handled by browser)
-   No memory leaks from uncleaned URLs

### Automatic Expiration

-   Old cached files are automatically cleaned up
-   Manual cleanup available via `clearExpiredMedia()`

## Debugging

### Check Cache Status

```javascript
// In browser console
const isCached = await isMediaCached("media_123");
console.log(isCached);

// Get all cached media
const db = await initializeMediaDB();
const tx = db.transaction(["media_files"], "readonly");
const store = tx.objectStore("media_files");
const all = await store.getAll();
console.log(all);
```

### Monitor Cache Size

```javascript
const size = await getMediaCacheSize();
console.log(`Total cached: ${formatBytes(size)}`);
```

### Clear Cache Manually

```javascript
// Clear all
import { clearAllMediaCache } from "@/lib/mediaCache";
await clearAllMediaCache();

// Or in DevTools
indexedDB.deleteDatabase("adviseai_media_cache");
```

## Browser Support

-   **Chrome/Edge**: Full support
-   **Firefox**: Full support
-   **Safari**: Full support (iOS 13+)
-   **Mobile browsers**: Full support (except very old devices)

Fallback: If IndexedDB unavailable, uses original URL (no caching).

## Security Considerations

-   Media is cached locally (secure from interception)
-   Cache cleared on logout (automatic)
-   No sensitive data stored with media
-   Media URLs must be valid and accessible

## Integration with Other Features

### With Authentication

```jsx
// In useAuthStore logout
const logout = async () => {
    // Clear all media cache on logout
    await clearAllMediaCache();
    // ... other logout logic
};
```

### With Real-time Updates

When new messages arrive with media:

```javascript
// Media will be cached on-demand when user interacts
// No automatic cache invalidation needed
```

## Troubleshooting

### Media not caching

1. Check browser IndexedDB support: `window.indexedDB` should exist
2. Check available storage: `navigator.storage?.estimate()`
3. Check CORS headers on media URLs
4. Monitor console for errors

### Cache not clearing

-   Check IndexedDB transaction completion
-   Manually clear: `indexedDB.deleteDatabase("adviseai_media_cache")`
-   Check browser storage permissions

### Performance issues

-   Media cache size growing: Use `getMediaCacheSize()` and `clearExpiredMedia()`
-   Reduce TTL for frequently updated media
-   Manually clear old cache periodically

## Future Enhancements

-   [ ] Service Worker integration for automatic offline sync
-   [ ] Cache size management UI
-   [ ] Batch cache operations
-   [ ] Compression for cached media
-   [ ] Progressive caching strategy
-   [ ] Cache analytics and statistics
