"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Peer } from "@/lib/types/network";
import { Shield, Server, Activity, Globe, Zap, Cpu, Search } from "lucide-react";

interface TopologyMapProps {
    peers: Peer[];
}

export function TopologyMap({ peers }: TopologyMapProps) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoveredNode, setHoveredNode] = useState<number | null>(null);

    useEffect(() => {
        const updateDimensions = () => {
            const container = document.getElementById("topology-container");
            if (container) {
                setDimensions({ width: container.offsetWidth, height: container.offsetHeight });
            }
        };
        updateDimensions();
        // Delay to ensure container is rendered
        const timer = setTimeout(updateDimensions, 100);
        window.addEventListener("resize", updateDimensions);
        return () => {
            window.removeEventListener("resize", updateDimensions);
            clearTimeout(timer);
        };
    }, []);

    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    return (
        <div id="topology-container" className="card-premium min-h-[700px] w-full relative overflow-hidden flex items-center justify-center cursor-crosshair">
            {/* Mission Backdrop */}
            <div className="absolute inset-0 bg-mesh opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 hud-grid opacity-[0.05] pointer-events-none" />

            {/* Dynamic Scanning Line */}
            <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-10 pointer-events-none"
            />

            {/* Central Strategic Gateway */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-20 flex flex-col items-center gap-6"
            >
                <div className="relative group">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-20px] border border-dashed border-primary/30 rounded-full"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-10px] border border-primary/10 rounded-full"
                    />

                    <div className="w-32 h-32 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/40 border-2 border-white/20 relative overflow-hidden group-hover:scale-105 transition-transform">
                        <div className="absolute inset-0 bg-mesh opacity-20" />
                        <Shield size={56} className="text-primary-foreground relative z-10" />
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0 bg-primary-foreground rounded-full blur-2xl"
                        />
                    </div>
                </div>

                <div className="text-center font-thai">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2 title-military">Central Hub Matrix</p>
                    <h4 className="text-xl font-black text-foreground tracking-tighter italic uppercase title-military group-hover:text-primary transition-colors">HQ-GATEWAY-CORE-X1</h4>
                    <div className="flex items-center justify-center gap-3 mt-3">
                        <div className="px-2 py-0.5 bg-emerald-500/10 rounded-lg text-[8px] font-black text-emerald-500 border border-emerald-500/20">OPERATIONAL</div>
                        <div className="px-2 py-0.5 bg-primary/10 rounded-lg text-[8px] font-black text-primary border border-primary/20">SECURE_MESH</div>
                    </div>
                </div>
            </motion.div>

            {/* Connection Vectors */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <defs>
                    <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                        <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {peers.map((peer, idx) => {
                    const angle = (idx / peers.length) * 2 * Math.PI;
                    const radius = Math.min(dimensions.width, dimensions.height) * 0.32;
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);

                    return (
                        <React.Fragment key={peer.id}>
                            <motion.line
                                x1={centerX} y1={centerY} x2={x} y2={y}
                                stroke={peer.status === 'active' ? "rgba(37, 99, 235, 0.15)" : "rgba(239, 68, 68, 0.1)"}
                                strokeWidth={hoveredNode === peer.id ? "2" : "1"}
                                strokeDasharray={peer.status === 'active' ? "none" : "4 4"}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, delay: idx * 0.05 }}
                            />

                            {/* Data Pulse Packets */}
                            {peer.status === 'active' && (
                                <motion.circle
                                    r="2" fill="var(--primary)"
                                    animate={{
                                        cx: [centerX, x],
                                        cy: [centerY, y],
                                        opacity: [0, 1, 0],
                                        r: [2, 4, 2]
                                    }}
                                    transition={{
                                        duration: 2 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: idx * 0.3,
                                        ease: "easeInOut"
                                    }}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </svg>

            {/* Sub-Nodes Identities */}
            {peers.map((peer, idx) => {
                const angle = (idx / peers.length) * 2 * Math.PI;
                const radius = Math.min(dimensions.width, dimensions.height) * 0.32;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);

                return (
                    <motion.div
                        key={peer.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, x: x - centerX, y: y - centerY }}
                        transition={{ type: "spring", damping: 20, delay: idx * 0.05 }}
                        onMouseEnter={() => setHoveredNode(peer.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="absolute z-30 group"
                    >
                        <div className="relative">
                            {/* Outer Orbit Glow */}
                            <AnimatePresence>
                                {hoveredNode === peer.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1.2 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute inset-[-15px] bg-primary/5 rounded-full blur-xl border border-primary/10"
                                    />
                                )}
                            </AnimatePresence>

                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border relative ${peer.status === 'active'
                                    ? 'bg-card border-border shadow-lg group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                                    : 'bg-destructive/5 border-destructive/20'
                                }`}>
                                <Server size={24} className={peer.status === 'active' ? 'text-primary' : 'text-destructive'} />

                                {/* Node Status Chip */}
                                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-lg border-2 border-background flex items-center justify-center ${peer.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-destructive shadow-[0_0_8px_#ef4444]'
                                    }`}>
                                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>

                            {/* Tactical Label Overlay */}
                            <div className={`absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 ${hoveredNode === peer.id ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                                }`}>
                                <div className="bg-card/90 backdrop-blur-xl border border-border px-4 py-2 rounded-2xl shadow-2xl min-w-[140px] text-center">
                                    <div className="text-[10px] font-black text-foreground uppercase tracking-widest truncate">{peer.username}</div>
                                    <div className="text-[9px] font-mono text-primary font-bold mt-1">IP: {peer.assigned_ip}</div>
                                    <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-border">
                                        <Activity size={10} className="text-primary" />
                                        <span className="text-[8px] font-black text-muted-foreground uppercase">{peer.status === 'active' ? 'SYNCHRONIZED' : 'DETACHED'}</span>
                                    </div>
                                </div>
                                <div className="w-[1px] h-4 bg-primary/30" />
                            </div>
                        </div>
                    </motion.div>
                );
            })}

            {/* Strategic HUD Overlays */}
            <div className="absolute top-8 left-8 p-6 bg-card/40 backdrop-blur-xl border border-border rounded-3xl hidden xl:block">
                <div className="flex items-center gap-3 mb-4">
                    <Globe size={18} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Global Mesh Status</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-8">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Nodes Online</span>
                        <span className="text-[10px] font-black text-emerald-500 font-mono">{peers.filter(p => p.status === 'active').length}</span>
                    </div>
                    <div className="flex items-center justify-between gap-8">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Detached Nodes</span>
                        <span className="text-[10px] font-black text-destructive font-mono">{peers.filter(p => p.status !== 'active').length}</span>
                    </div>
                    <div className="w-full h-[2px] bg-border/50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(peers.filter(p => p.status === 'active').length / peers.length) * 100}%` }}
                            className="h-full bg-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Tactical Legend (Bottom Left) */}
            <div className="absolute bottom-10 left-10 flex flex-col gap-3 font-thai z-40">
                <div className="flex items-center gap-3 p-2 bg-card/20 backdrop-blur-sm rounded-xl border border-border/50 transition-all hover:bg-card/40">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full status-glow-emerald" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">ACTIVE_TUNNEL</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-card/20 backdrop-blur-sm rounded-xl border border-border/50 transition-all hover:bg-card/40">
                    <div className="w-2.5 h-2.5 bg-destructive rounded-full" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">REVOKED_NODE</span>
                </div>
            </div>

            {/* Grid Coordinates (Corners) */}
            <div className="absolute top-6 left-6 text-[8px] font-mono text-primary/30 uppercase tracking-widest leading-none">SEC_GRID_ALPHA_01</div>
            <div className="absolute top-6 right-6 text-[8px] font-mono text-primary/30 uppercase tracking-widest leading-none">POS_X: {dimensions.width} . Y: {dimensions.height}</div>
            <div className="absolute bottom-6 right-6 text-[8px] font-mono text-primary/30 uppercase tracking-widest leading-none">ENCRYPTION: AES_256</div>
        </div>
    );
}
