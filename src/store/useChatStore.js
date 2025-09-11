import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
	messages: [],
	criticalConversations: [],
	selectedConversation: null,
	isConversationsLoading: false,
	isMessagesLoading: false,

	getInitialConversations: async () => {
		set({ isConversationsLoading: true });
		try {
			const res = await axiosInstance.get("/conversations/");
			console.log(res.data);
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
				`/messages/conversations?offset=${lastConversationId}&limit=100`
			);
			console.log(res.data);
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
				`/messages/conversations/${conversationId}`
			);
			console.log(res.data);
			res.data.conversation.human_intervention_required
				? set({
						criticalConversations: [
							...get().criticalConversations,
							...res.data.conversation,
						],
						conversations: [
							...get().conversations,
							...res.data.conversation,
						],
				  })
				: set({
						conversations: [
							...get().conversations,
							...res.data.conversation,
						],
				  });
		} catch (error) {
			toast.error(error.response.data.message);
		} finally {
			set({ isConversationsLoading: false });
		}
	},

	// sendMessage: async (messageData) => {
	// 	const { selectedConversation, messages } = get();
	// 	try {
	// 		const res = await axiosInstance.post(
	// 			`/messages/send/${selectedConversation.id}`,
	// 			messageData
	// 		);
	// 		set({ messages: [...messages, res.data] });
	// 	} catch (error) {
	// 		toast.error(error.response.data.message);
	// 	}
	// },

	getMessages: async (conversationId) => {
		set({ isMessagesLoading: true });
		try {
			const res = await axiosInstance.get(`/messages/${conversationId}`);
			set({ messages: [...res.data.messages] });
		} catch (error) {
			toast.error(error.response.data.message);
		} finally {
			set({ isMessagesLoading: false });
		}
	},

	subscribeToMessages: () => {
		const { selectedConversation } = get();
		if (!selectedConversation) return;

		const socket = useAuthStore.getState().socket;

		socket.on("newMessage", (newMessage) => {
			const isMessageSentFromSelectedConversation =
				newMessage.conversation_id === selectedConversation.id;
			if (!isMessageSentFromSelectedConversation) return;

			console.log("New message received", newMessage);
			set({
				messages: [...get().messages, newMessage],
			});

			// Move the conversation to the top and update last_message
			const conversations = get().conversations || [];
			const updatedConversations = conversations
				.map((conv) =>
					conv.id === newMessage.conversation_id
						? { ...conv, last_message: newMessage }
						: conv
				)
				.sort((a, b) => {
					const aTime = a.last_message?.provider_ts || 0;
					const bTime = b.last_message?.provider_ts || 0;
					return bTime - aTime;
				});

			set({ conversations: updatedConversations });
		});
	},

	unsubscribeFromMessages: () => {
		const socket = useAuthStore.getState().socket;
		socket.off("newMessage");
	},

	setSelectedConversation: (selectedConversation) =>
		set({ selectedConversation }),
}));
