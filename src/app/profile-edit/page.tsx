"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/lib/useAuth";
import AuthGuard from "@/src/components/AuthGuard";
import { Camera, LogOut, Check } from "lucide-react";

const ROLES = ["frontend", "backend", "fullstack", "devops", "ml", "mobile"];
const PROJECT_TYPES = ["saas", "opensource", "startup", "sideproject"];
const COMMITMENTS = ["parttime", "fulltime", "flexible"];
const POPULAR_SKILLS = [
    "React", "Next.js", "TypeScript", "Node.js", "Python", "Go",
    "Rust", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS",
    "GraphQL", "TailwindCSS", "Vue", "Flutter", "Swift", "Kotlin",
];

export default function ProfileEditPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [avatarPreview, setAvatarPreview] = useState("");

    const [form, setForm] = useState({
        name: "",
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
        isAvailable: true,
    });

    /* ── Prefill form with current user data ─────── */
    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                { credentials: "include" }
            );
            const data = await res.json();
            const u = data.user;

            setAvatarPreview(u.avatar || "");
            setForm({
                name: u.name || "",
                role: u.role || "",
                bio: u.bio || "",
                skills: u.skills || [],
                lookingFor: u.lookingFor || [],
                projectIdea: u.projectIdea || "",
                projectType: u.projectType || "",
                commitment: u.commitment || "",
                experience: u.experience?.toString() || "",
                github: u.github || "",
                linkedin: u.linkedin || "",
                location: u.location || "",
                isAvailable: u.isAvailable ?? true,
            });
        };

        fetchProfile();
    }, [user]);

    /* ── Helpers ─────────────────────────────────── */
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

    /* ── Avatar upload ───────────────────────────── */
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);

        setAvatarLoading(true);
        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/profile/avatar`,
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setAvatarPreview(data.avatar);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Avatar upload failed");
        } finally {
            setAvatarLoading(false);
        }
    };

    /* ── Save profile ────────────────────────────── */
    const handleSave = async () => {
        if (!form.role) return setError("Please select your role.");
        if (form.skills.length === 0) return setError("Add at least one skill.");

        setLoading(true);
        setError("");

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        ...form,
                        experience: Number(form.experience) || 0,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setLoading(false);
        }
    };

    /* ── Logout ──────────────────────────────────── */
    const handleLogout = async () => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });
        router.push("/auth");
    };

    const Label = ({ children }: { children: React.ReactNode }) => (
        <p className="font-grotesk text-[11px] uppercase tracking-[0.2em] text-cream/40 mb-3">
            {children}
        </p>
    );

    const Pill = ({
        label, active, onClick,
    }: {
        label: string; active: boolean; onClick: () => void;
    }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-wide transition-all duration-150
        ${active ? "bg-neon text-background" : "liquid-glass text-cream/60 hover:text-cream hover:bg-white/10"}`}
        >
            {label}
        </button>
    );

    if (authLoading) return null;

    const initials = form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background px-4 py-12 pb-28">
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(111,255,0,0.05) 0%, transparent 70%)",
                    }}
                />

                <div className="relative z-10 max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <span className="font-condiment text-[24px] text-neon inline-block -rotate-1 mb-1">
                                Edit your profile
                            </span>
                            <h1 className="font-grotesk text-[28px] uppercase text-cream leading-tight">
                                Your Dev Identity
                            </h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="liquid-glass rounded-[12px] px-4 py-2 flex items-center gap-2 hover:bg-red-500/10 hover:border-red-500/20 transition-colors"
                        >
                            <LogOut size={14} className="text-red-400" />
                            <span className="font-mono text-[11px] uppercase text-red-400">
                                Logout
                            </span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-10">
                        {/* ── Avatar ───────────────────────────── */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                {/* Avatar display */}
                                <div className="w-24 h-24 rounded-[24px] bg-neon/10 border border-neon/20 overflow-hidden flex items-center justify-center">
                                    {avatarLoading ? (
                                        <div className="w-6 h-6 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
                                    ) : avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="font-grotesk text-[28px] text-neon">
                                            {initials}
                                        </span>
                                    )}
                                </div>

                                {/* Camera button */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-neon flex items-center justify-center shadow-lg hover:bg-neon/90 transition-colors"
                                >
                                    <Camera size={14} className="text-background" />
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <p className="font-mono text-[10px] uppercase text-cream/30">
                                Click camera to upload · Max 5MB
                            </p>
                        </div>

                        {/* ── Availability toggle ───────────────── */}
                        <div className="liquid-glass rounded-[20px] px-5 py-4 flex items-center justify-between">
                            <div>
                                <p className="font-grotesk text-[13px] uppercase text-cream">
                                    Available for collaboration
                                </p>
                                <p className="font-mono text-[10px] uppercase text-cream/30 mt-0.5">
                                    {form.isAvailable
                                        ? "You appear in discover feed"
                                        : "Hidden from discover feed"}
                                </p>
                            </div>
                            <button
                                onClick={() => set("isAvailable", !form.isAvailable)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${form.isAvailable ? "bg-neon" : "bg-white/10"
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-background transition-all ${form.isAvailable ? "left-7" : "left-1"
                                        }`}
                                />
                            </button>
                        </div>

                        {/* ── Name ─────────────────────────────── */}
                        <div>
                            <Label>Display name</Label>
                            <input
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                className="w-full liquid-glass rounded-[12px] px-4 py-3 font-mono text-[13px] text-cream placeholder:text-cream/20 bg-transparent outline-none"
                            />
                        </div>

                        {/* ── Role ─────────────────────────────── */}
                        <div>
                            <Label>Your role *</Label>
                            <div className="flex flex-wrap gap-2">
                                {ROLES.map((r) => (
                                    <Pill key={r} label={r} active={form.role === r} onClick={() => set("role", r)} />
                                ))}
                            </div>
                        </div>

                        {/* ── Skills ───────────────────────────── */}
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

                        {/* ── Looking For ──────────────────────── */}
                        <div>
                            <Label>Looking to collaborate with</Label>
                            <div className="flex flex-wrap gap-2">
                                {ROLES.map((r) => (
                                    <Pill key={r} label={r} active={form.lookingFor.includes(r)} onClick={() => toggleArray("lookingFor", r)} />
                                ))}
                            </div>
                        </div>

                        {/* ── Bio ──────────────────────────────── */}
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
                            <p className="font-mono text-[10px] text-cream/20 mt-1 text-right">
                                {form.bio.length}/300
                            </p>
                        </div>

                        {/* ── Project Idea ─────────────────────── */}
                        <div>
                            <Label>Project idea</Label>
                            <textarea
                                value={form.projectIdea}
                                onChange={(e) => set("projectIdea", e.target.value)}
                                maxLength={500}
                                rows={3}
                                placeholder="Describe what you want to build..."
                                className="w-full liquid-glass rounded-[16px] px-5 py-4 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none resize-none leading-relaxed"
                            />
                        </div>

                        {/* ── Project Type ─────────────────────── */}
                        <div>
                            <Label>Project type</Label>
                            <div className="flex flex-wrap gap-2">
                                {PROJECT_TYPES.map((t) => (
                                    <Pill key={t} label={t} active={form.projectType === t} onClick={() => set("projectType", t)} />
                                ))}
                            </div>
                        </div>

                        {/* ── Commitment ───────────────────────── */}
                        <div>
                            <Label>Commitment level</Label>
                            <div className="flex flex-wrap gap-2">
                                {COMMITMENTS.map((c) => (
                                    <Pill key={c} label={c} active={form.commitment === c} onClick={() => set("commitment", c)} />
                                ))}
                            </div>
                        </div>

                        {/* ── Experience + Location ────────────── */}
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

                        {/* ── GitHub + LinkedIn ────────────────── */}
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

                        {/* ── Save button ───────────────────────── */}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`w-full py-5 rounded-[16px] font-grotesk text-[14px] uppercase tracking-widest transition-all duration-300
                                ${saved
                                    ? "bg-white/10 text-neon border border-neon/30"
                                    : "bg-neon text-background hover:bg-neon/90"
                                } disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]`}
                        >
                            {saved ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Check size={16} /> Saved
                                </span>
                            ) : loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>

                {/* Bottom nav */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <div className="liquid-glass rounded-[28px] px-6 py-3 flex items-center gap-8">
                        {[
                            { label: "Discover", href: "/discover", active: false },
                            { label: "Matches", href: "/matches", active: false },
                            { label: "Profile", href: "/profile-edit", active: true },
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