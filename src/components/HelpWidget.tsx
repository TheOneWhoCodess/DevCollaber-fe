"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Send, Sparkles, Search } from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

const SUGGESTED_PROMPTS = [
    "How does matching work?",
    "How do I sync my GitHub repo?",
    "What can the AI Concierge do?",
];

/** Mascot avatar — served from /public/Dev.ai.png (Next.js serves it at "/Dev.ai.png"). */
function DevBotIcon({ size = 22 }: { size?: number }) {
    return (
        <Image
            src="/Dev.ai.png"
            alt="Dev.ai"
            width={size}
            height={size}
            className="rounded-full object-cover"
            style={{ width: size, height: size }}
            priority
        />
    );
}

export default function HelpWidget() {
    const [open, setOpen] = useState(false);
    const [showNudge, setShowNudge] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "Hi, I'm Dev.ai 👋 Ask me anything about how DevCollab works — matching, GitHub sync, the AI Concierge, all of it." },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async (override?: string) => {
        const content = (override ?? input).trim();
        if (!content || loading) return;

        const updated: ChatMessage[] = [...messages, { role: "user", content }];
        setMessages(updated);
        setInput("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/help/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                // Only send role+content, matching what the backend expects —
                // strips out the initial greeting-only client state issues.
                body: JSON.stringify({ messages: updated }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.reply || "Sorry, something went wrong." },
            ]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "Sorry, I couldn't reach the help service. Please try again." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const isFreshConversation = messages.length === 1;

    return (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
            {/* Chat panel */}
            {open && (
                <div className="w-[350px] max-w-[calc(100vw-3rem)] h-[480px] rounded-[22px] flex flex-col overflow-hidden shadow-2xl bg-[#100B08] border border-[#FF7A1A]/20">
                    {/* Header */}
                    <div className="relative flex items-center gap-3 px-4 py-4 flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#2A1206] to-[#160B05]">
                        {/* ambient glow */}
                        <div className="pointer-events-none absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#FF7A1A]/25 blur-2xl" />
                        <div className="relative w-10 h-10 rounded-full bg-[#1A0E06] flex items-center justify-center ring-1 ring-[#FF7A1A]/40 flex-shrink-0">
                            <DevBotIcon size={24} />
                        </div>
                        <div className="relative flex flex-col min-w-0">
                            <span className="font-semibold text-[13px] tracking-wide text-[#FFEFE0]">Dev.ai</span>
                            <span className="text-[10.5px] text-[#FFC896]/70 truncate">Ask me anything about DevCollab</span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="relative ml-auto w-7 h-7 rounded-full flex items-center justify-center text-[#FFC896]/70 hover:text-[#FFEFE0] hover:bg-white/5 transition-colors flex-shrink-0"
                            aria-label="Close help"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-3.5 py-2.5 rounded-[15px] text-[12px] leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-gradient-to-br from-[#FF9A3C] to-[#FF6A00] text-[#1A0E06] font-medium rounded-br-[4px]"
                                            : "bg-[#1B140D] text-[#F2E4D6]/90 rounded-bl-[4px] border border-white/5"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Suggested prompts — only before the person has said anything */}
                        {isFreshConversation && !loading && (
                            <div className="flex flex-col gap-1.5 pt-1">
                                <span className="text-[9.5px] uppercase tracking-widest text-[#FFC896]/40 px-0.5">Try asking</span>
                                {SUGGESTED_PROMPTS.map((prompt) => (
                                    <button
                                        key={prompt}
                                        onClick={() => sendMessage(prompt)}
                                        className="text-left text-[11.5px] text-[#F2E4D6]/80 bg-[#1B140D] border border-white/5 rounded-[12px] px-3 py-2 hover:border-[#FF7A1A]/40 hover:text-[#FFEFE0] transition-colors"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[#1B140D] border border-white/5 rounded-[15px] rounded-bl-[4px] px-3.5 py-2.5">
                                    <div className="flex gap-1 items-center">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-[#FF9A3C]/70 animate-bounce"
                                                style={{ animationDelay: `${i * 0.15}s` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t border-white/5 px-3 py-3 flex items-center gap-2 flex-shrink-0 bg-[#0D0906]">
                        <Search size={13} className="text-[#FFC896]/30 flex-shrink-0" />
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                            placeholder="Ask a question..."
                            className="flex-1 bg-transparent text-[12px] text-[#F2E4D6] placeholder:text-[#FFC896]/25 outline-none"
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || loading}
                            className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#FF9A3C] to-[#FF6A00] flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <Send size={13} className="text-[#1A0E06]" />
                        </button>
                    </div>
                </div>
            )}

            {/* Nudge bubble — shown once before the panel is opened */}
            {!open && showNudge && (
                <div className="flex items-center gap-2 bg-[#1B140D] border border-[#FF7A1A]/25 rounded-full pl-3 pr-2 py-2 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                    <span className="text-[11.5px] text-[#F2E4D6]/90 whitespace-nowrap">Hi, I&apos;m Dev.ai — need a hand?</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNudge(false);
                        }}
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[#FFC896]/40 hover:text-[#FFEFE0] flex-shrink-0"
                        aria-label="Dismiss"
                    >
                        <X size={10} />
                    </button>
                </div>
            )}

            {/* Toggle button */}
            <button
                onClick={() => {
                    setOpen((o) => !o);
                    setShowNudge(false);
                }}
                className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#FF9A3C] to-[#FF6A00] flex items-center justify-center shadow-lg hover:brightness-110 transition-all active:scale-95 flex-shrink-0"
                aria-label="Open Dev.ai help"
            >
                {!open && (
                    <span className="absolute inset-0 rounded-full bg-[#FF6A00]/40 animate-ping" />
                )}
                {open ? (
                    <X size={20} className="text-[#1A0E06] relative" />
                ) : (
                    <span className="relative">
                        <DevBotIcon size={28} />
                    </span>
                )}
            </button>
        </div>
    );
}