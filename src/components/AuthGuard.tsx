"use client";

import { useAuth } from "../lib/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth(true);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-neon/30 border-t-neon animate-spin" />
                    <p className="font-mono text-[11px] uppercase text-cream/30">
                        Checking session...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}