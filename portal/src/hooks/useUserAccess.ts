import { useState, useEffect, useCallback } from "react";
import api from "@/lib/axios";

interface UserPeer {
    id: number;
    public_key: string;
    assigned_ip: string;
    status: string;
    is_provisioned: boolean;
    rx_bytes: number;
    tx_bytes: number;
    last_handshake: string;
}

interface ProvisionResponse {
    config: string;
    qr: string; // Base64 PNG
}

export function useUserAccess() {
    const [myPeers, setMyPeers] = useState<UserPeer[]>([]);
    const [loading, setLoading] = useState(true);
    const [provisionData, setProvisionData] = useState<ProvisionResponse | null>(null);

    const fetchStatus = useCallback(async () => {
        try {
            const res = await api.get("/api/v1/user/status");
            setMyPeers(res.data || []);
        } catch (err) {
            console.error("Failed to fetch user status");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("mil_token");
        if (!token) return;

        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Update every 10s
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const provision = async () => {
        setLoading(true);
        try {
            const res = await api.post("/api/v1/user/provision");
            setProvisionData(res.data);
            fetchStatus();
        } catch (err) {
            throw new Error("Provisioning failed");
        } finally {
            setLoading(false);
        }
    };

    const regenerate = async () => {
        if (!confirm("🚨 รีเซ็ตการเชื่อมต่อ: คุณกำลังจะลบกุญแจเดิมและสร้างใหม่ อุปกรณ์เดิมจะถูกตัดการเชื่อมต่อทันที ยืนยันหรือไม่?")) return;
        setLoading(true);
        try {
            const res = await api.post("/api/v1/user/regenerate");
            setProvisionData(res.data);
            fetchStatus();
        } catch (err) {
            throw new Error("Regeneration failed");
        } finally {
            setLoading(false);
        }
    };

    const forgetDevice = async (id: number) => {
        if (!confirm("⚠️ ลบอุปกรณ์: คุณต้องการยกเลิกการเข้าถึงของอุปกรณ์นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
        setLoading(true);
        try {
            await api.delete(`/api/v1/user/devices/${id}`);
            fetchStatus();
        } catch (err) {
            throw new Error("Failed to forget device");
        } finally {
            setLoading(false);
        }
    };

    return {
        myPeers,
        loading,
        provisionData,
        clearProvisionData: () => setProvisionData(null),
        provision,
        regenerate,
        forgetDevice,
        refresh: fetchStatus
    };
}
