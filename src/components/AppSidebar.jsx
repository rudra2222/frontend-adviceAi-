import { useLocation, useNavigate } from "react-router-dom";
import {
    PanelLeft,
    MessageSquareText,
    LayoutDashboard,
    SquareUserRound,
    Settings,
    LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
    {
        id: "chats",
        title: "Chats",
        href: "/",
        icon: MessageSquareText,
    },
    {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        id: "profile",
        title: "Profile",
        href: "/profile",
        icon: SquareUserRound,
    },
    {
        id: "settings",
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

const getUserInitials = (username) => {
    if (!username) return "U";
    const [first, second] = username.split(" ");
    if (second) return `${first[0]}${second[0]}`.toUpperCase();
    return username[0].toUpperCase();
};

const AppSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { authUser, logout } = useAuthStore();
    const { open, toggleSidebar } = useSidebar();

    const isActiveRoute = (href) => {
        if (!href) return false;
        if (href === "/") return location.pathname === "/";
        return location.pathname.startsWith(href);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Sidebar
            collapsible="icon"
            className={cn(
                "relative overflow-hidden border-r border-white/5",
                "bg-[#181c1a] text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
            )}
        >
            {/* Glass overlay */}
            <div className="pointer-events-none absolute left-0 top-32 h-96 w-96 rounded-full bg-white/5 blur-3xl" />

            {/* Header (simplified: logo text + toggle) */}
            <SidebarHeader
                className={cn(
                    "relative py-3 transition-all duration-300 flex items-center bg-black",
                    open ? "px-4 justify-between" : "px-2 justify-center"
                )}
            >
                {open ? (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <img
                                src="/favicon.jpeg"
                                alt="Advise AI"
                                className="w-6 h-6 object-contain rounded"
                            />
                            <span className="text-sm font-semibold text-white tracking-tight">
                                Advise AI
                            </span>
                        </div>

                        <button
                            onClick={toggleSidebar}
                            className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                            aria-label="Collapse sidebar"
                        >
                            <PanelLeft className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    // Collapsed: Show logo, toggle button appears on hover
                    <div className="relative flex items-center justify-center w-full">
                        <div className="group/logo relative flex items-center justify-center cursor-pointer">
                            <img
                                src="/favicon.jpeg"
                                alt="Advise AI"
                                className="w-8 h-8 object-contain rounded transition-opacity duration-200 group-hover/logo:opacity-0"
                            />
                            <button
                                onClick={toggleSidebar}
                                className="absolute flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 text-zinc-400 transition-all duration-200 opacity-0 group-hover/logo:opacity-100 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                                aria-label="Expand sidebar"
                            >
                                <PanelLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </SidebarHeader>

            {/* Content */}
            <SidebarContent
                className={cn(
                    "relative flex-1 pb-4 transition-all duration-300 bg-black",
                    open ? "px-3" : "px-2"
                )}
            >
                <div className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* PLATFORM Section */}
                <div className="pt-6">
                    {open && (
                        <div className="px-2 mb-3">
                            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wide">
                                Platform
                            </span>
                        </div>
                    )}
                    <nav className="space-y-1">
                        {navItems.slice(0, 2).map((item) => {
                            const isActive = isActiveRoute(item.href);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(item.href)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={cn(
                                        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                                        isActive
                                            ? "bg-white/10 text-zinc-200 shadow-lg shadow-black/20"
                                            : "text-zinc-300 hover:bg-white/5 hover:text-white",
                                        !open && "justify-center"
                                    )}
                                    title={!open ? item.title : undefined}
                                >
                                    <item.icon
                                        className={cn(
                                            "size-5 transition-colors",
                                            isActive
                                                ? "text-emerald-400"
                                                : "text-zinc-400"
                                        )}
                                    />
                                    {open && (
                                        <span className="text-sm font-medium">
                                            {item.title}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <SidebarSeparator className="my-6 bg-white/10" />

                {/* ACCOUNT Section */}
                <div>
                    {open && (
                        <div className="px-2 mb-3">
                            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wide">
                                Account
                            </span>
                        </div>
                    )}
                    <nav className="space-y-1">
                        {navItems.slice(2).map((item) => {
                            const isActive = isActiveRoute(item.href);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(item.href)}
                                    aria-current={isActive ? "page" : undefined}
                                    className={cn(
                                        "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                                        isActive
                                            ? "bg-white/10 text-zinc-200 shadow-lg shadow-black/20"
                                            : "text-zinc-300 hover:bg-white/5 hover:text-white",
                                        !open && "justify-center"
                                    )}
                                    title={!open ? item.title : undefined}
                                >
                                    <item.icon
                                        className={cn(
                                            "size-5 transition-colors",
                                            isActive
                                                ? "text-emerald-400"
                                                : "text-zinc-400"
                                        )}
                                    />
                                    {open && (
                                        <span className="text-sm font-medium">
                                            {item.title}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter
                className={cn(
                    "relative border-t border-white/10 pb-4 pt-4 transition-all duration-300 bg-black",
                    open ? "px-3" : "px-2"
                )}
            >
                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 shadow-lg backdrop-blur-xl">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
                    {open ? (
                        <>
                            <div className="relative flex items-center gap-3 mb-3">
                                <Avatar className="size-10 border border-white/10 bg-zinc-900/80 ring-1 ring-white/5">
                                    <AvatarImage
                                        src={
                                            authUser?.profilePic ||
                                            "/avatar.png"
                                        }
                                        alt={authUser?.username}
                                    />
                                    <AvatarFallback className="bg-gradient-to-br from-zinc-700/20 to-zinc-900/10 text-sm font-semibold text-white">
                                        {getUserInitials(authUser?.username)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-1 flex-col gap-0">
                                    <span className="text-sm font-semibold text-white">
                                        {authUser?.username ?? "User"}
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                        {authUser?.phone ?? "No phone"}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-zinc-300 transition-all duration-300 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 active:scale-[0.98]"
                            >
                                <LogOut className="size-4" />
                                <span>Log out</span>
                            </button>
                        </>
                    ) : (
                        <div className="relative flex flex-col items-center gap-2">
                            <Avatar className="size-10 border border-white/10 bg-zinc-900/80 ring-1 ring-white/5">
                                <AvatarImage
                                    src={authUser?.profilePic || "/avatar.png"}
                                    alt={authUser?.username}
                                />
                                <AvatarFallback className="bg-gradient-to-br from-zinc-700/20 to-zinc-900/10 text-sm font-semibold text-white">
                                    {getUserInitials(authUser?.username)}
                                </AvatarFallback>
                            </Avatar>
                            <button
                                onClick={handleLogout}
                                className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-all duration-300 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                                title="Log out"
                            >
                                <LogOut className="size-4" />
                            </button>
                        </div>
                    )}
                </div>
            </SidebarFooter>
        </Sidebar>
    );
};

export default AppSidebar;
