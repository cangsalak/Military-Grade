"use client";

import React from "react";
import { AuditLog } from "@/lib/types/network";
import { translations } from "@/lib/translations";
import { Clock, ShieldAlert, Terminal, Activity, ChevronRight, Fingerprint, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const t = translations.th;

interface AuditMatrixProps {
    logs: AuditLog[];
}

export function AuditMatrix({ logs }: AuditMatrixProps) {
    return (
        <div className="card-premium overflow-hidden min-h-[600px] font-thai relative">
            <div className="absolute inset-0 hud-grid opacity-[0.02] pointer-events-none" />

            <div className="px-8 py-7 border-b border-border bg-card/40 backdrop-blur-md flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary title-military italic">
                        {t.auditMatrix.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-foreground font-black uppercase tracking-tight italic">Security Event Nexus</span>
                        <div className="px-2 py-0.5 bg-primary/10 rounded-full text-[8px] font-black text-primary border border-primary/20 shadow-[0_0_8px_var(--primary)]">
                            {logs.length} LOG_ENTRIES_SECURED
                        </div>
                    </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner group transition-all hover:bg-primary hover:text-white duration-500">
                    <Terminal size={22} className="group-hover:scale-110 transition-transform" />
                </div>
            </div>

            <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Operational Timestamp</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Identity Vector</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Strategic Action</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border text-right">Origin Vector</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        <AnimatePresence mode="popLayout">
                            {logs.map((log) => (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="group hover:bg-primary/[0.03] transition-colors"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={10} className="text-primary" />
                                                    <span className="font-mono text-[11px] text-foreground font-black uppercase tracking-tighter">
                                                        {new Date(log.timestamp).toLocaleTimeString('th-TH')}
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-muted-foreground font-bold mt-1 opacity-60">
                                                    {new Date(log.timestamp).toLocaleDateString('th-TH')}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-muted rounded-xl flex items-center justify-center text-muted-foreground border border-border group-hover:border-primary/30 group-hover:text-primary transition-all">
                                                <Fingerprint size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-foreground tracking-tighter group-hover:text-primary transition-colors italic">
                                                    {log.resource_id || 'CENTRAL_COMMAND'}
                                                </span>
                                                <span className="text-[8px] font-mono text-muted-foreground/50 uppercase font-black">NODE_ID_MATCHED</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${log.action.includes('REVOKE') || log.action.includes('DELETE')
                                                ? 'bg-destructive/5 border-destructive/20 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                : 'bg-primary/5 border-primary/20 text-primary shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                                            }`}>
                                            <Activity size={12} className={log.action.includes('REVOKE') ? 'animate-pulse' : ''} />
                                            {log.action}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-muted/50 rounded-xl border border-border/60 group-hover:border-primary/20 transition-all font-mono">
                                            <MapPin size={10} className="text-muted-foreground/40" />
                                            <span className="text-[10px] text-foreground font-black tracking-tight">{log.source_ip}</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {logs.length === 0 && (
                <div className="py-40 flex flex-col items-center justify-center text-center">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center mb-8 border border-border"
                    >
                        <ShieldAlert size={48} className="text-muted-foreground" />
                    </motion.div>
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground italic mb-2">Perimeter Silence</p>
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">No security events detected in the current nexus</p>
                </div>
            )}

            {/* Tactical Footer Breadcrumb */}
            <div className="p-6 border-t border-border bg-card/20 flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-[0.01]" />
                <div className="flex items-center gap-6 relative z-10">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-soft" /> CRYPT_VAULT: SEALED</span>
                    <span className="flex items-center gap-2 opacity-50"><ChevronRight size={10} /> SECURE_FLOW_ACTIVE</span>
                </div>
                <div className="relative z-10">SESSION_INTEGRITY: 100%</div>
            </div>
        </div>
    );
}
