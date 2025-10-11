import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    criticalConversations: [],
    conversations: [],
    selectedConversation: null,
    isConversationsLoading: false,
    isMessagesLoading: false,
    interventionToggleDisabled: false,
    isHumanInterventionActive: false,

    getInitialConversations: async () => {
        set({ isConversationsLoading: true });
        try {
            const res = await axiosInstance.get("/conversations/");
            set({
                criticalConversations: [...res.data.criticalConversations],
                conversations: [
                    ...res.data.criticalConversations,
                    ...res.data.nonCriticalConversations,
                ],
            });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isConversationsLoading: false });
        }
    },

    getNonCriticalConversationsPaginated: async (lastConversationId) => {
        set({ isConversationsLoading: true });
        try {
            const res = await axiosInstance.get(
                `/conversations?offset=${lastConversationId}&limit=100`
            );
            set({
                conversations: [
                    ...get().conversations,
                    ...res.data.nonCriticalConversations,
                ],
            });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isConversationsLoading: false });
        }
    },

    getConversation: async (conversationId) => {
        set({ isConversationsLoading: true });
        try {
            const res = await axiosInstance.get(
                `/conversations/${conversationId}/`
            );
            res.data.conversation.human_intervention_required
                ? set({
                      criticalConversations: [
                          ...get().criticalConversations,
                          res.data.conversation,
                      ],
                      conversations: [
                          ...get().conversations,
                          res.data.conversation,
                      ],
                  })
                : set({
                      conversations: [
                          ...get().conversations,
                          res.data.conversation,
                      ],
                  });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isConversationsLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        try {
            let uploadRes;
            if (messageData.file) {
                const formData = new FormData();
                formData.append("file", messageData.file);
                uploadRes = await axiosInstance.post(
                    "/messages/upload",
                    formData
                );
            }

            const body = uploadRes
                ? {
                      receiverPhone: get().selectedConversation.phone,
                      senderId: useAuthStore.getState().authUser?.id,
                      message:
                          messageData.text?.length > 0
                              ? messageData.text
                              : null,
                      media: uploadRes?.data?.fileId,
                      mimeType: messageData.fileType,
                  }
                : {
                      receiverPhone: get().selectedConversation.phone,
                      senderId: useAuthStore.getState().authUser?.id,
                      message:
                          messageData.text?.length > 0
                              ? messageData.text
                              : null,
                      media: null,
                      mimeType: null,
                  };

            const res = await axiosInstance.post(
                "/messages/send-message",
                body
            );

            uploadRes = null;
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    },

    getMessages: async (conversationId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${conversationId}`);
            // Sort messages by timestamp
            const sortedMessages = res.data.messages.sort(
                (a, b) => new Date(a.provider_ts) - new Date(b.provider_ts)
            );
            set({ messages: sortedMessages });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        socket?.on("newMessage", async (newMessage) => {
            let isContains = false;
            get().conversations?.map((conv) => {
                if (conv.id === newMessage.conversation_id) {
                    isContains = true;
                    return;
                }
            });

            if (!isContains) {
                get().getConversation(newMessage.conversation_id);
            }

            set({
                messages: [...get().messages, newMessage],
            });

            // Move the conversation to the top and update last_message
            const conversations = get().conversations || [];
            const updatedConversations = conversations.map((conv) =>
                conv.id === newMessage.conversation_id
                    ? {
                          ...conv,
                          last_message: {
                              id: newMessage.id,
                              direction: newMessage.direction,
                              sender_id: newMessage.sender_id,
                              message_text: newMessage.message_text,
                              media_info: newMessage.media_info,
                              provider_ts: newMessage.provider_ts,
                          },
                      }
                    : conv
            );

            set({ conversations: updatedConversations });
        });
    },

    setSelectedConversation: (selectedConversation) =>
        set({ selectedConversation }),

    setInterventionToggleDisabled: (interventionToggleDisabled) =>
        set({ interventionToggleDisabled }),

    setIsHumanInterventionActive: (isHumanInterventionActive) =>
        set({ isHumanInterventionActive }),

    // ==================== CRITICAL LABEL LOGIC START ====================
    // TODO: To restore previous state, remove everything between these markers

    // Add conversation to critical list when takeover is activated
    addToCriticalConversations: (conversationId) => {
        const conversations = get().conversations;
        const conversation = conversations.find((c) => c.id === conversationId);

        if (!conversation) return;

        const criticalConversations = get().criticalConversations;
        const alreadyExists = criticalConversations.some(
            (c) => c.id === conversationId
        );

        if (!alreadyExists) {
            set({
                criticalConversations: [...criticalConversations, conversation],
            });
        }
    },

    // Remove conversation from critical list when takeover is deactivated
    removeFromCriticalConversations: (conversationId) => {
        const criticalConversations = get().criticalConversations;
        set({
            criticalConversations: criticalConversations.filter(
                (c) => c.id !== conversationId
            ),
        });
    },

    // ==================== CRITICAL LABEL LOGIC END ====================

    // ==================== LABEL ASSIGNMENT LOGIC START ====================
    // TODO: Database migration needed - add conversation_labels junction table
    // See useLabelsStore.js for complete database schema

    // Assign label to conversation
    assignLabelToConversation: (conversationId, label) => {
        const conversations = get().conversations;
        const selectedConversation = get().selectedConversation;

        const updatedConversations = conversations.map((conv) => {
            if (conv.id === conversationId) {
                const existingLabels = conv.labels || [];
                // Check if label already assigned
                if (existingLabels.some((l) => l.id === label.id)) {
                    return conv;
                }
                // Add new label
                const updatedConv = {
                    ...conv,
                    labels: [...existingLabels, label],
                };

                // Update selected conversation if it's the same one
                if (selectedConversation?.id === conversationId) {
                    set({ selectedConversation: updatedConv });
                }

                return updatedConv;
            }
            return conv;
        });

        set({ conversations: updatedConversations });

        // TODO: Call API to persist label assignment
        // await axiosInstance.post(`/conversations/${conversationId}/labels`, {
        //     labelId: label.id,
        // });
    },

    // Remove label from conversation
    removeLabelFromConversation: (conversationId, labelId) => {
        const conversations = get().conversations;
        const selectedConversation = get().selectedConversation;

        const updatedConversations = conversations.map((conv) => {
            if (conv.id === conversationId) {
                const existingLabels = conv.labels || [];
                const updatedConv = {
                    ...conv,
                    labels: existingLabels.filter((l) => l.id !== labelId),
                };

                // Update selected conversation if it's the same one
                if (selectedConversation?.id === conversationId) {
                    set({ selectedConversation: updatedConv });
                }

                return updatedConv;
            }
            return conv;
        });

        set({ conversations: updatedConversations });

        // TODO: Call API to remove label assignment
        // await axiosInstance.delete(
        //     `/conversations/${conversationId}/labels/${labelId}`
        // );
    },

    // ==================== LABEL ASSIGNMENT LOGIC END ====================

    takeover: async () => {
        try {
            set({ interventionToggleDisabled: true });

            const res = await axiosInstance.post("/takeover", {
                phone: get().selectedConversation.phone,
            });

            if (res.status !== 200) {
                throw new Error();
            }
            set({ isHumanInterventionActive: true });

            // ==================== CRITICAL LABEL LOGIC START ====================
            // Add to critical conversations when takeover is activated
            get().addToCriticalConversations(get().selectedConversation.id);
            // ==================== CRITICAL LABEL LOGIC END ====================
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ interventionToggleDisabled: false });
        }
    },

    handback: async () => {
        try {
            set({ interventionToggleDisabled: true });

            const res = await axiosInstance.post("/handback", {
                phone: get().selectedConversation.phone,
            });

            if (res.status !== 200) {
                throw new Error();
            }
            set({ isHumanInterventionActive: false });

            // ==================== CRITICAL LABEL LOGIC START ====================
            // Remove from critical conversations when takeover is deactivated
            get().removeFromCriticalConversations(
                get().selectedConversation.id
            );
            // ==================== CRITICAL LABEL LOGIC END ====================
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ interventionToggleDisabled: false });
        }
    },
}));
