import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import TakeoverToggleButton from "./TakeoverToggleButton";
import profilePicColors from "../lib/profilePicColors.js";
import { useEffect } from "react";

const ChatHeader = () => {
    const {
        selectedConversation,
        setSelectedConversation,
        setIsHumanInterventionActive,
    } = useChatStore();
    // const { onlineConversations } = useAuthStore();

    useEffect(() => {
        setIsHumanInterventionActive(
            selectedConversation?.human_intervention_required
        );
    }, [selectedConversation?.human_intervention_required]);

    return (
        <div className="p-2.5 border-b border-base-300">
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
                                        selectedConversation.name?.charAt(0) +
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
                            {selectedConversation.name}
                        </h3>
                        <p className="text-sm text-base-content/70">
                            {selectedConversation.phone}
                            {/* {onlineConversations.includes(selectedConversation.id) ? "Online" : "Offline"} */}
                        </p>
                    </div>
                </div>

                <TakeoverToggleButton />

                {/* Close button */}
                <button
                    className="btn btn-sm btn-circle gap-2 bg-transparent border-transparent text-gray-200 hover:bg-red-600"
                    onClick={() => setSelectedConversation(null)}
                >
                    <X />
                </button>
            </div>
        </div>
    );
};
export default ChatHeader;
