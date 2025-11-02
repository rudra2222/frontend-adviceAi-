// React default import not required with the new JSX transform
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card.jsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table.jsx";
import { Badge } from "../ui/badge.jsx";
import { TrendingUp, TrendingDown } from "lucide-react";

const campaigns = [
    {
        name: "Summer Sale",
        type: "WhatsApp",
        status: "Active",
        date: "2024-06-20",
        performance: "2.5%",
        trend: "up",
    },
    {
        name: "New Product Launch",
        type: "Meta",
        status: "Completed",
        date: "2024-06-15",
        performance: "1.8%",
        trend: "down",
    },
    {
        name: "Weekend Discount",
        type: "WhatsApp",
        status: "Active",
        date: "2024-06-22",
        performance: "3.1%",
        trend: "up",
    },
    {
        name: "Holiday Special",
        type: "Meta",
        status: "Paused",
        date: "2024-06-18",
        performance: "1.2%",
        trend: "down",
    },
    {
        name: "Flash Sale",
        type: "WhatsApp",
        status: "Completed",
        date: "2024-06-10",
        performance: "4.5%",
        trend: "up",
    },
];

export function LatestCampaigns() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-body">Latest Campaigns</CardTitle>
                <CardDescription className="font-body">
                    A summary of your recent marketing campaigns.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-body">
                                Campaign Name
                            </TableHead>
                            <TableHead className="font-body">Type</TableHead>
                            <TableHead className="font-body">Status</TableHead>
                            <TableHead className="font-body">Date</TableHead>
                            <TableHead className="text-right font-body">
                                Performance
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {campaigns.map((campaign) => (
                            <TableRow key={campaign.name}>
                                <TableCell className="font-medium font-body">
                                    {campaign.name}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            campaign.type === "Meta"
                                                ? "secondary"
                                                : "default"
                                        }
                                        className="font-body"
                                    >
                                        {campaign.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            campaign.status === "Active"
                                                ? "outline"
                                                : "destructive"
                                        }
                                        className={
                                            campaign.status === "Active"
                                                ? "text-primary border-primary font-body"
                                                : campaign.status === "Paused"
                                                ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/20 font-body"
                                                : "font-body"
                                        }
                                    >
                                        {campaign.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-body">
                                    {campaign.date}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        {campaign.trend === "up" ? (
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-destructive" />
                                        )}
                                        <span className="font-display">
                                            {campaign.performance}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
