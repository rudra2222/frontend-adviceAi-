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
        // setInterventionToggleDisabled,
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
            <div className="flex-1 flex flex-col overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
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
        <div className="flex-1 flex flex-col overflow-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
            <ChatHeader />

            {messages.length === 0 && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex justify-center items-center text-stone-400 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    No messages yet!
                </div>
            )}

            {messages.length > 0 && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {Object.entries(
                        messages
                            .filter(
                                (message) =>
                                    message.conversation_id ===
                                    selectedConversation.id
                            )
                            // Sort messages by timestamp (oldest first)
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
                                            {message.sender_type === "ai" && (
                                                <img
                                                    src="/AI-Neo-2.png"
                                                    alt="avatar"
                                                />
                                            )}

                                            {message.sender_type !== "ai" && (
                                                <img
                                                    src="/logo.webp"
                                                    alt="avatar"
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
                                                ? ""
                                                : "bg-zinc-800 text-white"
                                        } px-4 py-2`}
                                    >
                                        {JSON.parse(message.media_info)?.id !==
                                            null &&
                                            JSON.parse(
                                                message.media_info
                                            )?.mime_type?.startsWith(
                                                "image/"
                                            ) && (
                                                <img
                                                    src={`${BACKEND_URL}/api/v1/get-media?id=${
                                                        JSON.parse(
                                                            message.media_info
                                                        )?.id
                                                    }&type=${
                                                        JSON.parse(
                                                            message.media_info
                                                        )?.mime_type
                                                    }`}
                                                    alt={
                                                        JSON.parse(
                                                            message.media_info
                                                        )?.description?.length >
                                                        0
                                                            ? JSON.parse(
                                                                  message.media_info
                                                              )?.description
                                                            : "Image"
                                                    }
                                                    className="sm:max-w-[200px] rounded-md mb-2"
                                                    loading="lazy"
                                                />
                                            )}
                                        {JSON.parse(message.media_info)?.id !==
                                            null &&
                                            JSON.parse(
                                                message.media_info
                                            )?.mime_type?.startsWith(
                                                "video/"
                                            ) && (
                                                <video
                                                    src={`${BACKEND_URL}/api/v1/get-media?id=${
                                                        JSON.parse(
                                                            message.media_info
                                                        )?.id
                                                    }&type=${
                                                        JSON.parse(
                                                            message.media_info
                                                        )?.mime_type
                                                    }`}
                                                    alt={
                                                        JSON.parse(
                                                            message.media_info
                                                        )?.description?.length >
                                                        0
                                                            ? JSON.parse(
                                                                  message.media_info
                                                              )?.description
                                                            : "Video"
                                                    }
                                                    className="sm:max-w-[200px] rounded-md mb-2"
                                                    controls
                                                    preload="auto"
                                                />
                                            )}
                                        {JSON.parse(message.media_info)?.id !==
                                            null &&
                                            JSON.parse(
                                                message.media_info
                                            )?.mime_type?.startsWith(
                                                "audio/"
                                            ) && (
                                                <audio controls>
                                                    <source
                                                        src={`${BACKEND_URL}/api/v1/get-media?id=${
                                                            JSON.parse(
                                                                message.media_info
                                                            )?.id
                                                        }&type=${
                                                            JSON.parse(
                                                                message.media_info
                                                            )?.mime_type
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
