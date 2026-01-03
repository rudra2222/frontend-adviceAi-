import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_MODE === "development"
		// ? `${import.meta.env.VITE_LOCAL_URL}/api/v2`
		? "http://localhost:2025/api/v2"
		: `${import.meta.env.VITE_BACKEND_URL}/api/v2`;


const dashboardApi = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
});

/**
 * Fetch all dashboard statistics in one call
 * Returns: leadsStats, messagesStats, realTimeStats, campaignsStats
 */
export const getDashboardStats = async () => {
	try {
		const response = await dashboardApi.get("/dashboard/stats");
		return response.data;
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		throw error;
	}
};

/**
 * Fetch only lead category statistics
 */
export const getLeadsStats = async () => {
	try {
		const response = await dashboardApi.get("/dashboard/leads");
		return response.data;
	} catch (error) {
		console.error("Error fetching leads stats:", error);
		throw error;
	}
};

/**
 * Fetch only message statistics
 */
export const getMessagesStats = async () => {
	try {
		const response = await dashboardApi.get("/dashboard/messages");
		return response.data;
	} catch (error) {
		console.error("Error fetching messages stats:", error);
		throw error;
	}
};

/**
 * Fetch real-time conversation metrics
 */
export const getRealTimeStats = async () => {
	try {
		const response = await dashboardApi.get("/dashboard/real-time");
		return response.data;
	} catch (error) {
		console.error("Error fetching real-time stats:", error);
		throw error;
	}
};

/**
 * Fetch campaign statistics
 */
export const getCampaignsStats = async () => {
	try {
		const response = await dashboardApi.get("/dashboard/campaigns");
		return response.data;
	} catch (error) {
		console.error("Error fetching campaigns stats:", error);
		throw error;
	}
};

export default dashboardApi;
