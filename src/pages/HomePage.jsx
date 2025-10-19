import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

/**
 * HomePage Component
 *
 * Main chat interface displaying conversation list and chat container.
 * Now integrated with DashboardLayout - no top navbar needed.
 *
 * Features:
 * - Full height layout without navbar padding
 * - Chat list sidebar (existing Sidebar component)
 * - Chat container or "no chat selected" state
 * - All existing chat functionality preserved
 */
const HomePage = () => {
    const { selectedConversation } = useChatStore();

    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center p-4">
                <div className="bg-base-100 rounded-lg shadow-cl w-full h-[calc(100vh-2rem)]">
                    <div className="flex h-full rounded-lg overflow-hidden">
                        <Sidebar />

                        {!selectedConversation ? (
                            <NoChatSelected />
                        ) : (
                            <ChatContainer />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HomePage;
