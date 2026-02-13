"use client";

import React, { useState } from "react";
import {
    Server,
    Activity,
    Shield,
    Plus,
    RefreshCw,
    RefreshCcw,
    Settings,
    Trash2,
    Globe,
    Network,
    Power,
    Terminal,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EdgeNode } from "@/hooks/useGateways";
import { translations } from "@/lib/translations";
import { getTimeAgo } from "@/lib/utils";
import { LogTerminal } from "./LogTerminal";

const t = translations.th;

interface GatewayMatrixProps {
    nodes: EdgeNode[];
    loading: boolean;
    onRefresh: () => void;
    onCreate: (data: any) => Promise<void>;
    onUpdate: (id: number, data: any) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onSync: (id: number) => Promise<void>;
}

export function GatewayMatrix({ nodes, loading, onRefresh, onCreate, onUpdate, onDelete, onSync }: GatewayMatrixProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedNodeForLogs, setSelectedNodeForLogs] = useState<EdgeNode | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        public_ip: "",
        listen_port: 51820,
        tunnel_subnet: "",
        interface_name: "wg0"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onCreate(formData);
            setShowAddModal(false);
            setFormData({
                name: "",
                public_ip: "",
                listen_port: 51820,
                tunnel_subnet: "",
                interface_name: "wg0"
            });
        } catch (err) {
            alert("Deployment failed");
        }
    };

    return (
        <div className="space-y-8 font-thai">
            {/* Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-foreground italic tracking-tighter uppercase title-military">
                        Gateway Command Matrix
                    </h2>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-1 opacity-60">
                        Distributed Encryption Nodes // Operational Control
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onRefresh}
                        className="p-3 bg-secondary hover:bg-accent border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all active:rotate-180 duration-500"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} /> Deploy New Gateway
                    </motion.button>
                </div>
            </div>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {nodes.map((node) => (
                    <motion.div
                        key={node.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-premium p-6 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-mesh opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 ${node.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                                        <Server size={24} className={node.status === 'online' ? 'animate-pulse-soft' : ''} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-foreground uppercase tracking-tight italic title-military">{node.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${node.status === 'online' ? (node.desired_hash && node.last_sync_hash !== node.desired_hash ? 'bg-amber-500 animate-bounce' : 'bg-emerald-500 animate-pulse') : 'bg-destructive'}`} />
                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${node.status === 'online' ? (node.desired_hash && node.last_sync_hash !== node.desired_hash ? 'text-amber-500' : 'text-emerald-500') : 'text-destructive'}`}>
                                                {node.status === 'online' ? (node.desired_hash && node.last_sync_hash !== node.desired_hash ? 'DRIFT_DETECTED // SELF_HEALING' : `SYSTEM_${node.status.toUpperCase()}`) : `SYSTEM_${node.status.toUpperCase()}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => onSync(node.id)}
                                        className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all border border-primary/10 shadow-lg shadow-primary/5"
                                        title="Sync Mission Pulse"
                                    >
                                        <RefreshCcw size={16} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedNodeForLogs(node)}
                                        className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-all border border-emerald-500/10"
                                        title="Live Ops Terminal"
                                    >
                                        <Terminal size={16} />
                                    </button>
                                    <button
                                        onClick={() => onUpdate(node.id, { is_active: !node.is_active })}
                                        className={`p-2 rounded-xl transition-all ${node.is_active ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground bg-muted'}`}
                                    >
                                        <Power size={14} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(node.id)}
                                        className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                <div className="bg-muted/40 p-3 rounded-xl border border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe size={12} className="text-primary" />
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Public Endpoint</span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-foreground">{node.public_ip}:{node.listen_port}</span>
                                </div>
                                <div className="bg-muted/40 p-3 rounded-xl border border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Network size={12} className="text-amber-500" />
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tunnel Subnet</span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-foreground">{node.tunnel_subnet}</span>
                                </div>
                                <div className="bg-muted/40 p-3 rounded-xl border border-border/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Settings size={12} className="text-slate-400" />
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Interface</span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-foreground">{node.interface_name}</span>
                                </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-border/30 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">{t.nodeMatrix.handshake}</span>
                                    <span className="text-xs font-black text-foreground italic">{node.last_seen ? getTimeAgo(node.last_seen) : t.nodeMatrix.never}</span>
                                </div>
                                <div className="flex -space-x-2">
                                    <div className="px-3 py-1 bg-primary/10 rounded-full text-[8px] font-black text-primary uppercase tracking-widest border border-primary/10">
                                        GATEWAY_NODE
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Corner Accents */}
                        <div className="absolute top-0 right-0 w-8 h-8 opacity-5 group-hover:opacity-20 transition-opacity">
                            <Activity size={32} className="text-primary" />
                        </div>
                    </motion.div>
                ))}

                {nodes.length === 0 && !loading && (
                    <div className="col-span-full py-20 bg-muted/20 border-2 border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center opacity-40">
                        <Shield size={48} className="text-muted-foreground mb-4" />
                        <h3 className="text-sm font-black uppercase tracking-widest">No Gateway Infrastructure Detected</h3>
                        <p className="text-[10px] font-bold mt-2">Initialize enrollment via deploy protocol</p>
                    </div>
                )}
            </div>

            {/* Add Node Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-card border border-border w-full max-w-xl rounded-[3rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-mesh opacity-10" />
                            <div className="p-10 relative z-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black italic tracking-tighter uppercase title-military">Deploy New Gateway</h3>
                                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Infrastructure Expansion Protocol</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="p-3 hover:bg-muted rounded-2xl transition-all"
                                    >
                                        <XCircle size={20} className="text-muted-foreground" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Node Identifier</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. ALPHA-GW-01"
                                                className="w-full bg-muted border border-border rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Interface Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="wg0"
                                                className="w-full bg-muted border border-border rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={formData.interface_name}
                                                onChange={e => setFormData({ ...formData, interface_name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Public Endpoint IP</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="203.0.x.x"
                                                className="w-full bg-muted border border-border rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={formData.public_ip}
                                                onChange={e => setFormData({ ...formData, public_ip: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Listen Port</label>
                                            <input
                                                required
                                                type="number"
                                                className="w-full bg-muted border border-border rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                value={formData.listen_port}
                                                onChange={e => setFormData({ ...formData, listen_port: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest ml-1">Tunnel Subnet Matrix (CIDR)</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="10.8.x.x/24"
                                            className="w-full bg-muted border border-border rounded-2xl p-4 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={formData.tunnel_subnet}
                                            onChange={e => setFormData({ ...formData, tunnel_subnet: e.target.value })}
                                        />
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            className="w-full bg-primary text-primary-foreground py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                        >
                                            <CheckCircle2 size={20} /> Initialize Deployment Protocol
                                        </button>
                                        <p className="text-center text-[8px] font-black text-muted-foreground/40 mt-6 uppercase tracking-[0.3em] font-mono">
                                            Warning: Atomic configuration will be pushed to target node
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Log Terminal Overlay */}
            <AnimatePresence>
                {selectedNodeForLogs && (
                    <LogTerminal
                        nodeId={selectedNodeForLogs.id}
                        nodeName={selectedNodeForLogs.name}
                        onClose={() => setSelectedNodeForLogs(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
