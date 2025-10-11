import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Check } from "lucide-react";
import { useLabelsStore } from "../store/useLabelsStore";

/**
 * LabelDropdown Component
 *
 * Dropdown showing all available labels with colored circles.
 * Positioned absolutely when "Labels" button is clicked (like WhatsApp).
 * Click outside to close with smooth animations.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether dropdown is visible
 * @param {Function} props.onClose - Callback when dropdown should close
 * @param {string} props.selectedLabelId - Currently selected label ID for filtering
 * @param {Function} props.onSelectLabel - Callback when a label is selected
 * @param {Object} props.position - Position for dropdown { top, left } or null for auto
 */
const LabelDropdown = ({
    isOpen,
    onClose,
    selectedLabelId,
    onSelectLabel,
    position = null,
}) => {
    const { labels } = useLabelsStore();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
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

    if (!isOpen) return null;

    const handleLabelClick = (labelId) => {
        onSelectLabel(labelId);
        onClose();
    };

    return (
        <>
            {/* Dropdown - No backdrop to maintain focus */}
            <div
                ref={dropdownRef}
                className="absolute z-50 w-72 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl backdrop-blur-md origin-top"
                style={{
                    top: position?.top || "100%",
                    left: position?.left || "0",
                    right: position?.right || "auto",
                    animation: isOpen
                        ? "dropdownEnter 180ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards"
                        : "dropdownExit 150ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards",
                }}
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-zinc-800">
                    <h3 className="text-zinc-100 font-semibold text-sm">
                        Filter by label
                    </h3>
                </div>

                {/* Labels list */}
                <div className="max-h-80 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                    {labels.length === 0 ? (
                        <div className="px-4 py-8 text-center text-zinc-500 text-sm">
                            No labels created yet
                        </div>
                    ) : (
                        labels.map((label) => {
                            const isSelected = selectedLabelId === label.id;
                            return (
                                <button
                                    key={label.id}
                                    onClick={() => handleLabelClick(label.id)}
                                    className={`w-full px-4 py-2.5 flex items-center gap-3 transition-all duration-150 hover:bg-zinc-800 ${
                                        isSelected ? "bg-zinc-800/50" : ""
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

                                    {/* Check icon if selected */}
                                    {isSelected && (
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer info */}
                {labels.length > 0 && (
                    <div className="px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
                        {labels.length} label{labels.length !== 1 ? "s" : ""}
                    </div>
                )}
            </div>

            {/* WhatsApp-style animations */}
            <style jsx>{`
                @keyframes dropdownEnter {
                    from {
                        opacity: 0;
                        transform: scaleY(0.8) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scaleY(1) translateY(0);
                    }
                }
                @keyframes dropdownExit {
                    from {
                        opacity: 1;
                        transform: scaleY(1) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: scaleY(0.8) translateY(-10px);
                    }
                }
            `}</style>
        </>
    );
};

LabelDropdown.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    selectedLabelId: PropTypes.string,
    onSelectLabel: PropTypes.func.isRequired,
    position: PropTypes.shape({
        top: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        left: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
};

export default LabelDropdown;
