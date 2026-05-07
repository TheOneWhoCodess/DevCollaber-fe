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
                // ✅ Read token from localStorage
                const token = localStorage.getItem("token");

                if (!token) {
                    if (redirectIfUnauthenticated) router.push("/auth");
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // ✅ send as header
                        },
                    }
                );

                if (!res.ok) {
                    localStorage.removeItem("token"); // ✅ clear invalid token
                    if (redirectIfUnauthenticated) router.push("/auth");
                    return;
                }

                const data = await res.json();
                setUser(data.user);
            } catch {
                localStorage.removeItem("token");
                if (redirectIfUnauthenticated) router.push("/auth");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, redirectIfUnauthenticated]);

    return { user, loading };
}