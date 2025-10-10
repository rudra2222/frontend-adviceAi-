import React, { useState, useEffect, useRef } from "react";
import { useQuickReplies } from "../context/QuickRepliesContext";

const QuickReplyAutocomplete = ({
    inputRef,
    onSelect,
    isOpen,
    query,
    position,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { getMatchingReplies, quickReplies } = useQuickReplies();
    const dropdownRef = useRef();
    const itemRefs = useRef([]);

    // Show all replies if query is empty, otherwise filter
    const suggestions =
        query.trim() === ""
            ? quickReplies.slice(0, 5)
            : getMatchingReplies(query);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Scroll selected item into view
    useEffect(() => {
        if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (!suggestions.length) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev < suggestions.length - 1 ? prev + 1 : 0
                    );
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) =>
                        prev > 0 ? prev - 1 : suggestions.length - 1
                    );
                    break;
                case "Enter":
                case "Tab":
                    e.preventDefault();
                    if (suggestions[selectedIndex]) {
                        onSelect(suggestions[selectedIndex]);
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    onSelect(null);
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, suggestions, selectedIndex, onSelect]);

    if (!isOpen || !suggestions.length) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute bg-zinc-900 rounded-lg shadow-2xl border border-zinc-800 overflow-hidden z-50 animate-slide-down"
            style={{
                bottom: position?.bottom || "100%",
                left: position?.left || 0,
                marginBottom: "8px",
                minWidth: "300px",
                maxWidth: "400px",
                maxHeight: "200px",
                overflowY: "auto",
            }}
        >
            {suggestions.map((reply, index) => (
                <div
                    key={reply.id}
                    ref={(el) => (itemRefs.current[index] = el)}
                    className={`px-4 py-3 cursor-pointer transition-colors duration-100 ${
                        index === selectedIndex
                            ? "bg-zinc-800"
                            : "hover:bg-zinc-800"
                    }`}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelect(reply);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                >
                    <div className="text-green-500 font-mono text-sm mb-1">
                        /{reply.shortcut}
                    </div>
                    <div className="text-zinc-400 text-xs truncate">
                        {reply.message}
                    </div>
                </div>
            ))}
            <style>{`
                @keyframes slide-down {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-down {
                    animation: slide-down 150ms ease-out;
                }
                div::-webkit-scrollbar {
                    width: 6px;
                }
                div::-webkit-scrollbar-thumb {
                    background: #3f3f46;
                    border-radius: 3px;
                }
                div::-webkit-scrollbar-track {
                    background: transparent;
                }
            `}</style>
        </div>
    );
};

export default QuickReplyAutocomplete;
