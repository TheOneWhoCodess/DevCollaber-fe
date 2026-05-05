"use client";

import { useState, useEffect } from "react";

const steps = [
    {
        emoji: "👆",
        title: "Swipe to Match",
        body: "Drag cards left to pass, right to like, or up to superlike. Use the buttons too.",
        highlight: "Discover",
    },
    {
        emoji: "🚀",
        title: "Post Your Project",
        body: "Have an idea? Post it in Projects and find the right co-builder by skill.",
        highlight: "Projects",
    },
    {
        emoji: "💬",
        title: "Chat in Real-time",
        body: "When you match, start chatting instantly. No waiting, no friction.",
        highlight: "Matches",
    },
];

export default function OnboardingTour({ onDone }: { onDone: () => void }) {
    const [step, setStep] = useState(0);

    const next = () => {
        if (step < steps.length - 1) setStep(step + 1);
        else onDone();
    };

    const current = steps[step];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            <div className="relative liquid-glass rounded-[32px] w-full max-w-sm px-8 py-10 flex flex-col items-center gap-6 z-10">
                {/* Glow */}
                <div className="absolute inset-0 rounded-[32px] pointer-events-none" style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(111,255,0,0.08) 0%, transparent 70%)"
                }} />

                {/* Step indicators */}
                <div className="flex gap-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-neon" : "w-3 bg-white/20"}`}
                        />
                    ))}
                </div>

                {/* Emoji */}
                <div className="text-[48px]">{current.emoji}</div>

                {/* Content */}
                <div className="text-center">
                    <h2 className="font-grotesk text-[22px] uppercase text-cream mb-2">{current.title}</h2>
                    <p className="font-mono text-[12px] uppercase text-cream/50 leading-relaxed">{current.body}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 w-full">
                    <button
                        onClick={next}
                        className="w-full py-4 rounded-[16px] bg-neon text-background font-grotesk text-[13px] uppercase tracking-widest hover:bg-neon/90 transition-colors"
                    >
                        {step < steps.length - 1 ? "Next →" : "Let's go →"}
                    </button>
                    <button
                        onClick={onDone}
                        className="font-mono text-[10px] uppercase text-cream/30 hover:text-cream/60 transition-colors"
                    >
                        Skip tour
                    </button>
                </div>
            </div>
        </div>
    );
}