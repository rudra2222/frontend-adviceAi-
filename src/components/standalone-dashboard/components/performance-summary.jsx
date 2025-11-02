// React default import not required with the new JSX transform
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import {
    BrainCircuit,
    Users,
    BarChart3,
    Banknote,
    BellRing,
} from "lucide-react";

const summaryData = [
    {
        title: "Today's Conversations",
        content: "123 / 45",
        description: "AI vs Agent",
        icon: BrainCircuit,
    },
    {
        title: "New Leads",
        content: "27",
        description: "New qualified leads",
        icon: Users,
    },
    {
        title: "Campaign Stats",
        content: "5.2%",
        description: "CTR, 23% Reply",
        icon: BarChart3,
    },
    {
        title: "Revenue Overview",
        content: "₹12,345",
        description: "Today",
        icon: Banknote,
    },
    {
        title: "Pending Follow-Ups",
        content: "12",
        description: "Leads need attention",
        icon: BellRing,
    },
];

export function PerformanceSummary() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-body">Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {summaryData.map((item) => (
                    <Card key={item.title} className="bg-background">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium font-body">
                                {item.title}
                            </CardTitle>
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold font-display">
                                {item.content}
                            </div>
                            <p className="text-xs text-muted-foreground font-body">
                                {item.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
}
