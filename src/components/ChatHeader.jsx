import { MoreVertical } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import TakeoverToggleButton from "./TakeoverToggleButton";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import profilePicColors from "../lib/profilePicColors.js";
import { useEffect, useState } from "react";
import ConfirmModal from "./ui/ConfirmModal";

const ChatHeader = () => {
    const {
        selectedConversation,
        setSelectedConversation,
        setIsHumanInterventionActive,
    } = useChatStore();
    const [clearModalOpen, setClearModalOpen] = useState(false);
    // const { onlineConversations } = useAuthStore();

    useEffect(() => {
        setIsHumanInterventionActive(
            selectedConversation?.human_intervention_required
        );
    }, [selectedConversation?.human_intervention_required]);

    return (
        <>
            <div className="p-2.5 border-b border-zinc-700 bg-zinc-900">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="avatar">
                            <div
                                className={`size-10 rounded-full relative ${profilePicColors(
                                    selectedConversation.name
                                )}`}
                            >
                                {selectedConversation.name != null && (
                                    <div className="block mt-2 text-center">
                                        {selectedConversation.name != null &&
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
                                    </div>
                                )}
                                {selectedConversation.name == null && (
                                    <img src="/avatar.png" alt="avatar" />
                                )}
                            </div>
                        </div>

                        {/* Conversation info */}
                        <div>
                            <h3 className="font-medium">
                                {selectedConversation.name
                                    ? selectedConversation.name
                                    : "Unknown"}
                            </h3>
                            <p className="text-sm text-base-content/70 text-gray-300">
                                {selectedConversation.phone}
                                {/* {onlineConversations.includes(selectedConversation.id) ? "Online" : "Offline"} */}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <TakeoverToggleButton />

                        {/* Three-dot menu replacing close button - contains Close chat and Clear Chat */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    className="btn btn-sm btn-circle gap-2 bg-transparent border-transparent text-gray-200 hover:bg-zinc-800"
                                    aria-label="More actions"
                                >
                                    <MoreVertical />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    className="hover:bg-gray-800"
                                    onClick={() => {
                                        // Close chat (deselect)
                                        setSelectedConversation(null);
                                    }}
                                >
                                    Close chat
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="hover:bg-red-500"
                                    onClick={() => {
                                        if (!selectedConversation?.id) return;
                                        setClearModalOpen(true);
                                    }}
                                >
                                    Clear chat
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Confirm modal for clearing messages */}
            <ConfirmModal
                open={!!selectedConversation && clearModalOpen}
                title={"Clear chat"}
                description={
                    "Clear all messages in this chat? This cannot be undone."
                }
                onConfirm={async () => {
                    try {
                        await useChatStore
                            .getState()
                            .clearMessages(selectedConversation.id);
                    } catch (e) {
                        // store shows toast
                    } finally {
                        setClearModalOpen(false);
                    }
                }}
                onCancel={() => setClearModalOpen(false)}
            />
        </>
    );
};
export default ChatHeader;
