"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Building2, UserCircle2, Cpu, ArrowRight, CheckCircle2, Download, AlertTriangle, Key } from "lucide-react";
import api from "@/lib/axios";

interface SetupWizardProps {
    onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [orgData, setOrgData] = useState({ name: "", description: "" });
    const [adminData, setAdminData] = useState({ username: "root", email: "", password: "", name: "System Commander" });
    const [nodeRole, setNodeRole] = useState<"primary" | "secondary" | null>(null);
    const [secondaryConfig, setSecondaryConfig] = useState<string | null>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get("/api/v1/setup/status");
            setStatus(res.data);
            if (res.data.initialized) {
                // Already initialized, but maybe we are here for node role configuration
                // For now, let's just proceed to step 4 if already initialized
                setStep(4);
            }
        } catch (err) {
            console.error("Failed to check status", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenesis = async () => {
        setLoading(true);
        try {
            await api.post("/api/v1/setup/initialize", {
                org_name: orgData.name,
                org_description: orgData.description,
                admin_username: adminData.username,
                admin_email: adminData.email,
                admin_password: adminData.password,
            });
            setStep(4);
        } catch (err: any) {
            alert(err.response?.data?.error || "Initialization failed. Matrix collapse imminent.");
        } finally {
            setLoading(false);
        }
    };

    const handleNodeConfig = async (role: "primary" | "secondary") => {
        setNodeRole(role);
        if (role === "secondary") {
            // In a real scenario, this would generate a join token or a config
            // For this UI, let's generate a placeholder secondary config
            const mockConfig = `[Interface]
PrivateKey = <GENERATED_PRIVATE_KEY>
Address = 10.0.0.x/32

[Peer]
PublicKey = <PRIMARY_NODE_PUBLIC_KEY>
Endpoint = <PRIMARY_IP>:51820
AllowedIPs = 0.0.0.0/0`;
            setSecondaryConfig(mockConfig);
        } else {
            onComplete();
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-8">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`p-6 rounded-[2.5rem] ${status?.wireguard_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} border-2 border-current/20 status-glow`}>
                                <Cpu size={48} />
                            </div>
                            <h2 className="text-3xl font-black title-military italic">CORE_ENGINE_CHECK</h2>
                            <p className="text-muted-foreground text-sm max-w-md">ตรวจสอบสภาพแวดล้อม Linux บน Ubuntu VPS ของคุณ</p>
                        </div>

                        {!status?.wireguard_active && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-2">
                                    <AlertTriangle size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Action Required: Server Preparation</span>
                                </div>
                                <div className="bg-black/40 border border-amber-500/30 p-6 rounded-[2rem] font-mono text-[10px] relative group">
                                    <div className="text-amber-500/50 mb-4 italic"># รันคำสั่งนี้บน Ubuntu VPS เพื่อติดตั้ง Engine</div>
                                    <pre className="text-amber-200/80 whitespace-pre-wrap leading-relaxed select-all">
                                        {`sudo apt update && sudo apt install -y wireguard nftables
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p`}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="bg-muted/30 p-6 rounded-3xl border border-border space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">WireGuard Interface</span>
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${status?.wireguard_active ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                    {status?.wireguard_active ? 'ACTIVE' : 'NOT_FOUND'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">System Version</span>
                                <span className="text-[10px] font-mono opacity-80">{status?.version || 'UNKNOWN'}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-primary text-primary-foreground py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Confirm & Proceed <ArrowRight size={18} />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-8">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="p-6 rounded-[2.5rem] bg-indigo-500/10 text-indigo-500 border-2 border-indigo-500/20 shadow-xl">
                                <ShieldCheck size={48} />
                            </div>
                            <h2 className="text-3xl font-black title-military italic">MISSION_GENESIS</h2>
                            <p className="text-muted-foreground text-sm">ระบุข้อมูลองค์กรและบัญชีผู้บัญชาการสูงสุดเพื่อเริ่มต้นระบบ</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Organization Tactical Name</label>
                                    <input
                                        className="input-military"
                                        placeholder="ARMOR_HQ"
                                        value={orgData.name}
                                        onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Identity (Root User)</label>
                                    <input
                                        className="input-military"
                                        placeholder="admin"
                                        value={adminData.username}
                                        onChange={(e) => setAdminData({ ...adminData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Deployment Range (Email)</label>
                                    <input
                                        className="input-military"
                                        type="email"
                                        placeholder="commander@armor.local"
                                        value={adminData.email}
                                        onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Access Key (Secure Pass)</label>
                                    <input
                                        className="input-military"
                                        type="password"
                                        value={adminData.password}
                                        onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={!orgData.name || !adminData.password || !adminData.email || loading}
                            onClick={handleGenesis}
                            className="w-full bg-primary text-primary-foreground py-6 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? "INITIALIZING_GENESIS..." : "ESTABLISH STRATEGIC MATRIX"}
                        </button>
                    </div>
                );
            case 3:
                return null; // Merged into Step 2
            case 4:
                return (
                    <div className="space-y-8">
                        {!nodeRole ? (
                            <>
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-6 rounded-[2.5rem] bg-amber-500/10 text-amber-500 border-2 border-amber-500/20 shadow-xl">
                                        <Key size={48} />
                                    </div>
                                    <h2 className="text-3xl font-black title-military italic">NODE_DEPLOYMENT_ROLE</h2>
                                    <p className="text-muted-foreground text-sm">กำหนดบทบาทของเซิร์ฟเวอร์เครื่องนี้ในโครงข่าย</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={() => handleNodeConfig("primary")}
                                        className="group p-8 rounded-3xl border-2 border-border hover:border-primary/50 bg-muted/20 text-left transition-all"
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <span className="font-black text-lg italic tracking-tight italic">MAIN_COMMAND_UNIT (Primary)</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground opacity-80 leading-relaxed">
                                            เครื่องนี้จะเป็น **เครื่องหลัก** ที่ทำหน้าที่จัดเส้นทาง, เก็บสถิติ และเป็นศูนย์กลางของ VPN Matrix ทั้งหมด
                                        </p>
                                    </button>

                                    <button
                                        onClick={() => handleNodeConfig("secondary")}
                                        className="group p-8 rounded-3xl border-2 border-border hover:border-amber-500/50 bg-muted/20 text-left transition-all"
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                                <Cpu size={24} />
                                            </div>
                                            <span className="font-black text-lg italic tracking-tight italic">SATELLITE_EDGE_UNIT (Secondary)</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground opacity-80 leading-relaxed">
                                            เครื่องนี้จะเป็น **เครื่องรอง (Edge Node)** จะทำหน้าที่รับการเชื่อมต่อและส่งสัญญาณกลับไปที่เป้าหมายหลัก
                                        </p>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-8 text-center">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 mx-auto text-emerald-500 mb-6">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-3xl font-black title-military italic">DEPLOYMENT_READY</h2>
                                <p className="text-muted-foreground text-sm mb-4">ก๊อปปี้คำสั่งด้านล่างไปรันบน Ubuntu VPS เครื่องรอง เพื่อติดตั้ง Agent และจอยเข้ากับเครื่องหลักโดยอัตโนมัติ</p>

                                <div className="bg-black/40 border border-emerald-500/30 p-8 rounded-[2rem] font-mono text-[10px] text-left relative group">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-emerald-500/50 italic"># Tactical Agent Join Command</span>
                                        <span className="text-[8px] bg-emerald-500/20 text-emerald-500 px-2 rounded">AUTO_SYNC</span>
                                    </div>
                                    <pre className="text-emerald-200/80 whitespace-pre-wrap leading-relaxed select-all">
                                        {`curl -sSL https://get.armor-x1.net/agent.sh | bash -s -- \\
  --master-ip=${typeof window !== 'undefined' ? window.location.hostname : 'SERVER_IP'} \\
  --token=${Math.random().toString(36).substring(2, 15).toUpperCase()} \\
  --role=edge`}
                                    </pre>
                                </div>

                                <div className="grid grid-cols-1 gap-4 mt-8">
                                    <button
                                        onClick={onComplete}
                                        className="bg-primary text-primary-foreground py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                    >
                                        Finish & Open Dashboard
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    if (loading) return null;

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="card-premium w-full max-w-xl p-10 md:p-16 relative overflow-hidden shadow-2xl border-2 border-primary/20"
            >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck size={200} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-primary' : 'w-2 bg-muted'}`}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Phase_0{step}</span>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step + (nodeRole || "")}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderStep()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="mt-12 flex items-center justify-between opacity-20 border-t border-border pt-8 text-[8px] font-mono font-bold uppercase tracking-[0.5em]">
                    <span>ARMOR_X1_INSTALLER // UID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    <span>Status: {status?.wireguard_active ? 'ENGINE_ONLINE' : 'ENGINE_OFFLINE'}</span>
                </div>
            </motion.div>
        </div>
    );
}
