"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import SwipeCard from "@/src/components/SwipeCard";
import MatchPopup from "@/src/components/MatchPopup";
import { SlidersHorizontal, RefreshCw } from "lucide-react";
import AuthGuard from "@/src/components/AuthGuard";
interface Profile {
    _id: string;
    name: string;
    avatar: string;
    role: string;
    bio: string;
    skills: string[];
    projectIdea: string;
    projectType: string;
    commitment: string;
    experience: number;
    github: string;
    location: string;
    eloScore: number;
    matchScore?: number;
}

interface Match {
    matchId: string;
    matchScore: number;
    with: { name: string; avatar: string; role: string };
}

const ROLES = ["", "frontend", "backend", "fullstack", "devops", "ml", "mobile"];

export default function DiscoverPage() {
    const router = useRouter();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<Match | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [filterRole, setFilterRole] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [empty, setEmpty] = useState(false);

    /* ── Fetch profiles ─────────────────────────────────── */
    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        setEmpty(false);
        try {
            const params = new URLSearchParams({ limit: "10" });
            if (filterRole) params.set("role", filterRole);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/profile/discover?${params}`,
                { credentials: "include" }
            );

            if (res.status === 401) { router.push("/auth"); return; }

            const data = await res.json();
            if (data.profiles?.length === 0) setEmpty(true);
            setProfiles(data.profiles || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filterRole, router]);

    useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

    /* ── Socket ─────────────────────────────────────────── */
    useEffect(() => {
        const fetchToken = async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                { credentials: "include" }
            );
            if (!res.ok) return;
            const data = await res.json();

            const s = io(process.env.NEXT_PUBLIC_API_URL!, {
                auth: { token: data.token },
                withCredentials: true,
            });

            s.on("new_match", (matchData: Match) => setMatch(matchData));
            setSocket(s);
        };

        fetchToken();
        return () => { socket?.disconnect(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Swipe action ───────────────────────────────────── */
    const handleSwipe = async (action: "like" | "pass" | "superlike") => {
        const current = profiles[profiles.length - 1];
        if (!current) return;

        // Optimistically remove top card
        setProfiles((prev) => prev.slice(0, -1));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/swipe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ targetId: current._id, action }),
            });
        } catch (err) {
            console.error(err);
        }

        // Refetch when stack is low
        if (profiles.length <= 2) fetchProfiles();
    };

    /* ── UI ─────────────────────────────────────────────── */
    return (
        <AuthGuard>
            <main className="min-h-screen bg-background flex flex-col">
                {/* Glow */}
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(111,255,0,0.04) 0%, transparent 70%)",
                    }}
                />

                {/* Header */}
                <div className="relative z-10 max-w-lg mx-auto w-full px-4 pt-8 pb-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-grotesk text-[22px] uppercase text-cream">
                            Discover
                        </h1>
                        <span className="font-condiment text-[18px] text-neon -rotate-1 inline-block">
                            find your stack
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Refresh */}
                        <button
                            onClick={fetchProfiles}
                            className="liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw size={16} className="text-cream/60" />
                        </button>

                        {/* Filter */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors ${filterRole ? "bg-neon/20 border border-neon/30" : "hover:bg-white/10"
                                }`}
                        >
                            <SlidersHorizontal size={16} className={filterRole ? "text-neon" : "text-cream/60"} />
                        </button>
                    </div>
                </div>

                {/* Filter dropdown */}
                {showFilters && (
                    <div className="relative z-10 max-w-lg mx-auto w-full px-4 pb-4">
                        <div className="liquid-glass rounded-[20px] p-4">
                            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-3">
                                Filter by role
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {ROLES.map((r) => (
                                    <button
                                        key={r}
                                        onClick={() => { setFilterRole(r); setShowFilters(false); }}
                                        className={`px-4 py-2 rounded-full font-mono text-[11px] uppercase transition-all ${filterRole === r
                                            ? "bg-neon text-background"
                                            : "liquid-glass text-cream/60 hover:text-cream"
                                            }`}
                                    >
                                        {r || "All"}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Card stack */}
                <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-28">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
                            <p className="font-mono text-[12px] uppercase text-cream/30">
                                Finding devs...
                            </p>
                        </div>
                    ) : empty || profiles.length === 0 ? (
                        <div className="liquid-glass rounded-[32px] p-10 flex flex-col items-center gap-4 max-w-sm text-center">
                            <span className="font-condiment text-[36px] text-neon">That&apos;s all!</span>
                            <p className="font-mono text-[12px] uppercase text-cream/40">
                                No more profiles right now. Check back later or adjust your filters.
                            </p>
                            <button
                                onClick={fetchProfiles}
                                className="mt-2 px-6 py-3 rounded-[12px] bg-neon text-background font-grotesk text-[12px] uppercase tracking-widest"
                            >
                                Refresh
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full max-w-sm h-[580px]">
                            {/* Render bottom cards as stack shadows */}
                            {profiles.slice(0, -1).map((p, i) => (
                                <div
                                    key={p._id}
                                    className="absolute inset-0 liquid-glass rounded-[32px]"
                                    style={{
                                        transform: `scale(${0.95 - i * 0.03}) translateY(${(profiles.length - 1 - i - 1) * -8}px)`,
                                        zIndex: i,
                                    }}
                                />
                            ))}

                            {/* Top swipeable card */}
                            <div className="absolute inset-0" style={{ zIndex: profiles.length }}>
                                <SwipeCard
                                    key={profiles[profiles.length - 1]._id}
                                    profile={profiles[profiles.length - 1]}
                                    onSwipe={handleSwipe}
                                    isTop={true}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom nav */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="liquid-glass rounded-[28px] px-6 py-3 flex items-center gap-8">
                        {[
                            { label: "Discover", href: "/discover", active: true },
                            { label: "Matches", href: "/matches", active: false },
                            { label: "Profile", href: "/profile-edit", active: false },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className={`font-grotesk text-[11px] uppercase tracking-widest transition-colors ${item.active ? "text-neon" : "text-cream/40 hover:text-cream"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Match popup */}
                {match && (
                    <MatchPopup
                        match={match}
                        onClose={() => setMatch(null)}
                    />
                )}
            </main>
        </AuthGuard>
    );
}