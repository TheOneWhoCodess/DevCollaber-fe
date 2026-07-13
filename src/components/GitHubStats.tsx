"use client";

import { useEffect, useState } from "react";
import { Github, Star, GitFork, Code2 } from "lucide-react";

interface GitHubData {
    repos: { name: string; stars: number; forks: number; language: string; url: string }[];
    languages: Record<string, number>;
    contributions: number;
    followers: number;
}

export default function GitHubStats({ username }: { username: string }) {
    const [data, setData] = useState<GitHubData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/github/stats?username=${username}`
                );
                const json = await res.json();

                // The backend can respond 200 with a valid stats object, or
                // an error shape like { message: "..." } on failure (rate
                // limit, bad username, etc). Only trust it if it actually
                // looks like GitHubData — otherwise treat it the same as a
                // network failure below.
                if (res.ok && json && typeof json === "object" && json.languages && Array.isArray(json.repos)) {
                    setData(json);
                } else {
                    setData(null);
                }
            } catch {
                // silently fail — GitHub is optional
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

    // Calculate language percentages. Fallbacks here are belt-and-braces —
    // the shape check above should already guarantee these exist, but a
    // partially-shaped response (e.g. languages: {} with no repos) should
    // never crash the render.
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

            {/* Language bar */}
            {topLanguages.length > 0 && totalBytes > 0 && (
                <div className="liquid-glass rounded-[24px] p-5">
                    <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40 mb-3">
                        Languages
                    </p>
                    {/* Bar */}
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
                    {/* Legend */}
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