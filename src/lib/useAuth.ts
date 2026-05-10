"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRedirectResult } from "firebase/auth";
import { auth } from "./firebase";

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
                // ✅ isolated — errors here won't affect the token check below
                try {
                    await getRedirectResult(auth);
                } catch {
                    // ignore — this page wasn't the redirect target
                }

                const token = localStorage.getItem("token");

                if (!token) {
                    if (redirectIfUnauthenticated) router.push("/auth");
                    return;
                }

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!res.ok) {
                    localStorage.removeItem("token");
                    if (redirectIfUnauthenticated) router.push("/auth");
                    return;
                }

                const data = await res.json();
                setUser(data.user);
            } catch {
                // ✅ only token validation errors reach here now
                localStorage.removeItem("token");
                if (redirectIfUnauthenticated) router.push("/auth");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return { user, loading };
}