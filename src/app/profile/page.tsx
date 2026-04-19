"use client";

import { Camera, Mail, Shield, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiService, UserProfile } from "@/lib/api";

export default function ProfilePage() {
    const { user, updateAvatar } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await ApiService.getProfile();
                setProfile(data);
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
            setPreviewUrl(base64);
            updateAvatar(base64);

            try {
                await ApiService.updateAvatar(base64);
            } catch (error) {
                console.error("Failed to upload avatar", error);
            }
        };
        reader.readAsDataURL(file);
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
    const avatarUrl = previewUrl || (currentProfile as UserProfile)?.avatarUrl || user?.avatarUrl;

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto w-full">
            <div className="space-y-6 md:space-y-8 pb-20">
                {/* Avatar Section */}
                <section className="flex flex-col items-center py-8 md:py-12">
                    <div
                        className="relative w-28 h-28 md:w-36 md:h-36 rounded-2xl border-2 border-white/10 overflow-hidden group cursor-pointer shadow-2xl"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile Avatar"
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[var(--aurora-pink)] to-[var(--deep-rose-end)] flex items-center justify-center">
                                <span className="text-4xl md:text-5xl font-bold text-white/90">
                                    {displayName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Camera className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        className="hidden"
                    />
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mt-6">{displayName}</h2>
                    <p className="text-white/60 text-base md:text-lg mt-1">{displayRole}</p>
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
            </div>
        </div>
    );
}
