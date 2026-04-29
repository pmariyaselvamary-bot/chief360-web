"use client";
import { Mail, Shield, Loader2, Camera, Trash2, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiService, UserProfile } from "@/lib/api";
export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await ApiService.getProfile();
                setProfile(data);
                setAvatarUrl(data?.avatarUrl || null);
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            setAvatarUrl(base64);
            try {
                await ApiService.updateAvatar(base64);
            } catch (error) {
                console.error("Failed to upload avatar", error);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAvatar = async () => {
        setAvatarUrl(null);
        try {
            await ApiService.updateAvatar("");
        } catch (error) {
            console.error("Failed to remove avatar", error);
        }
    };

    const handleChangePassword = async () => {
        setPasswordMsg('');
        setPasswordError('');
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required!');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match!');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters!');
            return;
        }
        try {
            await ApiService.changePassword({ currentPassword, newPassword });
            setPasswordMsg('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (error) {
            setPasswordError('Current password is incorrect!');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--aurora-pink)]" />
            </div>
        );
    }
    const currentProfile = profile || user;
    const displayName = currentProfile?.name || "Executive";
    const displayEmail = currentProfile?.email || "";
    const displayRole = currentProfile?.role || "Executive";

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto w-full">
            <div className="space-y-6 md:space-y-8 pb-20">

                {/* Avatar Section */}
                <section className="flex flex-col items-center py-8">
                    <div className="relative w-28 h-28 rounded-full border-2 border-white/10 overflow-hidden shadow-2xl">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--aurora-pink)] to-[var(--deep-rose-end)] flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">
                                    {displayName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-all"
                        >
                            <Camera className="w-4 h-4" /> Upload Photo
                        </button>
                        {avatarUrl && (
                            <button
                                onClick={handleRemoveAvatar}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold transition-all"
                            >
                                <Trash2 className="w-4 h-4" /> Remove
                            </button>
                        )}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
                    <h2 className="text-2xl font-bold mt-4">{displayName}</h2>
                    <p className="text-white/60 mt-1">{displayRole}</p>
                </section>

                {/* Profile Info */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <h3 className="text-xl md:text-2xl font-semibold mb-8">Account Information</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-5 py-4 border-b border-white/5">
                            <Mail className="w-6 h-6 text-[var(--aurora-pink)] shrink-0" />
                            <div>
                                <p className="text-sm text-white/40 uppercase tracking-widest font-semibold">Email</p>
                                <p className="text-lg font-medium">{displayEmail}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 py-4 border-b border-white/5">
                            <Shield className="w-6 h-6 text-[var(--aurora-pink)] shrink-0" />
                            <div>
                                <p className="text-sm text-white/40 uppercase tracking-widest font-semibold">System Role</p>
                                <p className="text-lg font-medium">{displayRole}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 py-4">
                            <Shield className="w-6 h-6 text-emerald-400 shrink-0" />
                            <div>
                                <p className="text-sm text-white/40 uppercase tracking-widest font-semibold">Two-Factor Auth</p>
                                <p className={`text-lg font-medium ${profile?.isTwoFactorEnabled ? 'text-emerald-400' : 'text-amber-500'}`}>
                                    {profile?.isTwoFactorEnabled ? 'Enabled' : 'Not Configured'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Change Password Section */}
                <section className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Lock className="w-6 h-6 text-[var(--aurora-pink)]" />
                            <h3 className="text-xl font-semibold">Change Password</h3>
                        </div>
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="text-sm px-4 py-2 rounded-xl bg-[var(--aurora-pink)]/10 text-[var(--aurora-pink)] hover:bg-[var(--aurora-pink)]/20 font-semibold transition-all"
                        >
                            {showPasswordForm ? 'Cancel' : 'Change'}
                        </button>
                    </div>
                    {showPasswordForm && (
                        <div className="space-y-4">
                            {/* Current Password */}
                            <div className="relative">
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--aurora-pink)] pr-10"
                                />
                                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* New Password */}
                            <div className="relative">
                                <input
                                    type={showNew ? "text" : "password"}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--aurora-pink)] pr-10"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Confirm Password */}
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[var(--aurora-pink)] pr-10"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
                            {passwordMsg && <p className="text-emerald-400 text-sm">{passwordMsg}</p>}
                            <button
                                onClick={handleChangePassword}
                                className="w-full py-3 rounded-xl bg-[var(--aurora-pink)] text-white font-bold hover:opacity-90 transition-all"
                            >
                                Update Password
                            </button>
                        </div>
                    )}
                </section>

                <section className="pb-6">
                    <button
                        onClick={() => { logout(); window.location.href = '/login'; }}
                        className="w-full py-4 rounded-2xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all font-semibold text-lg tracking-wide"
                    >
                        Sign Out
                    </button>
                </section>
            </div>
        </div>
    );
}
