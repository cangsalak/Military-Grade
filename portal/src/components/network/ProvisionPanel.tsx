"use client";

import React, { useState } from "react";
import { Plus, UserPlus, ShieldPlus, ChevronRight } from "lucide-react";
import { translations } from "@/lib/translations";
import { motion } from "framer-motion";

const t = translations.th;

interface ProvisionPanelProps {
    onProvision: (username: string) => void;
}

export function ProvisionPanel({ onProvision }: ProvisionPanelProps) {
    const [username, setUsername] = useState("");

    const handleSubmit = () => {
        if (!username) return;
        onProvision(username);
        setUsername("");
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="card-premium p-8 relative font-thai overflow-hidden group"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.1] transition-all group-hover:scale-110 duration-700">
                <UserPlus size={80} className="text-primary" />
            </div>

            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-10 flex items-center gap-2 title-military">
                <ShieldPlus size={16} className="text-primary shadow-[0_0_8px_var(--primary)]" /> {t.provision.title}
            </h4>

            <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Operator Identity</label>
                        <span className="text-[8px] font-mono text-primary/40 uppercase">UID_AUTO_GEN</span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t.provision.tagPlaceholder}
                            className="bg-muted/50 border border-border w-full rounded-2xl p-4 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/20 italic"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary/20 rounded-full" />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={!username}
                    className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-black text-[11px] tracking-[0.2em] py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 uppercase flex items-center justify-center gap-3 group/btn"
                >
                    {t.provision.registerBtn}
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>

                <p className="text-[9px] text-center text-muted-foreground/40 uppercase tracking-widest leading-relaxed">
                    Identity enrollment triggers <br /> cryptographic peer generation
                </p>
            </div>

            {/* Tactical Hud Markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/20" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/20" />
        </motion.div>
    );
}
