import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js";
import {
    getCache,
    setCache,
    removeCache,
    CACHE_KEYS,
    CACHE_TTL,
} from "../lib/cache.js";

const BASE_URL =
    import.meta.env.VITE_MODE === "development"
        ? import.meta.env.VITE_LOCAL_URL
        : import.meta.env.VITE_BACKEND_URL;

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket: null,

    checkAuth: async () => {
        try {
            // Try to get from cache first
            const cached = getCache(CACHE_KEYS.AUTH_USER);
            if (cached) {
                set({ authUser: cached });
                get().connectSocket();
                return;
            }

            const res = await axiosInstance.get("/auth/check");

            // Cache the auth user
            setCache(CACHE_KEYS.AUTH_USER, res.data, CACHE_TTL.LONG);

            set({ authUser: res.data });
            get().connectSocket();
        } catch {
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);

            // Cache the auth user
            setCache(CACHE_KEYS.AUTH_USER, res.data, CACHE_TTL.LONG);

            set({ authUser: res.data });
            toast.success("Account created successfully");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);

            // Cache the auth user
            setCache(CACHE_KEYS.AUTH_USER, res.data, CACHE_TTL.LONG);

            set({ authUser: res.data });
            toast.success("Logged in successfully");

            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser: null });
            toast.success("Logged out successfully");

            // Clear all caches on logout
            removeCache(CACHE_KEYS.AUTH_USER);
            removeCache(CACHE_KEYS.CONVERSATIONS);
            removeCache(CACHE_KEYS.LABELS);
            removeCache(CACHE_KEYS.CONVERSATION_LABELS);

            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);

            // Cache the updated auth user
            setCache(CACHE_KEYS.AUTH_USER, res.data, CACHE_TTL.LONG);

            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });
        
        socket.on("connect_error", (error) => {
            console.warn("Socket connection error (non-critical for dashboard):", error.message);
        });
        
        socket.connect();
        set({ socket: socket });
        useChatStore.getState().subscribeToMessages();
        useChatStore.getState().subscribeToInterventionStatus();
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    },
}));




// import { create } from "zustand";
// import { axiosInstance } from "../lib/axios.js";
// import toast from "react-hot-toast";
// import { io } from "socket.io-client";
// import { useChatStore } from "./useChatStore.js";
// import {
//     getCache,
//     setCache,
//     removeCache,
//     CACHE_KEYS,
//     CACHE_TTL,
// } from "../lib/cache.js";

// const BASE_URL =
//     import.meta.env.MODE === "development"
//         ? import.meta.env.VITE_LOCAL_URL
//         : import.meta.env.VITE_BACKEND_URL;

// export const useAuthStore = create((set, get) => ({
//     authUser: null,
//     isSigningUp: false,
//     isLoggingIn: false,
//     isUpdatingProfile: false,
//     isCheckingAuth: true,
//     socket: null,

//     checkAuth: async () => {
//         try {
//             // Try to get from cache first
//             const cached = getCache(CACHE_KEYS.AUTH_USER);
//             if (cached) {
//                 set({ authUser: cached });
//                 get().connectSocket();
//                 return;
//             }

//             const res = await axiosInstance.get("/auth/check");

//             // Cache the auth user
//             setCache(CACHE_KEYS.AUTH_USER, res.data, CACHE_TTL.LONG);

//             set({ authUser: res.data });
//             get().connectSocket();
//         } catch (error) {
//             // In development mode, use a mock user for dashboard testing
//             if (import.meta.env.MODE === "development") {
//                 const mockUser = {
//                     _id: "dev-user-123",
//                     email: "dev@test.com",
//                     name: "Developer",
//                     profilePic: "https://via.placeholder.com/40",
//                 };
//                 set({ authUser: mockUser });
//                 setCache(CACHE_KEYS.AUTH_USER, mockUser, CACHE_TTL.LONG);
//                 get().connectSocket();
//             } else {
//                 set({ authUser: null });
//             }
//         } finally {
//             set({ isCheckingAuth: false });
//         }
//     },

//     signup: async (data) => {
//         set({ isSigningUp: true });
//         try {
//             const res = await axiosInstance.post("/auth/signup", data);

//             // Cache the auth user
//             setCache(CACHE_KEYS.AUTH_USER, res.data, CACHE_TTL.LONG);

//             set({ authUser: res.data });
//             toast.success("Account created successfully");
//             get().connectSocket();
//         } catch (error) {
//             toast.error(error.response.data.message);
//         } finally {
//             set({ isSigningUp: false });
//         }
//     },

//     login: async (data) => {
//         set({ isLoggingIn: true });
//         try {
//             const res = await axiosInstance.post("/auth/login", data);

//             // Cache the auth user
//             setCache(CACHE_KEYS.AUTH_USER, res.data, CACHE_TTL.LONG);

//             set({ authUser: res.data });
//             toast.success("Logged in successfully");

//             get().connectSocket();
//         } catch (error) {
//             toast.error(error.response.data.message);
//         } finally {
//             set({ isLoggingIn: false });
//         }
//     },

//     logout: async () => {
//         try {
//             await axiosInstance.post("/auth/logout");
//             set({ authUser: null });
//             toast.success("Logged out successfully");

//             // Clear all caches on logout
//             removeCache(CACHE_KEYS.AUTH_USER);
//             removeCache(CACHE_KEYS.CONVERSATIONS);
//             removeCache(CACHE_KEYS.LABELS);
//             removeCache(CACHE_KEYS.CONVERSATION_LABELS);

//             get().disconnectSocket();
//         } catch (error) {
//             toast.error(error.response.data.message);
//         }
//     },

//     updateProfile: async (data) => {
//         set({ isUpdatingProfile: true });
//         try {
//             const res = await axiosInstance.put("/auth/update-profile", data);

//             // Cache the updated auth user
//             setCache(CACHE_KEYS.AUTH_USER, res.data, CACHE_TTL.LONG);

//             set({ authUser: res.data });
//             toast.success("Profile updated successfully");
//         } catch (error) {
//             toast.error(error.response.data.message);
//         } finally {
//             set({ isUpdatingProfile: false });
//         }
//     },

//     connectSocket: () => {
//         const { authUser } = get();
//         if (!authUser || get().socket?.connected) return;

//         const socket = io(BASE_URL, {
//             transports: ["websocket"],
//             reconnection: true,
//             reconnectionDelay: 1000,
//             reconnectionDelayMax: 5000,
//             reconnectionAttempts: 5,
//         });
        
//         socket.on("connect_error", (error) => {
//             console.warn("Socket connection error (non-critical for dashboard):", error.message);
//         });
        
//         socket.connect();
//         set({ socket: socket });
//         useChatStore.getState().subscribeToMessages();
//         useChatStore.getState().subscribeToInterventionStatus();
//     },

//     disconnectSocket: () => {
//         if (get().socket?.connected) get().socket.disconnect();
//     },
// }));
