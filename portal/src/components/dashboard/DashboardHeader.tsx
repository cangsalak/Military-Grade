"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, Activity } from "lucide-react";
import api from "@/lib/axios";
import { translations } from "@/lib/translations";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationPanel } from "./NotificationPanel";

const t = translations.th;

interface DashboardHeaderProps {
    activeTab: string;
    error: string | null;
}

export function DashboardHeader({ activeTab, error }: DashboardHeaderProps) {
    const [engineStatus, setEngineStatus] = useState({ operational: false });

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get("/health");
                setEngineStatus({
                    operational: res.data.status === "operational"
                });
            } catch (e) { }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const getTitle = () => {
        switch (activeTab) {
            case 'my-access': return t.sidebar.myAccess;
            case 'nodes': return t.header.accessMatrix;
            case 'logs': return t.header.securityEventLogs;
            case 'map': return t.sidebar.nodeTopology;
            case 'policy': return t.sidebar.securityPolicy;
            case 'keys': return t.sidebar.keyManagement;
            case 'analytics': return t.analytics.title;
            case 'gateways': return t.sidebar.gatewayCommand;
            case 'users': return t.sidebar.identityMatrix;
            default: return t.header.accessMatrix;
        }
    };

    return (
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card sticky top-0 z-30">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{getTitle()}</h1>

                {/* Status Indicator */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full ${engineStatus.operational ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="text-xs font-medium text-muted-foreground">
                        {engineStatus.operational ? 'Online' : 'Offline'}
                    </span>
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-muted/50 border border-input rounded-lg py-2 pl-9 pr-4 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
                    />
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Notifications */}
                <NotificationPanel />
            </div>

            {/* Error Alert */}
            {error && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
                    <div className="bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg flex items-center gap-3">
                        <Activity size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                </div>
            )}
        </header>
    );
}
