import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { LABEL_COLORS, MAX_LABELS } from "../constants";
import { useChatStore } from "./useChatStore";
import {
    getCache,
    setCache,
    removeCache,
    CACHE_KEYS,
    CACHE_TTL,
} from "../lib/cache";

export const useLabelsStore = create((set, get) => ({
    // State
    labels: [],
    isLabelsLoading: false,
    selectedLabelFilter: "all", // "all" | "critical" | labelId

    initializeLabels: async () => {
        const chatStore = useChatStore.getState();
        const {
            conversations,
            setConversations,
            setSelectedConversation,
            selectedConversation,
        } = chatStore;

        const { getLabels } = get();

        try {
            // Step 1: Fetch all user labels first (ensures color, name, etc. are synced)
            await getLabels();
            set({ selectedLabelFilter: "all" });

            // Step 2: Fetch all assigned conversation labels from the backend
            const res = await axiosInstance.get("/conversation-label/labels");
            const conversationLabels = res.data?.labels || [];

            if (!conversationLabels.length) return;

            // Step 3: Prepare a map of conversationId → assigned labels
            const labelMap = conversationLabels.reduce((acc, label) => {
                const convId = label.conversationId.toString();
                if (!acc[convId]) acc[convId] = [];
                acc[convId].push({
                    id:
                        typeof label.id === "bigint"
                            ? Number(label.id)
                            : label.id,
                    name: label.name,
                    color: label.color,
                    assigned_at: label.assignedAt || new Date().toISOString(),
                    conversation_id: convId,
                });
                return acc;
            }, {});

            // Step 4: Merge labels into existing conversations
            const updatedConversations = conversations.map((conv) => {
                const convId = conv.id.toString();
                const convLabels = labelMap[convId] || [];
                return {
                    ...conv,
                    labels: convLabels,
                };
            });

            // Step 5: Update state
            setConversations(updatedConversations);

            // Step 6: If a conversation is open, refresh its labels too
            if (selectedConversation) {
                const updatedSelected = updatedConversations.find(
                    (c) => c.id === selectedConversation.id
                );
                if (updatedSelected) setSelectedConversation(updatedSelected);
            }
        } catch (error) {
            console.error("Failed to initialize conversation labels:", error);
            toast.error("Failed to load conversation labels");
        }
    },

    // Get all labels (ordered by sort_order)
    getLabels: async () => {
        set({ isLabelsLoading: true });
        try {
            // Try to get from cache first
            const cached = getCache(CACHE_KEYS.LABELS);
            if (cached) {
                set({ labels: cached, isLabelsLoading: false });
                return;
            }

            const res = await axiosInstance.get("/labels");
            // Backend should return labels with BigInt converted to number/string
            const labels = res.data.labels.map((label) => ({
                ...label,
                id: typeof label.id === "bigint" ? Number(label.id) : label.id,
                sort_order: label.sort_order ?? 0,
                created_at: label.created_at
                    ? new Date(label.created_at)
                    : new Date(),
            }));

            // Cache the labels
            setCache(CACHE_KEYS.LABELS, labels, CACHE_TTL.LONG);

            set({ labels });
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to load labels"
            );
        } finally {
            set({ isLabelsLoading: false });
        }
    },

    // Create new label
    createLabel: async (labelData) => {
        const currentLabels = get().labels;

        // Validate max labels limit
        if (currentLabels.length >= MAX_LABELS) {
            toast.error(`Maximum ${MAX_LABELS} labels allowed`);
            return false;
        }

        // Validate label name
        if (!labelData.name || labelData.name.trim().length === 0) {
            toast.error("Label name is required");
            return false;
        }

        if (labelData.name.length > 100) {
            toast.error("Label name must be 100 characters or less");
            return false;
        }

        // Check for duplicate names
        const isDuplicate = currentLabels.some(
            (label) => label.name.toLowerCase() === labelData.name.toLowerCase()
        );
        if (isDuplicate) {
            toast.error("A label with this name already exists");
            return false;
        }

        try {
            const res = await axiosInstance.post("/labels", {
                name: labelData.name.trim(),
                color: labelData.color || get().getRandomColor(),
            });

            const newLabel = {
                ...res.data.label,
                id:
                    typeof res.data.label.id === "bigint"
                        ? Number(res.data.label.id)
                        : res.data.label.id,
                sort_order: res.data.label.sort_order ?? currentLabels.length,
                created_at: res.data.label.created_at
                    ? new Date(res.data.label.created_at)
                    : new Date(),
            };

            // Add to end of list (highest sort_order)
            set({ labels: [...currentLabels, newLabel] });

            // Invalidate labels cache
            removeCache(CACHE_KEYS.LABELS);
            removeCache(CACHE_KEYS.CONVERSATION_LABELS);

            return true;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to create label"
            );
            return false;
        }
    },

    // Update label
    updateLabel: async (labelId, updates) => {
        const currentLabels = get().labels;
        const labelToUpdate = currentLabels.find((l) => l.id === labelId);

        if (!labelToUpdate) {
            toast.error("Label not found");
            return false;
        }

        // Validate name if being updated
        if (updates.name !== undefined) {
            if (updates.name.trim().length === 0) {
                toast.error("Label name is required");
                return false;
            }

            if (updates.name.length > 100) {
                toast.error("Label name must be 100 characters or less");
                return false;
            }

            // Check for duplicate names (excluding current label)
            const isDuplicate = currentLabels.some(
                (label) =>
                    label.id !== labelId &&
                    label.name.toLowerCase() === updates.name.toLowerCase()
            );
            if (isDuplicate) {
                toast.error("A label with this name already exists");
                return false;
            }
        }

        // Optimistic update
        const previousLabels = currentLabels;
        const updatedLabels = currentLabels.map((label) =>
            label.id === labelId ? { ...label, ...updates } : label
        );
        set({ labels: updatedLabels });

        try {
            await axiosInstance.put(`/labels/${labelId}`, updates);

            // Invalidate labels cache
            removeCache(CACHE_KEYS.LABELS);
            removeCache(CACHE_KEYS.CONVERSATION_LABELS);

            return true;
        } catch (error) {
            // Revert optimistic update on failure
            set({ labels: previousLabels });
            toast.error(
                error.response?.data?.message || "Failed to update label"
            );
            return false;
        }
    },

    // Delete label
    deleteLabel: async (labelId) => {
        const currentLabels = get().labels;
        const labelToDelete = currentLabels.find((l) => l.id === labelId);

        if (!labelToDelete) {
            toast.error("Label not found");
            return false;
        }

        // Optimistic update
        const previousLabels = currentLabels;
        const updatedLabels = currentLabels
            .filter((label) => label.id !== labelId)
            // Reindex sort_order after deletion
            .map((label, index) => ({ ...label, sort_order: index }));

        set({ labels: updatedLabels });

        try {
            await axiosInstance.delete(`/labels/${labelId}`);

            // Invalidate labels cache
            removeCache(CACHE_KEYS.LABELS);
            removeCache(CACHE_KEYS.CONVERSATION_LABELS);

            return true;
        } catch (error) {
            // Revert optimistic update on failure
            set({ labels: previousLabels });
            toast.error(
                error.response?.data?.message || "Failed to delete label"
            );
            return false;
        }
    },

    // =====================UNIMPLEMENTED FEATURES==========================

    // Reorder labels (drag and drop)
    reorderLabels: async (reorderedLabels) => {
        const previousLabels = get().labels;

        // Update sort_order to match new positions
        const labelsWithNewOrder = reorderedLabels.map((label, index) => ({
            ...label,
            sort_order: index,
        }));

        // Optimistic update
        set({ labels: labelsWithNewOrder });

        try {
            // Send array of {labelId, position} objects
            await axiosInstance.post("/labels/reorder", {
                orders: labelsWithNewOrder.map((label) => ({
                    labelId: label.id,
                    position: label.sort_order,
                })),
            });

            // Invalidate labels cache
            removeCache(CACHE_KEYS.LABELS);
            removeCache(CACHE_KEYS.CONVERSATION_LABELS);

            return true;
        } catch (error) {
            // Revert on failure
            set({ labels: previousLabels });
            toast.error(
                error.response?.data?.message || "Failed to reorder labels"
            );
            return false;
        }
    },

    // Reorder single label (for keyboard navigation or programmatic reordering)
    reorderSingleLabel: async (labelId, newPosition) => {
        const currentLabels = get().labels;
        const previousLabels = currentLabels;

        const labelIndex = currentLabels.findIndex((l) => l.id === labelId);
        if (labelIndex === -1) {
            toast.error("Label not found");
            return false;
        }

        // Validate new position
        if (newPosition < 0 || newPosition >= currentLabels.length) {
            toast.error("Invalid position");
            return false;
        }

        // Create reordered array
        const reordered = [...currentLabels];
        const [movedLabel] = reordered.splice(labelIndex, 1);
        reordered.splice(newPosition, 0, movedLabel);

        // Update sort_order
        const labelsWithNewOrder = reordered.map((label, index) => ({
            ...label,
            sort_order: index,
        }));

        // Optimistic update
        set({ labels: labelsWithNewOrder });

        try {
            await axiosInstance.post(`/labels/${labelId}/reorder`, {
                newPosition,
            });

            // Invalidate labels cache
            removeCache(CACHE_KEYS.LABELS);
            removeCache(CACHE_KEYS.CONVERSATION_LABELS);

            return true;
        } catch (error) {
            // Revert on failure
            set({ labels: previousLabels });
            toast.error(
                error.response?.data?.message || "Failed to reorder label"
            );
            return false;
        }
    },

    // ==========================================================================

    // Set label filter
    setSelectedLabelFilter: (filter) => {
        set({ selectedLabelFilter: filter });
    },

    // Get label by ID
    getLabelById: (labelId) => {
        return get().labels.find((l) => l.id === labelId);
    },

    // Get sorted labels
    getSortedLabels: () => {
        return [...get().labels].sort((a, b) => a.sort_order - b.sort_order);
    },

    // Get random color for new labels
    getRandomColor: () => {
        const usedColors = get().labels.map((l) => l.color);
        const availableColors = LABEL_COLORS.filter(
            (c) => !usedColors.includes(c.hex)
        );

        if (availableColors.length > 0) {
            return availableColors[
                Math.floor(Math.random() * availableColors.length)
            ].hex;
        }

        // If all colors are used, return a random one anyway
        return LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)]
            .hex;
    },
    setIsLabelsLoading: (value) => set({ isLabelsLoading: value }),
}));
