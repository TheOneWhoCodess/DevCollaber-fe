"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { CITY_THEMES, CityTheme, DEFAULT_THEME_ID, getTheme } from "./themes";

const STORAGE_KEY = "cityTheme";

interface ThemeContextValue {
    theme: CityTheme;
    themeId: string;
    setThemeId: (id: string) => void;
    themes: CityTheme[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Writes the theme's tokens onto :root as CSS custom properties. */
function applyThemeToDocument(theme: CityTheme) {
    const root = document.documentElement;
    root.style.setProperty("--color-accent", theme.colors.accent);
    root.style.setProperty("--color-on-accent", theme.colors.onAccent);
    root.style.setProperty("--color-bg", theme.colors.background);
    root.style.setProperty("--color-surface", theme.colors.surface);
    root.style.setProperty("--color-surface-border", theme.colors.surfaceBorder);
    root.style.setProperty("--color-text", theme.colors.text);
    root.style.setProperty("--color-text-muted", theme.colors.textMuted);
    root.style.setProperty("--bg-image", `url(${theme.image})`);
    root.style.setProperty("--bg-overlay", theme.overlay);
    root.dataset.theme = theme.id;
    root.dataset.themeAnimation = theme.animation;
}

export function ThemeProvider({
    children,
    userId,
}: {
    children: React.ReactNode;
    /** Pass the logged-in user's id to enable backend sync; omit to stay localStorage-only. */
    userId?: string;
}) {
    const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);
    const [hydrated, setHydrated] = useState(false);

    // On mount: read the cached choice immediately (avoids a flash of the
    // default theme), then reconcile with the backend if a user is known.
    useEffect(() => {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
            setThemeIdState(cached);
            applyThemeToDocument(getTheme(cached));
        } else {
            applyThemeToDocument(getTheme(DEFAULT_THEME_ID));
        }
        setHydrated(true);

        if (!userId) return;

        (async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/preferences`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (!res.ok) return;
                const data = await res.json();
                if (data.chatTheme && data.chatTheme !== cached) {
                    setThemeIdState(data.chatTheme);
                    applyThemeToDocument(getTheme(data.chatTheme));
                    localStorage.setItem(STORAGE_KEY, data.chatTheme);
                }
            } catch {
                // Backend preference fetch is best-effort; local cache already applied.
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const setThemeId = useCallback(
        (id: string) => {
            setThemeIdState(id);
            applyThemeToDocument(getTheme(id));
            localStorage.setItem(STORAGE_KEY, id);

            if (!userId) return;
            const token = localStorage.getItem("token");
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/preferences`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ chatTheme: id }),
            }).catch(() => {
                // Non-fatal: local + localStorage already reflect the change.
            });
        },
        [userId]
    );

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme: getTheme(themeId),
            themeId,
            setThemeId,
            themes: CITY_THEMES,
        }),
        [themeId, setThemeId]
    );

    // Prevents a flash of unstyled/default content before the cached
    // theme has been read and applied.
    if (!hydrated) return null;

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}