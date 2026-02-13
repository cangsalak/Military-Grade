"use client";

import React, { useState } from "react";
import { Plus, Trash2, ShieldCheck, ShieldX, ShieldAlert, Wifi, Lock, Activity, ChevronRight, X } from "lucide-react";
import { FirewallRule } from "@/lib/types/network";
import { translations } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";

const t = translations.th;

interface FirewallPanelProps {
    rules: FirewallRule[];
    onAdd: (rule: Omit<FirewallRule, 'id' | 'created_at'>) => void;
    onDelete: (id: number) => void;
    loading: boolean;
}

export function FirewallPanel({ rules, onAdd, onDelete, loading }: FirewallPanelProps) {
    const [showAdd, setShowAdd] = useState(false);
    const [newRule, setNewRule] = useState({
        description: "",
        source_ip: "any",
        destination: "",
        port: "any",
        protocol: "any",
        action: "ALLOW" as "ALLOW" | "DENY"
    });

    const handleSubmit = () => {
        if (!newRule.destination) return;
        onAdd(newRule);
        setShowAdd(false);
        setNewRule({
            description: "",
            source_ip: "any",
            destination: "",
            port: "any",
            protocol: "any",
            action: "ALLOW"
        });
    };

    return (
        <div className="card-premium overflow-hidden min-h-[600px] font-thai relative">
            <div className="absolute inset-0 hud-grid opacity-[0.02] pointer-events-none" />

            <div className="px-8 py-7 border-b border-border flex flex-col md:flex-row md:items-center justify-between bg-card/40 backdrop-blur-md gap-4 relative z-10">
                <div className="flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-primary title-military italic">
                        Security Policy Manager
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-foreground font-black uppercase tracking-tight italic">Armor_Protocol_v2.0</span>
                        <div className="px-2 py-0.5 bg-primary/10 rounded-full text-[8px] font-black text-primary border border-primary/20 shadow-[0_0_8px_var(--primary)] animate-pulse">
                            {rules.length} ACTIVE_RULES_ENFORCED
                        </div>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                >
                    {showAdd ? <X size={16} /> : <Plus size={16} />}
                    {showAdd ? "CANCEL_DEPLOYMENT" : t.firewall.addRule}
                </motion.button>
            </div>

            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-b border-border bg-primary/[0.02] relative z-10"
                    >
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t.firewall.description}</label>
                                <input
                                    type="text"
                                    className="bg-muted border border-border rounded-xl p-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono placeholder:text-muted-foreground/30"
                                    value={newRule.description}
                                    onChange={e => setNewRule({ ...newRule, description: e.target.value })}
                                    placeholder="e.g. ALLOW_SECURE_VAULT"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t.firewall.destination}</label>
                                <input
                                    type="text"
                                    className="bg-muted border border-border rounded-xl p-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono placeholder:text-muted-foreground/30"
                                    value={newRule.destination}
                                    onChange={e => setNewRule({ ...newRule, destination: e.target.value })}
                                    placeholder="e.g. 10.8.0.50/32"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{t.firewall.action}</label>
                                <select
                                    className="bg-muted border border-border rounded-xl p-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                    value={newRule.action}
                                    onChange={e => setNewRule({ ...newRule, action: e.target.value as "ALLOW" | "DENY" })}
                                >
                                    <option value="ALLOW">✓ {t.firewall.allow}</option>
                                    <option value="DENY">✗ {t.firewall.deny}</option>
                                </select>
                            </div>
                            <motion.button
                                whileHover={{ y: -2 }}
                                onClick={handleSubmit}
                                className="md:col-span-3 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                            >
                                <ShieldCheck size={18} /> COMMIT_RULE_TO_KERNEL
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/30">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">{t.firewall.description}</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Source_Vector</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Destination_Target</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border">Directive_Action</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        <AnimatePresence mode="popLayout">
                            {rules.map((rule) => (
                                <motion.tr
                                    key={rule.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="group hover:bg-primary/[0.03] transition-colors"
                                >
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${rule.action === 'ALLOW' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                                                {rule.action === 'ALLOW' ? <ShieldCheck size={18} /> : <ShieldX size={18} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-foreground tracking-tight group-hover:text-primary transition-colors italic">{rule.description}</span>
                                                <span className="text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-widest mt-0.5">SEQ_{rule.id}_ENABLED</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-2">
                                            <Activity size={12} className="text-muted-foreground/40" />
                                            <span className="text-xs font-mono font-bold text-muted-foreground">{rule.source_ip}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
                                            <span className="text-xs font-mono font-black text-foreground bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 tracking-tighter">{rule.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.15em] ${rule.action === 'ALLOW' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-destructive/5 border-destructive/20 text-destructive'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${rule.action === 'ALLOW' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                                            {rule.action}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 12 }}
                                            onClick={() => onDelete(rule.id)}
                                            className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl transition-all border border-transparent hover:border-destructive/20 active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {rules.length === 0 && !loading && (
                <div className="py-40 flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-muted rounded-[2.5rem] flex items-center justify-center mb-8 border border-border relative">
                        <ShieldAlert size={48} className="text-muted-foreground/30" />
                        <div className="absolute inset-0 bg-mesh opacity-5" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground italic mb-2">Security Perimeter Empty</p>
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">Implicit Deny All policy currently in effect</p>
                </div>
            )}

            {/* Tactical Footer Breadcrumb */}
            <div className="p-6 border-t border-border bg-card/20 flex items-center justify-between text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Lock size={10} className="text-primary" /> POLICY_LOCK: ENABLED</span>
                    <span className="flex items-center gap-1.5"><Wifi size={10} className="text-emerald-500" /> KERNEL_SYNC: ONLINE</span>
                </div>
                <div>X25519_ENCRYPTED_FLOW</div>
            </div>
        </div>
    );
}
