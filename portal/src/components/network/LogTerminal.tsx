import React, { useEffect, useState, useRef } from "react";
import { Terminal, Shield, AlertCircle, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LogEntry {
    time: string;
    level: string;
    message: string;
    node: string;
}

interface LogTerminalProps {
    nodeId: number;
    nodeName: string;
    onClose: () => void;
}

export function LogTerminal({ nodeId, nodeName, onClose }: LogTerminalProps) {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [status, setStatus] = useState<"connecting" | "streaming" | "error">("connecting");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("mil_token");
        if (!token) {
            setStatus("error");
            return;
        }

        const eventSource = new EventSource(`/api/v1/nodes/${nodeId}/logs`);

        eventSource.onopen = () => {
            setStatus("streaming");
        };

        eventSource.addEventListener("log", (event) => {
            try {
                const data: LogEntry = JSON.parse(event.data);
                setLogs((prev) => [...prev, data].slice(-100)); // Keep last 100 logs
            } catch (err) {
                console.error("Log parse error", err);
            }
        });

        eventSource.onerror = () => {
            setStatus("error");
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [nodeId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-background/80 backdrop-blur-xl"
        >
            <div className="w-full max-w-5xl h-[80vh] bg-[#050505] border-2 border-primary/20 rounded-[2rem] shadow-[0_0_100px_rgba(37,99,235,0.2)] overflow-hidden flex flex-col font-mono relative">
                <div className="absolute inset-0 hud-grid opacity-[0.02] pointer-events-none" />

                {/* Tactical Header */}
                <div className="p-6 border-b border-primary/10 flex items-center justify-between bg-card/20 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${status === 'streaming' ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' : 'bg-primary/10 text-primary'}`}>
                            <Terminal size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Telemetry Stream</div>
                            <div className="text-sm font-black text-foreground title-military italic uppercase">{nodeName} :: SEC_STREAM_V1</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {status === "streaming" && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live Link</span>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Log Viewport */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar relative z-10"
                >
                    {logs.length === 0 && status === "connecting" && (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <Shield className="animate-spin-slow text-primary/20" size={48} />
                            <div className="text-[10px] uppercase font-black tracking-[0.3em]">Establishing encrypted bridge...</div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="h-full flex flex-col items-center justify-center text-destructive gap-4">
                            <AlertCircle size={48} />
                            <div className="text-[10px] uppercase font-black tracking-[0.3em]">Operational Breach :: Bridge Defunct</div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-destructive/10 border border-destructive/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-destructive/20 transition-colors"
                            >
                                Re-initiate Sequence
                            </button>
                        </div>
                    )}

                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="grid grid-cols-[140px_80px_1fr] gap-4 text-[11px] font-mono leading-relaxed group"
                        >
                            <span className="text-muted-foreground/40">{new Date(log.time).toLocaleTimeString()}</span>
                            <span className={`font-black tracking-tighter ${log.level === 'ERROR' ? 'text-destructive' :
                                    log.level === 'WARN' ? 'text-amber-500' : 'text-primary'
                                }`}>[{log.level}]</span>
                            <span className="text-foreground/90 group-hover:text-foreground transition-colors">{log.message}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-primary/10 flex items-center justify-between text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.4em] bg-card/10">
                    <div>AES_256_GCM // SEC_PROTOCOL_TLS_1.3</div>
                    <div className="flex items-center gap-6">
                        <button className="hover:text-primary transition-colors flex items-center gap-1">
                            <Download size={10} /> Export Buffer
                        </button>
                        <span>Buffer: {logs.length}/100</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
