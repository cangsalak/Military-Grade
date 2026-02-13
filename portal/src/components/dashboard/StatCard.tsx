"use client";

import React from "react";

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    description?: string;
}

export function StatCard({ icon, label, value, trend, description }: StatCardProps) {
    return (
        <div className="card-premium p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-full">
                        {trend}
                    </span>
                )}
            </div>

            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
    );
}
