"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { useTheme } from "@/src/lib/themeContext";

/**
 * Small icon button that opens a popover grid of city themes.
 * Each swatch previews the theme's own gradient + accent so people
 * can judge the vibe before applying it.
 */
export default function ThemePicker() {
    const { theme, themeId, setThemeId, themes } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    return (
        <div className="relative flex-shrink-0" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label="Change chat theme"
                aria-expanded={open}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-white/10 transition-colors"
                style={{ color: "var(--color-accent)" }}
            >
                <Palette size={16} />
            </button>

            {open && (
                <div
                    role="menu"
                    className="liquid-glass absolute right-0 top-11 z-20 w-[280px] rounded-[16px] p-3"
                >
                    <p className="font-mono text-[9px] uppercase tracking-wide px-1 pb-2"
                        style={{ color: "var(--color-text-muted)" }}>
                        Chat theme
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {themes.map((t) => {
                            const active = t.id === themeId;
                            return (
                                <button
                                    key={t.id}
                                    role="menuitemradio"
                                    aria-checked={active}
                                    onClick={() => {
                                        setThemeId(t.id);
                                        setOpen(false);
                                    }}
                                    className="relative flex flex-col gap-1.5 rounded-[10px] p-2 text-left transition-transform active:scale-95 hover:bg-white/5"
                                    style={{
                                        outline: active
                                            ? `1px solid ${t.colors.accent}`
                                            : "1px solid transparent",
                                    }}
                                >
                                    <div
                                        className="h-10 w-full rounded-[8px] bg-cover bg-center"
                                        style={{
                                            backgroundColor: t.colors.background,
                                            backgroundImage: `linear-gradient(180deg, transparent 40%, ${t.colors.background}CC 100%), url(${t.image})`,
                                        }}
                                    >
                                        <div
                                            className="h-full w-full rounded-[8px]"
                                            style={{
                                                boxShadow: `inset 0 0 0 1px ${t.colors.accent}33`,
                                            }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between px-0.5">
                                        <span
                                            className="font-grotesk text-[10px] uppercase"
                                            style={{ color: "var(--color-text)" }}
                                        >
                                            {t.label}
                                        </span>
                                        {active && (
                                            <Check size={11} style={{ color: t.colors.accent }} />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}