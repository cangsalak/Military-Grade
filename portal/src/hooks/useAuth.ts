import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem("mil_token");
        const savedUser = localStorage.getItem("mil_user");
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const res = await api.post("/api/v1/auth/login", { username, password });
            const { token, user } = res.data;
            setToken(token);
            setUser(user);
            localStorage.setItem("mil_token", token);
            localStorage.setItem("mil_user", JSON.stringify(user));
            return true;
        } catch (err) {
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("mil_token");
        localStorage.removeItem("mil_user");
    };

    return { user, token, login, logout, isAuthenticated: !!token, loading };
}
