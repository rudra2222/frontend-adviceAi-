import React, { memo } from "react";
import PropTypes from "prop-types";

/**
 * LabelPill Component
 *
 * Small colored pill showing label name, displayed next to chats in conversation list.
 * Shows only the first label if multiple exist.
 * Memoized for performance.
 *
 * @param {Object} props
 * @param {string} props.name - Label name to display
 * @param {string} props.color - Hex color code for the label
 * @param {Function} props.onClick - Optional click handler
 * @param {string} props.className - Additional CSS classes
 */
const LabelPill = memo(({ name, color, onClick, className = "" }) => {
    if (!name) return null;

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-150 ease-in-out hover:bg-zinc-700/50 ${
                onClick ? "cursor-pointer" : ""
            } ${className}`}
            onClick={onClick}
            style={{ maxWidth: "120px" }}
        >
            {/* Color indicator circle */}
            <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
            />

            {/* Label name - truncated if too long */}
            <span className="text-xs text-zinc-300 truncate font-medium">
                {name}
            </span>
        </div>
    );
});

LabelPill.displayName = "LabelPill";

LabelPill.propTypes = {
    name: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

export default LabelPill;
