// React default import not required with the new JSX transform
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Skeleton } from "../../ui/skeleton.jsx";

import {
  Users,
  Megaphone,
  DollarSign,
  Ratio,
  MessageCircle,
} from "lucide-react";
import {
  getLeadsStats,
  getMessagesStats,
  getCampaignsStats,
} from "../../../lib/dashboardApi.js";


export function KpiCards() {
  const [kpiData, setKpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [leadsRes, messagesRes, campaignsRes] = await Promise.all([
          getLeadsStats(),
          getMessagesStats(),
          getCampaignsStats(),
        ]);

        const leadsData = leadsRes.data || leadsRes;
        const messagesData = messagesRes.data || messagesRes;
        const campaignsData = campaignsRes.data || campaignsRes;

        const totalLeads = leadsData.totalLeads?.count || 0;
        const leadsPercent = leadsData.totalLeads?.percentChange || 0;

        const sentMessages = messagesData.whatsappMessages?.sent || 0;
        const deliveredMessages = messagesData.whatsappMessages?.delivered || 0;
        const repliedMessages = messagesData.whatsappMessages?.replied || 0;

        const activeCampaigns = campaignsData.activeCampaigns?.total || 0;
        const whatsappCampaigns = campaignsData.activeCampaigns?.whatsapp || 0;
        const metaCampaigns = campaignsData.activeCampaigns?.meta || 0;

        const conversionRate = leadsData.conversionRate?.percentage || 0;
        const conversionChange = leadsData.conversionRate?.percentChange || 0;

        const formattedKpiData = [
          {
            title: "Total Leads",
            value: totalLeads.toLocaleString(),
            description: `${
              leadsPercent > 0 ? "+" : ""
            }${leadsPercent}% from last month`,
            icon: Users,
          },
          {
            title: "Active Campaigns",
            value: activeCampaigns.toString(),
            description: `${whatsappCampaigns} WhatsApp, ${metaCampaigns} Meta`,
            icon: Megaphone,
          },
          {
            title: "Total Ad Spend",
            value: "₹0",
            description: "Requires Meta Marketing API",
            icon: DollarSign,
          },
          {
            title: "Conversion Rate",
            value: `${conversionRate.toFixed(1)}%`,
            description: `${
              conversionChange > 0 ? "+" : ""
            }${conversionChange}% from last week`,
            icon: Ratio,
          },
          {
            title: "WhatsApp Messages",
            value: `${(sentMessages / 1000).toFixed(1)}k/${(
              deliveredMessages / 1000
            ).toFixed(1)}k/${repliedMessages}`,
            description: "Sent/Delivered/Replied",
            icon: MessageCircle,
          },
        ];

        setKpiData(formattedKpiData);
      } catch (err) {
        console.error("Error fetching KPI data:", err);
        setError(err.message || "Failed to load KPI data");
      } finally {
        setLoading(false);
      }
    };

    fetchKpiData();
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Error loading KPI data: {error}
      </div>
    );
  }

  if (loading || !kpiData) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
            <div className="text-2xl font-bold font-display">{kpi.value}</div>
            <p className="text-xs text-muted-foreground font-body">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
