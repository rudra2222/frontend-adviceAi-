import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, TrendingUp, Activity } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import Overlay from "../components/util/Overlay.jsx";

/**
 * DashboardPage Component
 *
 * Analytics and insights dashboard view.
 * Displays statistics about conversations, messages, and user activity.
 *
 * Features:
 * - Real-time statistics from chat store
 * - Card-based layout for metrics
 * - Responsive grid
 * - Professional shadcn/ui styling
 */
const DashboardPage = () => {
    const { conversations = [], messages = [] } = useChatStore();
    const { authUser } = useAuthStore();

    // Calculate statistics
    const totalConversations = conversations.length;
    const totalMessages = messages.length;
    const activeConversations = conversations.filter(
        (conv) => conv.messages && conv.messages.length > 0
    ).length;

    // Dashboard statistics cards
    const stats = [
        {
            title: "Total Conversations",
            value: totalConversations,
            description: "All chat conversations",
            icon: MessageSquare,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            title: "Active Chats",
            value: activeConversations,
            description: "Conversations with messages",
            icon: Activity,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950",
        },
        {
            title: "Total Messages",
            value: totalMessages,
            description: "Messages in current conversation",
            icon: TrendingUp,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950",
        },
        {
            title: "User Profile",
            value: "Active",
            description: authUser?.email || "No email",
            icon: Users,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950",
        },
    ];

    return (
        <Overlay>
            <div className="flex flex-col h-full bg-base-200">
                {/* Header */}
                <div className="border-b bg-base-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Dashboard</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Analytics and insights for your conversations
                            </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Live Data
                        </Badge>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-6">
                    {/* Statistics Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card
                                    key={stat.title}
                                    className="hover:shadow-md transition-shadow"
                                >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {stat.title}
                                        </CardTitle>
                                        <div
                                            className={`p-2 rounded-lg ${stat.bgColor}`}
                                        >
                                            <Icon
                                                className={`h-4 w-4 ${stat.color}`}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stat.value}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {stat.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Additional Information Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Welcome Card */}
                        <Card className="col-span-full lg:col-span-2">
                            <CardHeader>
                                <CardTitle>
                                    Welcome back, {authUser?.fullName || "User"}
                                    !
                                </CardTitle>
                                <CardDescription>
                                    Here's what's happening with your
                                    conversations today.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm font-medium">
                                            Account Status
                                        </span>
                                        <Badge variant="default">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b">
                                        <span className="text-sm font-medium">
                                            Email
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {authUser?.email || "Not provided"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm font-medium">
                                            Total Conversations
                                        </span>
                                        <span className="text-sm font-bold">
                                            {totalConversations}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversation Insights</CardTitle>
                                <CardDescription>
                                    Message distribution overview
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">
                                                Messages per Chat
                                            </span>
                                            <span className="text-sm font-bold text-emerald-600">
                                                {totalConversations > 0
                                                    ? Math.round(
                                                          totalMessages /
                                                              totalConversations
                                                      )
                                                    : 0}
                                            </span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-emerald-600 to-green-600 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${Math.min(
                                                        (totalMessages /
                                                            (totalConversations *
                                                                10)) *
                                                            100,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">
                                                Active Chat Rate
                                            </span>
                                            <span className="text-sm font-bold text-blue-600">
                                                {totalConversations > 0
                                                    ? Math.round(
                                                          (activeConversations /
                                                              totalConversations) *
                                                              100
                                                      )
                                                    : 0}
                                                %
                                            </span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-cyan-600 h-2 rounded-full transition-all duration-300"
                                                style={{
                                                    width: `${
                                                        totalConversations > 0
                                                            ? (activeConversations /
                                                                  totalConversations) *
                                                              100
                                                            : 0
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2 mt-2 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            � Tip: Use the sidebar to access
                                            Profile and Settings
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Activity Placeholder */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your latest conversations and interactions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-sm">
                                    No recent activity to display
                                </p>
                                <p className="text-xs mt-2">
                                    Start chatting to see your activity here
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Overlay>
    );
};

export default DashboardPage;
