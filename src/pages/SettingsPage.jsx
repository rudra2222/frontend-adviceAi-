import React, { useState } from "react";
import { Settings } from "lucide-react";
import SettingsSidebar from "../components/SettingsSidebar";
import QuickRepliesSettings from "../components/QuickRepliesSettings";
import PrivacyPolicy from "../components/PrivacyPolicy";

function SettingsPage() {
    const [currentView, setCurrentView] = useState("menu"); // "menu" | "business" | "help"

    return (
        <div className="flex h-screen bg-zinc-900">
            <div className="relative">
                <SettingsSidebar onNavigate={setCurrentView} />
                {/* Vertical separator with subtle highlight */}
                <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-zinc-700 via-zinc-600 to-zinc-700"></div>
            </div>
            {currentView === "business" && (
                <QuickRepliesSettings onBack={() => setCurrentView("menu")} />
            )}
            {currentView === "help" && (
                <PrivacyPolicy onBack={() => setCurrentView("menu")} />
            )}
            {currentView === "menu" && (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-4 pt-16">
                    <Settings className="w-24 h-24 text-zinc-600" />
                    <p className="text-lg">Select a setting to configure</p>
                </div>
            )}
        </div>
    );
}

export default SettingsPage;
