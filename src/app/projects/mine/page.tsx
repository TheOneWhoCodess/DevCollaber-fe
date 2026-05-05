"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { ArrowLeft, Plus } from "lucide-react";

interface MyProject {
    _id: string;
    title: string;
    stage: string;
    isOpen: boolean;
    rolesNeeded: string[];
    pendingApplications: number;
    createdAt: string;
}

const stageColors: Record<string, string> = {
    idea: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    mvp: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    building: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    launched: "bg-neon/20 text-neon border-neon/30",
};

export default function MyProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<MyProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/projects/mine`,
                    { credentials: "include" }
                );
                const data = await res.json();
                setProjects(data.projects || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, []);

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background px-4 pt-8 pb-20">
                <div className="fixed inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(111,255,0,0.04) 0%, transparent 70%)"
                }} />

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft size={18} className="text-cream/60" />
                            </button>
                            <div>
                                <h1 className="font-grotesk text-[24px] uppercase text-cream">My Projects</h1>
                                <span className="font-condiment text-[18px] text-neon">your ideas</span>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/projects/new")}
                            className="liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center bg-neon/10 border border-neon/30 hover:bg-neon/20 transition-colors"
                        >
                            <Plus size={16} className="text-neon" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center mt-20">
                            <div className="w-10 h-10 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="liquid-glass rounded-[32px] p-10 flex flex-col items-center gap-4 text-center">
                            <span className="font-condiment text-[32px] text-neon">No projects yet</span>
                            <p className="font-mono text-[11px] uppercase text-cream/40">Post your first project idea</p>
                            <button
                                onClick={() => router.push("/projects/new")}
                                className="mt-2 px-6 py-3 rounded-[12px] bg-neon text-background font-grotesk text-[12px] uppercase tracking-widest"
                            >
                                Post a project
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {projects.map((project) => (
                                <div
                                    key={project._id}
                                    onClick={() => router.push(`/projects/${project._id}`)}
                                    className="liquid-glass rounded-[24px] p-5 hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="font-grotesk text-[16px] uppercase text-cream flex-1">
                                            {project.title}
                                        </h3>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-mono uppercase border ${stageColors[project.stage] || ""}`}>
                                                {project.stage}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-mono uppercase border ${project.isOpen ? "border-neon/30 text-neon bg-neon/10" : "border-white/10 text-cream/30 bg-white/5"}`}>
                                                {project.isOpen ? "open" : "closed"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {project.rolesNeeded.map((r) => (
                                            <span key={r} className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 font-mono text-[9px] uppercase text-purple-300">
                                                {r}
                                            </span>
                                        ))}
                                    </div>

                                    {project.pendingApplications > 0 && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-2 h-2 rounded-full bg-neon animate-pulse" />
                                            <span className="font-mono text-[10px] uppercase text-neon">
                                                {project.pendingApplications} pending {project.pendingApplications === 1 ? "application" : "applications"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </AuthGuard>
    );
}