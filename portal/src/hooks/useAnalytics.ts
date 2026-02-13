import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

const API_BASE = "/api/v1/analytics";

export interface NodeAnalytics {
    node_id: number;
    node_name: string;
    total_rx: number;
    total_tx: number;
}

export function useAnalytics() {
    const [data, setData] = useState([]);
    const [nodeData, setNodeData] = useState<NodeAnalytics[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [globalRes, nodeRes] = await Promise.all([
                api.get(API_BASE),
                api.get(`${API_BASE}/nodes`)
            ]);
            setData(globalRes.data || []);
            setNodeData(nodeRes.data || []);
            setError(null);
        } catch (err) {
            setError("Tactical analytics transmission failed");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("mil_token");
        if (!token) return;

        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return { data, nodeData, loading, error, refresh: fetchData };
}

export default useAnalytics;
