// React default import not required with the new JSX transform
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import {
    Users,
    Megaphone,
    DollarSign,
    Ratio,
    MessageCircle,
} from "lucide-react";

const kpiData = [
    {
        title: "Total Leads",
        value: "1,257",
        description: "+15.2% from last month",
        icon: Users,
    },
    {
        title: "Active Campaigns",
        value: "5",
        description: "2 WhatsApp, 3 Meta",
        icon: Megaphone,
    },
    {
        title: "Total Ad Spend",
        value: "₹2,50,000",
        description: "Across all platforms",
        icon: DollarSign,
    },
    {
        title: "Conversion Rate",
        value: "4.8%",
        description: "+1.2% from last week",
        icon: Ratio,
    },
    {
        title: "WhatsApp Messages",
        value: "1.2k/980/650",
        description: "Sent/Delivered/Replied",
        icon: MessageCircle,
    },
];

export function KpiCards() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {kpiData.map((kpi) => (
                <Card key={kpi.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium font-body">
                            {kpi.title}
                        </CardTitle>
                        <kpi.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-display">
                            {kpi.value}
                        </div>
                        <p className="text-xs text-muted-foreground font-body">
                            {kpi.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
