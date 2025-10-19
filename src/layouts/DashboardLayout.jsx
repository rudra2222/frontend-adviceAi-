import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

/**
 * DashboardLayout Component
 *
 * Main layout wrapper for authenticated pages.
 * Provides persistent sidebar navigation and content area.
 *
 * Features:
 * - SidebarProvider manages sidebar state (collapsed/expanded)
 * - AppSidebar provides navigation menu
 * - SidebarInset provides content area with proper spacing
 * - Responsive: Sheet on mobile, persistent on desktop
 * - Preserves sidebar state in localStorage
 *
 * Usage:
 * Wrap routes that should have sidebar navigation
 */
const DashboardLayout = () => {
    return (
        <SidebarProvider
            defaultOpen={true}
            style={{
                "--sidebar-width": "16rem",
                "--sidebar-width-icon": "4rem",
                "--sidebar-width-mobile": "18rem",
            }}
        >
            <AppSidebar />
            <SidebarInset>
                {/* Content area - renders nested routes */}
                <main className="flex-1 w-full h-screen overflow-hidden">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DashboardLayout;
