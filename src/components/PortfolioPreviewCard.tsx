"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface PreviewData {
    url: string;
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
}

export default function PortfolioPreviewCard({ url }: { url: string }) {
    const [data, setData] = useState<PreviewData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const fetchPreview = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/profile/link-preview?url=${encodeURIComponent(url)}`
                );
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch {
                if (!cancelled) setData(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchPreview();
        return () => { cancelled = true; };
    }, [url]);

    if (loading) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass rounded-[20px] p-4 flex items-center gap-2 hover:bg-white/10 transition-colors animate-pulse"
            >
                <div className="h-3 w-32 bg-white/10 rounded-full" />
            </a>
        );
    }

    // No rich data came back (fetch failed, blocked, non-HTML, etc.) —
    // fall back to a plain link rather than showing a broken-looking card.
    if (!data || (!data.title && !data.image)) {
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass rounded-[12px] px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-colors w-fit"
            >
                <ExternalLink size={14} className="text-cream/60" />
                <span className="font-mono text-[11px] uppercase text-cream/60">Portfolio</span>
            </a>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass rounded-[20px] overflow-hidden flex flex-col hover:bg-white/10 transition-colors group"
        >
            {data.image && (
                <div className="w-full aspect-[2/1] overflow-hidden bg-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={data.image}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-grotesk text-[9px] uppercase tracking-[0.2em] text-cream/30">
                        {data.siteName || new URL(data.url).hostname}
                    </p>
                    <ExternalLink size={10} className="text-cream/20 flex-shrink-0" />
                </div>
                {data.title && (
                    <p className="font-grotesk text-[13px] uppercase text-cream leading-tight mb-1">
                        {data.title}
                    </p>
                )}
                {data.description && (
                    <p className="font-mono text-[10px] text-cream/50 leading-relaxed line-clamp-2">
                        {data.description}
                    </p>
                )}
            </div>
        </a>
    );
}