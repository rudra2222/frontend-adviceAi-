import { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import {
    Image,
    Clapperboard,
    AudioLines,
    File,
    ChevronDown,
    Sticker,
} from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import profilePicColors from "../lib/profilePicColors.js";
import ChatSearchBox from "./ChatSearchBox";
import LabelPill from "./LabelPill";
import LabelDropdown from "./LabelDropdown";
import LabelAssignmentMenu from "./LabelAssignmentMenu";
import LabelIcon from "./LabelIcon";
import { useLabelsStore } from "../store/useLabelsStore";
import { useConversationLabelActions } from "../store/useConversationLabelActions";

/**
 * Renders appropriate icon based on media MIME type
 * @param {string} mimeType - MIME type of the media
 * @returns {JSX.Element|null} Icon component or null
 */
const renderIcon = (mimeType) => {
    if (!mimeType) return null;
    if (mimeType.startsWith("image/")) {
        return <Image className="size-4 inline mr-2 align-text-center" />;
    }
    if (mimeType.startsWith("video/")) {
        return (
            <Clapperboard className="size-4 inline mr-2 align-text-center" />
        );
    }
    if (mimeType.startsWith("audio/")) {
        return <AudioLines className="size-4 inline mr-2 align-text-center" />;
    }
    return <File className="size-4 inline mr-2 align-text-center" />;
};

const Sidebar = () => {
    const {
        getInitialConversations,
        conversations = [],
        criticalConversations = [],
        selectedConversation,
        setSelectedConversation,
        isConversationsLoading,
        hasInitiallyLoaded,
    } = useChatStore();

    const {
        labels,
        initializeLabels,
        selectedLabelFilter,
        setSelectedLabelFilter,
    } = useLabelsStore();

    const { assignLabelToConversation, removeLabelFromConversation } =
        useConversationLabelActions();

    // State for search query
    const [searchQuery, setSearchQuery] = useState("");
    const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
    const [labelAssignmentMenu, setLabelAssignmentMenu] = useState({
        isOpen: false,
        conversation: null,
        position: { top: 0, left: 0 },
    });

    // Load conversations and labels on mount
    useEffect(() => {
        const loadData = async () => {
            await getInitialConversations();
            await initializeLabels();
        };
        loadData();
    }, [getInitialConversations, initializeLabels]);

    // Handle right-click on conversation to show label assignment menu
    const handleContextMenu = (e, conversation) => {
        e.preventDefault();
        setLabelAssignmentMenu({
            isOpen: true,
            conversation,
            position: {
                top: e.clientY,
                left: e.clientX - 250, // Offset to show menu to the left
            },
        });
    };

    // Handle assign label
    const handleAssignLabel = (conversationId, label) => {
        assignLabelToConversation(conversationId, label);
    };

    // Handle remove label
    const handleRemoveLabel = (conversationId, labelId) => {
        removeLabelFromConversation(conversationId, labelId);
    };

    // Close label assignment menu
    const closeLabelAssignmentMenu = () => {
        setLabelAssignmentMenu({
            isOpen: false,
            conversation: null,
            position: { top: 0, left: 0 },
        });
    };

    /**
     * Filters conversations based on search query
     * Searches across: name, last message, participant names, numbers, and phone
     */
    const filteredConversations = useMemo(() => {
        let filtered = conversations;

        // Apply label filter first
        if (selectedLabelFilter === "critical") {
            // Show only critical conversations (where takeover is active)
            filtered = criticalConversations;
        } else if (selectedLabelFilter !== "all") {
            // Filter by specific label
            filtered = conversations.filter((conv) =>
                conv.labels?.some((label) => label.id === selectedLabelFilter)
            );
        }

        // Then apply search query
        if (!searchQuery.trim()) return filtered;

        const query = searchQuery.trim().toLowerCase();

        return filtered.filter((conv) => {
            // Match against chat/group name
            const nameMatch = (conv.name || "").toLowerCase().includes(query);

            // Match against last message content
            const lastMsgMatch = (conv.last_message?.message_text || "")
                .toLowerCase()
                .includes(query);

            // Match against participant names (if available)
            const participants =
                conv.participants?.map((p) => p.name?.toLowerCase() || "") ||
                [];
            const participantMatch = participants.some((n) =>
                n.includes(query)
            );

            // Match against participant numbers (if available)
            const numberMatch =
                conv.participants?.some((p) =>
                    (p.number || "").toString().toLowerCase().includes(query)
                ) || false;

            // Match against conversation's own number
            const convNumberMatch = (conv.number || "")
                .toString()
                .toLowerCase()
                .includes(query);

            // Match against conversation phone
            const phoneMatch = (conv.phone || "")
                .toString()
                .toLowerCase()
                .includes(query);

            return (
                nameMatch ||
                lastMsgMatch ||
                participantMatch ||
                numberMatch ||
                convNumberMatch ||
                phoneMatch
            );
        });
    }, [
        conversations,
        criticalConversations,
        searchQuery,
        selectedLabelFilter,
    ]);

    /**
     * Sort conversations by most recent message timestamp
     * Most recent conversations appear first
     */
    const sortedConversations = useMemo(
        () =>
            [...(filteredConversations || [])].sort((a, b) => {
                const aTime = a.last_message?.provider_ts
                    ? new Date(a.last_message.provider_ts).getTime()
                    : 0;
                const bTime = b.last_message?.provider_ts
                    ? new Date(b.last_message.provider_ts).getTime()
                    : 0;
                return bTime - aTime; // Most recent first
            }),
        [filteredConversations]
    );

    // Show loading skeleton only on initial load, not when new conversations are added
    if (isConversationsLoading && !hasInitiallyLoaded)
        return <SidebarSkeleton />;

    // Get selected label name for display
    const getSelectedLabelName = () => {
        if (selectedLabelFilter === "all") return "All";
        if (selectedLabelFilter === "critical") return "Critical";
        const label = labels.find((l) => l.id === selectedLabelFilter);
        return label?.name || "All";
    };

    return (
        <aside className="h-full pr-3 mr-2 w-20 lg:w-fit border-r border-zinc-700 flex flex-col transition-all duration-200">
            {/* Search Box */}
            <ChatSearchBox
                value={searchQuery}
                onSearch={setSearchQuery}
                activeTab="all"
            />

            {/* Label Filter Tabs - WhatsApp Style */}
            <div className="hidden lg:block px-3 py-2 border-b border-zinc-800 bg-zinc-900">
                <div className="flex items-center gap-2">
                    {/* All Tab */}
                    <button
                        onClick={() => setSelectedLabelFilter("all")}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                            selectedLabelFilter === "all"
                                ? "bg-zinc-700 text-white"
                                : "text-zinc-400 hover:bg-zinc-800"
                        }`}
                    >
                        All
                    </button>

                    {/* Critical Tab */}
                    <button
                        onClick={() => setSelectedLabelFilter("critical")}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                            selectedLabelFilter === "critical"
                                ? "bg-zinc-700 text-white"
                                : "text-zinc-400 hover:bg-zinc-800"
                        }`}
                    >
                        Critical
                        {criticalConversations.length > 0 && (
                            <span className="ml-0.5 px-1.5 py-0.5 bg-red-600 text-white rounded-full text-xs">
                                {criticalConversations.length}
                            </span>
                        )}
                    </button>

                    {/* Labels Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() =>
                                setIsLabelDropdownOpen(!isLabelDropdownOpen)
                            }
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 flex items-center gap-1 ${
                                selectedLabelFilter !== "all" &&
                                selectedLabelFilter !== "critical"
                                    ? "bg-zinc-700 text-white"
                                    : "text-zinc-400 hover:bg-zinc-800"
                            }`}
                        >
                            <span>
                                {selectedLabelFilter !== "all" &&
                                selectedLabelFilter !== "critical"
                                    ? getSelectedLabelName()
                                    : "Labels"}
                            </span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-180 ${
                                    isLabelDropdownOpen ? "rotate-180" : ""
                                }`}
                                style={{
                                    transitionTimingFunction:
                                        "cubic-bezier(0.4, 0.0, 0.2, 1)",
                                }}
                            />
                        </button>

                        {/* Label Dropdown - positioned absolutely relative to button */}
                        {isLabelDropdownOpen && (
                            <LabelDropdown
                                isOpen={isLabelDropdownOpen}
                                onClose={() => setIsLabelDropdownOpen(false)}
                                selectedLabelId={selectedLabelFilter}
                                onSelectLabel={setSelectedLabelFilter}
                                position={{
                                    top: "calc(100% + 8px)",
                                    left: "0",
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto w-fit py-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {sortedConversations.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8">
                        {searchQuery.trim()
                            ? "No chats found"
                            : "No conversations yet"}
                    </div>
                ) : (
                    sortedConversations.map((conversation) => (
                        <button
                            key={conversation.id}
                            onClick={() =>
                                setSelectedConversation(conversation)
                            }
                            onContextMenu={(e) =>
                                handleContextMenu(e, conversation)
                            }
                            className={`w-fit p-3 flex items-center gap-3 transition-colors rounded-xl
                                ${
                                    selectedConversation?.id === conversation.id
                                        ? "bg-stone-700 shadow-lg"
                                        : "hover:bg-green-800 hover:shadow-md rounded-xl"
                                }
                            `}
                            aria-label={`Open chat with ${
                                conversation.name || "Unknown"
                            }`}
                        >
                            {/* Avatar */}
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

                            {/* Conversation Info */}

                            <div className="w-fit max-w-64 hidden lg:flex flex-col text-left">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-0.5 truncate w-1/2">
                                        <span className="font-medium truncate">
                                            {conversation.name?.length > 0
                                                ? conversation.name
                                                : "Unknown"}
                                        </span>
                                        {/* Show Tag/Tags icon with label color */}
                                        <LabelIcon
                                            labels={conversation.labels}
                                        />
                                    </div>
                                    {conversation.last_message?.id && (
                                        <span className="text-xs text-zinc-500">
                                            {formatMessageTime(
                                                conversation.last_message
                                                    .provider_ts
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    {conversation.last_message?.id && (
                                        <p className="text-sm text-zinc-400 truncate w-64">
                                            {(() => {
                                                // Check if there's message text
                                                if (
                                                    conversation.last_message
                                                        .message_text?.length >
                                                    0
                                                ) {
                                                    // Show media icon if there's media_info
                                                    if (
                                                        conversation
                                                            .last_message
                                                            .media_info
                                                    ) {
                                                        try {
                                                            const mediaInfo =
                                                                JSON.parse(
                                                                    conversation
                                                                        .last_message
                                                                        .media_info
                                                                );
                                                            const mimeType =
                                                                mediaInfo?.mimeType ||
                                                                mediaInfo?.mime_type;
                                                            if (mimeType) {
                                                                return (
                                                                    <>
                                                                        {renderIcon(
                                                                            mimeType
                                                                        )}
                                                                        {
                                                                            conversation
                                                                                .last_message
                                                                                .message_text
                                                                        }
                                                                    </>
                                                                );
                                                            }
                                                        } catch (e) {
                                                            // Ignore parse errors
                                                        }
                                                    }
                                                    return conversation
                                                        .last_message
                                                        .message_text;
                                                }

                                                // No text, check for media
                                                if (
                                                    conversation.last_message
                                                        .media_info
                                                ) {
                                                    try {
                                                        const mediaInfo =
                                                            JSON.parse(
                                                                conversation
                                                                    .last_message
                                                                    .media_info
                                                            );
                                                        const mediaId =
                                                            mediaInfo?.mediaId ||
                                                            mediaInfo?.id;
                                                        const mimeType =
                                                            mediaInfo?.mimeType ||
                                                            mediaInfo?.mime_type;

                                                        // Check if we have valid media
                                                        if (
                                                            mediaId &&
                                                            mimeType
                                                        ) {
                                                            return (
                                                                <>
                                                                    {renderIcon(
                                                                        mimeType
                                                                    )}
                                                                    {mimeType.substring(
                                                                        0,
                                                                        mimeType.indexOf(
                                                                            "/"
                                                                        )
                                                                    )}
                                                                </>
                                                            );
                                                        }

                                                        // Invalid/unsupported media
                                                        return (
                                                            <>
                                                                <Sticker className="size-4 inline mr-2 align-text-center" />
                                                                Unsupported
                                                                message type
                                                            </>
                                                        );
                                                    } catch (e) {
                                                        return (
                                                            <>
                                                                <Sticker className="size-4 inline mr-2 align-text-center" />
                                                                Unsupported
                                                                message type
                                                            </>
                                                        );
                                                    }
                                                }

                                                // No text and no media
                                                return (
                                                    <>
                                                        <Sticker className="size-4 inline mr-2 align-text-center" />
                                                        Unsupported message type
                                                    </>
                                                );
                                            })()}
                                        </p>
                                    )}

                                    {/* Show first label if conversation has labels */}
                                    {conversation.labels &&
                                        conversation.labels.length > 0 && (
                                            <div className="mt-1">
                                                <LabelPill
                                                    name={
                                                        conversation.labels[0]
                                                            .name
                                                    }
                                                    color={
                                                        conversation.labels[0]
                                                            .color
                                                    }
                                                />
                                            </div>
                                        )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Label Assignment Menu */}
            <LabelAssignmentMenu
                isOpen={labelAssignmentMenu.isOpen}
                onClose={closeLabelAssignmentMenu}
                conversation={labelAssignmentMenu.conversation}
                onAssignLabel={handleAssignLabel}
                onRemoveLabel={handleRemoveLabel}
                position={labelAssignmentMenu.position}
            />
        </aside>
    );
};

export default Sidebar;
