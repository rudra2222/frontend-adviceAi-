import { Badge } from "@/components/ui/badge";
import DashboardOverview from "../components/standalone-dashboard/index.jsx";

const DashboardPage = () => {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div
                className="border-b px-6 py-4"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
                <div className="flex items-center justify-between ">
                    <div>
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                    </div>
                    <Badge variant="outline" className="text-xs bg-blue-900">
                        BETA
                    </Badge>
                </div>
            </div>

            {/* Main Content with proper padding */}
            <div className="flex-1 overflow-auto px-6">
                {/* Standalone Dashboard Overview */}
                <div className="mt-6">
                    <DashboardOverview />
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
