// React default import not required with the new JSX transform
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card.jsx";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "../ui/chart.jsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const chartData = [
    { date: "2024-01", meta: 4000, whatsapp: 2400 },
    { date: "2024-02", meta: 3000, whatsapp: 1398 },
    { date: "2024-03", meta: 2000, whatsapp: 9800 },
    { date: "2024-04", meta: 2780, whatsapp: 3908 },
    { date: "2024-05", meta: 1890, whatsapp: 4800 },
    { date: "2024-06", meta: 2390, whatsapp: 3800 },
];

const chartConfig = {
    meta: {
        label: "Meta",
        color: "hsl(221.2 83.2% 53.3%)",
    },
    whatsapp: {
        label: "WhatsApp",
        color: "hsl(var(--chart-2))",
    },
};

export function PerformanceChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-body">Performance Trend</CardTitle>
                <CardDescription className="font-body">
                    Meta vs. WhatsApp
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[350px] w-full"
                >
                    <LineChart data={chartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            className="font-body"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            className="font-display"
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line
                            dataKey="meta"
                            type="monotone"
                            stroke="var(--color-meta)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            dataKey="whatsapp"
                            type="monotone"
                            stroke="var(--color-whatsapp)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
