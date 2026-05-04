"use client";
import React from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Github, ExternalLink, X, Star, Heart } from "lucide-react";

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

interface Props {
    profile: Profile;
    onSwipe: (action: "like" | "pass" | "superlike") => void;
    isTop: boolean;
}

export default function SwipeCard({ profile, onSwipe, isTop }: Props) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotate = useTransform(x, [-200, 200], [-18, 18]);
    const likeOpacity = useTransform(x, [20, 100], [0, 1]);
    const passOpacity = useTransform(x, [-100, -20], [1, 0]);
    const superlikeOpacity = useTransform(y, [-100, -20], [1, 0]);

    const handleDragEnd = () => {
        const xVal = x.get();
        const yVal = y.get();

        if (yVal < -100) {
            triggerSwipe("superlike", 0, -600);
        } else if (xVal > 100) {
            triggerSwipe("like", 600, 0);
        } else if (xVal < -100) {
            triggerSwipe("pass", -600, 0);
        } else {
            animate(x, 0, { type: "spring", stiffness: 300 });
            animate(y, 0, { type: "spring", stiffness: 300 });
        }
    };

    const triggerSwipe = (
        action: "like" | "pass" | "superlike",
        exitX: number,
        exitY: number
    ) => {
        animate(x, exitX, { duration: 0.3 });
        animate(y, exitY, { duration: 0.3 });
        setTimeout(() => onSwipe(action), 300);
    };

    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const roleColors: Record<string, string> = {
        frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        backend: "bg-green-500/20 text-green-300 border-green-500/30",
        fullstack: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        devops: "bg-orange-500/20 text-orange-300 border-orange-500/30",
        ml: "bg-pink-500/20 text-pink-300 border-pink-500/30",
        mobile: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    };

    return (
        <motion.div
            style={{ x, y, rotate }}
            drag={isTop}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
            {/* Like indicator */}
            <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-8 left-8 z-20 rotate-[-20deg] border-4 border-neon rounded-[12px] px-4 py-2"
            >
                <span className="font-grotesk text-[28px] uppercase text-neon">Like</span>
            </motion.div>

            {/* Pass indicator */}
            <motion.div
                style={{ opacity: passOpacity }}
                className="absolute top-8 right-8 z-20 rotate-[20deg] border-4 border-red-500 rounded-[12px] px-4 py-2"
            >
                <span className="font-grotesk text-[28px] uppercase text-red-500">Nope</span>
            </motion.div>

            {/* Superlike indicator */}
            <motion.div
                style={{ opacity: superlikeOpacity }}
                className="absolute top-8 left-1/2 -translate-x-1/2 z-20 border-4 border-blue-400 rounded-[12px] px-4 py-2"
            >
                <span className="font-grotesk text-[28px] uppercase text-blue-400">Super</span>
            </motion.div>

            {/* Card */}
            <div className="liquid-glass rounded-[32px] h-full overflow-y-auto flex flex-col">

                {/* Top section */}
                <div className="relative p-6 pb-4">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-[20px] bg-neon/10 border border-neon/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-grotesk text-[24px] text-neon">{initials}</span>
                            )}
                        </div>

                        {/* Name + role */}
                        <div className="flex-1 min-w-0">
                            <h2 className="font-grotesk text-[22px] uppercase text-cream leading-tight truncate">
                                {profile.name}
                            </h2>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-mono uppercase border ${roleColors[profile.role] || "bg-white/10 text-cream/60 border-white/20"}`}>
                                {profile.role}
                            </span>
                            <div className="flex items-center gap-3 mt-2">
                                {profile.experience > 0 && (
                                    <span className="font-mono text-[10px] text-cream/40 uppercase">{profile.experience}y exp</span>
                                )}
                                {profile.location && (
                                    <span className="font-mono text-[10px] text-cream/40 uppercase">{profile.location}</span>
                                )}
                            </div>
                        </div>

                        {/* Match score */}
                        {profile.matchScore !== undefined && (
                            <div className="flex flex-col items-center liquid-glass rounded-[16px] px-3 py-2">
                                <span className="font-grotesk text-[18px] text-neon leading-none">{profile.matchScore}</span>
                                <span className="font-mono text-[8px] text-neon/50 uppercase">match</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="mx-6 h-px bg-white/10" />

                {/* Skills */}
                {profile.skills?.length > 0 && (
                    <div className="px-6 py-4">
                        <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-3">Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills.slice(0, 8).map((skill) => (
                                <span key={skill} className="px-3 py-1 rounded-full liquid-glass font-mono text-[10px] uppercase text-cream/70">
                                    {skill}
                                </span>
                            ))}
                            {profile.skills.length > 8 && (
                                <span className="px-3 py-1 rounded-full liquid-glass font-mono text-[10px] uppercase text-cream/30">
                                    +{profile.skills.length - 8}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Bio */}
                {profile.bio && (
                    <div className="px-6 pb-4">
                        <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-2">About</p>
                        <p className="font-mono text-[12px] text-cream/70 leading-relaxed uppercase">{profile.bio}</p>
                    </div>
                )}

                {/* Project idea */}
                {profile.projectIdea && (
                    <div className="mx-6 mb-4 liquid-glass rounded-[20px] p-4">
                        <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-2">Project idea</p>
                        <p className="font-mono text-[11px] text-cream/80 leading-relaxed uppercase">{profile.projectIdea}</p>
                        <div className="flex gap-2 mt-3">
                            {profile.projectType && (
                                <span className="px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 font-mono text-[9px] uppercase text-purple-300">
                                    {profile.projectType}
                                </span>
                            )}
                            {profile.commitment && (
                                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-[9px] uppercase text-cream/50">
                                    {profile.commitment}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* GitHub */}
                {profile.github && (
                    <div className="px-6 pb-6">
                        <a
                            href={profile.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="flex items-center gap-2 liquid-glass rounded-[12px] px-4 py-3 hover:bg-white/10 transition-colors w-fit"
                        >
                            <Github size={14} className="text-cream/60" />
                            <span className="font-mono text-[11px] uppercase text-cream/60">View GitHub</span>
                            <ExternalLink size={10} className="text-cream/30" />
                        </a>
                    </div>
                )}

            </div>{/* end card */}

            {/* Action buttons */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-5">
                <button
                    onClick={() => triggerSwipe("pass", -600, 0)}
                    className="w-14 h-14 rounded-full liquid-glass flex items-center justify-center border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/60 transition-all active:scale-95"
                >
                    <X size={22} className="text-red-400" />
                </button>
                <button
                    onClick={() => triggerSwipe("superlike", 0, -600)}
                    className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center border border-blue-400/30 hover:bg-blue-400/20 hover:border-blue-400/60 transition-all active:scale-95"
                >
                    <Star size={18} className="text-blue-400" />
                </button>
                <button
                    onClick={() => triggerSwipe("like", 600, 0)}
                    className="w-14 h-14 rounded-full liquid-glass flex items-center justify-center border border-neon/30 hover:bg-neon/20 hover:border-neon/60 transition-all active:scale-95"
                >
                    <Heart size={22} className="text-neon" />
                </button>
            </div>

        </motion.div>
    );
}