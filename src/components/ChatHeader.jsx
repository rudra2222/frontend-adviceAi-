import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import TakeoverToggleButton from "../custom/TakeoverToggleButton";
import { useState } from "react";

const ChatHeader = () => {
	const { selectedConversation, setSelectedConversation } = useChatStore();
	// const { onlineConversations } = useAuthStore();
	const [takeoverToggle, setTakeoverToggle] = useState(false);

	return (
		<div className="p-2.5 border-b border-base-300">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{/* Avatar */}
					<div className="avatar">
						<div className="size-10 rounded-full relative">
							<img
								src={
									selectedConversation.profilePic ||
									"/avatar.png"
								}
								alt={selectedConversation.name}
							/>
						</div>
					</div>

					{/* Conversation info */}
					<div>
						<h3 className="font-medium">
							{selectedConversation.name}
						</h3>
						<p className="text-sm text-base-content/70">
							{selectedConversation.phone}
							{/* {onlineConversations.includes(selectedConversation.id) ? "Online" : "Offline"} */}
						</p>
					</div>
				</div>

				<TakeoverToggleButton
					isActive={takeoverToggle}
					onToggle={() => setTakeoverToggle(!takeoverToggle)}
				/>

				{/* Close button */}
				<button
					className="btn btn-sm btn-circle gap-2 hover:bg-red-600"
					onClick={() => setSelectedConversation(null)}
				>
					<X />
				</button>
			</div>
		</div>
	);
};
export default ChatHeader;
