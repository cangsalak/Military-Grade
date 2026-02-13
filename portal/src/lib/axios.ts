import axios from "axios";

const isDev = process.env.NODE_ENV === "development";

const api = axios.create({
    // In development, we use relative paths and proxy through next.config.ts
    // In production, we can specify the actual production API endpoint
    baseURL: isDev ? "" : process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add the security token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("mil_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for identity teardown on unauthorized access
api.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        // Clear local identity on unauthorized
        localStorage.removeItem("mil_token");
        localStorage.removeItem("mil_user");
        console.warn("Security session expired. Re-authentication required.");
    }
    return Promise.reject(error);
});

export default api;
