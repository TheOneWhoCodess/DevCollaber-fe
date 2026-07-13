"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, HelpCircle } from "lucide-react";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export default function HelpWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "Hi! I can help answer questions about how DevCollab works — matching, GitHub sync, the AI Concierge, anything. What do you need?" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    const sendMessage = async () => {
        const content = input.trim();
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

    return (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3">
            {/* Chat panel — renders above the button since it comes first
                in a column-reverse-like stack via flex order, always
                anchored to this same container so it can't drift or clip
                independently of the button. */}
            {open && (
                <div className="w-[340px] max-w-[calc(100vw-3rem)] h-[440px] liquid-glass rounded-[20px] flex flex-col overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 flex-shrink-0">
                        <Bot size={16} className="text-blue-300" />
                        <span className="font-grotesk text-[12px] uppercase tracking-widest text-cream">Help Assistant</span>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] px-3 py-2 rounded-[14px] font-mono text-[11px] leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-blue-500 text-white rounded-br-[4px]"
                                            : "liquid-glass text-cream/80 rounded-bl-[4px]"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="liquid-glass rounded-[14px] rounded-bl-[4px] px-3 py-2">
                                    <div className="flex gap-1 items-center">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="w-1.5 h-1.5 rounded-full bg-cream/40 animate-bounce"
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
                    <div className="border-t border-white/10 px-3 py-3 flex items-center gap-2 flex-shrink-0">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                            placeholder="Ask a question..."
                            className="flex-1 bg-transparent font-mono text-[12px] text-cream placeholder:text-cream/20 outline-none"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="w-8 h-8 rounded-[10px] bg-blue-500 flex items-center justify-center hover:bg-blue-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                        >
                            <Send size={13} className="text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Toggle button — always at the bottom of the stack */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg hover:bg-blue-400 transition-colors active:scale-95 flex-shrink-0"
                aria-label="Open help"
            >
                {open ? <X size={20} className="text-white" /> : <HelpCircle size={20} className="text-white" />}
            </button>
        </div>
    );
}