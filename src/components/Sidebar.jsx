import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Image, Plus } from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import profilePicColors from "../lib/profilePicColors.js";

// Example default labels
const DEFAULT_LABELS = [{ name: "All" }, { name: "Critical" }];

const Sidebar = () => {
	const {
		getInitialConversations,
		conversations,
		selectedConversation,
		setSelectedConversation,
		isConversationsLoading,
	} = useChatStore();

	const [labels, setLabels] = useState(DEFAULT_LABELS);
	const [activeLabel, setActiveLabel] = useState("All");
	const [showLabelModal, setShowLabelModal] = useState(false);
	const [newLabelName, setNewLabelName] = useState("");
	const [selectedContacts, setSelectedContacts] = useState([]);

	useEffect(() => {
		getInitialConversations();
	}, []);

	// Filter conversations based on label
	const filteredConversations = conversations.filter((conv) => {
		if (activeLabel === "All") return true;
		if (activeLabel === "Unread") return conv.unread;
		if (activeLabel === "Favorites") return conv.favorite;
		if (activeLabel === "Groups") return conv.is_group;
		// Custom label: check if conversation is associated
		return conv.labels?.includes(activeLabel);
	});

	// Sort conversations by latest message timestamp (descending)
	const sortedConversations = [...(filteredConversations || [])].sort(
		(a, b) => {
			const aTime = a.last_message?.provider_ts
				? new Date(a.last_message.provider_ts).getTime()
				: 0;
			const bTime = b.last_message?.provider_ts
				? new Date(b.last_message.provider_ts).getTime()
				: 0;
			return bTime - aTime;
		}
	);

	if (isConversationsLoading) return <SidebarSkeleton />;

	// Modal for adding a new label
	const handleAddLabel = () => {
		if (!newLabelName.trim()) return;
		setLabels([...labels, { name: newLabelName }]);
		// Associate selected contacts with the new label
		selectedContacts.forEach((convId) => {
			const idx = conversations.findIndex((c) => c.id === convId);
			if (idx !== -1) {
				conversations[idx].labels = [
					...(conversations[idx].labels || []),
					newLabelName,
				];
			}
		});
		setNewLabelName("");
		setSelectedContacts([]);
		setShowLabelModal(false);
	};

	return (
		<aside className="h-full w-20 lg:w-96 border-r border-base-300 flex flex-col transition-all duration-200">
			<div className="border-b border-base-300 w-full p-5">
				<div className="flex items-center gap-2">
					<Users className="size-6" />
					<span className="font-medium hidden lg:block">
						Contacts
					</span>
				</div>
			</div>

			{/* Labels section */}
			<div className="w-full px-2 py-2 border-b border-base-300">
				<div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
					{labels.map((label) => (
						<button
							key={label.name}
							onClick={() => setActiveLabel(label.name)}
							className={`px-4 py-1 rounded-full border ${
								activeLabel === label.name
									? "bg-green-800 text-white"
									: "bg-transparent text-zinc-300"
							} whitespace-nowrap`}
						>
							{label.name}
						</button>
					))}
					<button
						onClick={() => setShowLabelModal(true)}
						className="px-2 py-1 rounded-full border bg-transparent text-zinc-300 flex items-center"
						title="Add label"
					>
						<Plus className="size-4" />
					</button>
				</div>
			</div>

			{/* Modal for adding label */}
			{showLabelModal && (
				<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
					<div className="bg-zinc-900 p-6 rounded-lg w-80">
						<h2 className="text-lg font-bold mb-2">Create Label</h2>
						<input
							type="text"
							placeholder="Label name"
							value={newLabelName}
							onChange={(e) => setNewLabelName(e.target.value)}
							className="input input-bordered w-full mb-3"
						/>
						<div className="mb-2 text-sm font-medium">
							Select contacts:
						</div>
						<div className="max-h-32 overflow-y-auto mb-3">
							{conversations.map((conv) => (
								<label
									key={conv.id}
									className="flex items-center gap-2 mb-1"
								>
									<input
										type="checkbox"
										checked={selectedContacts.includes(
											conv.id
										)}
										onChange={(e) => {
											if (e.target.checked) {
												setSelectedContacts([
													...selectedContacts,
													conv.id,
												]);
											} else {
												setSelectedContacts(
													selectedContacts.filter(
														(id) => id !== conv.id
													)
												);
											}
										}}
									/>
									<span>{conv.name || "Unknown"}</span>
								</label>
							))}
						</div>
						<div className="flex justify-end gap-2">
							<button
								onClick={() => setShowLabelModal(false)}
								className="btn btn-sm"
							>
								Cancel
							</button>
							<button
								onClick={handleAddLabel}
								className="btn btn-sm btn-success"
							>
								Add
							</button>
						</div>
					</div>
				</div>
			)}
			
			{/* Conversations List */}

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
										className={`size-12 object-cover rounded-full flex justify-center items-center ${profilePicColors(
											conversation.name
										)}`}
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
