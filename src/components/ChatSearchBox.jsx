import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

const TAB_PLACEHOLDERS = {
    all: "Search chats",
    critical: "Search in critical chats",
};

const ChatSearchBox = ({
    value,
    onSearch,
    activeTab = "all",
    className = "",
    debounce = 300,
}) => {
    const [inputValue, setInputValue] = useState(value || "");
    const [isFocused, setIsFocused] = useState(false);
    const debounceRef = useRef();

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearch(inputValue);
        }, debounce);
        return () => clearTimeout(debounceRef.current);
    }, [inputValue, onSearch, debounce]);

    const handleClear = () => {
        setInputValue("");
        onSearch("");
    };

    return (
        <div
            className={`flex items-center bg-zinc-900 rounded-2xl px-3 py-2 mb-2 sticky top-0 z-10 transition-all ${className} ${
                isFocused
                    ? "border-2 border-green-600"
                    : "border border-zinc-800"
            }`}
            style={{
                minHeight: 44,
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.18)",
            }}
        >
            <Search
                className={`size-5 mr-2 transition-colors ${
                    isFocused ? "text-green-400" : "text-zinc-400"
                }`}
            />
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                    TAB_PLACEHOLDERS[activeTab] || TAB_PLACEHOLDERS.all
                }
                className="bg-transparent text-zinc-200 w-full outline-none placeholder-zinc-500 text-base"
                spellCheck={false}
                autoComplete="off"
                style={{
                    paddingRight: inputValue ? 28 : 0,
                    transition: "background 0.2s",
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
            {inputValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="ml-2 p-1 rounded-full hover:bg-zinc-800 transition-colors"
                    aria-label="Clear search"
                    tabIndex={0}
                >
                    <X className="size-5 text-zinc-400" />
                </button>
            )}
        </div>
    );
};

export default ChatSearchBox;
