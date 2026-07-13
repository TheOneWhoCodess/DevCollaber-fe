"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Sparkles } from "lucide-react";
import AuthGuard from "@/src/components/AuthGuard";
import NotificationBell from "@/src/components/NotificationBell";
import { useAuth } from "@/src/lib/AuthContext";
import { useSocket } from "@/src/lib/SocketContext";

interface MatchUser {
    _id: string;
    name: string;
    avatar: string;
    role: string;
    skills: string[];
    bio: string;
}

interface Match {
    _id: string;
    users: MatchUser[];
    matchScore: number;
    matchExplanation?: string;
    explanationStatus: "pending" | "ready" | "failed";
    status: string;
    matchedAt: string;
}

const roleColors: Record<string, string> = {
    frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    backend: "bg-green-500/20 text-green-300 border-green-500/30",
    fullstack: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    devops: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    ml: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    mobile: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "just now";
};

export default function MatchesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchMatches = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/matches`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.status === 401) { router.push("/auth"); return; }
                const data = await res.json();
                setMatches(data.matches || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches();
    }, [user, router]);

    // Live-update explanation on the card when AI finishes generating
    useEffect(() => {
        if (!socket) return;

        const handleExplanation = (data: { matchId: string; explanation: string }) => {
            setMatches((prev) =>
                prev.map((m) =>
                    m._id === data.matchId
                        ? { ...m, matchExplanation: data.explanation, explanationStatus: "ready" }
                        : m
                )
            );
        };

        socket.on("match_explanation_ready", handleExplanation);
        return () => { socket.off("match_explanation_ready", handleExplanation); };
    }, [socket]);

    const getOther = (match: Match) =>
        match.users.find((u) => u._id !== user?._id) || match.users[0];

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background">
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(111,255,0,0.04) 0%, transparent 70%)" }}
                />

                <div className="relative z-10 max-w-lg mx-auto px-4 pt-8 pb-28">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="font-grotesk text-[28px] uppercase text-cream">Matches</h1>
                            <span className="font-condiment text-[20px] text-neon -rotate-1 inline-block">your connections</span>
                        </div>
                        <NotificationBell />
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center gap-4 mt-20">
                            <div className="w-10 h-10 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
                            <p className="font-mono text-[11px] uppercase text-cream/30">Loading matches...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="liquid-glass rounded-[32px] p-10 flex flex-col items-center gap-4 text-center mt-10">
                            <span className="font-condiment text-[32px] text-neon">No matches yet</span>
                            <p className="font-mono text-[11px] uppercase text-cream/40">Keep swiping to find your perfect collaborator</p>
                            <button onClick={() => router.push("/discover")} className="mt-2 px-6 py-3 rounded-[12px] bg-neon text-background font-grotesk text-[12px] uppercase tracking-widest">
                                Go to Discover
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {matches.map((match) => {
                                const other = getOther(match);
                                const initials = other.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

                                return (
                                    <div
                                        key={match._id}
                                        className="liquid-glass rounded-[24px] overflow-hidden hover:bg-white/5 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/chat/${match._id}`)}
                                    >
                                        {/* Top row */}
                                        <div className="p-5 flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-[16px] bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                {other.avatar ? (
                                                    <img src={other.avatar} alt={other.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-grotesk text-[18px] text-neon">{initials}</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-grotesk text-[16px] uppercase text-cream truncate">{other.name}</h3>
                                                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-mono uppercase border ${roleColors[other.role] || "bg-white/10 text-cream/60 border-white/20"}`}>
                                                        {other.role}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 flex-wrap">
                                                    {other.skills?.slice(0, 3).map((s) => (
                                                        <span key={s} className="px-2 py-0.5 rounded-full liquid-glass font-mono text-[9px] uppercase text-cream/50">{s}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                                <div className="liquid-glass rounded-[10px] px-2 py-1 flex flex-col items-center">
                                                    <span className="font-grotesk text-[14px] text-neon leading-none">{match.matchScore}</span>
                                                    <span className="font-mono text-[7px] text-neon/40 uppercase">match</span>
                                                </div>
                                                <span className="font-mono text-[9px] text-cream/20 uppercase">{timeAgo(match.matchedAt)}</span>
                                            </div>

                                            <MessageCircle size={18} className="text-cream/20 flex-shrink-0" />
                                        </div>

                                        {/* AI Explanation strip */}
                                        <div
                                            className="border-t border-white/5 px-5 py-3 flex items-start gap-2"
                                            onClick={(e) => e.stopPropagation()} // don't nav to chat when tapping explanation
                                        >
                                            <Sparkles size={11} className="text-neon/50 mt-0.5 flex-shrink-0" />
                                            {match.explanationStatus === "pending" ? (
                                                <div className="flex-1 flex flex-col gap-1.5 animate-pulse">
                                                    <div className="h-2 bg-white/10 rounded-full w-full" />
                                                    <div className="h-2 bg-white/10 rounded-full w-3/5" />
                                                </div>
                                            ) : match.matchExplanation ? (
                                                <p className="font-mono text-[10px] text-cream/50 leading-relaxed">{match.matchExplanation}</p>
                                            ) : (
                                                <p className="font-mono text-[10px] text-cream/25 leading-relaxed">
                                                    {match.matchScore}% skill overlap
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom nav */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="liquid-glass rounded-[28px] px-6 py-3 flex items-center gap-8">
                        {[
                            { label: "Discover", href: "/discover", active: false },
                            { label: "Projects", href: "/projects" },
                            { label: "Matches", href: "/matches", active: true },
                            { label: "Profile", href: "/profile-edit", active: false },
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