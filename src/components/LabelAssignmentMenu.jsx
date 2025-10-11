import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Check, X } from "lucide-react";
import { useLabelsStore } from "../store/useLabelsStore";
import { useChatStore } from "../store/useChatStore";

/**
 * LabelAssignmentMenu Component
 *
 * Context menu for assigning/removing labels from a conversation.
 * Appears on right-click or long-press on a conversation.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether menu is visible
 * @param {Function} props.onClose - Callback when menu should close
 * @param {Object} props.conversation - Conversation object to assign labels to
 * @param {Function} props.onAssignLabel - Callback when a label is assigned
 * @param {Function} props.onRemoveLabel - Callback when a label is removed
 * @param {Object} props.position - Position for menu { top, left }
 */
const LabelAssignmentMenu = ({
    isOpen,
    onClose,
    conversation,
    onAssignLabel,
    onRemoveLabel,
    position,
}) => {
    const { labels } = useLabelsStore();
    const { conversations } = useChatStore();
    const menuRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState(position);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Update position when prop changes and ensure it's in viewport
    useEffect(() => {
        if (isOpen && position) {
            const adjustedPosition = getAdjustedPosition(position);
            setMenuPosition(adjustedPosition);
        }
    }, [isOpen, position]);

    // Function to keep menu within viewport
    const getAdjustedPosition = (pos) => {
        const menuWidth = 256; // w-64 = 256px
        const menuHeight = 400; // estimated max height
        const padding = 16;

        let { top, left } = pos;

        // Adjust horizontal position
        if (left + menuWidth > window.innerWidth - padding) {
            left = window.innerWidth - menuWidth - padding;
        }
        if (left < padding) {
            left = padding;
        }

        // Adjust vertical position
        if (top + menuHeight > window.innerHeight - padding) {
            top = window.innerHeight - menuHeight - padding;
        }
        if (top < padding) {
            top = padding;
        }

        return { top, left };
    };

    // Handle drag start
    const handleMouseDown = (e) => {
        if (e.target.closest("button") && !e.target.closest(".drag-handle")) {
            return; // Don't start drag if clicking buttons
        }
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - menuPosition.left,
            y: e.clientY - menuPosition.top,
        });
    };

    // Handle dragging
    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const newPosition = {
                left: e.clientX - dragOffset.x,
                top: e.clientY - dragOffset.y,
            };
            setMenuPosition(getAdjustedPosition(newPosition));
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    // Close menu when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        // Add small delay to prevent immediate closing
        setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 100);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Handle escape key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !conversation) return null;

    // Get fresh conversation data from store for instant updates
    const currentConversation = conversations.find((c) => c.id === conversation.id) || conversation;
    const conversationLabels = currentConversation.labels || [];
    const isLabelAssigned = (labelId) =>
        conversationLabels.some((l) => l.id === labelId);

    const handleLabelToggle = (label, e) => {
        e.stopPropagation(); // Prevent drag from starting
        if (isLabelAssigned(label.id)) {
            onRemoveLabel(conversation.id, label.id);
        } else {
            onAssignLabel(conversation.id, label);
        }
    };

    return (
        <>
            {/* Transparent backdrop - maintains focus */}
            <div
                className="fixed inset-0 bg-transparent z-40"
                onClick={onClose}
            />

            {/* Menu */}
            <div
                ref={menuRef}
                onMouseDown={handleMouseDown}
                className={`fixed z-50 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl backdrop-blur-md ${
                    isDragging ? "cursor-grabbing" : "cursor-grab"
                }`}
                style={{
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                    animation:
                        "menuFadeIn 180ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards",
                    userSelect: "none",
                }}
            >
                {/* Header - Drag Handle */}
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between drag-handle cursor-grab active:cursor-grabbing">
                    <h3 className="text-zinc-100 font-semibold text-sm">
                        Assign labels
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4 text-zinc-400" />
                    </button>
                </div>

                {/* Labels list */}
                <div className="max-h-80 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {labels.length === 0 ? (
                        <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                            No labels available
                            <p className="text-xs mt-1">
                                Create labels in Settings
                            </p>
                        </div>
                    ) : (
                        labels.map((label) => {
                            const assigned = isLabelAssigned(label.id);
                            return (
                                <button
                                    key={label.id}
                                    onClick={(e) => handleLabelToggle(label, e)}
                                    className={`w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-150 hover:bg-zinc-800 cursor-pointer ${
                                        assigned ? "bg-zinc-800/50" : ""
                                    }`}
                                >
                                    {/* Color circle */}
                                    <div
                                        className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-zinc-700"
                                        style={{ backgroundColor: label.color }}
                                    />

                                    {/* Label name */}
                                    <span className="flex-1 text-left text-zinc-200 text-sm font-medium truncate">
                                        {label.name}
                                    </span>

                                    {/* Check icon if assigned - with animation */}
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        {assigned && (
                                            <Check
                                                className="w-4 h-4 text-green-500 flex-shrink-0"
                                                style={{
                                                    animation:
                                                        "checkmarkPop 180ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards",
                                                }}
                                            />
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer info */}
                {conversationLabels.length > 0 && (
                    <div className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
                        {conversationLabels.length} label
                        {conversationLabels.length !== 1 ? "s" : ""} assigned
                    </div>
                )}
            </div>

            {/* WhatsApp-style animations */}
            <style jsx>{`
                @keyframes menuFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                @keyframes checkmarkPop {
                    0% {
                        opacity: 0;
                        transform: scale(0);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </>
    );
};

LabelAssignmentMenu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    conversation: PropTypes.object,
    onAssignLabel: PropTypes.func.isRequired,
    onRemoveLabel: PropTypes.func.isRequired,
    position: PropTypes.shape({
        top: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
        left: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
            .isRequired,
    }),
};

export default LabelAssignmentMenu;
