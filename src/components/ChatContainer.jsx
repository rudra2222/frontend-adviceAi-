import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
	const {
		messages,
		getMessages,
		isMessagesLoading,
		selectedConversation,
		subscribeToMessages,
		unsubscribeFromMessages,
	} = useChatStore();
	const { authUser } = useAuthStore();
	const messageEndRef = useRef(null);

	useEffect(() => {
		getMessages(selectedConversation.id); // later add the lazy loading feature

		subscribeToMessages();

		return () => unsubscribeFromMessages();
	}, [
		selectedConversation.id,
		getMessages,
		subscribeToMessages,
		unsubscribeFromMessages,
	]);

	useEffect(() => {
		if (messageEndRef.current && messages) {
			messageEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	if (isMessagesLoading) {
		return (
			<div className="flex-1 flex flex-col overflow-auto">
				<ChatHeader />
				<MessageSkeleton />
				<MessageInput />
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col overflow-auto">
			<ChatHeader />

			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.map((message) => {
					return (
						<div
							key={message.id}
							className={`chat ${
								message.direction === "outbound"
									? "chat-end"
									: "chat-start"
							}`}
							ref={messageEndRef}
						>
							<div className=" chat-image avatar">
								<div className="size-10 rounded-full border">
									<img
										src={
											message.senderId === authUser._id
												? authUser.profilePic ||
												"/avatar.png"
												: selectedUser.profilePic ||
												"/avatar.png"
										}
										alt="profile pic"
									/>
								</div>
							</div>
							<div className="chat-header mb-1">
								<time className="text-xs opacity-50 ml-1">
									{formatMessageTime(message.provider_ts)}
								</time>
							</div>
							<div className="chat-bubble flex flex-col">
								{message.media_info && (
									<img
										src={message.image}
										alt="Attachment"
										className="sm:max-w-[200px] rounded-md mb-2"
									/>
								)}
								{message.has_text && (
									<p>{message.message_text}</p>
								)}
							</div>
						</div>
					);
				})}
			</div>

			<MessageInput />
		</div>
	);
};
export default ChatContainer;
