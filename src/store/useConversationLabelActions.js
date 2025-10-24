import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useChatStore } from "./useChatStore";

export const useConversationLabelActions = () => {
    const {
        conversations,
        selectedConversation,
        setConversations,
        setSelectedConversation,
    } = useChatStore();

    // Assign label to conversation
    const assignLabelToConversation = async (conversationId, label) => {
        // Check if conversation exists
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) {
            toast.error("Conversation not found");
            return false;
        }

        // Check if label already assigned
        const existingLabels = conversation.labels || [];
        if (existingLabels.some((l) => l.id === label.id)) {
            toast.error("Label already assigned to this conversation");
            return false;
        }

        // Create label assignment object with metadata
        const labelAssignment = {
            ...label,
            assigned_at: new Date().toISOString(),
            conversation_id: conversationId,
        };

        // Optimistic update
        const previousConversations = conversations;
        const previousSelectedConversation = selectedConversation;

        const updatedConversations = conversations.map((conv) => {
            if (conv.id === conversationId) {
                const updatedConv = {
                    ...conv,
                    labels: [...existingLabels, labelAssignment],
                };

                // Update selected conversation if it's the same one
                if (selectedConversation?.id === conversationId) {
                    setSelectedConversation(updatedConv);
                }

                return updatedConv;
            }
            return conv;
        });

        setConversations(updatedConversations);

        try {
            const res = await axiosInstance.post(
                `/conversation-label/${conversationId}/labels`,
                {
                    labelId: label.id,
                }
            );

            // Update with server response (includes accurate assigned_at timestamp)
            if (res.data?.label) {
                const serverLabel = {
                    ...res.data.label,
                    id:
                        typeof res.data.label.id === "bigint"
                            ? Number(res.data.label.id)
                            : res.data.label.id,
                    assigned_at: res.data.label.assigned_at
                        ? new Date(res.data.label.assigned_at)
                        : new Date(),
                };

                const finalConversations = conversations.map((conv) => {
                    if (conv.id === conversationId) {
                        const updatedConv = {
                            ...conv,
                            labels: [...existingLabels, serverLabel],
                        };

                        if (selectedConversation?.id === conversationId) {
                            setSelectedConversation(updatedConv);
                        }

                        return updatedConv;
                    }
                    return conv;
                });

                setConversations(finalConversations);
            }

            return true;
        } catch (error) {
            // Revert optimistic update
            setConversations(previousConversations);
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(previousSelectedConversation);
            }

            toast.error(
                error.response?.data?.message || "Failed to assign label"
            );
            return false;
        }
    };

    // Remove label from conversation
    const removeLabelFromConversation = async (conversationId, labelId) => {
        // Check if conversation exists
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) {
            toast.error("Conversation not found");
            return false;
        }

        const existingLabels = conversation.labels || [];

        // Check if label is assigned
        if (!existingLabels.some((l) => l.id === labelId)) {
            toast.error("Label not assigned to this conversation");
            return false;
        }

        // Optimistic update
        const previousConversations = conversations;
        const previousSelectedConversation = selectedConversation;

        const updatedConversations = conversations.map((conv) => {
            if (conv.id === conversationId) {
                const updatedConv = {
                    ...conv,
                    labels: existingLabels.filter((l) => l.id !== labelId),
                };

                // Update selected conversation if it's the same one
                if (selectedConversation?.id === conversationId) {
                    setSelectedConversation(updatedConv);
                }

                return updatedConv;
            }
            return conv;
        });

        setConversations(updatedConversations);

        try {
            await axiosInstance.delete(
                `/conversation-label/${conversationId}/labels/${labelId}`
            );

            return true;
        } catch (error) {
            // Revert optimistic update
            setConversations(previousConversations);
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(previousSelectedConversation);
            }

            toast.error(
                error.response?.data?.message || "Failed to remove label"
            );
            return false;
        }
    };

    //=========================UNUSED FUNCTIONS==========================

    // Get all labels for a specific conversation
    const getConversationLabels = (conversationId) => {
        const conversation = conversations.find((c) => c.id === conversationId);
        return conversation?.labels || [];
    };

    // Check if a conversation has a specific label
    const conversationHasLabel = (conversationId, labelId) => {
        const labels = getConversationLabels(conversationId);
        return labels.some((l) => l.id === labelId);
    };

    // Get conversations by label
    const getConversationsByLabel = (labelId) => {
        return conversations.filter((conv) => {
            const labels = conv.labels || [];
            return labels.some((l) => l.id === labelId);
        });
    };

    // Bulk assign label to multiple conversations
    const bulkAssignLabel = async (conversationIds, label) => {
        const previousConversations = conversations;
        const previousSelectedConversation = selectedConversation;

        // Optimistic update
        const updatedConversations = conversations.map((conv) => {
            if (conversationIds.includes(conv.id)) {
                const existingLabels = conv.labels || [];

                // Skip if already has this label
                if (existingLabels.some((l) => l.id === label.id)) {
                    return conv;
                }

                const labelAssignment = {
                    ...label,
                    assigned_at: new Date().toISOString(),
                    conversation_id: conv.id,
                };

                const updatedConv = {
                    ...conv,
                    labels: [...existingLabels, labelAssignment],
                };

                // Update selected conversation if needed
                if (selectedConversation?.id === conv.id) {
                    setSelectedConversation(updatedConv);
                }

                return updatedConv;
            }
            return conv;
        });

        setConversations(updatedConversations);

        try {
            await axiosInstance.post(
                "/conversation-labels/conversations/labels/bulk-assign",
                {
                    conversationIds,
                    labelId: label.id,
                }
            );

            toast.success(
                `Label assigned to ${conversationIds.length} conversation(s)`
            );
            return true;
        } catch (error) {
            // Revert optimistic update
            setConversations(previousConversations);
            if (previousSelectedConversation) {
                setSelectedConversation(previousSelectedConversation);
            }

            toast.error(
                error.response?.data?.message || "Failed to assign labels"
            );
            return false;
        }
    };

    // Bulk remove label from multiple conversations
    const bulkRemoveLabel = async (conversationIds, labelId) => {
        const previousConversations = conversations;
        const previousSelectedConversation = selectedConversation;

        // Optimistic update
        const updatedConversations = conversations.map((conv) => {
            if (conversationIds.includes(conv.id)) {
                const existingLabels = conv.labels || [];

                const updatedConv = {
                    ...conv,
                    labels: existingLabels.filter((l) => l.id !== labelId),
                };

                // Update selected conversation if needed
                if (selectedConversation?.id === conv.id) {
                    setSelectedConversation(updatedConv);
                }

                return updatedConv;
            }
            return conv;
        });

        setConversations(updatedConversations);

        try {
            await axiosInstance.post(
                "/conversation-labels/conversations/labels/bulk-remove",
                {
                    conversationIds,
                    labelId,
                }
            );

            toast.success(
                `Label removed from ${conversationIds.length} conversation(s)`
            );
            return true;
        } catch (error) {
            // Revert optimistic update
            setConversations(previousConversations);
            if (previousSelectedConversation) {
                setSelectedConversation(previousSelectedConversation);
            }

            toast.error(
                error.response?.data?.message || "Failed to remove labels"
            );
            return false;
        }
    };

    // Remove all labels from a conversation
    const clearConversationLabels = async (conversationId) => {
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) {
            toast.error("Conversation not found");
            return false;
        }

        const existingLabels = conversation.labels || [];
        if (existingLabels.length === 0) {
            toast.error("No labels to remove");
            return false;
        }

        const previousConversations = conversations;
        const previousSelectedConversation = selectedConversation;

        // Optimistic update
        const updatedConversations = conversations.map((conv) => {
            if (conv.id === conversationId) {
                const updatedConv = {
                    ...conv,
                    labels: [],
                };

                if (selectedConversation?.id === conversationId) {
                    setSelectedConversation(updatedConv);
                }

                return updatedConv;
            }
            return conv;
        });

        setConversations(updatedConversations);

        try {
            await axiosInstance.delete(
                `/conversation-labels/conversations/${conversationId}/labels`
            );

            toast.success("All labels removed successfully");
            return true;
        } catch (error) {
            // Revert optimistic update
            setConversations(previousConversations);
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(previousSelectedConversation);
            }

            toast.error(
                error.response?.data?.message || "Failed to remove labels"
            );
            return false;
        }
    };

    //=====================================================================

    return {
        assignLabelToConversation,
        removeLabelFromConversation,
        getConversationLabels,
        conversationHasLabel,
        getConversationsByLabel,
        bulkAssignLabel,
        bulkRemoveLabel,
        clearConversationLabels,
    };
};
