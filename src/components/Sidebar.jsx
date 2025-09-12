import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Image } from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import profilePicColors from "../lib/profilePicColors.js";

const Sidebar = () => {
	const {
		getInitialConversations,
		conversations,
		selectedConversation,
		setSelectedConversation,
		isConversationsLoading,
	} = useChatStore();

	// const { onlineUsers } = useAuthStore();
	// const [showCriticalConversations, setShowCriticalConversations] =
	// 	useState(false);

	useEffect(() => {
		getInitialConversations();
	}, []);

	// const conversationsToShow = showCriticalConversations
	// 	? criticalConversations
	// 	: conversations;

	// Sort conversations by latest message timestamp (descending)
	const sortedConversations = [...(conversations || [])].sort((a, b) => {
		const aTime = a.last_message?.provider_ts
			? new Date(a.last_message.provider_ts).getTime()
			: 0;
		const bTime = b.last_message?.provider_ts
			? new Date(b.last_message.provider_ts).getTime()
			: 0;
		return bTime - aTime;
	});

	if (isConversationsLoading) return <SidebarSkeleton />;

	return (
		<aside className="h-full w-20 lg:w-96 border-r border-base-300 flex flex-col transition-all duration-200">
			<div className="border-b border-base-300 w-full p-5">
				<div className="flex items-center gap-2">
					<Users className="size-6" />
					<span className="font-medium hidden lg:block">
						Contacts
					</span>
				</div>
				{/* TODO: Critical chats filter toggle */}
				{/* <div className="mt-3 hidden lg:flex items-center gap-2">
					<label className="cursor-pointer flex items-center gap-2">
						<input
							type="checkbox"
							checked={showCriticalConversations}
							onChange={(e) =>
								setShowCriticalConversations(e.target.checked)
							}
							className="checkbox checkbox-sm"
						/>
						<span className="text-sm">
							Show Critical Conversations
						</span>
					</label>
					<span className="text-xs text-zinc-500">
						({onlineUsers.length == 0 ? 0 : onlineUsers.length - 1}{" "}
						online)
					</span>
				</div> */}
			</div>

			<div className="overflow-y-auto w-full py-3">
				{sortedConversations?.map((conversation) => {
					return (
						<button
							key={conversation.id}
							onClick={() =>
								setSelectedConversation(conversation)
							}
							className={`
            w-full p-3 flex items-center gap-3
            hover:bg-green-800 transition-colors
			${
				selectedConversation?.id === conversation.id
					? "bg-stone-800 ring-1 ring-base-300"
					: ""
			}
            `}
						>
							<div className="relative mx-auto lg:mx-0">
								{conversation.name == null && (
									<img
										src="/avatar.png"
										alt="avatar"
										className="size-12 object-cover rounded-full"
									/>
								)}
								{conversation.name != null && (
									<div
										className={`size-12 object-cover rounded-full flex justify-center items-center ${
											profilePicColors(conversation.name)
										}`}
									>
										{conversation.name?.charAt(0) +
											(conversation.name?.indexOf(" ") > 0
												? conversation.name
														?.substring(
															conversation.name?.indexOf(
																" "
															) + 1
														)
														.charAt(0)
												: "")}
									</div>
								)}
							</div>
							<div className="hidden lg:block text-left min-w-72">
								<div className="flex justify-between">
									<span className="font-medium truncate w-1/2">
										{conversation.name?.length > 0
											? conversation.name
											: "Unknown"}
									</span>
									{conversation.last_message?.id && (
										<span className="text-xs text-zinc-500 ">
											{formatMessageTime(
												conversation.last_message
													.provider_ts
											)}
										</span>
									)}
								</div>
								<div>
									{conversation.last_message?.id && (
										<p className="flex items-center gap-1 text-sm text-zinc-400 truncate w-64">
											{conversation.last_message
												.media_info == null ? null : (
												<Image className="size-4" />
											)}
											{conversation.last_message
												.message_text?.length > 0
												? conversation.last_message
														.message_text
												: "Media"}
										</p>
									)}
								</div>
							</div>
						</button>
					);
				})}
			</div>
		</aside>
	);
};
export default Sidebar;
