import { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send, File, X } from "lucide-react";
import toast from "react-hot-toast";
import QuickReplyAutocomplete from "./QuickReplyAutocomplete";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [filePreview, setFilePreview] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [fileName, setFileName] = useState("");
    const fileRef = useRef(null);

    const fileInputRef = useRef(null);
    const { sendMessage, isHumanInterventionActive } = useChatStore();

    // Quick Reply states
    const [showQuickReply, setShowQuickReply] = useState(false);
    const [quickReplyQuery, setQuickReplyQuery] = useState("");
    const [slashPosition, setSlashPosition] = useState(-1);
    const textareaRef = useRef();

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
        let file = e.target.files[0];
        const FILE_SIZE_LIMIT = 15; // in MB
        if (file.size > FILE_SIZE_LIMIT * 1024 * 1024) {
            toast.error(
                `File size should not be greater than ${FILE_SIZE_LIMIT}MB`
            );
            file = null;
        }

        if (
            !(
                file.type.startsWith("video/") ||
                file.type.startsWith("image/") ||
                file.type.startsWith("audio/")
            )
        ) {
            toast.error(`File type not supported!`);
            file = null;
        }

        fileRef.current = file;
        if (!fileRef.current) return;

        setFileType(fileRef.current.type);
        setFileName(fileRef.current.name);

        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result);
        };
        reader.readAsDataURL(fileRef.current);
    };

    const removeFile = () => {
        setFilePreview(null);
        setFileType(null);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (fileRef.current) fileRef.current = null;
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!text.length > 0 && !filePreview) return;

        try {
            sendMessage({
                text,
                file: fileRef.current,
                fileType,
            });

            setText("");
            setFilePreview(null);
            setFileType(null);
            setFileName("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (fileRef.current) fileRef.current = null;

            // Reset textarea height after sending
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        } catch (error) {
            toast.error("Failed to send message :(");
        }
    };

    const renderPreview = () => {
        if (!filePreview) return null;

        if (fileType.startsWith("image/")) {
            return (
                <img
                    src={filePreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                />
            );
        }
        if (fileType.startsWith("video/")) {
            return (
                <video
                    src={filePreview}
                    controls
                    className="h-36 object-cover rounded-lg border border-zinc-700"
                />
            );
        }
        if (fileType.startsWith("audio/")) {
            return (
                <audio
                    src={filePreview}
                    controls
                    className="h-10 rounded-lg border border-zinc-700"
                />
            );
        }
        // For other file types, just show the file name
        return (
            <div className="w-40 h-16 flex items-center justify-center rounded-lg border border-zinc-700 bg-base-200">
                <File size={18} className="min-w-5 ml-2" />
                <span className="text-xs truncate p-2 text-center">
                    {fileName}
                </span>
            </div>
        );
    };

    const handleTextChange = (e) => {
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
            {showQuickReply && (
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

            {filePreview && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        {renderPreview()}
                        <button
                            onClick={removeFile}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                            type="button"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex-1 flex gap-2 items-end">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        className="w-full p-3 rounded-lg bg-base-200 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none overflow-y-auto transition-all duration-100 ease-out scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                        style={{
                            minHeight: "44px",
                            maxHeight: "120px",
                            lineHeight: "1.5",
                        }}
                        placeholder="Type a message..."
                        value={text}
                        onChange={handleTextChange}
                        onKeyDown={(e) => {
                            // Send on Enter (without Shift)
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                    />
                    <input
                        type="file"
                        accept="*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <button
                        type="button"
                        className={`hidden sm:flex btn btn-circle ${
                            filePreview ? "text-emerald-500" : "text-zinc-400"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach File"
                    >
                        <Paperclip size={20} />
                    </button>
                </div>
                <button
                    type="submit"
                    className="btn btn-md btn-circle"
                    title="Send Message"
                    disabled={
                        (!text.length > 0 && !filePreview) ||
                        !isHumanInterventionActive
                    }
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
