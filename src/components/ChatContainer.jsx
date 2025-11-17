import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";
import MediaViewer from "./MediaViewer";
// import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import profilePicColors from "../lib/profilePicColors.js";
import { LinkifiedText } from "./util/LinkifiedText";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedConversation,
        // setInterventionToggleDisabled,
        // subscribeToMessages,
        // unsubscribeFromMessages,
    } = useChatStore();

    // const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);
    const messageRefs = useRef({});
    const [imageModal, setImageModal] = useState({
        isOpen: false,
        imageUrl: "",
        description: "",
    });
    const [videoModal, setVideoModal] = useState({
        isOpen: false,
        videoUrl: "",
        description: "",
    });

    useEffect(() => {
        getMessages(selectedConversation.id);
    }, [selectedConversation.id, getMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const scrollToMessage = (messageId) => {
        const element = messageRefs.current[messageId];
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            // Add a highlight effect
            element.classList.add("bg-zinc-700/50");
            setTimeout(() => {
                element.classList.remove("bg-zinc-700/50");
            }, 2000);
        }
    };

    const openImageModal = (imageUrl, description = "") => {
        setImageModal({
            isOpen: true,
            imageUrl,
            description,
        });
    };

    const closeImageModal = () => {
        setImageModal({
            isOpen: false,
            imageUrl: "",
            description: "",
        });
    };

    const openVideoModal = (videoUrl, description = "") => {
        setVideoModal({
            isOpen: true,
            videoUrl,
            description,
        });
    };

    const closeVideoModal = () => {
        setVideoModal({
            isOpen: false,
            videoUrl: "",
            description: "",
        });
    };

    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto chat-scrollbar">
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

    // Find the replied message by ID
    const findRepliedMessage = (repliedToId) => {
        return messages.find((msg) => msg.external_id === repliedToId);
    };

    return (
        <div className="flex-1 flex flex-col overflow-auto chat-scrollbar chat-doodle-bg">
            <ChatHeader />

            {messages.length === 0 && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex justify-center items-center text-stone-400 chat-scrollbar">
                    No messages yet!
                </div>
            )}

            {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent chat-doodle-bg">
                    {Object.entries(
                        messages
                            .filter(
                                (message) =>
                                    message.conversation_id ===
                                    selectedConversation.id
                            )
                            .sort(
                                (a, b) =>
                                    new Date(a.provider_ts) -
                                    new Date(b.provider_ts)
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
                            {dayMessages.map((message) => {
                                const contextObject =
                                    typeof message.extra_metadata === "string"
                                        ? JSON.parse(message.extra_metadata)
                                              ?.context
                                        : message.extra_metadata?.context;
                                const repliedMessage = contextObject?.id
                                    ? findRepliedMessage(contextObject?.id)
                                    : null;

                                return (
                                    <div
                                        key={message.id}
                                        ref={(el) =>
                                            (messageRefs.current[
                                                message.external_id
                                            ] = el)
                                        }
                                        className={`chat ${
                                            message.direction === "outbound"
                                                ? "chat-end"
                                                : "chat-start"
                                        } transition-colors duration-500`}
                                    >
                                        {message.direction === "outbound" && (
                                            <div
                                                className={`chat-image avatar size-10 rounded-full border bg-black flex justify-center items-center ${
                                                    message.direction ===
                                                        "inbound" &&
                                                    profilePicColors(
                                                        selectedConversation.name
                                                    )
                                                }`}
                                            >
                                                {message.sender_type ===
                                                    "ai" && (
                                                    <img
                                                        src="/AI-Neo.png"
                                                        alt="avatar"
                                                        className="rounded-full object-cover w-full h-full"
                                                    />
                                                )}
                                                {message.sender_type !==
                                                    "ai" && (
                                                    <img
                                                        src="/logo.webp"
                                                        alt="avatar"
                                                        className="rounded-full object-cover w-full h-full"
                                                    />
                                                )}
                                            </div>
                                        )}
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
                                                    ? "bg-[#144D37] text-white"
                                                    : "bg-zinc-800 text-white"
                                            } ${
                                                message.message_text?.length > 0
                                                    ? "px-4 py-2"
                                                    : "p-0"
                                            }`}
                                        >
                                            {/* Reply Preview Box */}
                                            {repliedMessage && (
                                                <div
                                                    onClick={() =>
                                                        scrollToMessage(
                                                            contextObject?.id
                                                        )
                                                    }
                                                    className="bg-zinc-900/50 border-l-4 border-blue-500 rounded px-3 py-2 mb-2 cursor-pointer hover:bg-zinc-900/70 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-blue-400 mb-1">
                                                                {repliedMessage.sender_type ===
                                                                    "customer" &&
                                                                    (selectedConversation.name ||
                                                                        "User")}
                                                                {repliedMessage.sender_type ===
                                                                    "ai" &&
                                                                    "AI"}
                                                                {repliedMessage.sender_type ===
                                                                    "operator" &&
                                                                    "You"}
                                                            </p>
                                                            <p className="text-sm text-gray-300 truncate">
                                                                {repliedMessage.has_text
                                                                    ? repliedMessage.message_text
                                                                    : (() => {
                                                                          try {
                                                                              const mediaInfo =
                                                                                  typeof repliedMessage.media_info ===
                                                                                  "string"
                                                                                      ? JSON.parse(
                                                                                            repliedMessage.media_info
                                                                                        )
                                                                                      : repliedMessage.media_info;
                                                                              const mimeType =
                                                                                  mediaInfo?.mimeType ||
                                                                                  mediaInfo?.mime_type;

                                                                              if (
                                                                                  mimeType?.startsWith(
                                                                                      "image/"
                                                                                  )
                                                                              )
                                                                                  return "📷 Image";
                                                                              if (
                                                                                  mimeType?.startsWith(
                                                                                      "video/"
                                                                                  )
                                                                              )
                                                                                  return "🎥 Video";
                                                                              if (
                                                                                  mimeType?.startsWith(
                                                                                      "audio/"
                                                                                  )
                                                                              )
                                                                                  return "🎧 Audio";
                                                                              return "Media";
                                                                          } catch {
                                                                              return "Media";
                                                                          }
                                                                      })()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Media Content */}
                                            {(() => {
                                                // Early return if no media_info
                                                if (!message.media_info)
                                                    return null;

                                                let mediaInfo;
                                                try {
                                                    mediaInfo =
                                                        typeof message.media_info ===
                                                        "string"
                                                            ? JSON.parse(
                                                                  message.media_info
                                                              )
                                                            : message.media_info;
                                                } catch (e) {
                                                    console.error(
                                                        "Failed to parse media_info:",
                                                        e
                                                    );
                                                    return null;
                                                }

                                                // Handle inconsistent backend field names:
                                                // - Videos use: { mediaId, mimeType }
                                                // - Images/Stickers use: { id, mime_type }
                                                const mediaId =
                                                    mediaInfo?.mediaId ||
                                                    mediaInfo?.id ||
                                                    mediaInfo?.media_id ||
                                                    mediaInfo?.wa_media_id;
                                                const mimeType =
                                                    mediaInfo?.mimeType ||
                                                    mediaInfo?.mime_type;
                                                const description =
                                                    mediaInfo?.description ||
                                                    "Media";

                                                if (!mediaId || !mimeType)
                                                    return null;

                                                const mediaUrl = `${BACKEND_URL}/api/v1/get-media?id=${mediaId}&type=${mimeType}`;

                                                // Images (including webp stickers)
                                                if (
                                                    mimeType.startsWith(
                                                        "image/"
                                                    )
                                                ) {
                                                    return (
                                                        <MediaViewer
                                                            type="image"
                                                            src={mediaUrl}
                                                            alt={description}
                                                            description={
                                                                description
                                                            }
                                                            onOpen={() =>
                                                                openImageModal(
                                                                    mediaUrl,
                                                                    description
                                                                )
                                                            }
                                                        />
                                                    );
                                                }

                                                // Videos
                                                if (
                                                    mimeType.startsWith(
                                                        "video/"
                                                    )
                                                ) {
                                                    return (
                                                        <MediaViewer
                                                            type="video"
                                                            src={mediaUrl}
                                                            alt={description}
                                                            description={
                                                                description
                                                            }
                                                            onOpen={() =>
                                                                openVideoModal(
                                                                    mediaUrl,
                                                                    description
                                                                )
                                                            }
                                                        />
                                                    );
                                                }

                                                // Audio
                                                if (
                                                    mimeType.startsWith(
                                                        "audio/"
                                                    )
                                                ) {
                                                    return (
                                                        <MediaViewer
                                                            type="audio"
                                                            src={mediaUrl}
                                                            alt={description}
                                                            description={
                                                                description
                                                            }
                                                        />
                                                    );
                                                }

                                                return null;
                                            })()}
                                            {message.has_text && (
                                                <LinkifiedText
                                                    text={message.message_text}
                                                />
                                            )}
                                            {!message.has_text &&
                                                (() => {
                                                    // Check if media_info exists and has valid content
                                                    try {
                                                        if (!message.media_info)
                                                            return true; // Show unsupported message

                                                        const mediaInfo =
                                                            typeof message.media_info ===
                                                            "string"
                                                                ? JSON.parse(
                                                                      message.media_info
                                                                  )
                                                                : message.media_info;

                                                        const mediaId =
                                                            mediaInfo?.mediaId ||
                                                            mediaInfo?.id ||
                                                            mediaInfo?.media_id ||
                                                            mediaInfo?.wa_media_id;
                                                        const mimeType =
                                                            mediaInfo?.mimeType ||
                                                            mediaInfo?.mime_type;

                                                        // If no valid media ID or mime type, show unsupported message
                                                        return (
                                                            !mediaId ||
                                                            !mimeType
                                                        );
                                                    } catch {
                                                        return true; // Show unsupported message on parse error
                                                    }
                                                })() && (
                                                    <div className="flex items-center gap-2 text-sm italic text-gray-400 px-4 py-2">
                                                        <span>
                                                            Unsupported message
                                                            type
                                                        </span>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                    <div ref={messageEndRef} />
                </div>
            )}

            <MessageInput />

            <ImageModal
                isOpen={imageModal.isOpen}
                imageUrl={imageModal.imageUrl}
                description={imageModal.description}
                onClose={closeImageModal}
            />

            <VideoModal
                isOpen={videoModal.isOpen}
                videoUrl={videoModal.videoUrl}
                description={videoModal.description}
                onClose={closeVideoModal}
            />
        </div>
    );
};
export default ChatContainer;
