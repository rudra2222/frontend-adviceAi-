// React default import not required with the new JSX transform
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card.jsx";
import { Skeleton } from "../../ui/skeleton.jsx";
import { getRealTimeStats } from "../../../lib/dashboardApi.js";

export function RealtimeConversations() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getRealTimeStats();
        const data = response.data || response;
        setStats(data.realTimeConversations || data);
      } catch (err) {
        console.error("Error fetching real-time stats:", err);
        setError(err.message || "Failed to load real-time data");
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchRealTimeData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRealTimeData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-body">
            Real-Time Conversation Counter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            Error loading real-time data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-body">
            Real-Time Conversation Counter
          </CardTitle>
          <CardDescription className="font-body">
            Live updates every 30 seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-body">
          Real-Time Conversation Counter
        </CardTitle>
        <CardDescription className="font-body">
          Live updates every 30 seconds
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground font-body">
            Total This Month
          </p>
          <p className="text-4xl font-bold font-display">
            {stats.totalThisMonth?.toLocaleString() || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-body">Active Now</p>
          <p className="text-4xl font-bold font-display text-primary">
            {stats.activeNow?.toLocaleString() || 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-body">AI Handled</p>
          <p className="text-4xl font-bold font-display">
            {stats.aiHandledPercentage || 0}%
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground font-body">
            Agent Handled
          </p>
          <p className="text-4xl font-bold font-display">
            {stats.agentHandledPercentage || 0}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
