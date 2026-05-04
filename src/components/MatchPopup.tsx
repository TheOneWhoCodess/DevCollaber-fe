"use client";

import { useRouter } from "next/navigation";

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div className="relative liquid-glass rounded-[32px] w-full max-w-sm px-8 py-12 flex flex-col items-center gap-6 z-10">
                {/* Glow */}
                <div
                    className="absolute inset-0 rounded-[32px] pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(111,255,0,0.1) 0%, transparent 70%)",
                    }}
                />

                {/* Score badge */}
                <div className="w-20 h-20 rounded-full bg-neon/10 border border-neon/30 flex flex-col items-center justify-center">
                    <span className="font-grotesk text-[22px] text-neon leading-none">
                        {match.matchScore}
                    </span>
                    <span className="font-mono text-[9px] text-neon/60 uppercase">
                        match
                    </span>
                </div>

                <div className="text-center">
                    <span className="font-condiment text-[32px] text-neon block -rotate-1 mb-1">
                        It&apos;s a match!
                    </span>
                    <h2 className="font-grotesk text-[22px] uppercase text-cream">
                        {match.with.name}
                    </h2>
                    <p className="font-mono text-[11px] uppercase text-cream/40 mt-1">
                        {match.with.role}
                    </p>
                </div>

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