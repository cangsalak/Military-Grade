"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/api/v1/user/notifications");
            setNotifications(res.data || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get("/api/v1/user/notifications/unread");
            setUnreadCount(res.data.count || 0);
        } catch (error) {
            console.error("Failed to fetch unread count:", error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const markAsRead = async (id: number) => {
        try {
            await api.post(`/api/v1/user/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            fetchUnreadCount();
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const deleteNotification = async (id: number) => {
        try {
            await api.delete(`/api/v1/user/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            fetchUnreadCount();
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10';
            case 'warning': return 'text-amber-600 dark:text-amber-400 bg-amber-500/10';
            case 'error': return 'text-red-600 dark:text-red-400 bg-red-500/10';
            default: return 'text-blue-600 dark:text-blue-400 bg-blue-500/10';
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                )}
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-border flex items-center justify-between">
                                <h3 className="font-semibold">Notifications</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-accent rounded transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto flex-1 scrollbar-custom">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No notifications
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 hover:bg-accent/50 transition-colors ${!notif.is_read ? 'bg-accent/30' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${getTypeColor(notif.type)}`}>
                                                        <Bell size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h4 className="text-sm font-medium truncate">
                                                                {notif.title}
                                                            </h4>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                {formatTime(notif.created_at)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                            {notif.message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {!notif.is_read && (
                                                                <button
                                                                    onClick={() => markAsRead(notif.id)}
                                                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                                                >
                                                                    <Check size={12} />
                                                                    Mark as read
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notif.id)}
                                                                className="text-xs text-destructive hover:underline flex items-center gap-1"
                                                            >
                                                                <Trash2 size={12} />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
