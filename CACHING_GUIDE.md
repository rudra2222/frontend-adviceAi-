# Caching Implementation Guide

## Overview

This application now uses a sophisticated caching layer to store backend data locally in the browser's localStorage. This reduces network requests, improves load times, and provides offline capabilities.

## Cache Module (`src/lib/cache.js`)

### Key Features

-   **Automatic Expiration**: Cache entries expire after a configurable TTL (Time To Live)
-   **Prefix Isolation**: All cache keys are prefixed with `adviseai_cache_` to avoid conflicts
-   **Type Safety**: Cache values are automatically serialized/deserialized using JSON
-   **Error Handling**: Graceful error handling if localStorage is unavailable

### API Functions

#### `setCache(key, value, ttl)`

Stores a value in cache with optional expiration.

```javascript
import { setCache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";

setCache(CACHE_KEYS.CONVERSATIONS, data, CACHE_TTL.LONG);
```

#### `getCache(key)`

Retrieves a value from cache if it exists and hasn't expired.

```javascript
const cached = getCache(CACHE_KEYS.CONVERSATIONS);
if (cached) {
    // Use cached data
}
```

#### `hasValidCache(key)`

Checks if cache exists and is valid without retrieving the data.

```javascript
if (hasValidCache(CACHE_KEYS.LABELS)) {
    // Cache is valid
}
```

#### `removeCache(key)`

Removes a specific cache entry.

```javascript
removeCache(CACHE_KEYS.CONVERSATIONS);
```

#### `clearAllCache()`

Clears all application caches at once.

```javascript
clearAllCache(); // Typically called on logout
```

#### `getCacheOrFetch(key, fetchFn, ttl)`

Advanced function that automatically uses cache if available, otherwise fetches fresh data.

```javascript
const data = await getCacheOrFetch(
    CACHE_KEYS.LABELS,
    async () => {
        const res = await axiosInstance.get("/labels");
        return res.data.labels;
    },
    CACHE_TTL.LONG
);
```

### Cache TTL Options

```javascript
CACHE_TTL.SHORT; // 5 seconds    - For frequently updated data
CACHE_TTL.MEDIUM; // 5 minutes    - For moderately updated data
CACHE_TTL.LONG; // 1 hour       - For stable data
CACHE_TTL.VERY_LONG; // 24 hours     - For rarely changing data
```

### Predefined Cache Keys

```javascript
CACHE_KEYS.AUTH_USER; // User authentication data
CACHE_KEYS.CONVERSATIONS; // Conversations list
CACHE_KEYS.CRITICAL_CONVERSATIONS; // Critical conversations list
CACHE_KEYS.MESSAGES(conversationId); // Messages for specific conversation
CACHE_KEYS.LABELS; // User labels
CACHE_KEYS.CONVERSATION_LABELS; // Conversation-label mappings
```

## Store Integration

### `useChatStore` - Caching Strategy

**Cached Data:**

-   Conversations (1 hour TTL)
-   Messages per conversation (5 minutes TTL)

**Cache Invalidation:**

-   When a new message arrives via WebSocket
-   When takeover/handback status changes
-   On logout

**Usage:**

```javascript
// getInitialConversations now checks cache first
await useChatStore.getState().getInitialConversations();

// getMessages uses cache before fetching
await useChatStore.getState().getMessages(conversationId);
```

### `useLabelsStore` - Caching Strategy

**Cached Data:**

-   Labels list (1 hour TTL)
-   Conversation labels (1 hour TTL)

**Cache Invalidation:**

-   On create, update, or delete label
-   On reorder labels
-   On assign/remove labels from conversations

**Usage:**

```javascript
// getLabels checks cache first
await useLabelsStore.getState().getLabels();

// Creating/updating labels automatically invalidates cache
await useLabelsStore.getState().createLabel({ name: "Bug", color: "#FF0000" });
```

### `useAuthStore` - Caching Strategy

**Cached Data:**

-   User authentication data (1 hour TTL)

**Cache Invalidation:**

-   On logout (all caches cleared)
-   On profile update

**Usage:**

```javascript
// checkAuth uses cache if available
await useAuthStore.getState().checkAuth();

// Login/signup cache the user data
await useAuthStore.getState().login(credentials);
```

### `useConversationLabelActions` - Cache Invalidation

All label assignment/removal operations invalidate the conversation labels cache to ensure consistency.

**Operations that clear cache:**

-   `assignLabelToConversation()`
-   `removeLabelFromConversation()`
-   `bulkAssignLabel()`
-   `bulkRemoveLabel()`
-   `clearConversationLabels()`

## Implementation Details

### How It Works

1. **First Load**: Data is fetched from backend and stored in cache with expiration timestamp
2. **Subsequent Loads**: Cache is checked first; if valid, cached data is used immediately
3. **Real-time Updates**: WebSocket events invalidate relevant caches to ensure consistency
4. **User Actions**: Mutations (create, update, delete) invalidate related caches
5. **Logout**: All caches are cleared to prevent data leakage

### Cache Storage Format

Each cache entry stores:

-   **Data**: `adviseai_cache_<key>` - Stores the JSON-serialized value
-   **Expiry**: `adviseai_cache_<key>_expiry` - Stores the expiration timestamp

```
localStorage:
  adviseai_cache_conversations = '[{"id":1,...}]'
  adviseai_cache_conversations_expiry = '1700000000000'
```

### Error Handling

-   If localStorage is unavailable, operations fail gracefully with console warnings
-   No errors are thrown; the app continues functioning normally
-   Network errors during fetch are still propagated to handle offline scenarios

## Performance Benefits

1. **Reduced Network Calls**: Eliminates redundant API requests for the same data
2. **Faster Page Loads**: Previously fetched data loads instantly from cache
3. **Offline Support**: Users can view cached data even without internet connection
4. **Battery Life**: Fewer network requests consume less battery on mobile devices

## Best Practices

### ✅ DO

-   Use appropriate TTL based on data volatility
-   Invalidate cache when data changes via mutations
-   Clear all caches on logout for security
-   Use `hasValidCache()` to avoid unnecessary re-renders

### ❌ DON'T

-   Store sensitive data (passwords, tokens) in cache
-   Set extremely long TTLs for frequently updated data
-   Forget to invalidate cache after mutations
-   Rely on cache for real-time data without WebSocket updates

## Debugging

### Check Cached Data

```javascript
// In browser console
localStorage.getItem("adviseai_cache_conversations");
localStorage.getItem("adviseai_cache_conversations_expiry");
```

### Clear All Cache

```javascript
// In browser console
Object.keys(localStorage)
    .filter((k) => k.startsWith("adviseai_cache_"))
    .forEach((k) => localStorage.removeItem(k));

// Or use the function
import { clearAllCache } from "@/lib/cache";
clearAllCache();
```

### Check Cache Validity

```javascript
import { hasValidCache } from "@/lib/cache";
console.log(hasValidCache("conversations")); // true/false
```

## Future Enhancements

-   IndexedDB support for larger datasets
-   Compression for large cached objects
-   Cache synchronization across browser tabs
-   Cache pre-warming strategy
-   Analytics on cache hit/miss rates
