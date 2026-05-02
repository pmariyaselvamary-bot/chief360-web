"use client";

import { LayoutDashboard, Users, BrainCircuit, Activity, Settings, Bell, Search, X, Calendar, Sun, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const [isDark, setIsDark] = useState(true);
    const [search, setSearch] = useState('');
useEffect(() => {
    const notifiedTasks = new Set<string>();
    const interval = setInterval(async () => {
        if (Notification.permission === 'default') {
    await Notification.requestPermission();
}
        if (Notification.permission !== 'granted') return;
        try {
            const { ApiService } = await import('@/lib/api');
            const tasks = await ApiService.getTasks();
            const now = new Date();
            for (const task of tasks) {
                if (task.completed) continue;
                if (notifiedTasks.has(task.id)) continue;
                const deadline = new Date(task.deadline);
                const diff = (deadline.getTime() - now.getTime()) / 60000;
                console.log(`${task.title} diff: ${diff} minutes, deadline: ${deadline.toISOString()}, now: ${now.toISOString()}`);
                if (diff > 0 && diff <= 10) {
                    notifiedTasks.add(task.id);
                    new Notification('⏰ Chief360 Deadline Alert', {
                        body: `"${task.title}" deadline in ${Math.round(diff)} minutes!`,
                        icon: '/favicon.ico',
                    });
                    try {
                        await ApiService.createNotification({
                            title: 'Deadline Alert',
                            message: `"${task.title}" deadline in ${Math.round(diff)} minutes!`,
                            type: 'warning',
                            icon: 'Clock'
                        });
                    } catch (e) {}
                }
            }
        } catch (err) {}
       }, 10000);
    return () => clearInterval(interval);
}, []);
    const toggleTheme = () => {
    const newMode = !isDark;
        setIsDark(newMode);
        document.documentElement.className = newMode ? 'dark' : 'light';
    };
    const navItems = [
        { name: "Command Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Executive Pipeline", href: "/schedule", icon: Calendar },
        { name: "Role Switch", href: "/roles", icon: Users },
        { name: "Strategic Intelligence", href: "/intelligence", icon: BrainCircuit },
        { name: "Performance", href: "/performance", icon: Activity },
    ];
    const filteredNav = navItems.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            <aside className={`fixed md:static inset-y-0 left-0 w-80 bg-[#1A1A1A] border-r border-white/5 flex flex-col pt-6 pb-6 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="px-6 mb-8 flex items-center justify-between md:justify-center">
                    <div className="relative w-48 h-16">
                        <Image
                            src="/assets/chief360-black bg.png"
                            alt="Chief360 Copilot App Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <button className="md:hidden text-white/50 hover:text-white" onClick={() => setIsOpen(false)}>
                        <X className="w-8 h-8" />
                    </button>
                </div>

                <div className="px-6 mb-8 relative">
                    <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
                    <input
                        type="text"
                        placeholder="Command search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
    if (e.key === 'Enter' && filteredNav.length > 0) {
      router.push(filteredNav[0].href);
        setSearch('');
        setIsOpen(false);
    }
}}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-14 pr-4 text-base focus:outline-none focus:ring-1 focus:ring-[var(--aurora-pink)] text-white/90 placeholder:text-white/40 transition-all font-mono"
                        />
                </div>

                <nav className="flex-1 px-4 space-y-3 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all group relative overflow-hidden ${isActive
                                    ? "bg-white/10 text-white font-medium shadow-inner"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-[var(--aurora-pink)] to-[var(--deep-rose-end)] rounded-r-full shadow-[0_0_8px_var(--aurora-pink)]" />
                                )}
                                <Icon className={`w-7 h-7 ${isActive ? "text-[var(--aurora-pink)]" : "group-hover:text-[var(--aurora-pink)] transition-colors"}`} />
                                <span className="text-lg tracking-wide">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 mt-auto space-y-3 pt-6 border-t border-white/5">
                    <button onClick={toggleTheme} className="flex items-center gap-4 px-4 py-4 rounded-xl transition-all text-white/60 hover:text-white hover:bg-white/5 w-full">
                        {isDark ? <Sun className="w-7 h-7" /> : <Moon className="w-7 h-7" />}
                        <span className="text-lg tracking-wide">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all group relative overflow-hidden w-full ${pathname === '/notifications'
                            ? "bg-white/10 text-white font-medium shadow-inner"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        {pathname === '/notifications' && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-[var(--aurora-pink)] to-[var(--deep-rose-end)] rounded-r-full shadow-[0_0_8px_var(--aurora-pink)]" />
                        )}
                        <Bell className={`w-7 h-7 flex-shrink-0 ${pathname === '/notifications' ? "text-[var(--aurora-pink)]" : "group-hover:text-[var(--aurora-pink)] transition-colors"}`} />
                        <span className="text-lg tracking-wide">Notifications</span>
                    </Link>

                    <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all group relative overflow-hidden w-full ${pathname === '/profile'
                            ? "bg-white/10 text-white font-medium shadow-inner"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        {pathname === '/profile' && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-[var(--aurora-pink)] to-[var(--deep-rose-end)] rounded-r-full shadow-[0_0_8px_var(--aurora-pink)]" />
                        )}
                        <Settings className={`w-7 h-7 flex-shrink-0 ${pathname === '/profile' ? "text-[var(--aurora-pink)]" : "group-hover:text-[var(--aurora-pink)] transition-colors"}`} />
                        <span className="text-lg tracking-wide">Account Settings</span>
                    </Link>

                    <Link href="/profile" onClick={() => setIsOpen(false)} className="mt-6 pt-6 flex items-center gap-4 px-4 border-t border-white/5 hover:bg-white/5 rounded-xl transition-colors cursor-pointer w-full py-4 relative group">
                        <div className="w-12 h-12 rounded-full flex-shrink-0 bg-gradient-to-tr from-[var(--aurora-pink)] to-[var(--deep-rose-start)] flex items-center justify-center text-white font-bold text-base ring-2 ring-background overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.name ? user.name.substring(0, 2).toUpperCase() : 'EX'
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-base font-semibold text-white truncate max-w-[150px] group-hover:text-[var(--aurora-pink)] transition-colors">{user?.name || 'Executive Alpha'}</p>
                            <p className="text-sm text-[var(--aurora-pink)] font-mono truncate">{user?.email || 'admin@chief360.ai'}</p>
                        </div>
                    </Link>
                </div>
            </aside>
        </>
    );
}
