import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send, File, X, Clock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import QuickReplyAutocomplete from "./QuickReplyAutocomplete";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [files, setFiles] = useState([]); // Changed from single file to array
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const fileInputRef = useRef(null);
    const { sendMessage, isHumanInterventionActive, messages } = useChatStore();

    // Quick Reply states
    const [showQuickReply, setShowQuickReply] = useState(false);
    const [quickReplyQuery, setQuickReplyQuery] = useState("");
    const [slashPosition, setSlashPosition] = useState(-1);
    const textareaRef = useRef();

    // // Check if message window is expired (24 hours)
    // const isMessageWindowExpired = () => {
    //     if (!messages || messages.length === 0) return false;

    //     // Find the last inbound message (direction: "inbound")
    //     const inboundMessages = messages.filter(
    //         (msg) => msg.direction === "inbound"
    //     );

    //     if (inboundMessages.length === 0) return false;

    //     const lastInboundMessage = inboundMessages[inboundMessages.length - 1];
    //     const lastInboundTime = new Date(lastInboundMessage.provider_ts);
    //     const currentTime = new Date();
    //     const hoursDifference =
    //         (currentTime - lastInboundTime) / (1000 * 60 * 60);

    //     return hoursDifference >= 24;
    // };

    // const windowExpired = isMessageWindowExpired();
    const windowExpired = false; // Temporarily disabled 24-hour window logic

    // Auto-resize textarea based on content (WhatsApp-style)
    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        // Reset height to get accurate scrollHeight
        textarea.style.height = "auto";

        // Calculate new height (max 5 lines ~ 120px)
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = `${newHeight}px`;
    };

    // Adjust height whenever text changes
    useEffect(() => {
        adjustTextareaHeight();
    }, [text]);

    const handleFileChange = (e) => {
        if (windowExpired || isSendingMessage) return;

        const selectedFiles = Array.from(e.target.files);
        const FILE_SIZE_LIMIT = 15; // in MB
        const MAX_FILES = 10; // WhatsApp allows up to 10 media items

        // Check if adding these files would exceed the limit
        if (files.length + selectedFiles.length > MAX_FILES) {
            toast.error(`You can only attach up to ${MAX_FILES} files at once`);
            return;
        }

        const validFiles = [];

        for (const file of selectedFiles) {
            // Check file size
            if (file.size > FILE_SIZE_LIMIT * 1024 * 1024) {
                toast.error(
                    `${file.name} is too large. Max size is ${FILE_SIZE_LIMIT}MB`
                );
                continue;
            }

            // Check file type (allow images, videos, audio, webp stickers)
            if (
                !(
                    file.type.startsWith("video/") ||
                    file.type.startsWith("image/") ||
                    file.type.startsWith("audio/") ||
                    file.type === "image/webp"
                )
            ) {
                toast.error(`${file.name} type not supported!`);
                continue;
            }

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                validFiles.push({
                    file,
                    preview: reader.result,
                    type: file.type,
                    name: file.name,
                    id: Date.now() + Math.random(), // Unique ID for each file
                });

                // Update state after last file is processed
                if (
                    validFiles.length ===
                    selectedFiles.filter(
                        (f) =>
                            f.size <= FILE_SIZE_LIMIT * 1024 * 1024 &&
                            (f.type.startsWith("video/") ||
                                f.type.startsWith("image/") ||
                                f.type.startsWith("audio/") ||
                                f.type === "image/webp")
                    ).length
                ) {
                    setFiles((prev) => [...prev, ...validFiles]);
                }
            };
            reader.readAsDataURL(file);
        }

        // Reset input to allow selecting the same files again if needed
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (fileId) => {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (windowExpired || isSendingMessage) return;
        if (!isHumanInterventionActive) {
            toast.error("Human intervention is not active.");
            return;
        }
        if (!text.length > 0 && files.length === 0) return;

        setIsSendingMessage(true);

        try {
            // If there are multiple files, send them one by one
            if (files.length > 0) {
                // Send first message with text (if any) and first file
                await sendMessage({
                    text: text.trim() || null,
                    file: files[0].file,
                    fileType: files[0].type,
                });

                // Send remaining files without text
                for (let i = 1; i < files.length; i++) {
                    await sendMessage({
                        text: null,
                        file: files[i].file,
                        fileType: files[i].type,
                    });
                }
            } else if (text.trim()) {
                // Send text-only message
                await sendMessage({
                    text: text.trim(),
                    file: null,
                    fileType: null,
                });
            }

            // Reset form
            setText("");
            setFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Reset textarea height after sending
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch (err) {
            // Error already handled in store with toast; log for debugging
            console.error(err);
        } finally {
            setIsSendingMessage(false);
        }
    };

    const renderPreview = (fileData) => {
        if (!fileData) return null;

        if (fileData.type.startsWith("image/")) {
            return (
                <img
                    src={fileData.preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                />
            );
        }
        if (fileData.type.startsWith("video/")) {
            return (
                <video
                    src={fileData.preview}
                    className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                />
            );
        }
        if (fileData.type.startsWith("audio/")) {
            return (
                <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-zinc-700">
                    <span className="text-xs">🎵</span>
                </div>
            );
        }

        // For other file types, just show the file icon
        return (
            <div className="w-20 h-20 flex items-center justify-center rounded-lg border border-zinc-700 bg-base-200">
                <File size={18} />
            </div>
        );
    };

    const handleTextChange = (e) => {
        if (windowExpired || isSendingMessage) return;

        const newText = e.target.value;
        const cursorPos = e.target.selectionStart;
        setText(newText);

        // Detect quick reply trigger
        const textBeforeCursor = newText.substring(0, cursorPos);
        const lastSlashIndex = textBeforeCursor.lastIndexOf("/");

        if (lastSlashIndex !== -1) {
            const textAfterSlash = textBeforeCursor.substring(
                lastSlashIndex + 1
            );
            // Check if there's no space after slash
            if (!textAfterSlash.includes(" ")) {
                setSlashPosition(lastSlashIndex);
                setQuickReplyQuery(textAfterSlash);
                setShowQuickReply(true);
                return;
            }
        }

        setShowQuickReply(false);
        setQuickReplyQuery("");
        setSlashPosition(-1);
    };

    const handleQuickReplySelect = (reply) => {
        if (!reply) {
            setShowQuickReply(false);
            setQuickReplyQuery("");
            setSlashPosition(-1);
            return;
        }

        // Get current cursor position
        const cursorPos = textareaRef.current?.selectionStart || text.length;

        // Replace from slash to end of query with the message
        const beforeSlash = text.substring(0, slashPosition);
        const afterCursor = text.substring(cursorPos);
        const newText = beforeSlash + reply.message + afterCursor;

        setText(newText);
        setShowQuickReply(false);
        setQuickReplyQuery("");
        setSlashPosition(-1);

        // Set cursor at end of inserted text
        setTimeout(() => {
            const newCursorPos = beforeSlash.length + reply.message.length;
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(
                    newCursorPos,
                    newCursorPos
                );
            }
        }, 0);
    };

    // Close dropdown on click outside
    useEffect(() => {
        if (!showQuickReply) return;
        const handleClickOutside = (e) => {
            // Don't close if clicking inside the dropdown
            if (
                e.target.closest(".quick-reply-dropdown") ||
                e.target === textareaRef.current
            ) {
                return;
            }
            setShowQuickReply(false);
            setQuickReplyQuery("");
            setSlashPosition(-1);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [showQuickReply]);

    return (
        <div className="p-4 w-full relative">
            {/* Quick Reply Autocomplete */}
            {showQuickReply && !windowExpired && (
                <div className="quick-reply-dropdown">
                    <QuickReplyAutocomplete
                        inputRef={textareaRef}
                        isOpen={showQuickReply}
                        query={quickReplyQuery}
                        onSelect={handleQuickReplySelect}
                        position={{ bottom: "100%", left: 0 }}
                    />
                </div>
            )}

            {/* 24-hour Window Expired Overlay - COMMENTED OUT */}
            {/* {windowExpired && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                    <div className="px-6 py-4 rounded-lg shadow-lg border border-zinc-700 flex items-center gap-3 max-w-md mx-4">
                        <Clock
                            className="text-orange-500 flex-shrink-0"
                            size={24}
                        />
                        <div>
                            <p className="text-sm font-semibold text-white">
                                Message window closed
                            </p>
                            <p className="text-xs text-zinc-400 mt-1">
                                The 24-hour message window has expired. Wait for
                                the customer to send a new message.
                            </p>
                        </div>
                    </div>
                </div>
            )} */}

            {files.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent pt-2 px-1">
                    {files.map((fileData) => (
                        <div key={fileData.id} className="relative pt-1">
                            {renderPreview(fileData)}
                            <button
                                onClick={() => removeFile(fileData.id)}
                                className="absolute top-0 left-16 w-6 h-6 rounded-full bg-zinc-800 hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                type="button"
                                disabled={windowExpired || isSendingMessage}
                            >
                                <X className="size-3.5 text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 flex gap-2 items-end">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        className="bg-zinc-900 w-full p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none overflow-y-auto transition-all duration-100 ease-out scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            minHeight: "44px",
                            maxHeight: "120px",
                            lineHeight: "1.5",
                        }}
                        placeholder={
                            windowExpired
                                ? "Message window closed"
                                : isSendingMessage
                                ? "Sending message..."
                                : "Type a message..."
                        }
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={(e) => {
                            // Send on Enter (without Shift)
                            if (
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                !windowExpired &&
                                !isSendingMessage
                            ) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        disabled={windowExpired || isSendingMessage}
                    />
                    <input
                        type="file"
                        accept="image/*,image/webp,video/*,audio/*"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={windowExpired || isSendingMessage}
                    />

                    <button
                        type="button"
                        className={`hidden sm:flex btn btn-circle bg-zinc-900 ${
                            files.length > 0
                                ? "text-emerald-500"
                                : "text-zinc-400"
                        } disabled:opacity-50 disabled:cursor-not-allowed relative`}
                        onClick={() => fileInputRef.current?.click()}
                        title={
                            windowExpired
                                ? "Message window closed"
                                : isSendingMessage
                                ? "Sending message..."
                                : files.length > 0
                                ? `${files.length} file(s) attached`
                                : "Attach Files"
                        }
                        disabled={windowExpired || isSendingMessage}
                    >
                        {isSendingMessage ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Paperclip size={20} />
                                {files.length > 0 && (
                                    <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                        {files.length}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                </div>
                <button
                    type="submit"
                    className="btn btn-md btn-circle bg-zinc-900 text-zinc-400 disabled:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed pt-1 pr-1"
                    title={
                        windowExpired
                            ? "Message window closed"
                            : isSendingMessage
                            ? "Sending message..."
                            : "Send Message"
                    }
                    disabled={
                        (!text.length > 0 && files.length === 0) ||
                        !isHumanInterventionActive ||
                        windowExpired ||
                        isSendingMessage
                    }
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
