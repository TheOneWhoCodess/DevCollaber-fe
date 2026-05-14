"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { ArrowLeft, Github, ExternalLink, Users } from "lucide-react";
import { useAuth } from "@/src/lib/AuthContext";

interface Project {
    _id: string;
    title: string;
    description: string;
    techStack: string[];
    rolesNeeded: string[];
    stage: string;
    commitment: string;
    projectType: string;
    openPositions: number;
    isOpen: boolean;
    github: string;
    website: string;
    postedBy: {
        _id: string;
        name: string;
        avatar: string;
        role: string;
        skills: string[];
        bio: string;
        github: string;
    };
    createdAt: string;
}

const stageColors: Record<string, string> = {
    idea: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    mvp: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    building: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    launched: "bg-neon/20 text-neon border-neon/30",
};

const ROLES = ["frontend", "backend", "fullstack", "devops", "ml", "mobile"];

export default function ProjectDetailPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();

    const [project, setProject] = useState<Project | null>(null);
    const [applied, setApplied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [applyMessage, setApplyMessage] = useState("");
    const [applyRole, setApplyRole] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                const data = await res.json();
                setProject(data.project);
                setApplied(data.applied);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleApply = async () => {
        setApplying(true);
        setError("");
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/apply`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify({ message: applyMessage, role: applyRole }),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setApplied(true);
            setShowApplyForm(false);
            setSuccess("Application sent successfully!");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to apply");
        } finally {
            setApplying(false);
        }
    };

    const isOwner = user?._id === project?.postedBy._id;

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
        </div>
    );

    if (!project) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <p className="font-mono text-cream/40 uppercase text-[12px]">Project not found</p>
        </div>
    );

    const initials = project.postedBy.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background pb-20">
                <div className="fixed inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(111,255,0,0.04) 0%, transparent 70%)"
                }} />

                <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8">
                    {/* Back */}
                    <button
                        onClick={() => router.back()}
                        className="liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-white/10 transition-colors mb-6"
                    >
                        <ArrowLeft size={18} className="text-cream/60" />
                    </button>

                    {/* Title + stage */}
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h1 className="font-grotesk text-[28px] uppercase text-cream leading-tight flex-1">
                            {project.title}
                        </h1>
                        <span className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-mono uppercase border ${stageColors[project.stage] || ""}`}>
                            {project.stage}
                        </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-6">
                        {project.projectType && (
                            <span className="font-mono text-[10px] uppercase text-cream/30">{project.projectType}</span>
                        )}
                        {project.commitment && (
                            <span className="font-mono text-[10px] uppercase text-cream/30">· {project.commitment}</span>
                        )}
                        <span className="font-mono text-[10px] uppercase text-cream/30">
                            · {project.openPositions} open {project.openPositions === 1 ? "position" : "positions"}
                        </span>
                    </div>

                    {/* Description */}
                    <div className="liquid-glass rounded-[24px] p-5 mb-4">
                        <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-3">About</p>
                        <p className="font-mono text-[12px] text-cream/80 leading-relaxed uppercase">
                            {project.description}
                        </p>
                    </div>

                    {/* Tech stack */}
                    {project.techStack?.length > 0 && (
                        <div className="liquid-glass rounded-[24px] p-5 mb-4">
                            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-3">Tech Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {project.techStack.map((t) => (
                                    <span key={t} className="px-3 py-1 rounded-full liquid-glass font-mono text-[10px] uppercase text-cream/70">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Roles needed */}
                    {project.rolesNeeded?.length > 0 && (
                        <div className="liquid-glass rounded-[24px] p-5 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Users size={14} className="text-cream/30" />
                                <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30">Looking for</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {project.rolesNeeded.map((r) => (
                                    <span key={r} className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 font-mono text-[10px] uppercase text-purple-300">
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Links */}
                    {(project.github || project.website) && (
                        <div className="flex gap-3 mb-4">
                            {project.github && (
                                <a
                                    href={project.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="liquid-glass rounded-[12px] px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors"
                                >
                                    <Github size={14} className="text-cream/60" />
                                    <span className="font-mono text-[11px] uppercase text-cream/60">GitHub</span>
                                </a>
                            )}
                            {project.website && (
                                <a
                                    href={project.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="liquid-glass rounded-[12px] px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors"
                                >
                                    <ExternalLink size={14} className="text-cream/60" />
                                    <span className="font-mono text-[11px] uppercase text-cream/60">Website</span>
                                </a>
                            )}
                        </div>
                    )}

                    {/* Posted by */}
                    <div
                        className="liquid-glass rounded-[24px] p-5 mb-6 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                        <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-3">Posted by</p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-[14px] bg-neon/10 border border-neon/20 overflow-hidden flex items-center justify-center">
                                {project.postedBy.avatar ? (
                                    <img src={project.postedBy.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-grotesk text-[16px] text-neon">{initials}</span>
                                )}
                            </div>
                            <div>
                                <p className="font-grotesk text-[15px] uppercase text-cream">{project.postedBy.name}</p>
                                <p className="font-mono text-[10px] uppercase text-cream/40">{project.postedBy.role}</p>
                            </div>
                        </div>
                        {project.postedBy.bio && (
                            <p className="font-mono text-[11px] text-cream/50 leading-relaxed uppercase mt-3">
                                {project.postedBy.bio}
                            </p>
                        )}
                    </div>

                    {/* Owner actions */}
                    {isOwner && (
                        <div className="flex gap-3 mb-6">
                            <button
                                onClick={() => router.push(`/projects/${id}/room`)}
                                className="flex-1 py-4 rounded-[16px] bg-neon text-background font-grotesk text-[12px] uppercase tracking-widest hover:bg-neon/90 transition-colors"
                            >
                                Enter Room →
                            </button>
                            <button onClick={() => router.push(`/projects/${id}/applications`)}>
                                View Applications
                            </button>
                            <button
                                onClick={() => router.push(`/projects/${id}/applications`)}
                                className="flex-1 liquid-glass rounded-[16px] py-4 font-grotesk text-[12px] uppercase text-cream hover:bg-white/10 transition-colors"
                            >
                                View Applications
                            </button>
                            <button
                                onClick={() => router.push(`/projects/${id}/edit`)}
                                className="liquid-glass rounded-[16px] px-5 py-4 font-grotesk text-[12px] uppercase text-cream/60 hover:bg-white/10 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    )}

                    {/* Apply section */}
                    {!isOwner && project.isOpen && (
                        <div>
                            {success && (
                                <p className="font-mono text-[11px] uppercase text-neon mb-4">{success}</p>
                            )}

                            {applied ? (
                                <div className="w-full py-4 rounded-[16px] liquid-glass border border-neon/20 text-center">
                                    <span className="font-grotesk text-[13px] uppercase text-neon">Application Sent ✓</span>
                                </div>
                            ) : showApplyForm ? (
                                <div className="liquid-glass rounded-[24px] p-5 flex flex-col gap-4">
                                    <p className="font-grotesk text-[12px] uppercase text-cream">Apply to this project</p>

                                    <div>
                                        <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-2">Your role</p>
                                        <div className="flex flex-wrap gap-2">
                                            {ROLES.map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => setApplyRole(r)}
                                                    className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase transition-all ${applyRole === r ? "bg-neon text-background" : "liquid-glass text-cream/60 hover:text-cream"}`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <textarea
                                        value={applyMessage}
                                        onChange={(e) => setApplyMessage(e.target.value)}
                                        placeholder="Tell them why you're a great fit..."
                                        maxLength={500}
                                        rows={3}
                                        className="w-full liquid-glass rounded-[16px] px-4 py-3 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none resize-none"
                                    />

                                    {error && <p className="font-mono text-[11px] uppercase text-red-400">{error}</p>}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowApplyForm(false)}
                                            className="flex-1 py-3 rounded-[12px] liquid-glass font-grotesk text-[12px] uppercase text-cream/60"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleApply}
                                            disabled={applying || !applyRole}
                                            className="flex-1 py-3 rounded-[12px] bg-neon text-background font-grotesk text-[12px] uppercase tracking-widest hover:bg-neon/90 transition-colors disabled:opacity-50"
                                        >
                                            {applying ? "Sending..." : "Send Application"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowApplyForm(true)}
                                    className="w-full py-5 rounded-[16px] bg-neon text-background font-grotesk text-[14px] uppercase tracking-widest hover:bg-neon/90 transition-all active:scale-[0.99]"
                                >
                                    Apply to Collaborate →
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </AuthGuard>
    );
}