"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/src/components/AuthGuard";
const ROLES = ["frontend", "backend", "fullstack", "devops", "ml", "mobile"];
const PROJECT_TYPES = ["saas", "opensource", "startup", "sideproject"];
const COMMITMENTS = ["parttime", "fulltime", "flexible"];
const POPULAR_SKILLS = [
    "React", "Next.js", "TypeScript", "Node.js", "Python", "Go",
    "Rust", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS",
    "GraphQL", "TailwindCSS", "Vue", "Flutter", "Swift", "Kotlin",
];

export default function ProfileSetupPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [skillInput, setSkillInput] = useState("");

    const [form, setForm] = useState({
        role: "",
        bio: "",
        skills: [] as string[],
        lookingFor: [] as string[],
        projectIdea: "",
        projectType: "",
        commitment: "",
        experience: "",
        github: "",
        linkedin: "",
        location: "",
    });

    const set = (key: string, value: unknown) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const toggleArray = (key: "skills" | "lookingFor", value: string) =>
        setForm((prev) => ({
            ...prev,
            [key]: prev[key].includes(value)
                ? prev[key].filter((v) => v !== value)
                : [...prev[key], value],
        }));

    const addSkill = (skill: string) => {
        const s = skill.trim();
        if (s && !form.skills.includes(s)) set("skills", [...form.skills, s]);
        setSkillInput("");
    };

    const handleSubmit = async () => {
        if (!form.role) return setError("Please select your role.");
        if (form.skills.length === 0) return setError("Add at least one skill.");
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ...form, experience: Number(form.experience) || 0 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save profile");
            router.push("/discover");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const Label = ({ children }: { children: React.ReactNode }) => (
        <p className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-cream/40 mb-3">
            {children}
        </p>
    );

    const Pill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-wide transition-all duration-150
        ${active ? "bg-neon text-background" : "liquid-glass text-cream/60 hover:text-cream hover:bg-white/10"}`}
        >
            {label}
        </button>
    );

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background px-4 py-16">
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(111,255,0,0.05) 0%, transparent 70%)",
                    }}
                />

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="mb-12">
                        <span className="font-condiment text-[28px] text-neon -rotate-1 inline-block mb-2">
                            Let&apos;s build your profile
                        </span>
                        <h1 className="font-grotesk text-[32px] sm:text-[40px] uppercase text-cream leading-tight">
                            Who are you as a dev?
                        </h1>
                    </div>

                    <div className="flex flex-col gap-10">
                        {/* Role */}
                        <div>
                            <Label>Your role *</Label>
                            <div className="flex flex-wrap gap-2">
                                {ROLES.map((r) => (
                                    <Pill key={r} label={r} active={form.role === r} onClick={() => set("role", r)} />
                                ))}
                            </div>
                        </div>

                        {/* Skills */}
                        <div>
                            <Label>Your skills *</Label>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {POPULAR_SKILLS.map((s) => (
                                    <Pill key={s} label={s} active={form.skills.includes(s)} onClick={() => toggleArray("skills", s)} />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addSkill(skillInput)}
                                    placeholder="Add custom skill..."
                                    className="flex-1 liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none"
                                />
                                <button
                                    onClick={() => addSkill(skillInput)}
                                    className="liquid-glass rounded-[12px] px-5 py-3 font-grotesk text-[12px] uppercase text-cream hover:bg-white/10 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            {form.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {form.skills.map((s) => (
                                        <span
                                            key={s}
                                            onClick={() => toggleArray("skills", s)}
                                            className="px-3 py-1 rounded-full bg-neon/10 border border-neon/30 font-mono text-[11px] uppercase text-neon cursor-pointer hover:bg-neon/20 transition-colors"
                                        >
                                            {s} ×
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Looking For */}
                        <div>
                            <Label>Looking to collaborate with</Label>
                            <div className="flex flex-wrap gap-2">
                                {ROLES.map((r) => (
                                    <Pill key={r} label={r} active={form.lookingFor.includes(r)} onClick={() => toggleArray("lookingFor", r)} />
                                ))}
                            </div>
                        </div>

                        {/* Bio */}
                        <div>
                            <Label>Short bio</Label>
                            <textarea
                                value={form.bio}
                                onChange={(e) => set("bio", e.target.value)}
                                maxLength={300}
                                rows={3}
                                placeholder="What do you build? What are you working on?"
                                className="w-full liquid-glass rounded-[16px] px-5 py-4 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none resize-none leading-relaxed"
                            />
                            <p className="font-mono text-[10px] text-cream/20 mt-1 text-right">{form.bio.length}/300</p>
                        </div>

                        {/* Project Idea */}
                        <div>
                            <Label>Project idea (optional)</Label>
                            <textarea
                                value={form.projectIdea}
                                onChange={(e) => set("projectIdea", e.target.value)}
                                maxLength={500}
                                rows={3}
                                placeholder="Describe what you want to build..."
                                className="w-full liquid-glass rounded-[16px] px-5 py-4 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none resize-none leading-relaxed"
                            />
                        </div>

                        {/* Project Type */}
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

                        {/* Experience + Location */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Years of experience</Label>
                                <input
                                    type="number"
                                    min={0}
                                    max={40}
                                    value={form.experience}
                                    onChange={(e) => set("experience", e.target.value)}
                                    placeholder="0"
                                    className="w-full liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none"
                                />
                            </div>
                            <div>
                                <Label>Location</Label>
                                <input
                                    value={form.location}
                                    onChange={(e) => set("location", e.target.value)}
                                    placeholder="City, Country"
                                    className="w-full liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none"
                                />
                            </div>
                        </div>

                        {/* GitHub + LinkedIn */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>GitHub URL</Label>
                                <input
                                    value={form.github}
                                    onChange={(e) => set("github", e.target.value)}
                                    placeholder="https://github.com/..."
                                    className="w-full liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] text-cream placeholder:text-cream/20 bg-transparent outline-none"
                                />
                            </div>
                            <div>
                                <Label>LinkedIn URL</Label>
                                <input
                                    value={form.linkedin}
                                    onChange={(e) => set("linkedin", e.target.value)}
                                    placeholder="https://linkedin.com/in/..."
                                    className="w-full liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] text-cream placeholder:text-cream/20 bg-transparent outline-none"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="font-mono text-[11px] uppercase text-red-400">{error}</p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-5 rounded-[16px] bg-neon text-background font-grotesk text-[14px] uppercase tracking-widest
              hover:bg-neon/90 active:scale-[0.99] transition-all duration-150
              disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Start Matching →"}
                        </button>
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}