"use client";

import { Mail, Shield, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { ApiService, UserProfile } from "@/lib/api";


export default function ProfilePage() {
    const { user, logout } = useAuthStore();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
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
