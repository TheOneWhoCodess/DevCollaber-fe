"use client";

import { useEffect, useState } from "react";
import { Github, Star, GitFork, Code2, CheckCircle2 } from "lucide-react";

interface GitHubData {
    repos: { name: string; stars: number; forks: number; language: string; url: string }[];
    languages: Record<string, number>;
    contributions: number;
    followers: number;
}

interface VerifiedSkill {
    skill: string;
    verified: boolean;
    /** "language" = confirmed via GitHub's detected language bytes (strong signal).
        "repo" = confirmed via a repo-name keyword match (weaker, since it's just
        a naming heuristic, not actual dependency/code inspection). */
    via?: "language" | "repo";
}

// Maps a self-tagged skill to the exact GitHub language name(s) it corresponds
// to. Only real programming languages can be verified this way — frameworks
// and tools aren't detected as "languages" by GitHub's API.
const LANGUAGE_ALIASES: Record<string, string[]> = {
    javascript: ["JavaScript"],
    typescript: ["TypeScript"],
    python: ["Python"],
    go: ["Go"],
    golang: ["Go"],
    rust: ["Rust"],
    java: ["Java"],
    "c++": ["C++"],
    cpp: ["C++"],
    "c#": ["C#"],
    csharp: ["C#"],
    swift: ["Swift"],
    kotlin: ["Kotlin"],
    php: ["PHP"],
    ruby: ["Ruby"],
    dart: ["Dart"],
    flutter: ["Dart"],
    html: ["HTML"],
    css: ["CSS"],
    tailwindcss: ["CSS"],
};

// Frameworks/tools GitHub doesn't report as "languages" — checked instead
// against repo names for a loose keyword match. Intentionally simple: this
// is a naming heuristic, not dependency inspection, and is labeled as such
// in the UI rather than presented with the same confidence as a language match.
const REPO_NAME_HINTS: Record<string, string[]> = {
    react: ["react"],
    "next.js": ["next"],
    nextjs: ["next"],
    "node.js": ["node"],
    nodejs: ["node"],
    vue: ["vue"],
    docker: ["docker"],
    kubernetes: ["k8s", "kube"],
    graphql: ["graphql"],
    mongodb: ["mongo"],
    postgresql: ["postgres", "pg"],
    aws: ["aws"],
    express: ["express", "api", "server"],
};

function normalize(s: string) {
    return s.toLowerCase().replace(/[.\s]/g, "");
}

function verifySkill(skill: string, data: GitHubData): VerifiedSkill {
    const norm = normalize(skill);

    for (const [alias, langs] of Object.entries(LANGUAGE_ALIASES)) {
        if (normalize(alias) === norm && langs.some((l) => data.languages?.[l] !== undefined)) {
            return { skill, verified: true, via: "language" };
        }
    }

    const hints = REPO_NAME_HINTS[norm] || REPO_NAME_HINTS[skill.toLowerCase()];
    if (hints) {
        const match = data.repos?.some((r) =>
            hints.some((h) => r.name.toLowerCase().includes(h))
        );
        if (match) return { skill, verified: true, via: "repo" };
    }

    return { skill, verified: false };
}

export default function GitHubStats({
    username,
    skills,
}: {
    username: string;
    /** Self-tagged skills from the user's profile — pass these to enable
        the "verified skills" comparison against real GitHub activity. */
    skills?: string[];
}) {
    const [data, setData] = useState<GitHubData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/github/stats?username=${username}`
                );
                const json = await res.json();

                if (res.ok && json && typeof json === "object" && json.languages && Array.isArray(json.repos)) {
                    setData(json);
                } else {
                    setData(null);
                }
            } catch {
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, [username]);

    if (loading) return (
        <div className="liquid-glass rounded-[24px] p-5 animate-pulse">
            <div className="h-4 w-32 bg-white/10 rounded mb-4" />
            <div className="h-3 w-full bg-white/5 rounded" />
        </div>
    );

    if (!data) return null;

    const languages = data.languages || {};
    const repos = data.repos || [];
    const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
    const topLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    const langColors: Record<string, string> = {
        TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
        Go: "#00ADD8", Rust: "#dea584", CSS: "#563d7c", HTML: "#e34c26",
    };

    const verifiedSkills: VerifiedSkill[] = (skills || []).map((s) => verifySkill(s, data));
    const verifiedCount = verifiedSkills.filter((v) => v.verified).length;

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="liquid-glass rounded-[24px] p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Github size={14} className="text-cream/40" />
                    <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40">
                        GitHub · {username}
                    </p>
                </div>
                <div className="flex gap-6">
                    <div>
                        <p className="font-grotesk text-[22px] text-cream">{data.contributions ?? 0}</p>
                        <p className="font-mono text-[10px] uppercase text-cream/30">contributions</p>
                    </div>
                    <div>
                        <p className="font-grotesk text-[22px] text-cream">{repos.length}</p>
                        <p className="font-mono text-[10px] uppercase text-cream/30">repos</p>
                    </div>
                    <div>
                        <p className="font-grotesk text-[22px] text-cream">{data.followers ?? 0}</p>
                        <p className="font-mono text-[10px] uppercase text-cream/30">followers</p>
                    </div>
                </div>
            </div>

            {/* Skill verification — compares self-tagged profile skills against
                real GitHub language/repo data. Unmatched skills aren't flagged
                as false, just shown without a badge — private repos, non-code
                skills (e.g. "System design"), and closed-source work are all
                legitimate reasons a real skill won't show up here. */}
            {verifiedSkills.length > 0 && (
                <div className="liquid-glass rounded-[24px] p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40">
                            Skill verification
                        </p>
                        <span className="font-mono text-[10px] text-cream/30">
                            {verifiedCount}/{verifiedSkills.length} confirmed
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {verifiedSkills.map(({ skill, verified, via }) => (
                            <span
                                key={skill}
                                title={
                                    verified
                                        ? via === "language"
                                            ? "Confirmed by GitHub's language stats"
                                            : "Found in a repo name — a loose signal, not a guarantee"
                                        : "Not visible in public GitHub activity — may still be real (private repos, non-coding skills, etc.)"
                                }
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[9px] uppercase ${verified
                                    ? "bg-neon/15 border border-neon/40 text-neon"
                                    : "liquid-glass text-cream/50"
                                    }`}
                            >
                                {verified && <CheckCircle2 size={9} />}
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Language bar */}
            {topLanguages.length > 0 && totalBytes > 0 && (
                <div className="liquid-glass rounded-[24px] p-5">
                    <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40 mb-3">
                        Languages
                    </p>
                    <div className="flex h-2 rounded-full overflow-hidden gap-0.5 mb-3">
                        {topLanguages.map(([lang, bytes]) => (
                            <div
                                key={lang}
                                style={{
                                    width: `${(bytes / totalBytes) * 100}%`,
                                    backgroundColor: langColors[lang] || "#6fff00",
                                }}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {topLanguages.map(([lang, bytes]) => (
                            <div key={lang} className="flex items-center gap-1.5">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: langColors[lang] || "#6fff00" }}
                                />
                                <span className="font-mono text-[10px] uppercase text-cream/50">{lang}</span>
                                <span className="font-mono text-[10px] text-cream/20">
                                    {((bytes / totalBytes) * 100).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top repos */}
            {repos.length > 0 && (
                <div className="liquid-glass rounded-[24px] p-5">
                    <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40 mb-3">
                        Top Repos
                    </p>
                    <div className="flex flex-col gap-3">
                        {repos.slice(0, 4).map((repo) => (
                            <a
                                key={repo.name}
                                href={repo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between hover:bg-white/5 rounded-[12px] p-2 -mx-2 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Code2 size={12} className="text-cream/30" />
                                    <span className="font-mono text-[11px] text-cream/70">{repo.name}</span>
                                    {repo.language && (
                                        <span
                                            className="px-2 py-0.5 rounded-full font-mono text-[9px] uppercase"
                                            style={{
                                                backgroundColor: `${langColors[repo.language]}22`,
                                                color: langColors[repo.language] || "#6fff00",
                                            }}
                                        >
                                            {repo.language}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1 font-mono text-[10px] text-cream/30">
                                        <Star size={10} /> {repo.stars}
                                    </span>
                                    <span className="flex items-center gap-1 font-mono text-[10px] text-cream/30">
                                        <GitFork size={10} /> {repo.forks}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}