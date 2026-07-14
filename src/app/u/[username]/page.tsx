import { Github, ExternalLink } from "lucide-react";
import GitHubStats from "@/src/components/GitHubStats";
import PortfolioPreviewCard from "@/src/components/PortfolioPreviewCard";

async function getProfile(username: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/profile/user/${username}`,
            { cache: "no-store" }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
    } catch {
        return null;
    }
}

const roleColors: Record<string, string> = {
    frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    backend: "bg-green-500/20 text-green-300 border-green-500/30",
    fullstack: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    devops: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    ml: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    mobile: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
};

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const user = await getProfile(username);

    if (!user) return (
        <main className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <p className="font-condiment text-[32px] text-neon mb-2">Not found</p>
                <p className="font-mono text-[11px] uppercase text-cream/40">This profile doesn&apos;t exist</p>
            </div>
        </main>
    );

    const initials = user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <main className="min-h-screen bg-background px-4 py-12">
            <div className="fixed inset-0 pointer-events-none" style={{
                background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(111,255,0,0.05) 0%, transparent 70%)"
            }} />

            <div className="relative z-10 max-w-lg mx-auto">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="font-grotesk text-[12px] uppercase tracking-[0.3em] text-cream/30">DevCollab</span>
                </div>

                {/* Profile card */}
                <div className="liquid-glass rounded-[32px] p-8">
                    {/* Avatar + name */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="w-24 h-24 rounded-[24px] bg-neon/10 border border-neon/20 overflow-hidden flex items-center justify-center">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-grotesk text-[28px] text-neon">{initials}</span>
                            )}
                        </div>
                        <div className="text-center">
                            <h1 className="font-grotesk text-[28px] uppercase text-cream">{user.name}</h1>
                            {user.role && (
                                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase border ${roleColors[user.role] || "bg-white/10 text-cream/60 border-white/20"}`}>
                                    {user.role}
                                </span>
                            )}
                            {user.location && (
                                <p className="font-mono text-[10px] uppercase text-cream/30 mt-2">{user.location}</p>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-white/10 mb-6" />

                    {/* Bio */}
                    {user.bio && (
                        <div className="mb-6">
                            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-2">About</p>
                            <p className="font-mono text-[12px] text-cream/70 leading-relaxed uppercase">{user.bio}</p>
                        </div>
                    )}
                    {user.github && <GitHubStats username={user.github} skills={user.skills} />}
                    {/* Skills */}
                    {user.skills?.length > 0 && (
                        <div className="mb-6 mt-6">
                            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-3">Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {user.skills.map((s: string) => (
                                    <span key={s} className="px-3 py-1 rounded-full liquid-glass font-mono text-[10px] uppercase text-cream/70">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Project idea */}
                    {user.projectIdea && (
                        <div className="liquid-glass rounded-[20px] p-4 mb-6">
                            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-2">Building</p>
                            <p className="font-mono text-[11px] text-cream/80 leading-relaxed uppercase">{user.projectIdea}</p>
                        </div>
                    )}

                    {/* Portfolio preview — rich card instead of a plain link,
                        falls back to a plain link automatically if the site
                        can't be previewed (see PortfolioPreviewCard). */}
                    {user.website && (
                        <div className="mb-6">
                            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30 mb-3">Portfolio</p>
                            <PortfolioPreviewCard url={user.website} />
                        </div>
                    )}

                    {/* Links */}
                    <div className="flex gap-3 mb-8">
                        {user.github && (
                            <a
                                href={user.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="liquid-glass rounded-[12px] px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors"
                            >
                                <Github size={14} className="text-cream/60" />
                                <span className="font-mono text-[11px] uppercase text-cream/60">GitHub</span>
                            </a>
                        )}
                        {user.linkedin && (
                            <a
                                href={user.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="liquid-glass rounded-[12px] px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors"
                            >
                                <ExternalLink size={14} className="text-cream/60" />
                                <span className="font-mono text-[11px] uppercase text-cream/60">LinkedIn</span>
                            </a>
                        )}
                    </div>

                    {/* CTA */}
                    <a
                        href="/auth"
                        className="w-full py-4 rounded-[16px] bg-neon text-background font-grotesk text-[13px] uppercase tracking-widest hover:bg-neon/90 transition-colors flex items-center justify-center"
                    >
                        Connect on DevCollab →
                    </a>
                </div>
            </div>
        </main>
    );
}