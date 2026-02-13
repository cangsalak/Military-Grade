"use client";

import React from "react";
import { Shield, Activity, History, Globe, Lock, UserCheck, Menu, X, LayoutDashboard, Database, BarChart3, ShieldAlert, LogOut, User, Bell, Building2, Zap } from "lucide-react";
import api from "@/lib/axios";
import { translations } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";

const t = translations.th;

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    user: any;
}

export function Sidebar({ activeTab, setActiveTab, onLogout, user }: SidebarProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [config, setConfig] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get('/api/v1/system-config');
                setConfig(res.data);
            } catch (err) {
                console.error('Failed to fetch sidebar config', err);
            }
        };
        fetchConfig();
    }, []);

    const isRoot = user?.role === 'root';
    const isAdmin = user?.role === 'admin' || isRoot;
    const isStaff = user?.role === 'staff' || isAdmin || isRoot;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'root': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
            case 'admin': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
            case 'staff': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
        }
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-lg border border-border"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-[45] lg:static lg:block
                w-64 bg-card border-r border-border 
                flex flex-col transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Shield size={20} className="text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold italic tracking-tighter truncate w-32 uppercase">
                                {config?.matrix_name || "ARMOR-X1"}
                            </h1>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Global Matrix</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-custom">
                    {/* Personal Section */}
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Personal
                        </p>
                        <SidebarItem
                            icon={<LayoutDashboard size={18} />}
                            label={t.sidebar.myAccess}
                            active={activeTab === 'my-access'}
                            onClick={() => { setActiveTab('my-access'); setIsOpen(false); }}
                        />
                        <SidebarItem
                            icon={<Bell size={18} />}
                            label="Notifications"
                            active={activeTab === 'notifications'}
                            onClick={() => { setActiveTab('notifications'); setIsOpen(false); }}
                        />
                    </div>

                    {/* Staff Section */}
                    {isStaff && (
                        <div className="space-y-1">
                            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Management
                            </p>
                            <SidebarItem
                                icon={<UserCheck size={18} />}
                                label={t.sidebar.identityMatrix}
                                active={activeTab === 'users'}
                                onClick={() => { setActiveTab('users'); setIsOpen(false); }}
                            />
                            <SidebarItem
                                icon={<Database size={18} />}
                                label={t.sidebar.networkPulse}
                                active={activeTab === 'nodes'}
                                onClick={() => { setActiveTab('nodes'); setIsOpen(false); }}
                            />
                            <SidebarItem
                                icon={<Globe size={18} />}
                                label={t.sidebar.nodeTopology}
                                active={activeTab === 'map'}
                                onClick={() => { setActiveTab('map'); setIsOpen(false); }}
                            />
                        </div>
                    )}

                    {/* Admin Section */}
                    {isAdmin && (
                        <div className="space-y-1">
                            <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                                Administration
                            </p>
                            <SidebarItem
                                icon={<Activity size={18} />}
                                label={t.sidebar.gatewayCommand}
                                active={activeTab === 'gateways'}
                                onClick={() => { setActiveTab('gateways'); setIsOpen(false); }}
                            />
                            <SidebarItem
                                icon={<BarChart3 size={18} />}
                                label={t.analytics.title}
                                active={activeTab === 'analytics'}
                                onClick={() => { setActiveTab('analytics'); setIsOpen(false); }}
                            />
                            {isRoot && (
                                <SidebarItem
                                    icon={<Zap size={18} />}
                                    label="Strategic Outreach"
                                    active={activeTab === 'outreach'}
                                    onClick={() => { setActiveTab('outreach'); setIsOpen(false); }}
                                />
                            )}
                            <SidebarItem
                                icon={<Building2 size={18} />}
                                label="Organizations"
                                active={activeTab === 'organizations'}
                                onClick={() => { setActiveTab('organizations'); setIsOpen(false); }}
                            />
                            <SidebarItem
                                icon={<History size={18} />}
                                label={t.sidebar.securityAudit}
                                active={activeTab === 'logs'}
                                onClick={() => { setActiveTab('logs'); setIsOpen(false); }}
                            />
                            <SidebarItem
                                icon={<Lock size={18} />}
                                label={t.sidebar.keyManagement}
                                active={activeTab === 'keys'}
                                onClick={() => { setActiveTab('keys'); setIsOpen(false); }}
                            />
                            <SidebarItem
                                icon={<ShieldAlert size={18} />}
                                label={t.sidebar.securityPolicy}
                                active={activeTab === 'policy'}
                                onClick={() => { setActiveTab('policy'); setIsOpen(false); }}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${getRoleBadgeColor(user?.role)}`}>
                                {user?.role?.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        {t.common?.logout || "Logout"}
                    </button>
                </div>
            </aside>
        </>
    );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }
            `}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
