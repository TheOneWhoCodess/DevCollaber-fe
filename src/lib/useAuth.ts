"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
}

export function useAuth(redirectIfUnauthenticated = true) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                    { credentials: "include" }
                );

                if (!res.ok) {
                    if (redirectIfUnauthenticated) router.push("/auth");
                    return;
                }

                const data = await res.json();
                setUser(data.user);
            } catch {
                if (redirectIfUnauthenticated) router.push("/auth");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, redirectIfUnauthenticated]);

    return { user, loading };
}