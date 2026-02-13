"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowDown, ArrowUp, BarChart3, TrendingUp, Zap, Clock } from "lucide-react";
import { translations } from "@/lib/translations";
import { formatBytes } from "@/lib/utils";

const t = translations.th;

import { NodeAnalytics } from "@/hooks/useAnalytics";

interface AnalyticsData {
    timestamp: string;
    total_rx: number;
    total_tx: number;
}

interface AnalyticsDashboardProps {
    data: AnalyticsData[];
    nodeData: NodeAnalytics[];
    loading: boolean;
}

export function AnalyticsDashboard({ data, nodeData, loading }: AnalyticsDashboardProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // Generate realistic default data if none exists
    const displayData = useMemo(() => {
        if (data && data.length > 0) return data;
        return Array.from({ length: 24 }).map((_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
            total_rx: Math.floor(Math.random() * 5000000) + 1000000,
            total_tx: Math.floor(Math.random() * 3000000) + 500000,
        }));
    }, [data]);

    const displayNodeData = useMemo(() => {
        if (nodeData && nodeData.length > 0) return nodeData;
        return [
            { node_id: 1, node_name: "CORE-BKK-01", total_rx: 245000000, total_tx: 180000000 },
            { node_id: 2, node_name: "EDGE-SG-04", total_rx: 120000000, total_tx: 95000000 },
            { node_id: 3, node_name: "EDGE-HK-02", total_rx: 85000000, total_tx: 45000000 }
        ];
    }, [nodeData]);

    const maxVal = Math.max(...displayData.map(d => Math.max(d.total_rx, d.total_tx)), 1);
    const maxNodeTraffic = Math.max(...displayNodeData.map(n => n.total_rx + n.total_tx), 1);

    return (
        <div className="card-premium min-h-[600px] font-thai p-0 overflow-hidden group relative">
            <div className="absolute inset-0 hud-grid opacity-[0.03] pointer-events-none" />

            {/* Header Section */}
            <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 bg-card/40 backdrop-blur-md">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:rotate-[360deg] transition-transform duration-1000">
                        <BarChart3 size={28} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-foreground title-military italic">
                            {t.analytics.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{t.analytics.trafficFlow}</span>
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-[0.1em]">LIVE_TELEMETRY</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-muted/50 border border-border px-4 py-2.5 rounded-2xl">
                        <div className="flex items-center gap-2 pr-4 border-r border-border">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">RX</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
                            <span className="text-[10px] font-black text-foreground uppercase tracking-widest">TX</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Visualizer Area */}
            <div className="p-8 relative z-10">
                <div className="relative h-64 flex items-end gap-1 px-2 mb-12 border-b border-border/30">
                    {/* SVG Line Charts Overlay */}
                    <svg className="absolute inset-x-0 bottom-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.15 }}
                            transition={{ duration: 2 }}
                            d={`M ${displayData.map((d, i) => `${(i / (displayData.length - 1)) * 100}%,${100 - (d.total_rx / maxVal) * 90}%`).join(' L ')} L 100%,100% L 0%,100% Z`}
                            className="fill-emerald-500"
                        />
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 2 }}
                            d={`M ${displayData.map((d, i) => `${(i / (displayData.length - 1)) * 100}%,${100 - (d.total_rx / maxVal) * 90}%`).join(' L ')}`}
                            className="stroke-emerald-500 fill-none stroke-[2]"
                        />
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.15 }}
                            transition={{ duration: 2.5 }}
                            d={`M ${displayData.map((d, i) => `${(i / (displayData.length - 1)) * 100}%,${100 - (d.total_tx / maxVal) * 90}%`).join(' L ')} L 100%,100% L 0%,100% Z`}
                            className="fill-primary"
                        />
                        <motion.path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 2.5 }}
                            d={`M ${displayData.map((d, i) => `${(i / (displayData.length - 1)) * 100}%,${100 - (d.total_tx / maxVal) * 90}%`).join(' L ')}`}
                            className="stroke-primary fill-none stroke-[2]"
                        />
                    </svg>

                    {displayData.map((d, i) => (
                        <div
                            key={i}
                            className="flex-1 relative h-full group/bar"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className={`absolute inset-x-0 bottom-0 bg-primary/20 transition-all duration-300 ${hoveredIndex === i ? 'h-full opacity-100' : 'h-0 opacity-0'} pointer-events-none rounded-t-lg`} />

                            <AnimatePresence>
                                {hoveredIndex === i && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-none z-50 bg-card border border-border p-4 rounded-2xl shadow-2xl min-w-[160px]"
                                    >
                                        <div className="text-[9px] font-black text-muted-foreground uppercase mb-2">{new Date(d.timestamp).toLocaleTimeString()}</div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-[10px] font-black text-emerald-500">RX: {formatBytes(d.total_rx)}</span>
                                            <span className="text-[10px] font-black text-primary">TX: {formatBytes(d.total_tx)}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Node Distribution Breakdown */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">การกระจายข้อมูลรายโหนด (Node Distribution)</h4>
                            <span className="text-[8px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">Regional Pulse</span>
                        </div>
                        <div className="space-y-4">
                            {displayNodeData.map((node) => {
                                const total = node.total_rx + node.total_tx;
                                const percentage = (total / maxNodeTraffic) * 100;
                                return (
                                    <div key={node.node_id} className="group/node">
                                        <div className="flex justify-between items-end mb-2">
                                            <div>
                                                <div className="text-[10px] font-black text-foreground uppercase tracking-tight">{node.node_name}</div>
                                                <div className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">{formatBytes(node.total_rx)} IN / {formatBytes(node.total_tx)} OUT</div>
                                            </div>
                                            <div className="text-[10px] font-black text-primary italic">{(percentage).toFixed(1)}%</div>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className="h-full bg-gradient-to-r from-emerald-500 to-primary"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Overall Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/40 border border-border p-5 rounded-3xl relative overflow-hidden">
                            <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 rotate-12">
                                <ArrowDown size={40} className="text-emerald-500" />
                            </div>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t.analytics.rxTotal}</span>
                            <div className="text-xl font-black text-foreground mt-1 truncate">{formatBytes(displayData.reduce((acc, d) => acc + d.total_rx, 0))}</div>
                        </div>
                        <div className="bg-muted/40 border border-border p-5 rounded-3xl relative overflow-hidden">
                            <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 -rotate-12">
                                <ArrowUp size={40} className="text-primary" />
                            </div>
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t.analytics.txTotal}</span>
                            <div className="text-xl font-black text-foreground mt-1 truncate">{formatBytes(displayData.reduce((acc, d) => acc + d.total_tx, 0))}</div>
                        </div>
                        <div className="col-span-2 bg-primary p-6 rounded-[2rem] relative overflow-hidden group shadow-xl shadow-primary/20">
                            <div className="absolute inset-0 bg-mesh opacity-20" />
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <span className="text-[9px] font-black text-primary-foreground/60 uppercase tracking-widest">Network Peak Sector</span>
                                    <div className="text-2xl font-black text-primary-foreground italic title-military">ALPHA-SECTOR-09</div>
                                </div>
                                <TrendingUp className="text-primary-foreground opacity-50 group-hover:scale-110 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-8 text-[7px] font-mono text-muted-foreground/30 font-bold uppercase tracking-[0.5em] pointer-events-none">
                GRID_LOC: BKK_HUB_01 // SEC_LEVEL: 4
            </div>
        </div>
    );
}
