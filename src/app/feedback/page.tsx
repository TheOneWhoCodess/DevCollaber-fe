"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, ArrowLeft, CheckCircle2 } from "lucide-react";
import AuthGuard from "@/src/components/AuthGuard";

const categories = [
    { value: "suggestion", label: "Suggestion" },
    { value: "bug", label: "Bug Report" },
    { value: "praise", label: "Praise" },
    { value: "other", label: "Other" },
];

export default function FeedbackPage() {
    const router = useRouter();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState("suggestion");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");
        if (rating === 0) {
            setError("Please select a rating");
            return;
        }
        if (!message.trim()) {
            setError("Please enter a message");
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ rating, category, message: message.trim() }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Something went wrong");
                return;
            }
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            setError("Couldn't submit feedback — please try again");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthGuard>
            <main className="min-h-screen bg-background">
                <div
                    className="fixed inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(111,255,0,0.04) 0%, transparent 70%)" }}
                />

                <div className="relative z-10 max-w-lg mx-auto px-4 pt-8 pb-20">
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-9 h-9 rounded-[10px] flex items-center justify-center hover:bg-white/10 transition-colors flex-shrink-0"
                        >
                            <ArrowLeft size={18} className="text-cream/60" />
                        </button>
                        <div>
                            <h1 className="font-grotesk text-[24px] uppercase text-cream">Feedback</h1>
                            <span className="font-condiment text-[16px] text-neon -rotate-1 inline-block">help us improve</span>
                        </div>
                    </div>

                    {submitted ? (
                        <div className="liquid-glass rounded-[32px] p-10 flex flex-col items-center gap-4 text-center mt-10">
                            <CheckCircle2 size={40} className="text-neon" />
                            <span className="font-condiment text-[28px] text-neon">Thanks!</span>
                            <p className="font-mono text-[11px] uppercase text-cream/40">
                                Your feedback has been submitted.
                            </p>
                            <button
                                onClick={() => router.push("/discover")}
                                className="mt-2 px-6 py-3 rounded-[12px] bg-neon text-background font-grotesk text-[12px] uppercase tracking-widest"
                            >
                                Back to Discover
                            </button>
                        </div>
                    ) : (
                        <div className="liquid-glass rounded-[24px] p-6 flex flex-col gap-6">
                            {/* Rating */}
                            <div>
                                <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40 mb-3">
                                    How's your experience?
                                </p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                        >
                                            <Star
                                                size={28}
                                                className={
                                                    star <= (hoverRating || rating)
                                                        ? "text-neon fill-neon"
                                                        : "text-cream/20"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40 mb-3">
                                    Category
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setCategory(cat.value)}
                                            className={`px-4 py-2 rounded-full font-mono text-[11px] uppercase border transition-colors ${
                                                category === cat.value
                                                    ? "bg-neon text-background border-neon"
                                                    : "liquid-glass text-cream/60 border-white/10 hover:border-white/30"
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-cream/40 mb-3">
                                    Tell us more
                                </p>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    maxLength={1000}
                                    rows={5}
                                    placeholder="What's on your mind?"
                                    className="w-full liquid-glass rounded-[16px] px-4 py-3 font-mono text-[12px] text-cream placeholder:text-cream/20 outline-none resize-none"
                                />
                                <p className="font-mono text-[9px] text-cream/20 uppercase mt-1 text-right">
                                    {message.length}/1000
                                </p>
                            </div>

                            {error && (
                                <p className="font-mono text-[10px] uppercase text-red-400">{error}</p>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full py-4 rounded-[16px] bg-neon text-background font-grotesk text-[13px] uppercase tracking-widest disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit Feedback"}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </AuthGuard>
    );
}