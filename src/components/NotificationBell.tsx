"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface Notification {
    _id: string;
    type: string;
    title: string;
    body: string;
    link: string;
    read: boolean;
    createdAt: string;
    from?: { name: string; avatar: string };
}

const typeIcons: Record<string, string> = {
    new_match: "💚",
    new_message: "💬",
    new_application: "📋",
    application_accepted: "✅",
    application_rejected: "❌",
};

export default function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/notifications`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const markAllRead = async () => {
        const token = localStorage.getItem("token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        });
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleNotificationClick = async (n: Notification) => {
        if (!n.read) {
            const token = localStorage.getItem("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${n._id}/read`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
            });
            setUnreadCount((c) => Math.max(0, c - 1));
            setNotifications((prev) =>
                prev.map((notif) => notif._id === n._id ? { ...notif, read: true } : notif)
            );
        }
        setOpen(false);
        if (n.link) router.push(n.link);
    };

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d`;
        if (hours > 0) return `${hours}h`;
        if (mins > 0) return `${mins}m`;
        return "now";
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
                className="relative liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <Bell size={16} className="text-cream/60" />
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon flex items-center justify-center">
                        <span className="font-grotesk text-[8px] text-background">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    </div>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-12 w-80 liquid-glass rounded-[24px] overflow-hidden z-50 shadow-xl">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                        <span className="font-grotesk text-[12px] uppercase text-cream">Notifications</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="font-mono text-[10px] uppercase text-neon hover:text-neon/70 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="font-mono text-[11px] uppercase text-cream/30">No notifications</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n._id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-white/10 transition-colors text-left border-b border-white/5 ${!n.read ? "bg-neon/5" : ""}`}
                                >
                                    <span className="text-[16px] flex-shrink-0 mt-0.5">
                                        {typeIcons[n.type] || "🔔"}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-grotesk text-[11px] uppercase text-cream truncate">{n.title}</p>
                                        <p className="font-mono text-[10px] text-cream/50 leading-relaxed">{n.body}</p>
                                    </div>
                                    <span className="font-mono text-[9px] text-cream/20 flex-shrink-0">
                                        {timeAgo(n.createdAt)}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}