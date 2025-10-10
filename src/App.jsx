import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import Navbar from "./components/Navbar";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { QuickRepliesProvider } from "./context/QuickRepliesContext";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
    const { theme } = useThemeStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    return (
        <QuickRepliesProvider>
            <div data-theme={theme}>
                <Navbar />

                <Routes>
                    <Route
                        path="/"
                        element={
                            authUser ? <HomePage /> : <Navigate to="/login" />
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            !authUser ? <SignUpPage /> : <Navigate to="/" />
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            !authUser ? <LoginPage /> : <Navigate to="/" />
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            authUser ? (
                                <SettingsPage />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            authUser ? (
                                <ProfilePage />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />

                    {/* Catch-all route for unknown paths */}
                    <Route
                        path="*"
                        element={
                            <Navigate to={authUser ? "/" : "/login"} replace />
                        }
                    />
                </Routes>

                <Toaster />
            </div>
        </QuickRepliesProvider>
    );
};

export default App;
