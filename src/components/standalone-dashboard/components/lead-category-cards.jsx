// React default import not required with the new JSX transform
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Skeleton } from "../../ui/skeleton.jsx";
import { cn } from "../lib/utils.js";
import { getLeadsStats } from "../../../lib/dashboardApi.js";

export function LeadCategoryCards() {
  const [leadCategories, setLeadCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getLeadsStats();
        const data = response.data || response;

        const leads = data.leadCategories || {};

        const categoryData = [
          {
            title: "HOT LEADS",
            count: leads.hotLeads?.count || 0,
            percentage: leads.hotLeads?.percentChange || 0,
            style: "bg-primary text-primary-foreground",
          },
          {
            title: "WARM LEADS",
            count: leads.warmLeads?.count || 0,
            percentage: leads.warmLeads?.percentChange || 0,
            style: "border-white text-primary",
          },
          {
            title: "COLD LEADS",
            count: leads.coldLeads?.count || 0,
            percentage: leads.coldLeads?.percentChange || 0,
            style: "border-gray-600 text-primary",
          },
          {
            title: "LOW PRIORITY",
            count: leads.lowPriority?.count || 0,
            percentage: leads.lowPriority?.percentChange || 0,
            style:
              "border-primary/50 text-primary border-dashed bg-transparent",
          },
        ];

        setLeadCategories(categoryData);
      } catch (err) {
        console.error("Error fetching lead categories:", err);
        setError(err.message || "Failed to load lead categories");
      } finally {
        setLoading(false);
      }
    };

    fetchLeadData();
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        Error loading leads data: {error}
      </div>
    );
  }

  if (loading || !leadCategories) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {leadCategories.map((lead) => (
        <Card key={lead.title} className={cn("shadow-lg", lead.style)}>
          <CardHeader>
            <CardTitle
              className={cn(
                "text-sm font-medium font-body",
                lead.title === "HOT LEADS" ? "text-primary-foreground/80" : ""
              )}
            >
              {lead.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold font-display">{lead.count}</div>
            <p
              className={cn(
                "text-xs font-body",
                lead.title === "HOT LEADS"
                  ? "text-primary-foreground/60"
                  : "text-muted-foreground"
              )}
            >
              {lead.percentage > 0 ? "+" : ""}
              {lead.percentage.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
