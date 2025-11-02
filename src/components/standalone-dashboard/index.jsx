// React default import not required with the new JSX transform
import { KpiCards } from "./components/kpi-cards.jsx";
import { PerformanceChart } from "./components/performance-chart.jsx";
import { LatestCampaigns } from "./components/latest-campaigns.jsx";
import { LeadCategoryCards } from "./components/lead-category-cards.jsx";
import { PerformanceSummary } from "./components/performance-summary.jsx";
import { RealtimeConversations } from "./components/realtime-conversations.jsx";

/**
 * DashboardOverview - A comprehensive dashboard component with multiple sections
 *
 * Features:
 * - Lead category cards (Hot, Warm, Cold, Low Priority)
 * - KPI cards (Total Leads, Active Campaigns, Ad Spend, etc.)
 * - Real-time conversation counter
 * - Performance trend chart (Meta vs WhatsApp)
 * - Latest campaigns table
 * - Performance summary cards
 *
 * @example
 * ```jsx
 * import DashboardOverview from './standalone-dashboard';
 *
 * function App() {
 *   return <DashboardOverview />;
 * }
 * ```
 */
export default function DashboardOverview() {
    return (
        <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="col-span-12">
                    <LeadCategoryCards />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="col-span-12">
                    <KpiCards />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="col-span-12">
                    <RealtimeConversations />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="col-span-12">
                    <PerformanceChart />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="col-span-12">
                    <LatestCampaigns />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="col-span-12">
                    <PerformanceSummary />
                </div>
            </div>
        </div>
    );
}

// Also export individual components for custom layouts
export {
    KpiCards,
    PerformanceChart,
    LatestCampaigns,
    LeadCategoryCards,
    PerformanceSummary,
    RealtimeConversations,
};
