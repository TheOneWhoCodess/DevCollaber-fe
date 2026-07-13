"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { ArrowLeft, Send } from "lucide-react";
import AuthGuard from "@/src/components/AuthGuard";
import { useAuth } from "@/src/lib/AuthContext";
import { useTheme } from "@/src/lib/themeContext";
import ThemePicker from "@/src/components/themePicker";

interface Message {
    _id: string;
    sender: { _id: string; name: string; avatar: string };
    content: string;
    type: string;
    createdAt: string;
}

interface MatchUser {
    _id: string;
    name: string;
    avatar: string;
    role: string;
}

export default function ChatPage() {
    const router = useRouter();
    const { matchId } = useParams<{ matchId: string }>();
    const searchParams = useSearchParams();
    const { theme } = useTheme();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);

    const [other, setOther] = useState<MatchUser | null>(null);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [typing, setTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);

    /* ── Scroll to bottom ─────────────────────────── */
    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const { user } = useAuth();
    useEffect(() => { scrollToBottom(); }, [messages]);

    /* ── Prefill input from ?draft= ───────────────── */
    useEffect(() => {
        const draft = searchParams.get("draft");
        if (draft) {
            setInput(draft);
            router.replace(`/chat/${matchId}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Fetch initial data ───────────────────────── */
    useEffect(() => {
        let s: Socket;

        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const [msgRes, matchRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${matchId}`,
                        { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`,
                        { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const msgData = await msgRes.json();
                const matchData = await matchRes.json();

                setMessages(msgData.messages || []);

                const thisMatch = matchData.matches?.find((m: { _id: string }) => m._id === matchId);
                if (thisMatch) {
                    const otherUser = thisMatch.users.find((u: MatchUser) => u._id !== user?._id);
                    setOther(otherUser || null);
                }

                s = io(process.env.NEXT_PUBLIC_API_URL!, {
                    auth: { token },
                    withCredentials: true,
                });

                s.on("connect", () => s.emit("join_match", { matchId }));
                s.on("receive_message", (msg: Message) => {
                    setMessages((prev) => {
                        if (prev.find((m) => m._id === msg._id)) return prev;
                        return [...prev, msg];
                    });
                });
                s.on("user_typing", () => {
                    setTyping(true);
                    setTimeout(() => setTyping(false), 2000);
                });

                setSocket(s);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchData();

        return () => { s?.disconnect(); };
    }, [matchId, user]);

    /* ── Send message ─────────────────────────────── */
    const sendMessage = useCallback(() => {
        const content = input.trim();
        if (!content || !socket) return;

        socket.emit("send_message", { matchId, content, type: "text" });
        setInput("");
    }, [input, socket, matchId]);

    /* ── Typing indicator ─────────────────────────── */
    const handleInputChange = (val: string) => {
        setInput(val);
        if (!socket) return;
        socket.emit("typing", { matchId });
        if (typingTimeout) clearTimeout(typingTimeout);
        setTypingTimeout(setTimeout(() => { }, 1000));
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const otherInitials = other?.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    return (
        <AuthGuard>
            <main className="min-h-screen flex flex-col" style={{ background: "var(--color-bg)" }}>
                {/* Ambient theme layer — gradient + optional motion come from theme.css */}
                <div className="theme-ambient fixed inset-0 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 max-w-lg mx-auto w-full px-4 pt-6 pb-4">
                    <div className="liquid-glass rounded-[20px] px-4 py-3 flex items-center gap-4">
                        <button
                            onClick={() => router.push("/matches")}
                            className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                        >
                            <ArrowLeft size={18} style={{ color: "var(--color-text-muted)" }} />
                        </button>

                        {/* Other user */}
                        <div
                            className="w-10 h-10 rounded-[12px] flex items-center justify-center overflow-hidden flex-shrink-0"
                            style={{
                                background: "var(--color-surface)",
                                border: "1px solid var(--color-surface-border)",
                            }}
                        >
                            {other?.avatar ? (
                                <img src={other.avatar} alt={other.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-grotesk text-[14px]" style={{ color: "var(--color-accent)" }}>
                                    {otherInitials}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="font-grotesk text-[15px] uppercase truncate" style={{ color: "var(--color-text)" }}>
                                {other?.name || "Loading..."}
                            </h2>
                            <p className="font-mono text-[10px] uppercase" style={{ color: "var(--color-text-muted)" }}>
                                {other?.role || ""}
                            </p>
                        </div>

                        {/* Online dot */}
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "var(--color-accent)" }} />

                        {/* Theme picker */}
                        <ThemePicker />
                    </div>
                </div>

                {/* Messages */}
                <div className="relative z-10 flex-1 max-w-lg mx-auto w-full px-4 overflow-y-auto pb-4">
                    {loading ? (
                        <div className="flex justify-center mt-20">
                            <div
                                className="w-8 h-8 rounded-full border-2 animate-spin"
                                style={{
                                    borderColor: "var(--color-surface-border)",
                                    borderTopColor: "var(--color-accent)",
                                }}
                            />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 mt-16 text-center">
                            <span className="font-condiment text-[28px]" style={{ color: "var(--color-accent)" }}>
                                Say hello!
                            </span>
                            <p className="font-mono text-[11px] uppercase" style={{ color: "var(--color-text-muted)" }}>
                                You matched — start the conversation
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 py-4">
                            {messages.map((msg, i) => {
                                const isMine = msg.sender._id === user?._id;
                                const showAvatar =
                                    !isMine &&
                                    (i === 0 || messages[i - 1].sender._id !== msg.sender._id);

                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        {!isMine && (
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                                                style={{
                                                    background: "var(--color-surface)",
                                                    border: "1px solid var(--color-surface-border)",
                                                }}
                                            >
                                                {showAvatar ? (
                                                    msg.sender.avatar ? (
                                                        <img src={msg.sender.avatar} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="font-grotesk text-[9px]" style={{ color: "var(--color-accent)" }}>
                                                            {msg.sender.name[0].toUpperCase()}
                                                        </span>
                                                    )
                                                ) : (
                                                    <span />
                                                )}
                                            </div>
                                        )}

                                        <div className={`flex flex-col gap-1 max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                                            <div
                                                className={`px-4 py-3 rounded-[18px] ${isMine ? "rounded-br-[6px]" : "liquid-glass rounded-bl-[6px]"}`}
                                                style={
                                                    isMine
                                                        ? { background: "var(--color-accent)" }
                                                        : undefined
                                                }
                                            >
                                                <p
                                                    className="font-mono text-[13px] leading-relaxed"
                                                    style={{ color: isMine ? "var(--color-on-accent)" : "var(--color-text)" }}
                                                >
                                                    {msg.content}
                                                </p>
                                            </div>
                                            <span className="font-mono text-[9px] uppercase px-1" style={{ color: "var(--color-text-muted)" }}>
                                                {formatTime(msg.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Typing indicator */}
                            {typing && (
                                <div className="flex items-end gap-2">
                                    <div
                                        className="w-7 h-7 rounded-full flex-shrink-0"
                                        style={{ background: "var(--color-surface)", border: "1px solid var(--color-surface-border)" }}
                                    />
                                    <div className="liquid-glass rounded-[18px] rounded-bl-[6px] px-4 py-3">
                                        <div className="flex gap-1 items-center">
                                            {[0, 1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                                                    style={{
                                                        background: "var(--color-text-muted)",
                                                        animationDelay: `${i * 0.15}s`,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* Input bar */}
                <div className="relative z-10 max-w-lg mx-auto w-full px-4 pb-6 pt-2">
                    <div className="liquid-glass rounded-[20px] px-4 py-3 flex items-center gap-3">
                        <input
                            value={input}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent font-mono text-[13px] outline-none"
                            style={{ color: "var(--color-text)" }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            className="w-9 h-9 rounded-[12px] flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                            style={{ background: "var(--color-accent)" }}
                        >
                            <Send size={15} style={{ color: "var(--color-on-accent)" }} />
                        </button>
                    </div>
                </div>
            </main>
        </AuthGuard>
    );
}