"use client";

import React, { useState } from "react";
import { Search, RefreshCw, Server, Activity, ArrowRight, Shield, ShieldCheck, Clock, Download, MoreVertical, RotateCw, Edit3, Trash2, Lock } from "lucide-react";
import { formatBytes, getTimeAgo } from "@/lib/utils";
import { translations } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";

const t = translations.th;

interface NodeMatrixProps {
    peers: any[];
    loading: boolean;
    onRefresh: () => void;
    onRevoke: (id: number) => void;
    onRotate: (id: number) => void;
    onUpdate: (id: number, data: { username?: string; status?: string }) => void;
    onDelete: (id: number) => void;
    onMigrate?: (peerIds: number[], targetNodeId: number) => void;
    availableNodes?: any[];
}

export function NodeMatrix({ peers, loading, onRefresh, onRevoke, onRotate, onUpdate, onDelete, onMigrate, availableNodes }: NodeMatrixProps) {
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editUsername, setEditUsername] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [targetNodeId, setTargetNodeId] = useState<number | string>("");

    const filteredPeers = peers.filter(p =>
        (p.username || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.assigned_ip || "").includes(search) ||
        (p.public_key || "").toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        setSelectedIds(prev => prev.length === filteredPeers.length ? [] : filteredPeers.map(p => p.id));
    };

    const handleMigrate = () => {
        if (onMigrate && targetNodeId) {
            onMigrate(selectedIds, Number(targetNodeId));
            setSelectedIds([]);
            setTargetNodeId("");
        }
    };

    return (
        <div className="card-premium overflow-hidden min-h-[500px] font-thai relative">
            <div className="absolute inset-0 hud-grid opacity-[0.02] pointer-events-none" />

            <div className="px-8 py-7 border-b border-border flex flex-col md:flex-row md:items-center justify-between bg-card/40 backdrop-blur-md gap-4 relative z-10">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary title-military italic">
                        {t.nodeMatrix.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-foreground font-black uppercase tracking-tight">Deployment Matrix v1.02</span>
                        <div className="px-2 py-0.5 bg-emerald-500/10 rounded-full text-[8px] font-black text-emerald-500 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                            {filteredPeers.length} NODES_ONLINE
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-3 bg-primary/10 border border-primary/20 px-4 py-2 rounded-2xl"
                            >
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedIds.length} SELECTED</span>
                                <div className="h-4 w-[1px] bg-primary/20" />
                                <select
                                    value={targetNodeId}
                                    onChange={(e) => setTargetNodeId(e.target.value)}
                                    className="bg-transparent text-[10px] font-black uppercase text-primary focus:outline-none border-none cursor-pointer"
                                >
                                    <option value="" className="bg-card text-foreground">SELECT_BASE</option>
                                    {(availableNodes || []).map(node => (
                                        <option key={node.id} value={node.id} className="bg-card text-foreground">{node.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleMigrate}
                                    disabled={!targetNodeId}
                                    className="p-2 bg-primary text-white rounded-xl hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all disabled:opacity-50 disabled:shadow-none"
                                >
                                    <ArrowRight size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative group">
                        <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Query identity vector..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-muted/50 border border-border rounded-2xl py-3 pl-12 pr-6 text-xs w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-foreground placeholder-muted-foreground/40"
                        />
                    </div>
                    <button
                        onClick={onRefresh}
                        className="p-3 bg-secondary hover:bg-accent border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all active:rotate-180 duration-500 group"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:scale-110"} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === filteredPeers.length && filteredPeers.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 bg-muted border-border rounded-lg accent-primary cursor-pointer"
                                />
                            </th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Network Node</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Encryption Vectors</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Security Matrix</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Strategic Telemetry</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        <AnimatePresence mode="popLayout">
                            {filteredPeers.map((peer) => (
                                <motion.tr
                                    key={peer.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group hover:bg-primary/[0.03] transition-colors"
                                >
                                    <td className="px-8 py-7">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(peer.id)}
                                            onChange={() => toggleSelect(peer.id)}
                                            className="w-4 h-4 bg-muted border-border rounded-lg accent-primary cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-5">
                                            <div className="relative group-hover:scale-110 transition-transform duration-500">
                                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-sm border border-primary/20 shadow-inner overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-mesh opacity-10" />
                                                    <span className="relative z-10">{peer.username ? peer.username[0].toUpperCase() : "U"}</span>
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-lg bg-emerald-500 border-2 border-background flex items-center justify-center shadow-[0_0_8px_#10b981]">
                                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                {editingId === peer.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            value={editUsername}
                                                            onChange={(e) => setEditUsername(e.target.value)}
                                                            className="bg-background border border-primary rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && (onUpdate(peer.id, { username: editUsername }), setEditingId(null))}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span
                                                        className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
                                                        onClick={() => { setEditingId(peer.id); setEditUsername(peer.username || ""); }}
                                                    >
                                                        {peer.username || "Unknown Operator"}
                                                        <Edit3 size={10} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-mono text-muted-foreground/60 tracking-tight font-bold">
                                                    COORD_{peer.user_id}_SECURED
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
                                                <span className="text-xs font-black text-foreground font-mono tracking-tighter bg-primary/5 px-2 py-0.5 rounded-lg border border-primary/10">{peer.assigned_ip}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Lock size={10} className="text-muted-foreground/40" />
                                                <span className="text-[9px] font-mono text-muted-foreground/50 truncate max-w-[160px] tracking-tight" title={peer.public_key}>
                                                    {peer.public_key}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${peer.status === 'active' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-destructive/5 border-destructive/20 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                                            <div className={`w-2 h-2 rounded-full ${peer.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-destructive shadow-[0_0_8px_#ef4444]'}`} />
                                            {peer.status.toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-8">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1.5">Last Pulse</span>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-foreground font-black bg-muted/50 px-2 py-1 rounded-lg">
                                                    <Clock size={10} className="text-primary" />
                                                    {getTimeAgo(peer.last_handshake)}
                                                </div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1.5">Load Factor</span>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-foreground font-black bg-muted/50 px-2 py-1 rounded-lg border border-border">
                                                    <Activity size={10} className="text-amber-500" />
                                                    {formatBytes(peer.rx_bytes + peer.tx_bytes)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => onRotate(peer.id)}
                                                className="p-3 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border border-amber-500/20 rounded-2xl transition-all shadow-lg shadow-amber-500/5 active:scale-90"
                                                title="Rotate Cryptographic Vector"
                                            >
                                                <RotateCw size={18} />
                                            </button>
                                            <button
                                                onClick={() => onRevoke(peer.id)}
                                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl transition-all shadow-lg shadow-red-500/5 active:scale-90"
                                                title="Execute Revocation Protocol"
                                            >
                                                <Shield size={18} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(peer.id)}
                                                className="p-3 bg-muted hover:bg-destructive hover:text-white text-muted-foreground border border-border rounded-2xl transition-all active:scale-90"
                                                title="Purge Node Integrity"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {filteredPeers.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
                    <div className="w-20 h-20 bg-muted rounded-[2.5rem] flex items-center justify-center mb-8 border border-border">
                        <Server size={48} className="text-muted-foreground" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground">Encryption Matrix Empty // No Active Identity Vectors</p>
                </div>
            )}
        </div>
    );
}
