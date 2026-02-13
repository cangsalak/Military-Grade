"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Download, ShieldAlert, X, Terminal, Fingerprint, Cpu, ShieldCheck } from "lucide-react";
import { OnboardingData } from "@/lib/types/network";
import { translations } from "@/lib/translations";

const t = translations.th;

interface OnboardingModalProps {
    data: OnboardingData | null;
    onClose: () => void;
}

export function OnboardingModal({ data, onClose }: OnboardingModalProps) {
    if (!data) return null;

    const handleDownload = () => {
        const blob = new Blob([data.config], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wg_armor_deploy.conf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-background/90 backdrop-blur-3xl flex items-center justify-center p-6 z-[100] font-sans">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 30 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="card-premium w-full max-w-2xl p-10 md:p-16 relative overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.1)] border-2 border-primary/20"
                >
                    {/* Background Intelligence */}
                    <div className="absolute inset-0 bg-mesh opacity-[0.03] pointer-events-none" />
                    <div className="absolute inset-0 hud-grid opacity-[0.05] pointer-events-none" />

                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
                        <Fingerprint size={280} className="text-primary" />
                    </div>

                    <button onClick={onClose} className="absolute top-8 right-8 p-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl transition-all z-20">
                        <X size={24} />
                    </button>

                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner relative group">
                                <ShieldCheck size={40} className="text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">SECURE_VECTOR_ESTABLISHED</span>
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-foreground tracking-tighter title-military italic leading-none">
                                    {t.onboarding.accessGranted}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                                        <Terminal size={12} className="text-primary" /> WireGuard Strategic Matrix
                                    </label>
                                    <span className="text-[8px] font-mono text-primary/40 uppercase">CONF_TYPE: X25519_GCM</span>
                                </div>
                                <div className="bg-muted/50 border border-border p-8 rounded-[2rem] font-mono text-[11px] text-foreground leading-relaxed max-h-60 overflow-y-auto custom-scrollbar relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity">
                                        <Cpu size={14} className="text-primary" />
                                    </div>
                                    <pre className="whitespace-pre-wrap select-all">{data.config}</pre>
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ x: 5 }}
                                className="bg-primary/5 border border-primary/20 p-8 rounded-[2rem] items-center gap-6 flex relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-mesh opacity-10" />
                                <div className="bg-primary w-14 h-14 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center shrink-0 relative z-10">
                                    <ShieldAlert size={28} className="text-primary-foreground" />
                                </div>
                                <div className="flex-1 overflow-hidden relative z-10">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{t.onboarding.singleUseKey}</p>
                                        <span className="text-[8px] font-mono text-primary/40">DESTROY_ON_EXIT</span>
                                    </div>
                                    <p className="text-xs font-mono font-bold text-foreground break-all select-all tracking-tight bg-black/5 p-2 rounded-lg border border-primary/10">
                                        {data.private_key}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-16">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="py-5 rounded-2xl bg-secondary hover:bg-accent text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-3 border border-border shadow-sm"
                            >
                                <X size={18} /> {t.onboarding.destroyView}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDownload}
                                className="py-5 rounded-2xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Download size={18} /> {t.onboarding.saveMetadata}
                            </motion.button>
                        </div>
                    </div>

                    {/* Footer HUD Breadcrumb */}
                    <div className="mt-12 pt-8 border-t border-border flex items-center justify-between opacity-30">
                        <div className="text-[8px] font-mono font-bold uppercase tracking-[0.5em]">Auth_Success // ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}</div>
                        <div className="text-[8px] font-mono font-bold uppercase tracking-[0.5em]">Matrix_v2.10</div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
