"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import UpgradeModal from "./upgradeModal";

interface Props {
    onUpgraded?: () => void;
}

// Small, attention-grabbing pill button meant to sit in a header icon
// row or similar. Uses a subtle pulsing glow rather than anything too
// aggressive — meant to catch the eye without being obnoxious.
export default function UpgradeButton({ onUpgraded }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative flex items-center gap-1.5 px-3 h-10 rounded-[12px] bg-gradient-to-r from-neon/20 to-neon/10 border border-neon/40 hover:border-neon/70 transition-colors overflow-hidden"
            >
                <span className="absolute inset-0 bg-neon/10 animate-pulse" />
                <Crown size={14} className="relative text-neon flex-shrink-0" />
                <span className="relative font-grotesk text-[10px] uppercase tracking-wider text-neon whitespace-nowrap">
                    Upgrade
                </span>
            </button>

            <UpgradeModal
                isOpen={open}
                onClose={() => setOpen(false)}
                onUpgraded={onUpgraded}
            />
        </>
    );
}