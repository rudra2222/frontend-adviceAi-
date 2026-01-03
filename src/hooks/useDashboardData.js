import { useEffect, useState } from "react";
import { getDashboardStats } from "../lib/dashboardApi.js";

/**
 * Custom hook to fetch and manage dashboard data with auto-refresh
 * @param {number} refreshInterval - Interval in milliseconds to refresh data (default: 30000 = 30 seconds)
 * @returns {Object} - { data, loading, error, lastUpdated, refetch }
 */
export const useDashboardData = (refreshInterval = 30000) => {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastUpdated, setLastUpdated] = useState(null);

	// Fetch data function
	const fetchData = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await getDashboardStats();
			setData(response.data);
			setLastUpdated(new Date());
		} catch (err) {
			console.error("Error fetching dashboard data:", err);
			setError(err.message || "Failed to fetch dashboard data");
		} finally {
			setLoading(false);
		}
	};

	// Initial fetch
	useEffect(() => {
		fetchData();
	}, []);

	// Auto-refresh interval
	useEffect(() => {
		if (refreshInterval <= 0) return;

		const interval = setInterval(() => {
			fetchData();
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [refreshInterval]);

	return {
		data,
		loading,
		error,
		lastUpdated,
		refetch: fetchData,
	};
};
