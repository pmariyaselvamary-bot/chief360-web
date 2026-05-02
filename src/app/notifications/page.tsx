"use client";

import { Bell, CheckSquare, Clock, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { ApiService, NotificationItem } from "@/lib/api";

const iconMap: Record<string, typeof Bell> = { Bell, CheckSquare, Clock, AlertTriangle };

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
   const [notifEnabled, setNotifEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('notifEnabled');
    return saved === null ? true : saved === 'true';
});

    useEffect(() => {
        
        async function fetchNotifications() {
            try {
                const data = await ApiService.getNotifications();
                setNotifications(data);
            } catch (err) {
                console.error("Failed to load notifications", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchNotifications();

        // Task deadline checker - every 60 seconds
        const interval = setInterval(async () => {
            if (!localStorage.getItem('notifEnabled') || localStorage.getItem('notifEnabled') === 'false') return;
            try {
                const tasks = await ApiService.getTasks();
                const now = new Date();
                tasks.forEach((task: any) => {
                    if (task.completed) return;
                    const deadline = new Date(task.deadline);
                    const diff = (deadline.getTime() - now.getTime()) / 60000;
                    if (diff > 0 && diff <= 10) {
                        if (Notification.permission === 'granted') {
                            new Notification('⏰ Chief360 Deadline Alert', {
                                body: `"${task.title}" deadline in ${Math.round(diff)} minutes!`,
                                icon: '/favicon.ico',
                            });
                        }
                    }
                });
            } catch (err) {}
        }, 60000);

        return () => clearInterval(interval);
    }, []);

   const toggleNotifications = async () => {
    if (!notifEnabled) {
        try {
            if ('Notification' in window) {
                await Notification.requestPermission();
            }
        } catch (e) {}
        setNotifEnabled(true);
        localStorage.setItem('notifEnabled', 'true');
    } else {
        setNotifEnabled(false);
        localStorage.setItem('notifEnabled', 'false');
    }
};
    const markAllRead = async () => {
        try {
            await ApiService.markAllNotificationsRead();
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {}
    };

    const markOneRead = async (id: string) => {
        try {
            await ApiService.markNotificationRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {}
    };

    const dismissNotification = async (id: string) => {
        try {
            await ApiService.dismissNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
        } catch (err) {}
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--aurora-pink)]" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto h-full overflow-y-auto w-full">
            <header className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Command Feeds</h1>
                    <p className="text-white/60 text-base md:text-lg">Alerts and strategic notifications.</p>
                </div>
                <div className="flex gap-3 items-center">
                    {/* Notification Toggle */}
                    <button
                        onClick={toggleNotifications}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all border ${notifEnabled ? 'bg-[var(--aurora-pink)]/20 border-[var(--aurora-pink)]/40 text-[var(--aurora-pink)]' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        <Bell className="w-4 h-4" />
                        {notifEnabled ? 'Notifications ON' : 'Notifications OFF'}
                        <div className={`w-10 h-5 rounded-full transition-all relative ${notifEnabled ? 'bg-[var(--aurora-pink)]' : 'bg-white/20'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${notifEnabled ? 'left-5' : 'left-0.5'}`} />
                        </div>
                    </button>
                    <button
                        onClick={markAllRead}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-colors text-white/80"
                    >
                        Mark All Read
                    </button>
                </div>
            </header>

            <div className="space-y-4 pb-20">
                {notifications.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center">
                        <Bell className="w-16 h-16 text-white/20 mb-4" />
                        <h3 className="text-2xl font-semibold mb-2 text-white/60">All Caught Up</h3>
                        <p className="text-white/40">No new notifications requiring executive attention.</p>
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const Icon = iconMap[notif.icon] || Bell;
                        const isWarning = notif.type === 'warning';
                        return (
                            <div key={notif.id} className={`relative flex flex-col sm:flex-row gap-5 p-6 md:p-8 rounded-2xl border transition-all ${notif.read ? 'bg-black/30 border-white/5 opacity-70' : isWarning ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                                {!notif.read && <div className={`absolute top-1/2 -translate-y-1/2 left-0 w-1.5 h-12 rounded-r-md ${isWarning ? 'bg-amber-500' : 'bg-[var(--aurora-pink)]'}`} />}
                                <div className={`w-14 h-14 shrink-0 rounded-xl flex items-center justify-center ${isWarning ? 'bg-amber-500/20 text-amber-500' : 'bg-white/10 text-white/80'}`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                        <h3 className="text-xl md:text-2xl font-semibold text-white/90">{notif.title}</h3>
                                        <span className="text-sm font-mono text-white/40">{timeAgo(notif.createdAt)}</span>
                                    </div>
                                    <p className="text-base md:text-lg text-white/60 leading-relaxed mb-4">{notif.message}</p>
                                    <div className="flex gap-4">
                                        <button onClick={() => dismissNotification(notif.id)} className="text-sm font-semibold text-white/40 hover:text-red-400 transition-colors uppercase flex items-center gap-1">
                                            <Trash2 className="w-3.5 h-3.5" /> Dismiss
                                        </button>
                                        {!notif.read && (
                                            <button onClick={() => markOneRead(notif.id)} className={`text-sm font-semibold uppercase ${isWarning ? 'text-amber-500/80 hover:text-amber-500' : 'text-[var(--aurora-pink)]/80 hover:text-[var(--aurora-pink)]'}`}>
                                                Mark Read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
