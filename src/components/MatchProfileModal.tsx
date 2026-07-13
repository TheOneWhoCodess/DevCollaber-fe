"use client";

import { useEffect, useRef } from "react";
import { X, Github } from "lucide-react";
import GitHubStats from "@/src/components/GitHubStats";

interface MatchUser {
    _id: string;
    name: string;
    avatar: string;
    role: string;
    skills: string[];
    bio?: string;
    github?: string;
    username?: string;
}

const roleColors: Record<string, string> = {
    frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    backend: "bg-green-500/20 text-green-300 border-green-500/30",
    fullstack: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    devops: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    ml: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    mobile: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

/**
 * Quick-view profile for a match, shown as an overlay from the Matches list.
 * Intentionally shows less than the full public profile page — no contact
 * links beyond GitHub, no "connect" CTA (they're already matched) — this is
 * a fast context check, not a replacement for the full profile.
 */
export default function MatchProfileModal({
    user,
    matchScore,
    currentUserSkills,
    onClose,
    onMessage,
}: {
    user: MatchUser;
    matchScore?: number;
    /** The viewer's own skills, used to highlight overlap — purely client-side, no extra fetch. */
    currentUserSkills?: string[];
    onClose: () => void;
    onMessage: () => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on Escape, close on backdrop click (handled inline below)
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    const mySkillsLower = new Set((currentUserSkills || []).map((s) => s.toLowerCase()));

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                ref={panelRef}
                className="liquid-glass w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 max-h-[85vh] overflow-y-auto"
            >
                {/* Close */}
                <div className="flex justify-end mb-2">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-white/10 transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} className="text-cream/50" />
                    </button>
                </div>

                {/* Avatar + name */}
                <div className="flex flex-col items-center gap-3 mb-6 -mt-4">
                    <div className="w-20 h-20 rounded-[20px] bg-neon/10 border border-neon/20 overflow-hidden flex items-center justify-center">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-grotesk text-[24px] text-neon">{initials}</span>
                        )}
                    </div>
                    <div className="text-center">
                        <h2 className="font-grotesk text-[20px] uppercase text-cream">{user.name}</h2>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            {user.role && (
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase border ${roleColors[user.role] || "bg-white/10 text-cream/60 border-white/20"}`}>
                                    {user.role}
                                </span>
                            )}
                            {typeof matchScore === "number" && (
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-mono uppercase border bg-neon/10 text-neon border-neon/20">
                                    {matchScore}% match
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio — trimmed, this is a quick-view not the full profile */}
                {user.bio && (
                    <div className="mb-5">
                        <p className="font-grotesk text-[9px] uppercase tracking-[0.2em] text-cream/30 mb-1.5">About</p>
                        <p className="font-mono text-[11px] text-cream/60 leading-relaxed uppercase line-clamp-4">
                            {user.bio}
                        </p>
                    </div>
                )}

                {/* Skills — overlap with your own profile is highlighted, so you
                    can tell at a glance why this could be a good pairing. */}
                {user.skills?.length > 0 && (
                    <div className="mb-5">
                        <p className="font-grotesk text-[9px] uppercase tracking-[0.2em] text-cream/30 mb-2">
                            Skills {currentUserSkills?.length ? "— shared with you highlighted" : ""}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {user.skills.map((s) => {
                                const shared = mySkillsLower.has(s.toLowerCase());
                                return (
                                    <span
                                        key={s}
                                        className={`px-2.5 py-1 rounded-full font-mono text-[9px] uppercase ${shared
                                            ? "bg-neon/15 border border-neon/40 text-neon"
                                            : "liquid-glass text-cream/50"
                                            }`}
                                    >
                                        {s}
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* GitHub stats — only if they've linked one; kept to language
                    breakdown, no repo names or private-ish detail here. */}
                {user.github && (
                    <div className="mb-5">
                        <p className="font-grotesk text-[9px] uppercase tracking-[0.2em] text-cream/30 mb-2">GitHub activity</p>
                        <GitHubStats username={user.github} />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    {user.github && (
                        <a
                            href={user.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="liquid-glass rounded-[12px] px-4 py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                            <Github size={14} className="text-cream/60" />
                        </a>
                    )}
                    <button
                        onClick={onMessage}
                        className="flex-1 py-3 rounded-[12px] bg-neon text-background font-grotesk text-[11px] uppercase tracking-widest hover:bg-neon/90 transition-colors"
                    >
                        Message
                    </button>
                </div>
            </div>
        </div>
    );
}