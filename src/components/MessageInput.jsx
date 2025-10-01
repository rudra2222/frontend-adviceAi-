import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Paperclip, Send, File, X } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
    const [text, setText] = useState("");
    const [filePreview, setFilePreview] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [fileName, setFileName] = useState("");
    const fileRef = useRef(null);

    const fileInputRef = useRef(null);
    const { sendMessage, isHumanInterventionActive } = useChatStore();

    const handleFileChange = (e) => {
        let file = e.target.files[0];
        const FILE_SIZE_LIMIT = 10; // in MB
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

    return (
        <div className="p-4 w-full">
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

            <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2"
            >
                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        className="w-full input input-bordered rounded-lg input-sm sm:input-md"
                        placeholder="Type your message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
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
                    className="btn btn-sm btn-circle"
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
