import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { Peer, AuditLog } from "@/lib/types/network";
import { translations } from "@/lib/translations";

const API_BASE = "/api/v1";
const t = translations.th;

export function useNetworkDiscovery() {
    const [peers, setPeers] = useState<Peer[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [peerRes, logRes] = await Promise.all([
                api.get(`${API_BASE}/peers`),
                api.get(`${API_BASE}/audit-logs`)
            ]);
            setPeers(peerRes.data || []);
            setAuditLogs(logRes.data || []);
            setError(null);
        } catch (err: any) {
            setError(t.common.error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("mil_token");
        if (!token) return;

        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleRevoke = async (id: number) => {
        if (!confirm(t.common.revocationWarning)) return;
        try {
            await api.post(`${API_BASE}/peers/${id}/revoke`);
            fetchData();
        } catch (err) {
            throw new Error("Revocation failed");
        }
    };

    const createPeer = async (username: string) => {
        try {
            const res = await api.post(`${API_BASE}/peers`, { username });
            fetchData();
            return res.data;
        } catch (err) {
            throw new Error("Provisioning failed");
        }
    };

    const handleRotate = async (id: number) => {
        try {
            const res = await api.post(`${API_BASE}/peers/${id}/rotate`);
            fetchData();
            return res.data;
        } catch (err) {
            throw new Error("Rotation failed");
        }
    };

    const rotateAll = async () => {
        try {
            await api.post(`${API_BASE}/peers/rotate-all`);
            fetchData();
        } catch (err) {
            throw new Error("Mass rotation failed");
        }
    };

    const handleUpdate = async (id: number, data: { username?: string; status?: string }) => {
        try {
            await api.put(`${API_BASE}/peers/${id}`, data);
            fetchData();
        } catch (err) {
            throw new Error("Update failed");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("⚠️ CRITICAL WARNING: This will PERMANENTLY delete this peer and release its IP. This action CANNOT be undone. Continue?")) return;
        try {
            await api.delete(`${API_BASE}/peers/${id}`);
            fetchData();
        } catch (err) {
            throw new Error("Deletion failed");
        }
    };

    return {
        peers,
        auditLogs,
        loading,
        error,
        refresh: fetchData,
        handleRevoke,
        handleRotate,
        handleUpdate,
        handleDelete,
        rotateAll,
        createPeer
    };
}
