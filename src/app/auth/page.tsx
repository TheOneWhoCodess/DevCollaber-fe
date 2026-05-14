"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { auth, googleProvider } from "@/src/lib/firebase";

export default function AuthPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const sendTokenToBackend = async (idToken: string) => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Auth failed");

        // ✅ Treat missing token as an error — don't navigate blindly
        if (!data.token) throw new Error("No token received from server");

        localStorage.setItem("token", data.token);

        // ✅ wait for localStorage write to complete before navigating
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push(data.isNewUser ? "/profile-setup" : "/discover");
    };

    // ✅ Handle redirect result when user lands back on the page (mobile)
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                setLoading(true);
                const result = await getRedirectResult(auth);
                if (result) {
                    const idToken = await result.user.getIdToken();
                    await sendTokenToBackend(idToken);
                }
            } catch (err: any) {
                setError(err.message || "Google sign-in failed");
            } finally {
                setLoading(false);
            }
        };

        handleRedirectResult();
    }, []);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            await sendTokenToBackend(idToken);
        } catch (err: any) {
            if (err.code === "auth/popup-blocked") {
                // Safari in-app browser fallback
                await signInWithRedirect(auth, googleProvider);
            } else if (
                err.code === "auth/popup-closed-by-user" ||
                err.code === "auth/cancelled-popup-request"
            ) {
                setError("Sign-in cancelled. Please try again.");
            } else {
                setError(err.message || "Google sign-in failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
            {/* Background Glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(111,255,0,0.06) 0%, transparent 70%)",
                }}
            />

            <div className="liquid-glass rounded-[32px] w-full max-w-md px-10 py-14 flex flex-col items-center gap-8 relative z-10">

                {/* Logo */}
                <div className="flex flex-col items-center gap-2">
                    <span className="font-grotesk text-[13px] uppercase tracking-[0.3em] text-cream/50">
                        Welcome to
                    </span>
                    <h1 className="font-grotesk text-[36px] uppercase tracking-widest text-cream leading-none">
                        DevCollab
                    </h1>
                    <span className="font-condiment text-[22px] text-neon -rotate-1 opacity-90">
                        find your stack
                    </span>
                </div>

                <div className="w-full h-px bg-white/10" />

                <p className="font-mono text-[12px] uppercase text-cream/50 text-center leading-relaxed max-w-[260px]">
                    Match with developers by skill. Build something real together.
                </p>

                {/* Google Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full liquid-glass rounded-[16px] px-6 py-4 flex items-center justify-center gap-4
                    hover:bg-white/10 active:scale-[0.98] transition-all duration-150
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {!loading ? (
                        <>
                            {/* Google Icon */}
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>

                            <span className="font-grotesk text-[13px] uppercase tracking-widest text-cream">
                                Continue with Google
                            </span>
                        </>
                    ) : (
                        <span className="font-grotesk text-[13px] uppercase tracking-widest text-cream/60 animate-pulse">
                            Signing in...
                        </span>
                    )}
                </button>

                {/* Error */}
                {error && (
                    <p className="font-mono text-[11px] uppercase text-red-400 text-center">
                        {error}
                    </p>
                )}

                <p className="font-mono text-[10px] uppercase text-cream/20 text-center leading-relaxed">
                    By continuing you agree to our terms of service
                </p>
            </div>
        </main>
    );
}