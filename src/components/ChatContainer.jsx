import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import profilePicColors from "../lib/profilePicColors.js";

const ChatContainer = () => {
	const {
		messages,
		getMessages,
		isMessagesLoading,
		selectedConversation,
		// subscribeToMessages,
		// unsubscribeFromMessages,
	} = useChatStore();
	// const { authUser } = useAuthStore();
	const messageEndRef = useRef(null);

	useEffect(() => {
		getMessages(selectedConversation.id); // later add the lazy loading feature
	}, [
		selectedConversation.id,
		getMessages,
		// subscribeToMessages,
		// unsubscribeFromMessages,
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

	const BACKEND_URL =
		import.meta.env.MODE === "development"
			? import.meta.env.VITE_LOCAL_URL
			: import.meta.env.VITE_BACKEND_URL;

	return (
		<div className="flex-1 flex flex-col overflow-auto">
			<ChatHeader />

			{messages.length === 0 && (
				<div className="flex-1 overflow-y-auto p-4 space-y-4 flex justify-center items-center text-stone-400">
					No messages yet!
				</div>
			)}

			{messages.length > 0 && (
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{Object.entries(
						messages
							.filter(
								(message) =>
									message.conversation_id ===
									selectedConversation.id
							)
							.reduce((acc, message) => {
								const date = new Date(message.provider_ts);
								const day = date.toDateString();
								if (!acc[day]) acc[day] = [];
								acc[day].push(message);
								return acc;
							}, {})
					).map(([day, dayMessages]) => (
						<div key={day}>
							<div className="flex justify-center my-2">
								<span className="bg-stone-900 text-xs text-stone-300 font-semibold p-2 my-3 rounded-lg shadow">
									{(() => {
										const now = new Date();
										const msgDate = new Date(day);
										const diffDays = Math.floor(
											(now - msgDate) /
												(1000 * 60 * 60 * 24)
										);
										if (diffDays === 0) return "Today";
										if (diffDays === 1) return "Yesterday";
										return `${diffDays} days ago`;
									})()}
								</span>
							</div>
							{dayMessages.map((message) => (
								<div
									key={message.id}
									className={`chat ${
										message.direction === "outbound"
											? "chat-end"
											: "chat-start"
									}`}
									ref={messageEndRef}
								>
									<div
										className={`chat-image avatar size-10 rounded-full border flex justify-center items-center ${
											message.direction === "inbound" &&
											profilePicColors(
												selectedConversation.name
											)
										}`}
									>
										{selectedConversation.name != null &&
											message.direction === "inbound" &&
											selectedConversation.name?.charAt(
												0
											) +
												(selectedConversation.name?.indexOf(
													" "
												) > 0
													? selectedConversation.name
															?.substring(
																selectedConversation.name?.indexOf(
																	" "
																) + 1
															)
															.charAt(0)
													: "")}

										{(selectedConversation.name == null ||
											message.direction ===
												"outbound") && (
											<img
												src="/avatar.png"
												alt="avatar"
											/>
										)}
									</div>
									<div className="chat-header mb-1">
										<time className="text-xs opacity-50 ml-1">
											{formatMessageTime(
												message.provider_ts
											)}
										</time>
									</div>
									<div
										className={`chat-bubble flex flex-col rounded-2xl ${
											message.direction === "outbound"
												? ""
												: "bg-zinc-800 text-white"
										} px-4 py-2`}
									>
										{((JSON.parse(message.media_info)
											?.id !== null &&
											JSON.parse(
												message.media_info
											)?.mime_type?.substring(
												0,
												JSON.parse(
													message.media_info
												)?.mime_type.indexOf("/")
											) === "image") ||
											JSON.parse(
												message.media_info
											)?.mime_type?.substring(
												0,
												JSON.parse(
													message.media_info
												)?.mime_type.indexOf("/")
											) === "gif") && (
											<img
												src={`${BACKEND_URL}/api/v1/get-media?id=${
													JSON.parse(
														message.media_info
													)?.id
												}&type=${
													JSON.parse(
														message.media_info
													)?.mime_type?.substring(
														0,
														JSON.parse(
															message.media_info
														)?.mime_type?.indexOf(
															"/"
														)
													) +
													"%2F" +
													JSON.parse(
														message.media_info
													)?.mime_type?.substring(
														JSON.parse(
															message.media_info
														)?.mime_type?.indexOf(
															"/"
														) + 1
													)
												}`}
												alt={
													JSON.parse(
														message.media_info
													)?.description?.length >
														0 &&
													JSON.parse(
														message.media_info
													)?.description
												}
												className="sm:max-w-[200px] rounded-md mb-2"
												loading="lazy"
											/>
										)}
										{JSON.parse(message.media_info)?.id !==
											null &&
											JSON.parse(
												message.media_info
											)?.mime_type?.substring(
												0,
												JSON.parse(
													message.media_info
												)?.mime_type?.indexOf("/")
											) === "video" && (
												<video
													src={`${BACKEND_URL}/api/v1/get-media?id=${
														JSON.parse(
															message.media_info
														)?.id
													}&type=${
														JSON.parse(
															message.media_info
														)?.mime_type?.substring(
															0,
															JSON.parse(
																message.media_info
															)?.mime_type?.indexOf(
																"/"
															)
														) +
														"%2F" +
														JSON.parse(
															message.media_info
														)?.mime_type?.substring(
															JSON.parse(
																message.media_info
															)?.mime_type?.indexOf(
																"/"
															) + 1
														)
													}`}
													alt={
														JSON.parse(
															message.media_info
														)?.description?.length >
														0
															? "Video"
															: JSON.parse(
																	message.media_info
															  )?.description
													}
													className="sm:max-w-[200px] rounded-md mb-2"
													controls
													preload="none"
												/>
											)}
										{JSON.parse(message.media_info)?.id !==
											null &&
											JSON.parse(
												message.media_info
											)?.mime_type?.substring(
												0,
												JSON.parse(
													message.media_info
												)?.mime_type?.indexOf("/")
											) === "audio" && (
												<audio controls>
													<source
														src={`${BACKEND_URL}/api/v1/get-media?id=${
															JSON.parse(
																message.media_info
															)?.id
														}&type=${
															JSON.parse(
																message.media_info
															)?.mime_type?.substring(
																0,
																JSON.parse(
																	message.media_info
																)?.mime_type?.indexOf(
																	"/"
																)
															) +
															"%2F" +
															JSON.parse(
																message.media_info
															)?.mime_type?.substring(
																JSON.parse(
																	message.media_info
																)?.mime_type?.indexOf(
																	"/"
																) + 1
															)
														}`}
														type={
															JSON.parse(
																message.media_info
															)?.mime_type
														}
														className="sm:max-w-[200px] rounded-md mb-2"
													/>
												</audio>
											)}
										{message.has_text && (
											<p className="whitespace-pre-wrap">
												{message.message_text}
											</p>
										)}
									</div>
								</div>
							))}
						</div>
					))}
				</div>
			)}

			<MessageInput />
		</div>
	);
};
export default ChatContainer;
