import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";
import { FirewallRule } from "@/lib/types/network";

const API_BASE = "/api/v1/firewall";

export function useFirewall() {
    const [rules, setRules] = useState<FirewallRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRules = useCallback(async () => {
        try {
            const res = await api.get(`${API_BASE}/rules`);
            setRules(res.data || []);
            setError(null);
        } catch (err) {
            setError("Security Policy Desync");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("mil_token");
        if (!token) return;
        fetchRules();
    }, [fetchRules]);

    const addRule = async (rule: Omit<FirewallRule, 'id' | 'created_at'>) => {
        try {
            await api.post(`${API_BASE}/rules`, rule);
            fetchRules();
        } catch (err) {
            throw new Error("Failed to provision rule");
        }
    };

    const deleteRule = async (id: number) => {
        try {
            await api.delete(`${API_BASE}/rules/${id}`);
            fetchRules();
        } catch (err) {
            throw new Error("Failed to deprecate rule");
        }
    };

    return {
        rules,
        loading,
        error,
        refresh: fetchRules,
        addRule,
        deleteRule
    };
}
