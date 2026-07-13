"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export function SocketProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Only connect when we have an authenticated user
        if (!user) {
            // Clean up any existing connection on logout
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        // Don't reconnect if we already have an active socket for this user
        if (socketRef.current?.connected) return;

        const s = io(process.env.NEXT_PUBLIC_API_URL!, {
            auth: { token },
            withCredentials: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
        });

        s.on("connect", () => console.log("[socket] connected:", s.id));
        s.on("disconnect", (reason) => console.log("[socket] disconnected:", reason));
        s.on("connect_error", (err) => console.error("[socket] error:", err.message));

        socketRef.current = s;
        setSocket(s);

        return () => {
            s.disconnect();
            socketRef.current = null;
            setSocket(null);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}