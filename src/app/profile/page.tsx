"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { useAuth } from "@/src/lib/AuthContext";
import {
    ArrowLeft, Crown, Trophy, Zap, Heart, Sparkles,
    Github, Users, Lock, CheckCircle2, Edit3,
    LayoutGrid, Settings, LogOut as LogOutIcon,
} from "lucide-react";

interface Stats {
    matchCount: number;
    swipeCount: number;
    totalAiActionsUsed: number;
    eloScore: number;
    level: number;
    levelProgressPercent: number;
    plan: "free" | "premium";
    premiumExpiresAt?: string;
    isPremiumActive: boolean;
}

interface Achievement {
    id: string;
    label: string;
    description: string;
    earned: boolean;
}

const achievementIcons: Record<string, React.ElementType> = {
    first_match: Heart,
    networker: Users,
    github_verified: Github,
    ai_pioneer: Sparkles,
    ai_power_user: Zap,
    super_swiper: Heart,
    premium_member: Crown,
};

// Circular progress ring around the avatar — replaces the flat bar with
// something closer to a "level frame," matching the reference's golden
// ring treatment.
function AvatarRing({ percent, isPremium, children }: { percent: number; isPremium: boolean; children: React.ReactNode }) {
    const size = 112;
    const stroke = 4;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="absolute inset-0 -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#6fff00"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: "stroke-dashoffset 0.6s ease",
                        filter: isPremium ? "drop-shadow(0 0 6px rgba(111,255,0,0.7))" : undefined,
                    }}
                />
            </svg>
            <div className="absolute inset-[8px] rounded-full bg-neon/10 border border-neon/20 overflow-hidden flex items-center justify-center">
                {children}
            </div>
            {isPremium && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-neon flex items-center justify-center border-2 border-background">
                    <Crown size={14} className="text-background" />
                </div>
            )}
        </div>
    );
}

export default function ProfileDashboardPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [profile, setProfile] = useState<{ name: string; avatar: string; role: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchAll = async () => {
            try {
                const token = localStorage.getItem("token");
                const [statsRes, meRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                const statsData = await statsRes.json();
                const meData = await meRes.json();
                setStats(statsData.stats);
                setAchievements(statsData.achievements || []);
                setProfile(meData.user);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    const handleLogout = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        router.push("/auth");
    };

    const initials = profile?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    const earnedCount = achievements.filter((a) => a.earned).length;

    const sidebarItems = [
        { label: "Dashboard", icon: LayoutGrid, active: true, onClick: () => {} },
        { label: "Edit Profile", icon: Edit3, onClick: () => router.push("/profile-edit") },
        { label: "Upgrade to Pro", icon: Crown, onClick: () => router.push("/discover") },
        { label: "Settings", icon: Settings, onClick: () => router.push("/profile-edit") },
    ];

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background relative overflow-hidden">
                {/* Vivid atmospheric background — layered radial gradients for
                    depth, closer to the reference's cinematic glow rather than
                    the app's usual single subtle gradient. */}
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        background: `
                            radial-gradient(ellipse 50% 40% at 15% 10%, rgba(111,255,0,0.10) 0%, transparent 60%),
                            radial-gradient(ellipse 40% 50% at 85% 20%, rgba(147,51,234,0.12) 0%, transparent 60%),
                            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)
                        `,
                    }}
                />

                <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-28 lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
                    {/* Desktop sidebar */}
                    <aside className="hidden lg:flex lg:flex-col lg:gap-1 lg:sticky lg:top-8 lg:h-fit">
                        <div className="mb-6 px-2">
                            <h1 className="font-grotesk text-[20px] uppercase text-cream">Dashboard</h1>
                            <span className="font-condiment text-[14px] text-neon -rotate-1 inline-block">your progress</span>
                        </div>
                        {sidebarItems.map((item) => (
                            <button
                                key={item.label}
                                onClick={item.onClick}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-grotesk text-[12px] uppercase tracking-wide transition-colors text-left ${
                                    item.active
                                        ? "bg-neon/15 text-neon border border-neon/30"
                                        : "text-cream/50 hover:text-cream hover:bg-white/5"
                                }`}
                            >
                                <item.icon size={15} />
                                {item.label}
                            </button>
                        ))}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-grotesk text-[12px] uppercase tracking-wide text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors text-left mt-4"
                        >
                            <LogOutIcon size={15} />
                            Logout
                        </button>
                    </aside>

                    {/* Main content */}
                    <div>
                        {/* Mobile header (hidden on desktop, sidebar covers it there) */}
                        <div className="flex items-center gap-4 mb-8 lg:hidden">
                            <button
                                onClick={() => router.back()}
                                className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                            >
                                <ArrowLeft size={18} className="text-cream/60" />
                            </button>
                            <div>
                                <h1 className="font-grotesk text-[24px] uppercase text-cream">Dashboard</h1>
                                <span className="font-condiment text-[16px] text-neon -rotate-1 inline-block">your progress</span>
                            </div>
                        </div>

                        {loading || !stats ? (
                            <div className="flex justify-center mt-20">
                                <div className="w-8 h-8 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5">
                                {/* Hero card — horizontal on desktop (avatar left,
                                    identity+stats right, all in one card like the
                                    reference), stacked/centered on mobile. */}
                                <div className="liquid-glass rounded-[28px] p-6 lg:p-8 flex flex-col lg:flex-row items-center lg:items-center gap-6 text-center lg:text-left">
                                    <AvatarRing percent={stats.levelProgressPercent} isPremium={stats.isPremiumActive}>
                                        {profile?.avatar ? (
                                            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-grotesk text-[24px] text-neon">{initials}</span>
                                        )}
                                    </AvatarRing>

                                    <div className="flex-1 w-full">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
                                            <div>
                                                <h2 className="font-grotesk text-[20px] uppercase text-cream">{profile?.name}</h2>
                                                <div className="flex items-center justify-center lg:justify-start gap-2 mt-1">
                                                    <span className="font-mono text-[10px] uppercase text-cream/40">{profile?.role}</span>
                                                    {stats.isPremiumActive ? (
                                                        <span className="px-2.5 py-0.5 rounded-full bg-neon/20 border border-neon/40 font-grotesk text-[8px] uppercase tracking-widest text-neon flex items-center gap-1">
                                                            <Crown size={9} /> Premium
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => router.push("/discover")}
                                                            className="px-2.5 py-0.5 rounded-full liquid-glass border border-white/10 font-grotesk text-[8px] uppercase tracking-widest text-cream/50 hover:text-cream transition-colors"
                                                        >
                                                            Free · Upgrade
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push("/profile-edit")}
                                                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-[12px] liquid-glass hover:bg-white/10 transition-colors lg:hidden"
                                            >
                                                <Edit3 size={13} className="text-cream/60" />
                                                <span className="font-grotesk text-[11px] uppercase tracking-widest text-cream/60">Edit Profile</span>
                                            </button>
                                        </div>

                                        {/* Level bar */}
                                        <div className="mb-5">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-grotesk text-[11px] uppercase text-cream/60">Level {stats.level}</span>
                                                <span className="font-mono text-[9px] text-cream/30 uppercase">{stats.eloScore} ELO</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-neon/60 to-neon rounded-full transition-all"
                                                    style={{ width: `${stats.levelProgressPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Stat icon row — inline within the hero card on
                                            desktop, like the reference's icon strip. */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col items-center gap-1 py-2">
                                                <Heart size={16} className="text-neon" />
                                                <span className="font-grotesk text-[18px] text-cream">{stats.matchCount}</span>
                                                <span className="font-mono text-[8px] uppercase text-cream/30">Matches</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 py-2 border-x border-white/5">
                                                <Users size={16} className="text-neon" />
                                                <span className="font-grotesk text-[18px] text-cream">{stats.swipeCount}</span>
                                                <span className="font-mono text-[8px] uppercase text-cream/30">Swipes</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1 py-2">
                                                <Sparkles size={16} className="text-neon" />
                                                <span className="font-grotesk text-[18px] text-cream">{stats.totalAiActionsUsed}</span>
                                                <span className="font-mono text-[8px] uppercase text-cream/30">AI Actions</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Achievements */}
                                <div className="liquid-glass rounded-[24px] p-5 lg:p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Trophy size={15} className="text-neon" />
                                            <p className="font-grotesk text-[12px] uppercase tracking-widest text-cream">Achievements</p>
                                        </div>
                                        <span className="font-mono text-[10px] text-cream/30 uppercase">
                                            {earnedCount}/{achievements.length}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        {achievements.map((a) => {
                                            const Icon = achievementIcons[a.id] || Trophy;
                                            return (
                                                <div
                                                    key={a.id}
                                                    className={`rounded-[16px] p-3 flex flex-col gap-1.5 border transition-all ${
                                                        a.earned
                                                            ? "bg-neon/10 border-neon/30 hover:border-neon/60"
                                                            : "bg-white/[0.02] border-white/5"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${a.earned ? "bg-neon/20" : "bg-white/5"}`}>
                                                            <Icon
                                                                size={15}
                                                                className={a.earned ? "text-neon" : "text-cream/20"}
                                                            />
                                                        </div>
                                                        {a.earned ? (
                                                            <CheckCircle2 size={12} className="text-neon" />
                                                        ) : (
                                                            <Lock size={11} className="text-cream/20" />
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`font-grotesk text-[10px] uppercase leading-tight ${
                                                            a.earned ? "text-cream" : "text-cream/30"
                                                        }`}
                                                    >
                                                        {a.label}
                                                    </span>
                                                    <span className="font-mono text-[8px] text-cream/25 leading-snug">
                                                        {a.description}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile bottom nav */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 lg:hidden">
                    <div className="liquid-glass rounded-[28px] px-6 py-3 flex items-center gap-8">
                        {[
                            { label: "Discover", href: "/discover" },
                            { label: "Projects", href: "/projects" },
                            { label: "Matches", href: "/matches" },
                            { label: "Profile", href: "/profile", active: true },
                        ].map((item) => (
                            <button key={item.label} onClick={() => router.push(item.href)} className={`font-grotesk text-[11px] uppercase tracking-widest transition-colors ${item.active ? "text-neon" : "text-cream/40 hover:text-cream"}`}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}