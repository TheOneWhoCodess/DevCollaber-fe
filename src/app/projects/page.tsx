"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import { Plus, Filter, Search, X, ArrowUpDown } from "lucide-react";
import NotificationBell from "@/src/components/NotificationBell";

interface Project {
    _id: string;
    title: string;
    description: string;
    techStack: string[];
    rolesNeeded: string[];
    stage: string;
    commitment: string;
    projectType: string;
    postedBy: {
        _id: string;
        name: string;
        avatar: string;
        role: string;
    };
    createdAt: string;
}

const STAGES = ["", "idea", "mvp", "building", "launched"];
const ROLES = ["", "frontend", "backend", "fullstack", "devops", "ml", "mobile"];

type SortKey = "newest" | "oldest" | "mostRoles";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest", label: "Newest" },
    { key: "oldest", label: "Oldest" },
    { key: "mostRoles", label: "Most roles open" },
];

const stageColors: Record<string, string> = {
    idea: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    mvp: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    building: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    launched: "bg-neon/20 text-neon border-neon/30",
};

/** Ghost card shown while the list is loading — mirrors the real card's shape
    so the layout doesn't jump once data arrives. */
function SkeletonCard() {
    return (
        <div className="liquid-glass rounded-[24px] p-5 animate-pulse">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="h-4 w-2/3 rounded-full bg-white/10" />
                <div className="h-5 w-14 rounded-full bg-white/10" />
            </div>
            <div className="h-3 w-full rounded-full bg-white/5 mb-2" />
            <div className="h-3 w-4/5 rounded-full bg-white/5 mb-4" />
            <div className="flex gap-1.5 mb-4">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-5 w-16 rounded-full bg-white/5" />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10" />
                    <div className="h-3 w-20 rounded-full bg-white/5" />
                </div>
                <div className="h-3 w-10 rounded-full bg-white/5" />
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStage, setFilterStage] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("newest");
    const [showSort, setShowSort] = useState(false);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStage) params.set("stage", filterStage);
            if (filterRole) params.set("role", filterRole);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/projects?${params}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            const data = await res.json();
            setProjects(data.projects || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProjects(); }, [filterStage, filterRole]);

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor(diff / 3600000);
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return "just now";
    };

    // Search + sort run client-side over the already-fetched list — stage/role
    // filters stay server-side (existing behavior), search/sort don't need
    // a round trip since the full matching set is already in memory.
    const visibleProjects = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = projects;

        if (q) {
            list = list.filter((p) => {
                const haystack = [p.title, p.description, ...(p.techStack || [])]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(q);
            });
        }

        const sorted = [...list];
        if (sortKey === "newest") {
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortKey === "oldest") {
            sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else if (sortKey === "mostRoles") {
            sorted.sort((a, b) => (b.rolesNeeded?.length || 0) - (a.rolesNeeded?.length || 0));
        }
        return sorted;
    }, [projects, search, sortKey]);

    const hasActiveFilters = Boolean(filterStage || filterRole || search);

    const clearAll = () => {
        setFilterStage("");
        setFilterRole("");
        setSearch("");
    };

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background pb-28">
                <div className="fixed inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(111,255,0,0.04) 0%, transparent 70%)"
                }} />

                <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="font-grotesk text-[28px] uppercase text-cream">Projects</h1>
                            <span className="font-condiment text-[20px] text-neon -rotate-1 inline-block">
                                find your next build
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <NotificationBell />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors ${(filterStage || filterRole) ? "bg-neon/20 border border-neon/30" : "hover:bg-white/10"}`}
                            >
                                <Filter size={16} className={(filterStage || filterRole) ? "text-neon" : "text-cream/60"} />
                            </button>
                            <button
                                onClick={() => router.push("/projects/new")}
                                className="liquid-glass h-10 px-4 rounded-[12px] flex items-center gap-2 bg-neon/10 border border-neon/30 hover:bg-neon/20 transition-colors"
                            >
                                <Plus size={16} className="text-neon" />
                                <span className="font-grotesk text-[11px] uppercase text-neon">Post</span>
                            </button>
                        </div>
                    </div>

                    {/* Search + sort */}
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 liquid-glass rounded-[14px] px-4 py-3 flex items-center gap-2.5">
                            <Search size={14} className="text-cream/30 flex-shrink-0" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by title, tech, or keyword..."
                                className="flex-1 bg-transparent font-mono text-[12px] text-cream placeholder:text-cream/20 outline-none min-w-0"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="flex-shrink-0">
                                    <X size={13} className="text-cream/30 hover:text-cream/60" />
                                </button>
                            )}
                        </div>

                        <div className="relative flex-shrink-0">
                            <button
                                onClick={() => setShowSort((s) => !s)}
                                className="liquid-glass h-full w-11 rounded-[14px] flex items-center justify-center hover:bg-white/10 transition-colors"
                                aria-label="Sort projects"
                            >
                                <ArrowUpDown size={14} className="text-cream/60" />
                            </button>
                            {showSort && (
                                <div className="liquid-glass absolute right-0 top-12 z-20 w-44 rounded-[14px] p-1.5">
                                    {SORT_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.key}
                                            onClick={() => { setSortKey(opt.key); setShowSort(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-[10px] font-mono text-[11px] uppercase transition-colors ${sortKey === opt.key ? "bg-neon/20 text-neon" : "text-cream/60 hover:bg-white/10 hover:text-cream"}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active filter chips */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            {filterStage && (
                                <button
                                    onClick={() => setFilterStage("")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass font-mono text-[10px] uppercase text-cream/70 hover:text-cream transition-colors"
                                >
                                    Stage: {filterStage}
                                    <X size={11} />
                                </button>
                            )}
                            {filterRole && (
                                <button
                                    onClick={() => setFilterRole("")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass font-mono text-[10px] uppercase text-cream/70 hover:text-cream transition-colors"
                                >
                                    Role: {filterRole}
                                    <X size={11} />
                                </button>
                            )}
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass font-mono text-[10px] uppercase text-cream/70 hover:text-cream transition-colors"
                                >
                                    "{search}"
                                    <X size={11} />
                                </button>
                            )}
                            <button
                                onClick={clearAll}
                                className="px-3 py-1.5 rounded-full font-mono text-[10px] uppercase text-cream/30 hover:text-cream/60 transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Filters panel */}
                    {showFilters && (
                        <div className="liquid-glass rounded-[20px] p-4 mb-6">
                            <div className="mb-4">
                                <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-2">Stage</p>
                                <div className="flex flex-wrap gap-2">
                                    {STAGES.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setFilterStage(s)}
                                            className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase transition-all ${filterStage === s ? "bg-neon text-background" : "liquid-glass text-cream/60 hover:text-cream"}`}
                                        >
                                            {s || "All"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-2">Role needed</p>
                                <div className="flex flex-wrap gap-2">
                                    {ROLES.map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setFilterRole(r)}
                                            className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase transition-all ${filterRole === r ? "bg-neon text-background" : "liquid-glass text-cream/60 hover:text-cream"}`}
                                        >
                                            {r || "All"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My projects button */}
                    <button
                        onClick={() => router.push("/projects/mine")}
                        className="w-full liquid-glass rounded-[16px] px-5 py-3 flex items-center justify-between mb-6 hover:bg-white/10 transition-colors"
                    >
                        <span className="font-grotesk text-[12px] uppercase text-cream/60">My Projects</span>
                        <span className="font-mono text-[11px] text-cream/30">→</span>
                    </button>

                    {/* Projects list */}
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : visibleProjects.length === 0 ? (
                        <div className="liquid-glass rounded-[32px] p-10 flex flex-col items-center gap-4 text-center mt-10">
                            <span className="font-condiment text-[32px] text-neon">
                                {hasActiveFilters ? "No matches" : "No projects yet"}
                            </span>
                            <p className="font-mono text-[11px] uppercase text-cream/40">
                                {hasActiveFilters
                                    ? "Try a different search or clear your filters"
                                    : "Be the first to post a project"}
                            </p>
                            {hasActiveFilters ? (
                                <button
                                    onClick={clearAll}
                                    className="mt-2 px-6 py-3 rounded-[12px] liquid-glass font-grotesk text-[12px] uppercase tracking-widest text-cream hover:bg-white/10 transition-colors"
                                >
                                    Clear filters
                                </button>
                            ) : (
                                <button
                                    onClick={() => router.push("/projects/new")}
                                    className="mt-2 px-6 py-3 rounded-[12px] bg-neon text-background font-grotesk text-[12px] uppercase tracking-widest"
                                >
                                    Post a project
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {visibleProjects.map((project) => {
                                const initials = project.postedBy.name
                                    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

                                return (
                                    <div
                                        key={project._id}
                                        onClick={() => router.push(`/projects/${project._id}`)}
                                        className="liquid-glass rounded-[24px] p-5 hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                        {/* Top row */}
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <h3 className="font-grotesk text-[16px] uppercase text-cream leading-tight flex-1">
                                                {project.title}
                                            </h3>
                                            <span className={`flex-shrink-0 px-2 py-1 rounded-full text-[9px] font-mono uppercase border ${stageColors[project.stage] || "bg-white/10 text-cream/60 border-white/20"}`}>
                                                {project.stage}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <p className="font-mono text-[11px] text-cream/50 leading-relaxed mb-4 line-clamp-2 uppercase">
                                            {project.description}
                                        </p>

                                        {/* Tech stack */}
                                        {project.techStack?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {project.techStack.slice(0, 5).map((t) => (
                                                    <span key={t} className="px-2 py-0.5 rounded-full liquid-glass font-mono text-[9px] uppercase text-cream/60">
                                                        {t}
                                                    </span>
                                                ))}
                                                {project.techStack.length > 5 && (
                                                    <span className="px-2 py-0.5 rounded-full liquid-glass font-mono text-[9px] uppercase text-cream/30">
                                                        +{project.techStack.length - 5}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Roles needed */}
                                        {project.rolesNeeded?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {project.rolesNeeded.map((r) => (
                                                    <span key={r} className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 font-mono text-[9px] uppercase text-purple-300">
                                                        {r} needed
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-neon/10 border border-neon/20 overflow-hidden flex items-center justify-center">
                                                    {project.postedBy.avatar ? (
                                                        <img src={project.postedBy.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-grotesk text-[8px] text-neon">{initials}</span>
                                                    )}
                                                </div>
                                                <span className="font-mono text-[10px] uppercase text-cream/40">
                                                    {project.postedBy.name}
                                                </span>
                                            </div>
                                            <span className="font-mono text-[9px] text-cream/20 uppercase">
                                                {timeAgo(project.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom nav */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="liquid-glass rounded-[28px] px-6 py-3 flex items-center gap-6">
                        {[
                            { label: "Discover", href: "/discover" },
                            { label: "Projects", href: "/projects", active: true },
                            { label: "Matches", href: "/matches" },
                            { label: "Profile", href: "/profile-edit" },
                        ].map((item) => (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className={`font-grotesk text-[11px] uppercase tracking-widest transition-colors ${item.active ? "text-neon" : "text-cream/40 hover:text-cream"}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}