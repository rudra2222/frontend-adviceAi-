import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const location = useLocation();

    // Check if current page is login or signup
    const isAuthPage =
        location.pathname === "/login" || location.pathname === "/signup";

    return (
        <header
            className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
        >
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    <div className="flex items-center gap-8">
                        <Link
                            to="/"
                            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
                        >
                            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <img
                                    src="/favicon.jpeg"
                                    alt="Logo"
                                    className="size-6 object-contain"
                                />
                            </div>
                            <h1 className="text-lg font-bold">Advise AI</h1>
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        {authUser && !isAuthPage && (
                            <>
                                <Link
                                    to={"/settings"}
                                    className={`btn btn-sm gap-2 transition-colors hover:bg-green-800`}
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="hidden sm:inline">
                                        Settings
                                    </span>
                                </Link>

                                <Link
                                    to={"/profile"}
                                    className={`btn btn-sm gap-2 hover:bg-green-800`}
                                >
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">
                                        Profile
                                    </span>
                                </Link>

                                <button
                                    className="flex gap-2 items-center"
                                    onClick={logout}
                                >
                                    <LogOut className="size-5" />
                                    <span className="hidden sm:inline">
                                        Logout
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
export default Navbar;
