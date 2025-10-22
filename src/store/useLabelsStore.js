import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { LABEL_COLORS, MAX_LABELS } from "../constants";

/**
 * DATABASE MIGRATION NOTES:
 * ========================
 *
 * 1. Create 'labels' table:
 *    - id (primary key, auto-increment)
 *    - name (varchar, required, max 50 chars)
 *    - color (varchar, hex color code, required)
 *    - workspace_id (foreign key to workspaces table)
 *    - created_at (timestamp)
 *    - updated_at (timestamp)
 *    - position (integer, for ordering labels)
 *
 * 2. Create 'conversation_labels' junction table (many-to-many):
 *    - id (primary key, auto-increment)
 *    - conversation_id (foreign key to conversations table)
 *    - label_id (foreign key to labels table)
 *    - created_at (timestamp)
 *    - UNIQUE constraint on (conversation_id, label_id)
 *
 * 3. API Endpoints needed:
 *    - GET    /api/labels                     - Get all labels
 *    - POST   /api/labels                     - Create new label
 *    - PUT    /api/labels/:id                 - Update label
 *    - DELETE /api/labels/:id                 - Delete label
 *    - POST   /api/labels/reorder             - Reorder labels
 *    - POST   /api/conversations/:id/labels   - Assign label to conversation
 *    - DELETE /api/conversations/:id/labels/:labelId - Remove label from conversation
 *
 * 4. Predefined labels to seed in database:
 *    These 8 default labels should be created for each new workspace:
 *    - "New customer" (Blue)
 *    - "New order" (Green)
 *    - "Pending payment" (Yellow)
 *    - "Paid" (Green)
 *    - "Order complete" (Green)
 *    - "To do" (Orange)
 *    - "Important" (Red)
 *    - "Follow up" (Purple)
 */

export const useLabelsStore = create((set, get) => ({
    // State
    labels: [],
    isLabelsLoading: false,
    selectedLabelFilter: "all", // "all" | "critical" | labelId

    // Initialize with default labels (will be replaced by API data)
    // These are the 8 predefined labels that should exist in the database
    initializeDefaultLabels: () => {
        const defaultLabels = [
            {
                id: "default-1",
                name: "New customer",
                color: LABEL_COLORS[2].hex,
                isDefault: true,
            },
            {
                id: "default-2",
                name: "New order",
                color: "#16C47F",
                isDefault: true,
            },
            {
                id: "default-3",
                name: "Pending payment",
                color: LABEL_COLORS[3].hex,
                isDefault: true,
            },
            {
                id: "default-4",
                name: "Paid",
                color: "#E45A92",
                isDefault: true,
            },
            {
                id: "default-5",
                name: "Order complete",
                color: "#F9CB99",
                isDefault: true,
            },
            {
                id: "default-6",
                name: "To do",
                color: LABEL_COLORS[4].hex,
                isDefault: true,
            },
            {
                id: "default-7",
                name: "Important",
                color: LABEL_COLORS[0].hex,
                isDefault: true,
            },
            {
                id: "default-8",
                name: "Follow up",
                color: LABEL_COLORS[1].hex,
                isDefault: true,
            },
        ];
        set({ labels: defaultLabels });
    },

    // Get all labels
    getLabels: async () => {
        set({ isLabelsLoading: true });
        try {
            // TODO: Replace with actual API call when backend is ready
            // const res = await axiosInstance.get("/labels");
            // set({ labels: res.data.labels });

            // For now, use default labels
            get().initializeDefaultLabels();
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

        if (labelData.name.length > 50) {
            toast.error("Label name must be 50 characters or less");
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
            // TODO: Replace with actual API call when backend is ready
            // const res = await axiosInstance.post("/labels", {
            //     name: labelData.name,
            //     color: labelData.color,
            // });
            // const newLabel = res.data.label;

            // Optimistic update
            const newLabel = {
                id: `custom-${Date.now()}`, // Replace with actual ID from API
                name: labelData.name,
                color: labelData.color,
                isDefault: false,
            };

            set({ labels: [...currentLabels, newLabel] });
            toast.success("Label created successfully");
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

        // Prevent editing default labels (optional - remove if defaults should be editable)
        // if (labelToUpdate.isDefault) {
        //     toast.error("Default labels cannot be edited");
        //     return false;
        // }

        // Validate name if being updated
        if (updates.name) {
            if (updates.name.trim().length === 0) {
                toast.error("Label name is required");
                return false;
            }

            if (updates.name.length > 50) {
                toast.error("Label name must be 50 characters or less");
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

        try {
            // TODO: Replace with actual API call when backend is ready
            // await axiosInstance.put(`/labels/${labelId}`, updates);

            // Optimistic update
            const updatedLabels = currentLabels.map((label) =>
                label.id === labelId ? { ...label, ...updates } : label
            );
            set({ labels: updatedLabels });
            toast.success("Label updated successfully");
            return true;
        } catch (error) {
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

        // Optional: Prevent deleting default labels
        // if (labelToDelete.isDefault) {
        //     toast.error("Default labels cannot be deleted");
        //     return false;
        // }

        try {
            // TODO: Replace with actual API call when backend is ready
            // await axiosInstance.delete(`/labels/${labelId}`);

            // Optimistic update
            const updatedLabels = currentLabels.filter(
                (label) => label.id !== labelId
            );
            set({ labels: updatedLabels });
            toast.success("Label deleted successfully");
            return true;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to delete label"
            );
            return false;
        }
    },

    // Reorder labels (drag and drop)
    reorderLabels: async (reorderedLabels) => {
        try {
            // TODO: Replace with actual API call when backend is ready
            // await axiosInstance.post("/labels/reorder", {
            //     labelIds: reorderedLabels.map((l) => l.id),
            // });

            // Optimistic update
            set({ labels: reorderedLabels });
            return true;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to reorder labels"
            );
            return false;
        }
    },

    // Assign label to conversation
    assignLabelToConversation: async (conversationId, labelId) => {
        try {
            // TODO: Replace with actual API call when backend is ready
            // await axiosInstance.post(`/conversations/${conversationId}/labels`, {
            //     labelId,
            // });

            toast.success("Label assigned successfully");
            return true;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to assign label"
            );
            return false;
        }
    },

    // Remove label from conversation
    removeLabelFromConversation: async (conversationId, labelId) => {
        try {
            // TODO: Replace with actual API call when backend is ready
            // await axiosInstance.delete(
            //     `/conversations/${conversationId}/labels/${labelId}`
            // );

            toast.success("Label removed successfully");
            return true;
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to remove label"
            );
            return false;
        }
    },

    // Set label filter
    setSelectedLabelFilter: (filter) => {
        set({ selectedLabelFilter: filter });
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
}));
