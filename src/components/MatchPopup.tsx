"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "@/src/lib/SocketContext";
import { Sparkles } from "lucide-react";

interface Props {
    match: {
        matchId: string;
        matchScore: number;
        with: { name: string; avatar: string; role: string };
    };
    onClose: () => void;
}

export default function MatchPopup({ match, onClose }: Props) {
    const router = useRouter();
    const { socket } = useSocket();
    const [explanation, setExplanation] = useState<string | null>(null);
    const [explanationLoading, setExplanationLoading] = useState(true);

    // Listen for the AI explanation once the backend generates it.
    // The swipe response fires immediately; the explanation arrives 1-3s later.
    useEffect(() => {
        if (!socket) return;

        const handleExplanation = (data: { matchId: string; explanation: string }) => {
            if (data.matchId === match.matchId) {
                setExplanation(data.explanation);
                setExplanationLoading(false);
            }
        };

        socket.on("match_explanation_ready", handleExplanation);

        // Safety timeout — if Vertex AI never responds, stop shimmering after 8s
        const timeout = setTimeout(() => setExplanationLoading(false), 8000);

        return () => {
            socket.off("match_explanation_ready", handleExplanation);
            clearTimeout(timeout);
        };
    }, [socket, match.matchId]);

    const initials = match.with.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div className="relative liquid-glass rounded-[32px] w-full max-w-sm px-8 py-10 flex flex-col items-center gap-5 z-10">
                {/* Top glow */}
                <div
                    className="absolute inset-0 rounded-[32px] pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(111,255,0,0.1) 0%, transparent 70%)",
                    }}
                />

                {/* Score + avatar row */}
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[16px] bg-neon/10 border border-neon/20 flex items-center justify-center overflow-hidden">
                        {match.with.avatar ? (
                            <img src={match.with.avatar} alt={match.with.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-grotesk text-[20px] text-neon">{initials}</span>
                        )}
                    </div>
                    <div className="w-16 h-16 rounded-full bg-neon/10 border border-neon/30 flex flex-col items-center justify-center">
                        <span className="font-grotesk text-[20px] text-neon leading-none">{match.matchScore}</span>
                        <span className="font-mono text-[8px] text-neon/60 uppercase">match</span>
                    </div>
                </div>

                {/* Names */}
                <div className="text-center">
                    <span className="font-condiment text-[30px] text-neon block -rotate-1 mb-1">
                        It&apos;s a match!
                    </span>
                    <h2 className="font-grotesk text-[20px] uppercase text-cream">{match.with.name}</h2>
                    <p className="font-mono text-[10px] uppercase text-cream/40 mt-1">{match.with.role}</p>
                </div>

                {/* AI Explanation */}
                <div className="w-full liquid-glass rounded-[20px] p-4 min-h-[72px] flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles size={11} className="text-neon/70" />
                        <span className="font-grotesk text-[9px] uppercase tracking-[0.2em] text-neon/70">
                            Why you match
                        </span>
                    </div>

                    {explanationLoading ? (
                        <div className="flex flex-col gap-2 animate-pulse">
                            <div className="h-2.5 bg-white/10 rounded-full w-full" />
                            <div className="h-2.5 bg-white/10 rounded-full w-4/5" />
                            <div className="h-2.5 bg-white/10 rounded-full w-3/5" />
                        </div>
                    ) : explanation ? (
                        <p className="font-mono text-[11px] text-cream/70 leading-relaxed">{explanation}</p>
                    ) : (
                        <p className="font-mono text-[11px] text-cream/40 leading-relaxed">
                            You have complementary skills and a {match.matchScore}% overlap score.
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={() => router.push(`/matches`)}
                        className="w-full py-4 rounded-[16px] bg-neon text-background font-grotesk text-[13px] uppercase tracking-widest hover:bg-neon/90 transition-colors"
                    >
                        Start chatting →
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-4 rounded-[16px] liquid-glass font-grotesk text-[13px] uppercase tracking-widest text-cream/60 hover:text-cream hover:bg-white/10 transition-colors"
                    >
                        Keep swiping
                    </button>
                </div>
            </div>
        </div>
    );
}