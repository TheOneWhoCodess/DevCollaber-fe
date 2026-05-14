"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import TaskBoard from "@/src/components/room/TaskBoard";
import LinkVault from "@/src/components/room/LinkVault";
import MemberList from "@/src/components/room/MemberList";
import { ArrowLeft, CheckSquare, Link2, Users } from "lucide-react";

type Tab = "tasks" | "links" | "members";

export default function ProjectRoomPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("tasks");
    const [project, setProject] = useState<any>(null);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(r => r.json())
            .then(d => setProject(d.project));
    }, [id]);

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: "tasks", label: "Tasks", icon: <CheckSquare size={14} /> },
        { key: "links", label: "Links", icon: <Link2 size={14} /> },
        { key: "members", label: "Members", icon: <Users size={14} /> },
    ];

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background pb-20">
                <div className="fixed inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(111,255,0,0.04) 0%, transparent 70%)"
                }} />

                <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <button
                            onClick={() => router.push(`/projects/${id}`)}
                            className="liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={18} className="text-cream/60" />
                        </button>
                        <div>
                            <p className="font-mono text-[10px] uppercase text-cream/30">Project Room</p>
                            <h1 className="font-grotesk text-[20px] uppercase text-cream leading-tight">
                                {project?.title || "..."}
                            </h1>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 liquid-glass rounded-[16px] p-1.5">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] font-grotesk text-[11px] uppercase tracking-wide transition-all
                                    ${tab === t.key ? "bg-neon text-background" : "text-cream/40 hover:text-cream"}`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    {tab === "tasks" && <TaskBoard projectId={id} />}
                    {tab === "links" && <LinkVault projectId={id} />}
                    {tab === "members" && <MemberList projectId={id} />}
                </div>
            </main>
        </AuthGuard>
    );
}