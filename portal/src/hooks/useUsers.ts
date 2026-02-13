import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const API_BASE = "/api/v1/users";

export interface User {
    id: number;
    organization_id: number;
    username: string;
    email: string;
    name: string;
    pin: string;
    role: 'root' | 'admin' | 'staff' | 'user';
    status: 'active' | 'revoked';
    rx_bytes?: number;
    tx_bytes?: number;
    last_handshake?: string;
}

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await api.get(API_BASE);
            setUsers(res.data || []);
            setError(null);
        } catch (err: any) {
            setError("Failed to fetch user directory");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const createUser = async (data: any) => {
        try {
            await api.post(API_BASE, data);
            fetchUsers();
        } catch (err) {
            throw new Error("Failed to deploy new identity vector");
        }
    };

    const updateUser = async (id: number, data: any) => {
        try {
            await api.patch(`${API_BASE}/${id}`, data);
            fetchUsers();
        } catch (err) {
            throw new Error("Failed to recalibrate identity");
        }
    };

    const deleteUser = async (id: number) => {
        if (!confirm("🚨 CRITICAL ALERT: Permanently purge this identity from the mission matrix?")) return;
        try {
            await api.delete(`${API_BASE}/${id}`);
            fetchUsers();
        } catch (err) {
            throw new Error("Failed to purge identity");
        }
    };

    return {
        users,
        loading,
        error,
        refresh: fetchUsers,
        createUser,
        updateUser,
        deleteUser
    };
}
