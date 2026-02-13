"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { EdgeNode } from "@/hooks/useGateways";
import { MapPin, Radio, ShieldCheck } from "lucide-react";

interface TacticalMapProps {
    nodes: EdgeNode[];
}

export function TacticalMap({ nodes }: TacticalMapProps) {
    // Project Lat/Lng to SVG coordinates (Simplified Mercator-ish)
    const project = (lat: number, lng: number) => {
        const x = ((lng + 180) * 800) / 360;
        const y = ((90 - lat) * 400) / 180;
        return { x, y };
    };

    const activeNodes = useMemo(() => nodes.filter(n => n.lat !== 0 || n.lng !== 0), [nodes]);

    return (
        <div className="card-premium p-8 relative overflow-hidden h-[500px] flex flex-col">
            <div className="absolute inset-0 bg-mesh opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 hud-grid opacity-[0.02] pointer-events-none" />

            {/* Tactical Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic tracking-tighter uppercase title-military">Global Deployment Matrix</h3>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1">Real-time Node Telemetry // Geo-Spatial Oversight</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Operational Hubs</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary/40 rounded-full" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Relay Matrix</span>
                    </div>
                </div>
            </div>

            {/* Map Canvas */}
            <div className="flex-1 relative bg-black/40 border border-primary/10 rounded-[2rem] overflow-hidden group">
                <svg viewBox="0 0 800 400" className="w-full h-full opacity-60">
                    {/* Simplified World outlines - Placeholder Paths */}
                    <path
                        d="M150,100 L200,80 L250,120 L220,180 L140,160 Z M400,100 L450,90 L500,150 L420,200 L380,140 Z M600,200 L650,180 L700,250 L620,300 Z"
                        fill="none"
                        stroke="rgba(37,99,235,0.15)"
                        strokeWidth="1"
                    />

                    {/* Decorative Grid Lines */}
                    {[...Array(8)].map((_, i) => (
                        <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="400" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    ))}
                    {[...Array(4)].map((_, i) => (
                        <line key={`h-${i}`} x1="0" y1={i * 100} x2="800" y2={i * 100} stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                    ))}

                    {/* Node Interactions */}
                    {activeNodes.map((node) => {
                        const { x, y } = project(node.lat, node.lng);
                        const isDrift = node.desired_hash && node.last_sync_hash !== node.desired_hash;

                        return (
                            <g key={node.id} className="cursor-pointer group/node">
                                {/* Pulse Effect */}
                                <motion.circle
                                    cx={x}
                                    cy={y}
                                    r="12"
                                    initial={{ scale: 0.8, opacity: 0.2 }}
                                    animate={{ scale: [0.8, 1.8, 0.8], opacity: [0.2, 0.1, 0.2] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    fill={node.status === 'online' ? (isDrift ? '#f59e0b' : '#10b981') : '#ef4444'}
                                />

                                {/* Core Point */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill={node.status === 'online' ? (isDrift ? '#f59e0b' : '#10b981') : '#ef4444'}
                                    className="shadow-xl"
                                />

                                {/* Node Label (Visible on Hover) */}
                                <foreignObject x={x + 10} y={y - 20} width="150" height="50" className="pointer-events-none opacity-0 group-hover/node:opacity-100 transition-opacity">
                                    <div className="bg-card/90 backdrop-blur-md border border-primary/20 p-2 rounded-xl">
                                        <div className="text-[8px] font-black text-primary uppercase tracking-tighter">{node.name}</div>
                                        <div className="text-[7px] text-muted-foreground font-mono">{node.public_ip}</div>
                                    </div>
                                </foreignObject>
                            </g>
                        );
                    })}
                </svg>

                {/* Floating Stats */}
                <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-none">
                    <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/5 rounded-xl">
                        <div className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Active Matrix</div>
                        <div className="text-sm font-black text-primary italic">0{activeNodes.length} ENROLLED</div>
                    </div>
                </div>

                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#2563eb]" />
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">Sat-Link Active</span>
                </div>
            </div>

            {/* Tactical Footer Accents */}
            <div className="mt-6 flex items-center justify-between opacity-40">
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.4em]">LAT_SCAN_COMPLETE // LNG_STABLE</div>
                <div className="flex gap-4">
                    <span className="text-[8px] font-mono">0x45 0x78 0x69 0x74</span>
                    <span className="text-[8px] font-mono">SEC_ZONE_DELTA_V</span>
                </div>
            </div>
        </div>
    );
}
