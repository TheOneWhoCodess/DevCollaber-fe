"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { ArrowLeft, Check, X, Github } from "lucide-react";

interface Application {
    _id: string;
    applicant: {
        _id: string;
        name: string;
        avatar: string;
        role: string;
        skills: string[];
        bio: string;
        github: string;
    };
    role: string;
    message: string;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
}

const roleColors: Record<string, string> = {
    frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    backend: "bg-green-500/20 text-green-300 border-green-500/30",
    fullstack: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    devops: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    ml: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    mobile: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default function ApplicationsPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/applications`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                if (res.status === 403) { router.push("/projects"); return; }
                const data = await res.json();
                setApplications(data.applications || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, [id, router]);

    const updateStatus = async (appId: string, status: "accepted" | "rejected") => {
        setUpdating(appId);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}/applications/${appId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify({ status }),
                }
            );
            const data = await res.json();
            if (res.ok) {
                setApplications((prev) =>
                    prev.map((a) => a._id === appId ? { ...a, status: data.application.status } : a)
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const pending = applications.filter((a) => a.status === "pending");
    const decided = applications.filter((a) => a.status !== "pending");

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor(diff / 3600000);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "just now";
    };

    const AppCard = ({ app }: { app: Application }) => {
        const initials = app.applicant.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

        return (
            <div className="liquid-glass rounded-[24px] p-5">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-[14px] bg-neon/10 border border-neon/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {app.applicant.avatar ? (
                            <img src={app.applicant.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-grotesk text-[16px] text-neon">{initials}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-grotesk text-[15px] uppercase text-cream">{app.applicant.name}</h3>
                            {app.role && (
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase border ${roleColors[app.role] || "bg-white/10 text-cream/60 border-white/20"}`}>
                                    {app.role}
                                </span>
                            )}
                        </div>
                        <p className="font-mono text-[10px] uppercase text-cream/40 mt-0.5">{timeAgo(app.createdAt)}</p>
                    </div>
                    {/* Status badge */}
                    {app.status !== "pending" && (
                        <span className={`px-3 py-1 rounded-full text-[9px] font-mono uppercase border flex-shrink-0 ${app.status === "accepted"
                            ? "bg-neon/20 text-neon border-neon/30"
                            : "bg-red-500/20 text-red-300 border-red-500/30"
                            }`}>
                            {app.status}
                        </span>
                    )}
                </div>

                {/* Skills */}
                {app.applicant.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {app.applicant.skills.slice(0, 5).map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-full liquid-glass font-mono text-[9px] uppercase text-cream/60">
                                {s}
                            </span>
                        ))}
                    </div>
                )}

                {/* Bio */}
                {app.applicant.bio && (
                    <p className="font-mono text-[11px] text-cream/50 leading-relaxed uppercase mb-3">
                        {app.applicant.bio}
                    </p>
                )}

                {/* Message */}
                {app.message && (
                    <div className="bg-white/5 rounded-[16px] px-4 py-3 mb-4">
                        <p className="font-grotesk text-[9px] uppercase tracking-[0.2em] text-cream/30 mb-1">Their message</p>
                        <p className="font-mono text-[11px] text-cream/70 leading-relaxed uppercase">{app.message}</p>
                    </div>
                )}

                {/* GitHub link */}
                {app.applicant.github && (
                    <a
                        href={app.applicant.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 liquid-glass rounded-[10px] px-3 py-2 w-fit hover:bg-white/10 transition-colors mb-4"
                    >
                        <Github size={12} className="text-cream/60" />
                        <span className="font-mono text-[10px] uppercase text-cream/60">View GitHub</span>
                    </a>
                )}

                {/* Actions */}
                {app.status === "pending" && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => updateStatus(app._id, "rejected")}
                            disabled={updating === app._id}
                            className="flex-1 py-3 rounded-[12px] liquid-glass border border-red-500/20 flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                            <X size={14} className="text-red-400" />
                            <span className="font-grotesk text-[11px] uppercase text-red-400">Decline</span>
                        </button>
                        <button
                            onClick={() => updateStatus(app._id, "accepted")}
                            disabled={updating === app._id}
                            className="flex-1 py-3 rounded-[12px] bg-neon/10 border border-neon/30 flex items-center justify-center gap-2 hover:bg-neon/20 transition-colors disabled:opacity-50"
                        >
                            <Check size={14} className="text-neon" />
                            <span className="font-grotesk text-[11px] uppercase text-neon">Accept</span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background px-4 pt-8 pb-20">
                <div className="fixed inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(111,255,0,0.04) 0%, transparent 70%)"
                }} />

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.back()}
                            className="liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={18} className="text-cream/60" />
                        </button>
                        <div>
                            <h1 className="font-grotesk text-[24px] uppercase text-cream">Applications</h1>
                            <span className="font-condiment text-[18px] text-neon">find your teammate</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center mt-20">
                            <div className="w-10 h-10 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="liquid-glass rounded-[32px] p-10 flex flex-col items-center gap-4 text-center">
                            <span className="font-condiment text-[32px] text-neon">No applications yet</span>
                            <p className="font-mono text-[11px] uppercase text-cream/40">
                                Share your project to get more applicants
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {pending.length > 0 && (
                                <div>
                                    <p className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-cream/30 mb-4">
                                        Pending · {pending.length}
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        {pending.map((app) => <AppCard key={app._id} app={app} />)}
                                    </div>
                                </div>
                            )}
                            {decided.length > 0 && (
                                <div>
                                    <p className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-cream/30 mb-4">
                                        Decided · {decided.length}
                                    </p>
                                    <div className="flex flex-col gap-4">
                                        {decided.map((app) => <AppCard key={app._id} app={app} />)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </AuthGuard>
    );
}