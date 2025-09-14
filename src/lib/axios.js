import axios from "axios";

export const axiosInstance = axios.create({
	baseURL:
		import.meta.env.MODE === "development"
			? "http://localhost:2025/api/v1"
			: `https://adviseai-backend.onrender.com/api/v1`,
	withCredentials: true,
});
