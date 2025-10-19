import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import DashboardLayout from "./layouts/DashboardLayout";

import Navbar from "./components/Navbar";

import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { QuickRepliesProvider } from "./context/QuickRepliesContext";

/**
 * App Component
 *
 * Root component with routing logic.
 *
 * Architecture:
 * - Auth pages (Login/SignUp): Standalone with Navbar
 * - Authenticated pages: Wrapped in DashboardLayout with AppSidebar
 * - All chat functionality preserved in HomePage
 *
 * Migration Notes:
 * - Navbar only shown on auth pages
 * - DashboardLayout provides sidebar for authenticated routes
 * - All existing features maintained
 */
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
                <Routes>
                    {/* Public Routes - Auth pages with Navbar */}
                    <Route
                        path="/signup"
                        element={
                            !authUser ? (
                                <>
                                    <Navbar />
                                    <SignUpPage />
                                </>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            !authUser ? (
                                <>
                                    <Navbar />
                                    <LoginPage />
                                </>
                            ) : (
                                <Navigate to="/" />
                            )
                        }
                    />

                    {/* Protected Routes - Wrapped in DashboardLayout */}
                    <Route
                        element={
                            authUser ? (
                                <DashboardLayout />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    >
                        <Route path="/" element={<HomePage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

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
