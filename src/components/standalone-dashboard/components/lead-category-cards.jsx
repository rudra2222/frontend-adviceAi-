// React default import not required with the new JSX transform
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { cn } from "../lib/utils.js";

const leadCategories = [
    {
        title: "HOT LEADS",
        count: 42,
        percentage: "+12.5%",
        style: "bg-primary text-primary-foreground",
    },
    {
        title: "WARM LEADS",
        count: 103,
        percentage: "+8.2%",
        style: "border-white text-primary",
    },
    {
        title: "COLD LEADS",
        count: 215,
        percentage: "-2.1%",
        style: "border-gray-600 text-primary",
    },
    {
        title: "LOW PRIORITY",
        count: 350,
        percentage: "+5.0%",
        style: "border-primary/50 text-primary border-dashed bg-transparent",
    },
];

export function LeadCategoryCards() {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {leadCategories.map((lead) => (
                <Card key={lead.title} className={cn("shadow-lg", lead.style)}>
                    <CardHeader>
                        <CardTitle
                            className={cn(
                                "text-sm font-medium font-body",
                                lead.title === "HOT LEADS"
                                    ? "text-primary-foreground/80"
                                    : ""
                            )}
                        >
                            {lead.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold font-display">
                            {lead.count}
                        </div>
                        <p
                            className={cn(
                                "text-xs font-body",
                                lead.title === "HOT LEADS"
                                    ? "text-primary-foreground/60"
                                    : "text-muted-foreground"
                            )}
                        >
                            {lead.percentage} from last month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
