"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Download, QrCode, RefreshCcw, Activity, Wifi, ShieldAlert, X, Smartphone, Monitor, ChevronRight, Clock } from "lucide-react";
import { useUserAccess } from "@/hooks/useUserAccess";
import { formatBytes, getTimeAgo } from "@/lib/utils";

export function UserAccessPanel() {
    const { myPeers, loading, provisionData, clearProvisionData, provision, regenerate, forgetDevice } = useUserAccess();

    const downloadConfig = () => {
        if (!provisionData) return;
        const blob = new Blob([provisionData.config], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const activePeer = myPeers.find(p => p.status === 'active');
        a.download = `wg_secure_${activePeer?.assigned_ip || 'new'}.conf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8 font-thai">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary title-military mb-1">
                        Deployment Matrix: Personal Nodes
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className="text-xl font-black text-foreground tracking-tight">Active Identity Matrix</span>
                        <div className="px-3 py-1 bg-muted border border-border rounded-lg text-[10px] font-mono font-bold text-muted-foreground">
                            NODE_CAPACITY: {myPeers.length}/05
                        </div>
                    </div>
                </div>
                {myPeers.length < 5 && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={provision}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs transition-all shadow-xl shadow-primary/20 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-mesh opacity-20" />
                        <RefreshCcw size={16} className={`relative z-10 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                        <span className="relative z-10 tracking-[0.1em]">ENROLL NEW TERMINAL</span>
                    </motion.button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {myPeers.map((peer) => (
                        <motion.div
                            key={peer.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card-premium p-7 relative group overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-500"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all pointer-events-none group-hover:scale-110">
                                <Wifi size={100} className="text-primary" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center text-primary shadow-inner relative group-hover:rotate-[360deg] transition-transform duration-700">
                                            <div className="absolute inset-0 bg-mesh opacity-10" />
                                            <div className="relative z-10">
                                                {peer.assigned_ip.startsWith('10.') ? <Monitor size={32} /> : <Smartphone size={32} />}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-foreground tracking-tighter text-tactical">{peer.assigned_ip}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className={`w-2 h-2 rounded-full ${peer.status === 'active' ? 'bg-emerald-500 status-glow-emerald' : 'bg-destructive'}`} />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] font-mono">{peer.status.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 10 }}
                                        onClick={() => forgetDevice(peer.id)}
                                        className="p-3 bg-destructive/5 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all border border-transparent hover:border-destructive/20"
                                    >
                                        <ShieldAlert size={20} />
                                    </motion.button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-muted/50 border border-border rounded-2xl p-4 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock size={10} className="text-primary" />
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-tactical">Last Handshake</span>
                                        </div>
                                        <div className="text-xs font-black text-foreground font-mono">{getTimeAgo(peer.last_handshake)}</div>
                                    </div>
                                    <div className="bg-muted/50 border border-border rounded-2xl p-4 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Activity size={10} className="text-amber-500" />
                                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-tactical">Telemetry Flux</span>
                                        </div>
                                        <div className="text-xs font-black text-foreground font-mono">{formatBytes(peer.rx_bytes + peer.tx_bytes)}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={regenerate}
                                    className="w-full py-4 bg-secondary hover:bg-accent border border-border rounded-2xl text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-[0.25em] transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform" />
                                    ROTATE_CRYPT_VECTORS
                                </button>
                            </div>

                            {/* Tactical HUD Markers */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary/20" />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {myPeers.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-32 card-premium border-dashed border-2 border-primary/20 flex flex-col items-center justify-center text-center relative overflow-hidden"
                    >
                        <div className="absolute inset-0 hud-grid opacity-[0.03]" />
                        <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mb-8 relative">
                            <ShieldAlert size={50} className="text-primary animate-pulse" />
                        </div>
                        <h4 className="text-3xl font-black text-foreground mb-4 title-military italic uppercase tracking-tighter">Zero-Trust Protocol Void</h4>
                        <p className="text-muted-foreground text-sm mb-12 max-w-lg px-6 leading-relaxed">
                            Your secure identity matrix is currently empty. No cryptographic tunnels detected. <br />
                            <span className="text-primary font-bold">Initialize the enrollment protocol to establish network presence.</span>
                        </p>
                        <button
                            onClick={provision}
                            className="px-12 py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-xs transition-all shadow-2xl shadow-primary/40 active:scale-95 uppercase tracking-[0.3em] flex items-center gap-3"
                        >
                            <RefreshCcw size={18} /> INITIALIZE ENROLLMENT
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Protocol Overlay Info */}
            <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] flex items-start gap-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-mesh opacity-[0.02]" />
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">
                    <ShieldAlert size={28} />
                </div>
                <div>
                    <div className="text-[11px] font-black text-primary uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                        <Activity size={12} /> OP_SECURITY_DIRECTIVE: DEV_MGMT
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed font-medium">
                        To maintain cryptographic integrity, please revoke any compromised terminals immediately. <br className="hidden md:block" />
                        Use the <span className="text-destructive font-black underline mx-1">FORGET_DEVICE (Shield icon)</span> protocol for terminal decommission.
                    </p>
                </div>
                <div className="ml-auto hidden md:block">
                    <ChevronRight size={24} className="text-primary/20" />
                </div>
            </div>

            {/* Elite Provisioning Portal Modal */}
            <AnimatePresence>
                {provisionData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-background/90 backdrop-blur-3xl"
                            onClick={clearProvisionData}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            className="card-premium p-10 lg:p-16 max-w-4xl w-full relative z-10 overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)]"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <QrCode size={200} className="text-primary" />
                            </div>

                            <button onClick={clearProvisionData} className="absolute top-8 right-8 p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all">
                                <X size={24} />
                            </button>

                            <div className="flex flex-col lg:flex-row gap-12 items-start">
                                <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                            <ShieldCheck className="text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" size={40} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-foreground tracking-tighter title-military italic uppercase leading-tight">
                                                Identity <br /> Provisioned
                                            </h2>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-mono">SECURE_SYNC_COMPLETE</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-muted border border-border p-6 rounded-3xl relative">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">WireGuard Strategic Matrix</label>
                                            <div className="font-mono text-[11px] text-foreground leading-relaxed max-h-48 overflow-y-auto custom-scrollbar bg-black/5 p-4 rounded-xl border border-border/50">
                                                <pre className="whitespace-pre-wrap">{provisionData.config}</pre>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <button
                                                onClick={downloadConfig}
                                                className="w-full py-5 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 active:scale-95 uppercase tracking-[0.2em]"
                                            >
                                                <Download size={20} /> MISSION_DOWNLOAD (.CONF)
                                            </button>
                                            <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-widest opacity-40">
                                                Single-view portal // Destroy on exit
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden lg:flex flex-col items-center gap-8 w-80 bg-muted/40 p-10 rounded-[3rem] border border-border relative">
                                    <div className="absolute inset-0 hud-grid opacity-[0.03]" />
                                    <div className="relative">
                                        <div className="absolute inset-0 blur-2xl bg-emerald-500/10" />
                                        <div className="relative bg-white p-6 rounded-[2.5rem] shadow-2xl ring-1 ring-border group hover:scale-105 transition-transform duration-500">
                                            <img
                                                src={`data:image/png;base64,${provisionData.qr}`}
                                                alt="WireGuard QR Code"
                                                className="w-48 h-48 block"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <span className="text-[11px] font-black text-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                                            <Smartphone size={14} className="text-primary" /> MOBILE_SYNC_VECTOR
                                        </span>
                                        <p className="text-[9px] text-muted-foreground mt-3 leading-relaxed uppercase tracking-tighter opacity-70">
                                            Scan via military-spec WireGuard <br /> app on authorized hardware
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
