"use client";

import { useEffect, useState } from "react";
import { Github, ExternalLink, Crown } from "lucide-react";

interface Member {
    _id: string;
    name: string;
    avatar: string;
    role: string;
    skills: string[];
    github: string;
    appliedRole: string;
    isOwner: boolean;
}

export default function MemberList({ projectId }: { projectId: string }) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/members`,
            { headers }
        )
            .then(r => r.json())
            .then(d => setMembers(d.members || []))
            .finally(() => setLoading(false));
    }, [projectId]);

    if (loading) return (
        <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="liquid-glass rounded-[20px] p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[14px] bg-white/10" />
                        <div className="flex flex-col gap-2 flex-1">
                            <div className="h-3 w-32 bg-white/10 rounded" />
                            <div className="h-2 w-20 bg-white/5 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (members.length === 0) return (
        <p className="font-mono text-[11px] uppercase text-cream/20 text-center py-8">
            No members yet — accept applications to add collaborators
        </p>
    );

    return (
        <div className="flex flex-col gap-3">
            {members.map(member => {
                const initials = member.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                return (
                    <div key={member._id} className="liquid-glass rounded-[20px] p-4">
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-[14px] bg-neon/10 border border-neon/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                                {member.avatar ? (
                                    <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-grotesk text-[16px] text-neon">{initials}</span>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-grotesk text-[14px] uppercase text-cream truncate">
                                        {member.name}
                                    </p>
                                    {member.isOwner && (
                                        <Crown size={12} className="text-neon flex-shrink-0" />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-[10px] uppercase text-cream/30">
                                        {member.role}
                                    </span>
                                    {member.appliedRole && !member.isOwner && (
                                        <>
                                            <span className="text-cream/20">·</span>
                                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 font-mono text-[9px] uppercase text-purple-300">
                                                {member.appliedRole}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* GitHub link */}
                            {member.github && (
                                <a
                                    href={`https://github.com/${member.github.replace("https://github.com/", "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="liquid-glass w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                                >
                                    <Github size={13} className="text-cream/40" />
                                </a>
                            )}

                            {/* Profile link */}
                            <a
                                href={`/u/${member.name.toLowerCase().replace(" ", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="liquid-glass w-8 h-8 rounded-[10px] flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                            >
                                <ExternalLink size={13} className="text-cream/40" />
                            </a>
                        </div>

                        {/* Skills */}
                        {member.skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3 pl-[60px]">
                                {member.skills.slice(0, 5).map(skill => (
                                    <span
                                        key={skill}
                                        className="px-2 py-0.5 rounded-full liquid-glass font-mono text-[9px] uppercase text-cream/40"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {member.skills.length > 5 && (
                                    <span className="font-mono text-[9px] uppercase text-cream/20">
                                        +{member.skills.length - 5} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}