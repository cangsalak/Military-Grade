"use client";

import React, { useState, useEffect } from "react";
import {
    UserPlus,
    Shield,
    Trash2,
    Edit,
    UserCheck,
    UserX,
    Mail,
    XCircle,
    CheckCircle2,
    RefreshCw,
    Building2,
    Download,
    QrCode,
    Eye,
    Key
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/hooks/useUsers";
import { translations } from "@/lib/translations";
import { QRCodeSVG } from "qrcode.react";
import api from "@/lib/axios";

const t = translations.th;

export interface UserMatrixProps {
    users: User[];
    loading: boolean;
    onRefresh: () => void;
    onCreate: (data: any) => Promise<void>;
    onUpdate: (id: number, data: any) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    currentUserRole: string;
}

export function UserMatrixEnhanced({ users, loading, onRefresh, onCreate, onUpdate, onDelete, currentUserRole }: UserMatrixProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [qrConfig, setQrConfig] = useState("");
    const [organizations, setOrganizations] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        organization_id: 1,
        username: "",
        email: "",
        name: "",
        password: "",
        pin: "",
        role: "user"
    });

    const [editFormData, setEditFormData] = useState({
        organization_id: 1,
        email: "",
        name: "",
        pin: "",
        role: "user",
        password: ""
    });

    const canDelete = currentUserRole === 'admin' || currentUserRole === 'root';
    const canManageRoles = currentUserRole === 'root';

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const res = await api.get('/api/v1/organizations');
            if (Array.isArray(res.data)) {
                setOrganizations(res.data);
            } else {
                console.error('Organizations data is not an array:', res.data);
                setOrganizations([]);
            }
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
            setOrganizations([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onCreate(formData);
            setShowAddModal(false);
            setFormData({
                organization_id: 1,
                username: "",
                email: "",
                name: "",
                password: "",
                pin: "",
                role: "user"
            });
        } catch (err) {
            alert("Identity deployment failed");
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setEditFormData({
            organization_id: user.organization_id || 1,
            email: user.email || "",
            name: user.name || "",
            pin: user.pin || "",
            role: user.role,
            password: ""
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        try {
            const updateData: any = {
                organization_id: editFormData.organization_id,
                email: editFormData.email,
                name: editFormData.name,
                pin: editFormData.pin,
                role: editFormData.role
            };

            // Only include password if it's provided
            if (editFormData.password) {
                updateData.password = editFormData.password;
            }

            await onUpdate(selectedUser.id, updateData);
            setShowEditModal(false);
            setSelectedUser(null);
        } catch (err) {
            alert("Failed to update user");
        }
    };

    const handleDownloadConfig = async (user: User) => {
        try {
            const res = await api.get(`/api/v1/users/${user.id}/config`);
            const config = res.data;

            // Download as file
            const blob = new Blob([config], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${user.username}.conf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download config:', error);
            alert("Failed to download config");
        }
    };

    const handleShowQR = async (user: User) => {
        try {
            const res = await api.get(`/api/v1/users/${user.id}/config`);
            const config = res.data;
            setQrConfig(config);
            setSelectedUser(user);
            setShowQRModal(true);
        } catch (error) {
            console.error('Failed to generate QR:', error);
            alert("Failed to generate QR code");
        }
    };

    return (
        <div className="space-y-8 font-thai">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-foreground italic tracking-tighter uppercase title-military">
                        {t.userMatrix.title}
                    </h2>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-1 opacity-60">
                        Mission-Critical Resource Management // Operational Staff Control
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onRefresh}
                        className="p-3 bg-secondary hover:bg-accent border border-border rounded-2xl text-muted-foreground hover:text-primary transition-all active:rotate-180 duration-500"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                    >
                        <UserPlus size={16} /> {t.userMatrix.deployBtn}
                    </motion.button>
                </div>
            </div>

            {/* Users Table */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-muted/30 border-b border-border">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Info</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Organization</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Usage Statistics</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Seen</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t.userMatrix.status}</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{t.userMatrix.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {users.map((user) => {
                                const userOrg = organizations.find(org => org.id === user.organization_id);
                                const formatBytes = (bytes: number = 0) => {
                                    if (bytes === 0) return "0 B";
                                    const k = 1024;
                                    const sizes = ["B", "KB", "MB", "GB", "TB"];
                                    const i = Math.floor(Math.log(bytes) / Math.log(k));
                                    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
                                };

                                return (
                                    <tr key={user.id} className="group hover:bg-primary/[0.02] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-foreground tracking-tight">{user.username}</span>
                                                    {user.name ? (
                                                        <span className="text-[10px] text-muted-foreground uppercase font-black">{user.name}</span>
                                                    ) : null}
                                                    <div className="flex items-center gap-1.5 opacity-50">
                                                        <Mail size={10} />
                                                        <span className="text-[10px] font-mono lowercase">{user.email || "NO_EMAIL"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground">
                                                <Building2 size={12} className="text-primary/50" />
                                                <span>{userOrg?.name || "Global Matrix"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500">
                                                    <span className="opacity-50 font-black">↓</span> {formatBytes(user.rx_bytes)}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-blue-500">
                                                    <span className="opacity-50 font-black">↑</span> {formatBytes(user.tx_bytes)}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-mono text-muted-foreground uppercase">
                                                {user.last_handshake ? new Date(user.last_handshake).toLocaleString() : "NEVER_SEEN"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`flex items-center gap-2 ${user.status === 'active' ? 'text-emerald-500' : 'text-destructive'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{user.status.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-xl transition-all"
                                                    title="Edit User"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadConfig(user)}
                                                    className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"
                                                    title="Download Config"
                                                >
                                                    <Download size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleShowQR(user)}
                                                    className="p-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white rounded-xl transition-all"
                                                    title="Show QR Code"
                                                >
                                                    <QrCode size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onUpdate(user.id, { status: user.status === 'active' ? 'revoked' : 'active' })}
                                                    className={`p-2 rounded-xl transition-all ${user.status === 'active'
                                                        ? 'bg-destructive/10 text-destructive hover:bg-destructive'
                                                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500'
                                                        } hover:text-white`}
                                                    title={user.status === 'active' ? "Revoke Access" : "Grant Access"}
                                                >
                                                    {user.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                                                </button>
                                                {canDelete && (
                                                    <button
                                                        onClick={() => onDelete(user.id)}
                                                        className="p-2 bg-muted hover:bg-destructive hover:text-white rounded-xl transition-all"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                                            <UserPlus size={20} />
                                        </div>
                                        <h3 className="text-lg font-black italic uppercase title-military">Deploy New Identity</h3>
                                    </div>
                                    <button onClick={() => setShowAddModal(false)}><XCircle className="text-muted-foreground" /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Organization</label>
                                        <select
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs outline-none"
                                            value={formData.organization_id}
                                            onChange={e => setFormData({ ...formData, organization_id: parseInt(e.target.value) })}
                                        >
                                            {organizations.length > 0 ? (
                                                organizations.map(org => (
                                                    <option key={org.id} value={org.id}>{org.name}</option>
                                                ))
                                            ) : (
                                                <option value={1}>Loading organizations...</option>
                                            )}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Username *</label>
                                        <input
                                            required
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="john.doe"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Email Address *</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john.doe@company.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Full Name</label>
                                        <input
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Password *</label>
                                        <input
                                            required
                                            type="password"
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Minimum 8 characters"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">PIN (Optional)</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            value={formData.pin}
                                            onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                                            placeholder="4-6 digits (optional)"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Role Allocation</label>
                                        <select
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs font-black uppercase outline-none"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="user">USER (VPN ONLY)</option>
                                            <option value="staff">STAFF (MANAGEMENT)</option>
                                            {currentUserRole === 'root' && <option value="admin">ADMIN (CONTROL)</option>}
                                            {currentUserRole === 'root' && <option value="root">ROOT (TOTAL ACCESS)</option>}
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-emerald-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest mt-6 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Initialize Deployment
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit User Modal */}
            <AnimatePresence>
                {showEditModal && selectedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                                            <Edit size={20} />
                                        </div>
                                        <h3 className="text-lg font-black italic uppercase title-military">Edit User: {selectedUser.username}</h3>
                                    </div>
                                    <button onClick={() => setShowEditModal(false)}><XCircle className="text-muted-foreground" /></button>
                                </div>

                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Organization</label>
                                        <select
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs outline-none"
                                            value={editFormData.organization_id}
                                            onChange={e => setEditFormData({ ...editFormData, organization_id: parseInt(e.target.value) })}
                                        >
                                            {organizations.map(org => (
                                                <option key={org.id} value={org.id}>{org.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            value={editFormData.email}
                                            onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Full Name</label>
                                        <input
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            value={editFormData.name}
                                            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">PIN</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            value={editFormData.pin}
                                            onChange={e => setEditFormData({ ...editFormData, pin: e.target.value.replace(/\D/g, '') })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">Role</label>
                                        <select
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs font-black uppercase outline-none"
                                            value={editFormData.role}
                                            onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                                        >
                                            <option value="user">USER</option>
                                            <option value="staff">STAFF</option>
                                            {currentUserRole === 'root' && <option value="admin">ADMIN</option>}
                                            {currentUserRole === 'root' && <option value="root">ROOT</option>}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-muted-foreground uppercase ml-1">New Password (Optional)</label>
                                        <input
                                            type="password"
                                            className="w-full bg-muted border border-border rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-blue-500/20 outline-none"
                                            value={editFormData.password}
                                            onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                                            placeholder="Leave blank to keep current password"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest mt-6 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Save Changes
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && selectedUser && qrConfig && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                                            <QrCode size={20} />
                                        </div>
                                        <h3 className="text-lg font-black italic uppercase title-military">WireGuard Config: {selectedUser.username}</h3>
                                    </div>
                                    <button onClick={() => setShowQRModal(false)}><XCircle className="text-muted-foreground" /></button>
                                </div>

                                <div className="space-y-6">
                                    {/* QR Code */}
                                    <div className="flex justify-center p-8 bg-white rounded-2xl">
                                        <QRCodeSVG value={qrConfig} size={300} level="M" />
                                    </div>

                                    <p className="text-center text-sm text-muted-foreground">
                                        Scan with WireGuard mobile app
                                    </p>

                                    {/* Config Preview */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-muted-foreground uppercase">Config Preview:</label>
                                        <pre className="bg-muted p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48 overflow-y-auto">
                                            {qrConfig}
                                        </pre>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleDownloadConfig(selectedUser)}
                                            className="flex-1 bg-emerald-500 text-white py-3 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2"
                                        >
                                            <Download size={14} /> Download Config
                                        </button>
                                        <button
                                            onClick={() => setShowQRModal(false)}
                                            className="flex-1 bg-muted text-foreground py-3 rounded-xl text-xs font-black uppercase"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
