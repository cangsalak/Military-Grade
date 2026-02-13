import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const API_BASE = "/api/v1/nodes";

export interface EdgeNode {
    id: number;
    name: string;
    public_ip: string;
    listen_port: number;
    tunnel_subnet: string;
    interface_name: string;
    status: 'online' | 'offline' | 'syncing';
    is_active: boolean;
    lat: number;
    lng: number;
    last_seen: string | null;
    last_sync_hash?: string;
    desired_hash?: string;
}

export function useGateways() {
    const [nodes, setNodes] = useState<EdgeNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNodes = useCallback(async () => {
        try {
            const res = await api.get(API_BASE);
            setNodes(res.data || []);
            setError(null);
        } catch (err: any) {
            setError("Failed to fetch gateway matrix");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNodes();
        const interval = setInterval(fetchNodes, 15000);
        return () => clearInterval(interval);
    }, [fetchNodes]);

    const createNode = async (data: Omit<EdgeNode, 'id' | 'status' | 'last_seen'>) => {
        try {
            await api.post(API_BASE, data);
            fetchNodes();
        } catch (err) {
            throw new Error("Failed to deploy new gateway");
        }
    };

    const updateNode = async (id: number, data: Partial<EdgeNode>) => {
        try {
            await api.patch(`${API_BASE}/${id}`, data);
            fetchNodes();
        } catch (err) {
            throw new Error("Failed to update gateway parameters");
        }
    };

    const deleteNode = async (id: number) => {
        if (!confirm("🚨 CRITICAL ALERT: Decommissioning this gateway will terminate all active tunnels on this node. Continue?")) return;
        try {
            await api.delete(`${API_BASE}/${id}`);
            fetchNodes();
        } catch (err) {
            throw new Error("Failed to decommission gateway");
        }
    };

    const syncNode = async (id: number) => {
        try {
            await api.post(`${API_BASE}/${id}/sync`);
            alert("Node Synchronized Successfully");
            fetchNodes();
        } catch (err) {
            alert("Node Sync Failed: Check Agent Connection");
            throw new Error("Synchronization failed");
        }
    };

    return {
        nodes,
        loading,
        error,
        refresh: fetchNodes,
        createNode,
        updateNode,
        deleteNode,
        syncNode
    };
}
