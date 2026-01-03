import axios from "axios";

export const axiosInstance = axios.create({
	baseURL:
		import.meta.env.VITE_MODE === "development"
			? `${import.meta.env.VITE_LOCAL_URL}/api/v2`
			: `${import.meta.env.VITE_BACKEND_URL}/api/v2`,
	withCredentials: true,
});
