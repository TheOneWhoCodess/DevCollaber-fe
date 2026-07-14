"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
import UpgradeModal from "@/src/components/upgradeModal";
import { ArrowLeft, Sparkles, Check, X as XIcon } from "lucide-react";

const ROLES = ["frontend", "backend", "fullstack", "devops", "ml", "mobile"];
const STAGES = ["idea", "mvp", "building", "launched"];
const PROJECT_TYPES = ["saas", "opensource", "startup", "sideproject"];
const COMMITMENTS = ["parttime", "fulltime", "flexible"];
const POPULAR_SKILLS = [
    "React", "Next.js", "TypeScript", "Node.js", "Python", "Go",
    "Rust", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS",
    "GraphQL", "TailwindCSS", "Vue", "Flutter", "Swift", "Kotlin",
];

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [techInput, setTechInput] = useState("");

    // AI expansion state — kept separate from form.description so the
    // suggestion is a non-destructive preview until the user accepts it.
    const [expanding, setExpanding] = useState(false);
    const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
    const [expandError, setExpandError] = useState("");
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const [form, setForm] = useState({
        title: "",
        description: "",
        techStack: [] as string[],
        rolesNeeded: [] as string[],
        stage: "idea",
        commitment: "",
        projectType: "",
        openPositions: 1,
        github: "",
        website: "",
    });

    const set = (key: string, value: unknown) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const toggleArray = (key: "techStack" | "rolesNeeded", value: string) =>
        setForm((prev) => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter((v) => v !== value)
                : [...prev[key], value],
        }));

    const addTech = (tech: string) => {
        const t = tech.trim();
        if (t && !form.techStack.includes(t)) set("techStack", [...form.techStack, t]);
        setTechInput("");
    };

    const expandDescription = async () => {
        if (!form.description.trim()) {
            setExpandError("Write a rough draft first — even a sentence or two");
            return;
        }
        setExpanding(true);
        setExpandError("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/projects/expand-description`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                        draft: form.description,
                        title: form.title,
                        techStack: form.techStack,
                        rolesNeeded: form.rolesNeeded,
                        projectType: form.projectType,
                        stage: form.stage,
                    }),
                }
            );

            if (res.status === 429) {
                const data = await res.json();
                if (data.limitReached) setShowUpgradeModal(true);
                return;
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to expand description");
            setExpandedSuggestion(data.description);
        } catch (err) {
            setExpandError(err instanceof Error ? err.message : "Failed to expand description");
        } finally {
            setExpanding(false);
        }
    };

    const acceptSuggestion = () => {
        if (expandedSuggestion) set("description", expandedSuggestion);
        setExpandedSuggestion(null);
    };

    const handleSubmit = async () => {
        if (!form.title) return setError("Title is required");
        if (!form.description) return setError("Description is required");
        if (form.rolesNeeded.length === 0) return setError("Select at least one role needed");

        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify(form),
                }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            router.push(`/projects/${data.project._id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    const Label = ({ children }: { children: React.ReactNode }) => (
        <p className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-cream/40 mb-3">{children}</p>
    );

    const Pill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-wide transition-all ${active ? "bg-neon text-background" : "liquid-glass text-cream/60 hover:text-cream hover:bg-white/10"}`}
        >
            {label}
        </button>
    );

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background px-4 py-8 pb-20">
                <div className="fixed inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(111,255,0,0.05) 0%, transparent 70%)"
                }} />

                <div className="relative z-10 max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => router.back()}
                            className="liquid-glass w-10 h-10 rounded-[12px] flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={18} className="text-cream/60" />
                        </button>
                        <div>
                            <span className="font-condiment text-[22px] text-neon -rotate-1 inline-block">
                                Post a project
                            </span>
                            <h1 className="font-grotesk text-[24px] uppercase text-cream leading-tight">
                                Find your team
                            </h1>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* Title */}
                        <div>
                            <Label>Project title *</Label>
                            <input
                                value={form.title}
                                onChange={(e) => set("title", e.target.value)}
                                placeholder="What are you building?"
                                maxLength={100}
                                className="w-full liquid-glass rounded-[12px] px-4 py-3 font-mono text-[13px] text-cream placeholder:text-cream/20 bg-transparent outline-none"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-cream/40">Description *</p>
                                <button
                                    onClick={expandDescription}
                                    disabled={expanding || !form.description.trim()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass font-mono text-[9px] uppercase text-neon/80 hover:text-neon hover:bg-neon/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Sparkles size={11} className={expanding ? "animate-pulse" : ""} />
                                    {expanding ? "Expanding..." : "Expand with AI"}
                                </button>
                            </div>
                            <textarea
                                value={form.description}
                                onChange={(e) => { set("description", e.target.value); setExpandedSuggestion(null); }}
                                placeholder="Describe your project, what problem it solves, and what you've done so far... (even a rough sentence is fine — AI can help expand it)"
                                maxLength={1000}
                                rows={4}
                                className="w-full liquid-glass rounded-[16px] px-5 py-4 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none resize-none leading-relaxed"
                            />
                            <div className="flex items-center justify-between mt-1">
                                {expandError ? (
                                    <p className="font-mono text-[10px] text-red-400 uppercase">{expandError}</p>
                                ) : <span />}
                                <p className="font-mono text-[10px] text-cream/20 text-right">{form.description.length}/1000</p>
                            </div>

                            {/* AI suggestion preview — non-destructive until accepted */}
                            {expandedSuggestion && (
                                <div className="mt-3 liquid-glass rounded-[16px] p-4 border border-neon/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={11} className="text-neon/70" />
                                        <p className="font-grotesk text-[9px] uppercase tracking-[0.2em] text-neon/70">AI suggestion</p>
                                    </div>
                                    <p className="font-mono text-[11px] text-cream/70 leading-relaxed uppercase mb-3">
                                        {expandedSuggestion}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={acceptSuggestion}
                                            className="flex items-center gap-1.5 font-grotesk text-[9px] uppercase tracking-widest text-neon hover:text-neon/80 transition-colors"
                                        >
                                            <Check size={11} />
                                            Use this
                                        </button>
                                        <button
                                            onClick={() => setExpandedSuggestion(null)}
                                            className="flex items-center gap-1.5 font-grotesk text-[9px] uppercase tracking-widest text-cream/40 hover:text-cream/60 transition-colors"
                                        >
                                            <XIcon size={11} />
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stage */}
                        <div>
                            <Label>Project stage</Label>
                            <div className="flex flex-wrap gap-2">
                                {STAGES.map((s) => (
                                    <Pill key={s} label={s} active={form.stage === s} onClick={() => set("stage", s)} />
                                ))}
                            </div>
                        </div>

                        {/* Roles needed */}
                        <div>
                            <Label>Roles needed *</Label>
                            <div className="flex flex-wrap gap-2">
                                {ROLES.map((r) => (
                                    <Pill key={r} label={r} active={form.rolesNeeded.includes(r)} onClick={() => toggleArray("rolesNeeded", r)} />
                                ))}
                            </div>
                        </div>

                        {/* Tech stack */}
                        <div>
                            <Label>Tech stack</Label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {POPULAR_SKILLS.map((s) => (
                                    <Pill key={s} label={s} active={form.techStack.includes(s)} onClick={() => toggleArray("techStack", s)} />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addTech(techInput)}
                                    placeholder="Add custom tech..."
                                    className="flex-1 liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none"
                                />
                                <button
                                    onClick={() => addTech(techInput)}
                                    className="liquid-glass rounded-[12px] px-4 py-3 font-grotesk text-[12px] uppercase text-cream hover:bg-white/10 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Project type */}
                        <div>
                            <Label>Project type</Label>
                            <div className="flex flex-wrap gap-2">
                                {PROJECT_TYPES.map((t) => (
                                    <Pill key={t} label={t} active={form.projectType === t} onClick={() => set("projectType", t)} />
                                ))}
                            </div>
                        </div>

                        {/* Commitment */}
                        <div>
                            <Label>Commitment level</Label>
                            <div className="flex flex-wrap gap-2">
                                {COMMITMENTS.map((c) => (
                                    <Pill key={c} label={c} active={form.commitment === c} onClick={() => set("commitment", c)} />
                                ))}
                            </div>
                        </div>

                        {/* Open positions */}
                        <div>
                            <Label>Open positions</Label>
                            <input
                                type="number"
                                min={1}
                                max={10}
                                value={form.openPositions}
                                onChange={(e) => set("openPositions", Number(e.target.value))}
                                className="w-32 liquid-glass rounded-[12px] px-4 py-3 font-mono text-[13px] text-cream bg-transparent outline-none"
                            />
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>GitHub URL</Label>
                                <input
                                    value={form.github}
                                    onChange={(e) => set("github", e.target.value)}
                                    placeholder="https://github.com/..."
                                    className="w-full liquid-glass rounded-[12px] px-4 py-3 font-mono text-[11px] text-cream placeholder:text-cream/20 bg-transparent outline-none"
                                />
                            </div>
                            <div>
                                <Label>Website</Label>
                                <input
                                    value={form.website}
                                    onChange={(e) => set("website", e.target.value)}
                                    placeholder="https://..."
                                    className="w-full liquid-glass rounded-[12px] px-4 py-3 font-mono text-[11px] text-cream placeholder:text-cream/20 bg-transparent outline-none"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="font-mono text-[11px] uppercase text-red-400">{error}</p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-5 rounded-[16px] bg-neon text-background font-grotesk text-[14px] uppercase tracking-widest hover:bg-neon/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Posting..." : "Post Project →"}
                        </button>
                    </div>
                </div>

                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                />
            </main>
        </AuthGuard>
    );
}