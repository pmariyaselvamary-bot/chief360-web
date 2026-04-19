"use client";

import { useState, useEffect } from "react";
import { Users, Building2, Briefcase, GraduationCap, Loader2, AlertTriangle, Network, Landmark, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { ApiService, RoleEntity } from "@/lib/api";
import { RoleModal, RoleFormData } from "@/components/RoleModal";

const iconMap: Record<string, typeof Building2> = {
    Building2,
    Briefcase,
    GraduationCap,
    Network,
    Landmark,
};

export default function RoleSwitchPanel() {
    const [roles, setRoles] = useState<RoleEntity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleEntity | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRoles() {
            try {
                const data = await ApiService.getRoles();
                setRoles(data);
            } catch (err) {
                console.error("Failed to load roles", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchRoles();
    }, []);

    const handleActivate = async (roleId: string) => {
        try {
            await ApiService.activateRole(roleId);
            // Update local state: deactivate all, activate the selected one
            setRoles(roles.map(r => ({
                ...r,
                active: r.id === roleId
            })));
        } catch (err) {
            console.error("Failed to switch context", err);
        }
    };

    const handleSaveRole = async (data: RoleFormData) => {
        try {
            if (editingRole) {
                const updated = await ApiService.updateRole(editingRole.id, data);
                setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...updated } : r));
            } else {
                const newlyCreated = await ApiService.createRole(data);
                setRoles([...roles, newlyCreated]);
            }
        } catch (err) {
            console.error("Failed to save role", err);
            throw err;
        }
    };

    const handleDeleteRole = async (roleId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const roleToDelete = roles.find(r => r.id === roleId);
        if (roleToDelete?.active) {
            alert("Cannot delete the active context. Switch context first.");
            return;
        }

        if (!confirm("Are you sure you want to delete this context? This cannot be undone.")) return;

        setIsDeleting(roleId);
        try {
            await ApiService.deleteRole(roleId);
            setRoles(roles.filter(r => r.id !== roleId));
            setActiveDropdown(null);
        } catch (err) {
            console.error("Failed to delete role", err);
            alert("Failed to delete role.");
        } finally {
            setIsDeleting(null);
        }
    };

    const openEditModal = (role: RoleEntity, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingRole(role);
        setIsModalOpen(true);
        setActiveDropdown(null);
    };

    const openCreateModal = () => {
        setEditingRole(null);
        setIsModalOpen(true);
    };

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--aurora-pink)]" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto h-full overflow-y-auto w-full relative">
            <header className="mb-6 md:mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Role Switch Panel</h1>
                    <p className="text-white/60 text-base md:text-lg">Manage contextual separation and entity performance.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-[var(--aurora-pink)] to-[var(--deep-rose-start)] text-white px-5 py-3 rounded-xl font-bold tracking-wide hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden md:inline">Add New Context</span>
                </button>
            </header>

            {roles.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center">
                    <AlertTriangle className="w-16 h-16 text-white/20 mb-4" />
                    <h3 className="text-2xl font-semibold mb-2 text-white/60">No Roles Configured</h3>
                    <p className="text-white/40">Add your first role to begin tracking entities and managing context switching.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {roles.map((role) => {
                        const Icon = iconMap[role.icon] || Building2;
                        return (
                            <div
                                key={role.id}
                                className={`relative rounded-2xl border p-6 md:p-8 transition-all hover:bg-white/5 ${role.active
                                    ? "border-[var(--aurora-pink)] bg-[var(--aurora-pink)]/5 shadow-[0_0_30px_rgba(247,37,133,0.1)] "
                                    : "border-white/10 bg-black/20"
                                    }`}
                            >
                                <div className="absolute top-5 right-5 flex items-center gap-3 z-10">
                                    {role.active && (
                                        <div className="bg-gradient-to-r from-[var(--aurora-pink)] to-[var(--deep-rose-start)] text-white text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded-md shadow-lg">
                                            Active Context
                                        </div>
                                    )}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === role.id ? null : role.id);
                                            }}
                                            className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>

                                        {activeDropdown === role.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-white/10 rounded-xl shadow-2xl py-2 z-20 overflow-hidden text-sm">
                                                <button
                                                    onClick={(e) => openEditModal(role, e)}
                                                    className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4 text-white/70" />
                                                    Edit Context
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteRole(role.id, e)}
                                                    disabled={isDeleting === role.id}
                                                    className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 flex items-center gap-3 transition-colors disabled:opacity-50"
                                                >
                                                    {isDeleting === role.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                    Delete Context
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mb-6"
                                    style={{ backgroundColor: `${role.color}20`, color: role.color }}
                                >
                                    <Icon className="w-7 h-7 md:w-8 md:h-8" />
                                </div>

                                <h2 className="text-2xl md:text-3xl font-semibold mb-1">{role.name}</h2>
                                <p className="text-base md:text-lg text-white/50 mb-8">{role.title}</p>

                                <div className="space-y-4 pt-6 border-t border-white/10">
                                    <div className="flex justify-between items-center text-base md:text-lg">
                                        <span className="text-white/60">Time Allocated</span>
                                        <span className="font-mono font-medium">{role.hours}h</span>
                                    </div>
                                    <div className="flex justify-between items-center text-base md:text-lg">
                                        <span className="text-white/60">High-Impact Tasks</span>
                                        <span className="font-mono font-medium">{role.taskCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-base md:text-lg">
                                        <span className="text-white/60">KPI Status</span>
                                        <span className={`font-semibold ${role.kpiStatus === 'Needs Attention' ? 'text-amber-500' : role.kpiStatus === 'Behind' ? 'text-red-400' : 'text-green-400'
                                            }`}>
                                            {role.kpiStatus}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => !role.active && handleActivate(role.id)}
                                    className={`w-full mt-8 py-3 md:py-4 rounded-xl text-base md:text-lg font-bold tracking-wide transition-colors active:scale-95 ${role.active
                                        ? "bg-gradient-to-r from-[var(--aurora-pink)] to-[var(--deep-rose-end)] text-white shadow-lg cursor-default"
                                        : "bg-white/10 text-white/80 hover:bg-white/20"
                                        }`}
                                >
                                    {role.active ? "Current Context" : "Switch Context"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
            <RoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveRole}
                isEditing={!!editingRole}
                initialData={editingRole ? {
                    name: editingRole.name,
                    title: editingRole.title,
                    icon: editingRole.icon,
                    color: editingRole.color
                } : null}
            />
        </div>
    );
}
