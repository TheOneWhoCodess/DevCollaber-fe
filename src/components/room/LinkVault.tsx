"use client";

import { useEffect, useState } from "react";
import { Plus, Link2, Trash2, ExternalLink } from "lucide-react";

interface RoomLink {
    _id: string;
    title: string;
    url: string;
    addedBy: { name: string };
    createdAt: string;
}

export default function LinkVault({ projectId }: { projectId: string }) {
    const [links, setLinks] = useState<RoomLink[]>([]);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [adding, setAdding] = useState(false);
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/links`, { headers })
            .then(r => r.json())
            .then(d => setLinks(d.links || []));
    }, [projectId]);

    const addLink = async () => {
        if (!url.trim()) return;
        setAdding(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/links`, {
            method: "POST", headers,
            body: JSON.stringify({ title: title || url, url }),
        });
        const data = await res.json();
        setLinks(prev => [...prev, data.link]);
        setTitle(""); setUrl("");
        setAdding(false);
    };

    const deleteLink = async (linkId: string) => {
        setLinks(prev => prev.filter(l => l._id !== linkId));
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/links/${linkId}`, {
            method: "DELETE", headers
        });
    };

    const getDomain = (url: string) => {
        try { return new URL(url).hostname.replace("www.", ""); }
        catch { return url; }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Add link */}
            <div className="liquid-glass rounded-[24px] p-4 flex flex-col gap-3">
                <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/30">Add Link</p>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Label (optional)"
                    className="liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] uppercase text-cream placeholder:text-cream/20 bg-transparent outline-none"
                />
                <div className="flex gap-2">
                    <input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addLink()}
                        placeholder="https://..."
                        className="flex-1 liquid-glass rounded-[12px] px-4 py-3 font-mono text-[12px] text-cream placeholder:text-cream/20 bg-transparent outline-none"
                    />
                    <button
                        onClick={addLink}
                        disabled={adding}
                        className="liquid-glass rounded-[12px] px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <Plus size={16} className="text-neon" />
                    </button>
                </div>
            </div>

            {/* Links list */}
            {links.length === 0 && (
                <p className="font-mono text-[11px] uppercase text-cream/20 text-center py-8">
                    No links yet — add docs, designs, repos...
                </p>
            )}

            <div className="flex flex-col gap-2">
                {links.map(link => (
                    <div key={link._id} className="liquid-glass rounded-[16px] px-4 py-3 flex items-center gap-3">
                        <Link2 size={12} className="text-neon/50 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="font-mono text-[11px] uppercase text-cream/80 truncate">{link.title}</p>
                            <p className="font-mono text-[10px] text-cream/30">{getDomain(link.url)}</p>
                        </div>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cream/30 hover:text-cream transition-colors"
                        >
                            <ExternalLink size={12} />
                        </a>
                        <button onClick={() => deleteLink(link._id)}>
                            <Trash2 size={12} className="text-cream/20 hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                ))}
            </div>
        </div >
    );
}