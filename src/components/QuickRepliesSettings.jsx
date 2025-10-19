import React, { useState, useRef, useEffect } from "react";
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    MessageSquare,
    X,
    Zap,
    Tag,
} from "lucide-react";
import { useQuickReplies } from "../context/QuickRepliesContext";

// Quick Reply Card Component
const QuickReplyCard = ({ reply, onEdit, onDelete }) => {
    const [showActions, setShowActions] = useState(false);

    return (
        <div
            className="bg-zinc-900 border-b border-zinc-800 p-4 transition-colors duration-150 hover:bg-zinc-800 cursor-pointer"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="text-green-500 font-mono text-sm mb-2">
                        /{reply.shortcut}
                    </div>
                    <div className="text-zinc-200 text-[15px] line-clamp-2">
                        {reply.message}
                    </div>
                </div>
                {showActions && (
                    <div className="flex gap-2 ml-4">
                        <button
                            onClick={() => onEdit(reply)}
                            className="p-2 rounded-full hover:bg-zinc-700 transition-colors"
                            aria-label="Edit"
                        >
                            <Edit2 className="w-4 h-4 text-zinc-400" />
                        </button>
                        <button
                            onClick={() => onDelete(reply.id)}
                            className="p-2 rounded-full hover:bg-zinc-700 transition-colors"
                            aria-label="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-zinc-400" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Add/Edit Modal Component
const QuickReplyModal = ({ isOpen, onClose, editingReply, onSave }) => {
    const [shortcut, setShortcut] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const modalRef = useRef();
    const shortcutInputRef = useRef();
    const { quickReplies } = useQuickReplies();

    useEffect(() => {
        if (isOpen) {
            if (editingReply) {
                setShortcut(editingReply.shortcut);
                setMessage(editingReply.message);
            } else {
                setShortcut("");
                setMessage("");
            }
            setError("");
            setTimeout(() => shortcutInputRef.current?.focus(), 100);
        }
    }, [isOpen, editingReply]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    const handleSave = () => {
        setError("");

        if (!shortcut.trim() || !message.trim()) {
            setError("Both fields are required");
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(shortcut)) {
            setError("Shortcut must be alphanumeric or underscore only");
            return;
        }

        const exists = quickReplies.some(
            (r) =>
                r.shortcut.toLowerCase() === shortcut.toLowerCase() &&
                (!editingReply || r.id !== editingReply.id)
        );
        if (exists) {
            setError("Shortcut already exists");
            return;
        }

        onSave(shortcut, message);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in">
            <div
                ref={modalRef}
                className="bg-zinc-900 rounded-lg w-full max-w-[500px] mx-4 animate-scale-up"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                    <h2 className="text-zinc-100 text-[20px] font-medium">
                        {editingReply ? "Edit quick reply" : "Add quick reply"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-900 bg-opacity-20 border border-red-800 text-red-400 px-4 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {/* Shortcut Input */}
                    <div>
                        <label className="block text-zinc-400 text-sm mb-2">
                            Shortcut
                        </label>
                        <div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                            <span className="text-green-500 px-3 font-mono">
                                /
                            </span>
                            <input
                                ref={shortcutInputRef}
                                type="text"
                                value={shortcut}
                                onChange={(e) => setShortcut(e.target.value)}
                                placeholder="e.g., hello, thanks, meeting"
                                maxLength={20}
                                className="flex-1 bg-transparent text-zinc-200 px-3 py-3 outline-none placeholder-zinc-500"
                            />
                        </div>
                    </div>

                    {/* Message Textarea */}
                    <div>
                        <label className="block text-zinc-400 text-sm mb-2">
                            Message
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter your message..."
                            rows={4}
                            className="w-full bg-zinc-800 text-zinc-200 px-3 py-3 rounded-lg outline-none placeholder-zinc-500 resize-none border border-zinc-700"
                        />
                        <div className="text-zinc-400 text-xs mt-1 text-right">
                            {message.length} characters
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-6 border-t border-zinc-800">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Quick Replies Settings Component
const QuickRepliesSettings = ({ onBack, onNavigateToLabels }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReply, setEditingReply] = useState(null);
    const { quickReplies, addQuickReply, updateQuickReply, deleteQuickReply } =
        useQuickReplies();

    const handleSave = (shortcut, message) => {
        if (editingReply) {
            updateQuickReply(editingReply.id, shortcut, message);
        } else {
            addQuickReply(shortcut, message);
        }
    };

    const handleEdit = (reply) => {
        setEditingReply(reply);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingReply(null);
        setIsModalOpen(true);
    };

    return (
        <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-4 px-6 py-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        aria-label="Back"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <h1 className="text-zinc-100 text-[20px] font-medium">
                        Business tools
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[800px] mx-auto p-6">
                    {/* Section Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-zinc-400" />
                                <h2 className="text-zinc-100 text-[18px] font-medium">
                                    Quick replies
                                </h2>
                            </div>
                            <p className="text-zinc-400 text-[14px]">
                                Save time by creating shortcuts for messages you
                                send often
                            </p>
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-150 active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add</span>
                        </button>
                    </div>

                    {/* Quick Replies List */}
                    {quickReplies.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <MessageSquare className="w-16 h-16 text-zinc-400 mb-4" />
                            <div className="text-zinc-200 text-lg mb-2">
                                No quick replies yet
                            </div>
                            <div className="text-zinc-400 text-sm">
                                Create your first shortcut to save time
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
                            {quickReplies.map((reply) => (
                                <QuickReplyCard
                                    key={reply.id}
                                    reply={reply}
                                    onEdit={handleEdit}
                                    onDelete={deleteQuickReply}
                                />
                            ))}
                        </div>
                    )}

                    {/* Labels Section */}
                    <div className="mt-12 pt-8 border-t border-zinc-800">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-zinc-400" />
                                    <h2 className="text-zinc-100 text-[18px] font-medium">
                                        Labels
                                    </h2>
                                </div>
                                <p className="text-zinc-400 text-[14px]">
                                    Organize conversations with custom labels
                                </p>
                            </div>
                            <button
                                onClick={onNavigateToLabels}
                                className="flex items-center gap-2 bg-zinc-800 text-zinc-200 px-4 py-2 rounded-lg hover:bg-zinc-700 transition-all duration-150 active:scale-95 border border-zinc-700"
                            >
                                <span>Manage Labels</span>
                            </button>
                        </div>

                        <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
                            <p className="text-zinc-400 text-sm mb-2">
                                Click "Manage Labels" to create and organize
                                conversation labels.
                            </p>
                            <p className="text-zinc-500 text-xs">
                                You can create up to 20 custom labels to
                                categorize your conversations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <QuickReplyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingReply={editingReply}
                onSave={handleSave}
            />

            {/* Animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-up {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 150ms ease-out;
                }
                .animate-scale-up {
                    animation: scale-up 150ms ease-out;
                }
            `}</style>
        </div>
    );
};

export default QuickRepliesSettings;
