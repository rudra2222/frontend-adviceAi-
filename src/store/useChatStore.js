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
				`/conversations?offset=${lastConversationId}&limit=100`
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
				`/conversations/${conversationId}/`
			);
			console.log(res.data);
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
			console.log(error);
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
		const socket = useAuthStore.getState().socket;

		socket?.on("newMessage", async (newMessage) => {
			console.log("New message received", newMessage);

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

	// unsubscribeFromMessages: () => {
	// 	const socket = useAuthStore.getState().socket;
	// 	socket.off("newMessage");
	// },

	setSelectedConversation: (selectedConversation) =>
		set({ selectedConversation }),
}));
