// React default import not required with the new JSX transform
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Skeleton } from "../../ui/skeleton.jsx";
import {
  BrainCircuit,
  Users,
  BarChart3,
  Banknote,
  BellRing,
} from "lucide-react";
import { getLeadsStats, getMessagesStats } from "../../../lib/dashboardApi.js";

export function PerformanceSummary() {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [leadsRes, messagesRes] = await Promise.all([
          getLeadsStats(),
          getMessagesStats(),
        ]);

        const leadsData = leadsRes.data || leadsRes;
        const messagesData = messagesRes.data || messagesRes;

        const totalLeads = leadsData.totalLeads?.count || 0;
        const hotLeads = leadsData.leadCategories?.hotLeads?.count || 0;

        const sentMessages = messagesData.whatsappMessages?.sent || 0;
        const deliveredMessages = messagesData.whatsappMessages?.delivered || 0;
        const deliveryRate =
          sentMessages > 0
            ? ((deliveredMessages / sentMessages) * 100).toFixed(1)
            : 0;

        const formattedData = [
          {
            title: "Today's Conversations",
            content: "N/A",
            description: "AI vs Agent",
            icon: BrainCircuit,
          },
          {
            title: "New Leads",
            content: hotLeads.toString(),
            description: "Hot leads (High Priority)",
            icon: Users,
          },
          {
            title: "Campaign Stats",
            content: `${deliveryRate}%`,
            description: "Delivery Rate",
            icon: BarChart3,
          },
          {
            title: "Revenue Overview",
            content: "₹0",
            description: "Not available",
            icon: Banknote,
          },
          {
            title: "Total Leads",
            content: totalLeads.toString(),
            description: "All leads in system",
            icon: BellRing,
          },
        ];

        setSummaryData(formattedData);
      } catch (err) {
        console.error("Error fetching summary data:", err);
        setError(err.message || "Failed to load summary data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-body">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            Error loading summary data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !summaryData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="font-body">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-background">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    );
  }

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
