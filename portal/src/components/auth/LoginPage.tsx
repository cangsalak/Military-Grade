"use client";

import React, { useState } from "react";
import { Shield, Lock, User, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function LoginPage({ onLogin }: { onLogin: (u: string, p: string) => Promise<boolean> }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await onLogin(username, password);
        } catch (err) {
            setError("CRITICAL_ERROR: Access Denied. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans relative overflow-hidden">
            <div className="bg-mesh" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[450px] card-premium p-10 md:p-14 relative z-10"
            >
                <div className="flex flex-col items-center mb-12">
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-8 border border-primary/20 shadow-inner group">
                        <Shield className="text-primary group-hover:scale-110 transition-transform" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-foreground tracking-tighter title-military leading-none">COMMAND CENTER</h2>
                    <div className="flex items-center gap-2 mt-3">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] font-tactical">Secure Tunnel Orchestration</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Mission Operator</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={20} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-2xl py-5 pl-14 pr-6 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono placeholder:text-muted-foreground/40"
                                placeholder="OPERATOR_CODE"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">Encryption Key</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-muted/50 border border-border rounded-2xl py-5 pl-14 pr-6 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono placeholder:text-muted-foreground/40"
                                placeholder="••••••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 p-5 rounded-2xl text-destructive text-[11px] font-black uppercase tracking-widest leading-relaxed"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-black uppercase text-xs tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                            <>
                                <span className="text-primary-foreground">INITIALIZE HANDSHAKE</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-border flex justify-between items-center opacity-40">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Identity Matrix v1.2</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Military-Grade Encryption</span>
                </div>
            </motion.div>
        </div>
    );
}
