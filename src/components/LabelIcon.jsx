import React, { memo } from "react";
import PropTypes from "prop-types";
import { Tag, Tags } from "lucide-react";

/**
 * LabelIcon Component
 *
 * Shows Tag icon for single label or Tags icon for multiple labels
 * Icon is colored based on the last assigned label
 * Memoized for performance
 *
 * @param {Object} props
 * @param {Array} props.labels - Array of label objects assigned to conversation
 */
const LabelIcon = memo(({ labels }) => {
    if (!labels || labels.length === 0) return null;

    const isMultiple = labels.length > 1;
    const lastLabel = labels[labels.length - 1]; // Last assigned label
    const IconComponent = isMultiple ? Tags : Tag;

    return (
        <span
            className="inline-flex items-center"
            style={{
                animation:
                    "iconFadeIn 180ms cubic-bezier(0.4, 0.0, 0.2, 1) forwards",
            }}
        >
            <IconComponent
                className="w-5 h-5"
                style={{ color: lastLabel.color }}
                strokeWidth={2.5}
            />
            <style jsx>{`
                @keyframes iconFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </span>
    );
});

LabelIcon.displayName = "LabelIcon";

LabelIcon.propTypes = {
    labels: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
        })
    ),
};

export default LabelIcon;
