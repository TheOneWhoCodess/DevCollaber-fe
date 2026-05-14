"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setLoading(false);
                    return;
                }

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (!res.ok) {
                    localStorage.removeItem("token");
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                setUser(data.user);
            } catch {
                localStorage.removeItem("token");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []); // ✅ runs ONCE, ever

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/auth");
    };

    return (
        <AuthContext.Provider value={{ user, loading, setUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}