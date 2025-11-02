import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
} from "react";

const QuickRepliesContext = createContext();

export const useQuickReplies = () => {
    const context = useContext(QuickRepliesContext);
    if (!context) {
        throw new Error(
            "useQuickReplies must be used within QuickRepliesProvider"
        );
    }
    return context;
};

const DEFAULT_QUICK_REPLIES = [
    {
        id: "1",
        shortcut: "hello",
        message: "Hello! How can I help you today?",
        createdAt: Date.now(),
    },
    {
        id: "2",
        shortcut: "thanks",
        message: "Thank you for reaching out! I appreciate it.",
        createdAt: Date.now(),
    },
];

// ==================== LOCAL STORAGE HELPER FUNCTIONS ====================
// TODO: Remove these functions when migrating to backend storage
const STORAGE_KEY = "quick_replies";

const loadQuickRepliesFromStorage = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : DEFAULT_QUICK_REPLIES;
    } catch (error) {
        console.error("Error loading quick replies from localStorage:", error);
        return DEFAULT_QUICK_REPLIES;
    }
};

const saveQuickRepliesToStorage = (replies) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(replies));
    } catch (error) {
        console.error("Error saving quick replies to localStorage:", error);
    }
};
// ==================== END LOCAL STORAGE HELPERS ====================

export const QuickRepliesProvider = ({ children }) => {
    // TODO: When migrating to backend, change this to:
    // const [quickReplies, setQuickReplies] = useState(DEFAULT_QUICK_REPLIES);
    const [quickReplies, setQuickReplies] = useState(
        loadQuickRepliesFromStorage
    );

    // ==================== LOCAL STORAGE SYNC ====================
    // TODO: Remove this useEffect when migrating to backend
    useEffect(() => {
        saveQuickRepliesToStorage(quickReplies);
    }, [quickReplies]);
    // ==================== END LOCAL STORAGE SYNC ====================

    const addQuickReply = useCallback((shortcut, message) => {
        const newReply = {
            id: Date.now().toString(),
            shortcut: shortcut.toLowerCase().trim(),
            message: message.trim(),
            createdAt: Date.now(),
        };
        setQuickReplies((prev) => [...prev, newReply]);
        // TODO: When migrating to backend, add API call here:
        // await axiosInstance.post('/quick-replies', newReply);
        return newReply;
    }, []);

    const updateQuickReply = useCallback((id, shortcut, message) => {
        setQuickReplies((prev) =>
            prev.map((reply) =>
                reply.id === id
                    ? {
                          ...reply,
                          shortcut: shortcut.toLowerCase().trim(),
                          message: message.trim(),
                      }
                    : reply
            )
        );
        // TODO: When migrating to backend, add API call here:
        // await axiosInstance.put(`/quick-replies/${id}`, { shortcut, message });
    }, []);

    const deleteQuickReply = useCallback((id) => {
        setQuickReplies((prev) => prev.filter((reply) => reply.id !== id));
        // TODO: When migrating to backend, add API call here:
        // await axiosInstance.delete(`/quick-replies/${id}`);
    }, []);

    const getMatchingReplies = useCallback(
        (query) => {
            if (!query) return [];
            const lowerQuery = query.toLowerCase();
            return quickReplies
                .filter((reply) =>
                    reply.shortcut.toLowerCase().startsWith(lowerQuery)
                )
                .slice(0, 5);
        },
        [quickReplies]
    );

    const value = {
        quickReplies,
        addQuickReply,
        updateQuickReply,
        deleteQuickReply,
        getMatchingReplies,
    };

    return (
        <QuickRepliesContext.Provider value={value}>
            {children}
        </QuickRepliesContext.Provider>
    );
};
