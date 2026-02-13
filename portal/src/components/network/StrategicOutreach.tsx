"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Globe, Zap, Server, Save, AlertCircle, CheckCircle2, Wifi, Search, Lock as LockIcon, Database } from 'lucide-react';
import api from '@/lib/axios';

export default function StrategicOutreach() {
    const [config, setConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await api.get('/api/v1/system-config');
            setConfig(res.data);
        } catch (err) {
            console.error('Failed to fetch strategy config', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.patch('/api/v1/system-config', config);
            setMessage({ type: 'success', text: 'STRATEGIC_PARAMETERS_SYNCHRONIZED' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'SYNCHRONIZATION_FAILURE' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black title-military italic">STRATEGIC_OUTREACH</h2>
                    <p className="text-muted-foreground text-sm">การจัดการช่องทางสื่อสารพิเศษและการควบคุมอินเทอร์เน็ตระดับองค์กร</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {saving ? <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> : <Save size={18} />}
                    Apply Strategy
                </button>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}
                >
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span className="text-xs font-bold uppercase tracking-wider">{message.text}</span>
                </motion.div>
            )}

            {/* IDENTITY SECTION */}
            <div className="card-premium p-8 border-2 border-primary/10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <LockIcon size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg italic tracking-tight uppercase">Matrix Identity Genesis</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Global Meta-Data // Administrative Branding</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Matrix Mission Name</label>
                        <input
                            className="input-military font-mono"
                            placeholder="e.g. ARMOR-X1 COMMAND"
                            value={config.matrix_name}
                            onChange={(e) => setConfig({ ...config, matrix_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Commander Support Email</label>
                        <input
                            className="input-military font-mono"
                            placeholder="admin@organization.local"
                            value={config.support_email}
                            onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* NETWORK ARCHITECTURE SECTION */}
            <div className="card-premium p-8 border-2 border-primary/10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <Database size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg italic tracking-tight uppercase">Strategic Network Infrastructure</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Traffic Routing Layer // IPAM Vectors</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Public Gateway Vector (IP/Domain)</label>
                        <input
                            className="input-military font-mono"
                            placeholder="e.g. 159.223.x.x"
                            value={config.public_gateway_ip}
                            onChange={(e) => setConfig({ ...config, public_gateway_ip: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Internal Strategic Subnet</label>
                        <input
                            className="input-military font-mono"
                            placeholder="10.8.0.0/22"
                            value={config.internal_subnet}
                            onChange={(e) => setConfig({ ...config, internal_subnet: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DNS Section */}
                <div className="card-premium p-8 space-y-6 border-2 border-primary/10">
                    <div className="flex items-center gap-4 border-b border-border pb-6">
                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                            <Search size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg italic tracking-tight uppercase">Strategic DNS filtering</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Pi-hole Integration Core</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                            <div className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-wide">Status</span>
                                <p className="text-[10px] text-muted-foreground capitalize">Toggle global ad-blocking & security</p>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, dns_filtering_active: !config.dns_filtering_active })}
                                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 ${config.dns_filtering_active ? 'bg-blue-500' : 'bg-muted'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${config.dns_filtering_active ? 'translate-x-7' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Pi-hole Address (Proxy IP)</label>
                            <input
                                className="input-military font-mono"
                                placeholder="127.0.0.1"
                                value={config.pihole_address}
                                onChange={(e) => setConfig({ ...config, pihole_address: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-blue-500">
                            <Shield size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Enterprise Guard</span>
                        </div>
                        <p className="text-[10px] text-blue-500/70 leading-relaxed italic">
                            ระบบจะบังคับให้ลูกข่ายทั้งหมดใน Matrix ใช้งาน DNS ผ่าน Pi-hole เพื่อกรองโฆษณาและเว็บอันตรายโดยอัตโนมัติ
                        </p>
                    </div>
                </div>

                {/* Stealth APN Section */}
                <div className="card-premium p-8 space-y-6 border-2 border-amber-500/10">
                    <div className="flex items-center gap-4 border-b border-border pb-6">
                        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                            <Wifi size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg italic tracking-tight uppercase">Stealth APN Tunneling</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Isolated Network Penetration</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border">
                            <div className="space-y-1">
                                <span className="text-xs font-bold uppercase tracking-wide">Status</span>
                                <p className="text-[10px] text-muted-foreground capitalize">Bypass network isolation layers</p>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, stealth_apn_active: !config.stealth_apn_active })}
                                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 ${config.stealth_apn_active ? 'bg-amber-500' : 'bg-muted'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${config.stealth_apn_active ? 'translate-x-7' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">Stealth Host (SNI Spoofing)</label>
                            <input
                                className="input-military font-mono"
                                placeholder="portal.ais.co.th"
                                value={config.stealth_apn_host}
                                onChange={(e) => setConfig({ ...config, stealth_apn_host: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20 space-y-2">
                        <div className="flex items-center gap-2 text-amber-500">
                            <Zap size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Deep Penetration</span>
                        </div>
                        <p className="text-[10px] text-amber-500/70 leading-relaxed italic">
                            ใช้สำหรับการทะลุผ่านคลื่นเครือข่ายที่ไม่มีอินเทอร์เน็ต โดยการปลอมแปลงทราฟฟิกให้เป็นเว็บเป้าหมายที่เครือข่ายนั้นอนุญาต
                        </p>
                    </div>
                </div>
            </div>

            <div className="card-premium p-8 border-2 border-primary/10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                        <Globe size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg italic tracking-tight uppercase">System outreach parameters</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Kernel Routing Interface</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50 ml-2">WAN Interface (Main Exit)</label>
                        <input
                            className="input-military font-mono"
                            placeholder="eth0"
                            value={config.wan_interface}
                            onChange={(e) => setConfig({ ...config, wan_interface: e.target.value })}
                        />
                    </div>

                    {/* Internet Blackout Toggle */}
                    <div className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col justify-between ${config.internet_access_limited ? 'bg-red-500/10 border-red-500/20' : 'bg-muted/10 border-border/50'}`}>
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${config.internet_access_limited ? 'text-red-500' : 'text-muted-foreground'}`}>Mission Restriction</span>
                                <h4 className="text-xs font-black italic tracking-tighter uppercase title-military">Internet Blackout</h4>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, internet_access_limited: !config.internet_access_limited })}
                                className={`w-12 h-6 rounded-full transition-all relative ${config.internet_access_limited ? 'bg-red-500' : 'bg-white/10'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.internet_access_limited ? 'left-7 shadow-[0_0_10px_#ef4444]' : 'left-1'}`} />
                            </button>
                        </div>
                        <p className={`text-[9px] mt-4 font-bold ${config.internet_access_limited ? 'text-red-500/70' : 'text-muted-foreground/50'}`}>
                            {config.internet_access_limited ? 'ACTIVE: Outbound vectors suspended.' : 'READY: Internet outreach operational.'}
                        </p>
                    </div>

                    <div className="p-4 bg-muted/20 rounded-2xl border border-border flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Local Engine Status</span>
                            <div className="flex items-center gap-2 text-emerald-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Operational</span>
                            </div>
                        </div>
                        <Server size={20} className="opacity-20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
