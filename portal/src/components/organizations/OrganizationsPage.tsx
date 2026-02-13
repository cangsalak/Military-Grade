"use client";

import React, { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2, Users, X } from "lucide-react";
import api from "@/lib/axios";
import { motion, AnimatePresence } from "framer-motion";

interface Organization {
    id: number;
    name: string;
    user_count: number;
    created_at: string;
}

export function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [formData, setFormData] = useState({ name: "" });

    const fetchOrganizations = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/v1/organizations");
            setOrganizations(res.data || []);
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/api/v1/organizations", formData);
            setShowCreateModal(false);
            setFormData({ name: "" });
            fetchOrganizations();
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to create organization");
        }
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg) return;

        try {
            await api.patch(`/api/v1/organizations/${selectedOrg.id}`, formData);
            setShowEditModal(false);
            setSelectedOrg(null);
            setFormData({ name: "" });
            fetchOrganizations();
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to update organization");
        }
    };

    const handleDelete = async (org: Organization) => {
        if (!confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/api/v1/organizations/${org.id}`);
            fetchOrganizations();
        } catch (error: any) {
            alert(error.response?.data?.error || "Failed to delete organization");
        }
    };

    const openEditModal = (org: Organization) => {
        setSelectedOrg(org);
        setFormData({ name: org.name });
        setShowEditModal(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Organizations</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage organizations and their users
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                    <Plus size={18} />
                    Add Organization
                </button>
            </div>

            {/* Organizations Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading organizations...</div>
                </div>
            ) : organizations.length === 0 ? (
                <div className="card-premium p-12 text-center">
                    <Building2 size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No organizations</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Get started by creating your first organization
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={18} />
                        Create Organization
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {organizations.map((org) => (
                        <div key={org.id} className="card-premium p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Building2 size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{org.name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Created {formatDate(org.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Users size={16} />
                                <span>{org.user_count} {org.user_count === 1 ? 'user' : 'users'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditModal(org)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                                >
                                    <Edit2 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(org)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-destructive/20 text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                                    disabled={org.user_count > 0}
                                    title={org.user_count > 0 ? "Cannot delete organization with users" : ""}
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <>
                        <div
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                            onClick={() => setShowCreateModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="card-premium p-6 w-full max-w-md">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Create Organization</h2>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Organization Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ name: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="e.g., Engineering Team"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && selectedOrg && (
                    <>
                        <div
                            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                            onClick={() => setShowEditModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="card-premium p-6 w-full max-w-md">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Edit Organization</h2>
                                    <button
                                        onClick={() => setShowEditModal(false)}
                                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <form onSubmit={handleEdit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Organization Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ name: e.target.value })}
                                            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
