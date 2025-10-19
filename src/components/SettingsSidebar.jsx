import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, Briefcase, HelpCircle, User, Tag } from "lucide-react";

// Individual menu item (memoized for performance)
const SettingsMenuItem = React.memo(function SettingsMenuItem({
    icon: Icon,
    title,
    subtitle,
    onClick,
    avatar,
    status,
}) {
    return (
        <div
            className="flex items-center px-4 py-4 gap-3 cursor-pointer transition-colors duration-150 ease-in rounded-lg hover:bg-zinc-800"
            onClick={onClick}
            tabIndex={0}
        >
            {avatar ? (
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mr-3">
                    <User className="w-8 h-8 text-zinc-400" />
                </div>
            ) : (
                <Icon className="w-6 h-6 text-zinc-400 mr-3 flex-shrink-0" />
            )}
            <div className="flex flex-col">
                <span className="text-[17px] font-medium text-zinc-200">
                    {title}
                </span>
                {status && (
                    <span className="text-[15px] text-zinc-400 mt-1">
                        {status}
                    </span>
                )}
                {subtitle && (
                    <span className="text-[15px] text-zinc-400 mt-1">
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );
});

// Settings menu data
const MENU_ITEMS = [
    {
        key: "business",
        icon: Briefcase,
        title: "Business tools",
        subtitle: "Quick replies, labels",
    },
    {
        key: "help",
        icon: HelpCircle,
        title: "Help",
        subtitle: "About us, privacy policy",
    },
];

// Search bar with debounce
const SettingsSearchBar = ({ value, onChange }) => {
    const [inputValue, setInputValue] = useState(value || "");
    const debounceRef = useRef();

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onChange(inputValue);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [inputValue, onChange]);

    return (
        <div className="flex items-center bg-zinc-900 rounded-2xl px-3 py-2 mt-4 mb-4 mx-4 border border-zinc-800 focus-within:border-green-600 focus-within:shadow-[0_0_0_2px_rgba(34,197,94,0.2)] transition-all duration-150">
            <Search className="w-5 h-5 text-zinc-400 mr-2" />
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search settings"
                className="bg-transparent text-zinc-200 w-full outline-none placeholder-zinc-400 text-[16px]"
                spellCheck={false}
                autoComplete="off"
            />
        </div>
    );
};

const SettingsSidebar = ({ onNavigate }) => {
    const [search, setSearch] = useState("");
    // Filter menu items by search
    const filteredItems = useMemo(() => {
        if (!search.trim()) return MENU_ITEMS;
        const q = search.trim().toLowerCase();
        return MENU_ITEMS.filter(
            (item) =>
                item.title?.toLowerCase().includes(q) ||
                item.subtitle?.toLowerCase().includes(q) ||
                item.status?.toLowerCase().includes(q)
        );
    }, [search]);

    // Virtualization for >20 items (not needed here, but ready for future)
    const itemsToRender =
        filteredItems.length > 20 ? filteredItems.slice(0, 20) : filteredItems;

    const handleMenuClick = (key) => {
        if (key === "business") {
            onNavigate?.("business");
        } else if (key === "help") {
            onNavigate?.("help");
        }
        // Handle other menu items as needed
    };

    return (
        <aside
            className="h-screen w-[400px] bg-zinc-950 flex flex-col"
            style={{ minWidth: 400 }}
        >
            {/* Top Heading */}
            <div className="px-6 pt-7 pb-3 flex items-center">
                <span className="text-zinc-100 font-bold text-[24px] tracking-tight">
                    Settings
                </span>
            </div>
            {/* Search Bar */}
            <SettingsSearchBar value={search} onChange={setSearch} />
            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950">
                <div className="flex flex-col gap-1 px-2">
                    {itemsToRender.length === 0 ? (
                        <div className="text-zinc-400 text-center py-8">
                            No settings found
                        </div>
                    ) : (
                        itemsToRender.map((item) => (
                            <SettingsMenuItem
                                key={item.key}
                                {...item}
                                onClick={() => handleMenuClick(item.key)}
                            />
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
};

export default SettingsSidebar;
