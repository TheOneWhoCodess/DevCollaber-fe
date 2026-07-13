"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Script from "next/script";
import { X, Sparkles } from "lucide-react";

interface Plan {
    id: "weekly" | "monthly" | "yearly";
    label: string;
    price: string;
    period: string;
    badge?: string;
}

const PLANS: Plan[] = [
    { id: "weekly", label: "Weekly", price: "₹49", period: "/ week" },
    { id: "monthly", label: "Monthly", price: "₹149", period: "/ month", badge: "MOST POPULAR" },
    { id: "yearly", label: "Yearly", price: "₹999", period: "/ year", badge: "BEST VALUE" },
];

const FEATURES = [
    { icon: "🔗", title: "Unlimited GitHub AI Sync", desc: "Auto-sync every repo, no daily cap" },
    { icon: "💡", title: "Unlimited AI Project Ideas", desc: "Fresh builds generated on demand" },
    { icon: "🤝", title: "Unlimited AI Match Concierge", desc: "Get paired with the right collaborators" },
    { icon: "🚀", title: "Priority visibility in Discover", desc: "Your profile surfaces first" },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpgraded?: () => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgraded }: Props) {
    const [selected, setSelected] = useState<Plan["id"]>("monthly");
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");
    const [scriptReady, setScriptReady] = useState(false);

    if (!isOpen) return null;
    if (typeof document === "undefined") return null;

    const selectedPlan = PLANS.find((p) => p.id === selected)!;

    const handleSubscribe = async () => {
        setError("");
        if (!scriptReady || !(window as any).Razorpay) {
            setError("Payment system is still loading — try again in a moment.");
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem("token");

            const orderRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ planId: selected }),
            });
            const order = await orderRes.json();
            if (!orderRes.ok) {
                setError(order.message || "Couldn't start checkout");
                setProcessing(false);
                return;
            }

            const razorpay = new (window as any).Razorpay({
                key: order.keyId,
                amount: order.amount,
                currency: order.currency,
                order_id: order.orderId,
                name: "DevCollab",
                description: `Premium — ${order.planLabel}`,
                theme: { color: "#a855f7" },
                handler: async (response: any) => {
                    try {
                        const verifyRes = await fetch(
                            `${process.env.NEXT_PUBLIC_API_URL}/api/payment/verify`,
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            }
                        );
                        const verifyData = await verifyRes.json();
                        if (!verifyRes.ok) {
                            setError(verifyData.message || "Payment verification failed");
                            return;
                        }
                        onUpgraded?.();
                        onClose();
                    } catch (err) {
                        console.error(err);
                        setError("Payment succeeded but verification failed — contact support with your payment ID.");
                    } finally {
                        setProcessing(false);
                    }
                },
                modal: {
                    ondismiss: () => setProcessing(false),
                },
            });

            razorpay.on("payment.failed", () => {
                setError("Payment failed — please try again.");
                setProcessing(false);
            });

            razorpay.open();
        } catch (err) {
            console.error(err);
            setError("Something went wrong starting checkout.");
            setProcessing(false);
        }
    };

    return createPortal(
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setScriptReady(true)}
            />
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center backdrop-blur-sm"
                style={{ backgroundColor: "rgba(5, 2, 10, 0.92)" }}
                onClick={onClose}
            >
                {/* Card */}
                <div
                    className="w-full sm:w-[400px] sm:rounded-[32px] rounded-t-[32px] relative max-h-[92vh] overflow-y-auto border border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.25)] isolate"
                    style={{ backgroundColor: "#15111f" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Hero banner */}
                    <div
                        className="relative h-44 w-full overflow-hidden rounded-t-[32px] sm:rounded-t-[32px]"
                        style={{ backgroundColor: "#0c0a14" }}
                    >
                        {/* Astronaut image — swap the src to your asset path */}
                        <img
                            src="/pro.png"
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover object-top"
                        />

                        {/* Glow accents on top of the image */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 20% 15%, rgba(236,72,153,0.35), transparent 50%), radial-gradient(circle at 80% 10%, rgba(139,92,246,0.35), transparent 50%)",
                            }}
                        />

                        {/* Dark vignette so text stays legible */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to top, #0c0a14 5%, rgba(12,10,20,0.35) 55%, rgba(12,10,20,0.55) 100%)",
                            }}
                        />
                        <div
                            className="absolute inset-0"
                            style={{ backgroundImage: "linear-gradient(to bottom, rgba(12,10,20,0.55), transparent 40%)" }}
                        />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-colors z-10"
                        >
                            <X size={16} className="text-white" />
                        </button>

                        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center justify-end gap-0">
                            <h2 className="font-extrabold text-[26px] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
                                Go <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">Pro</span>
                            </h2>
                        </div>
                    </div>

                    <div className="px-6 pb-6 pt-5">
                        {/* Price */}
                        <div className="text-center mb-5">
                            <span className="text-[32px] font-extrabold text-white">{selectedPlan.price}</span>
                            <span className="text-[14px] text-white/50 ml-1">{selectedPlan.period}</span>
                        </div>

                        {/* Features */}
                        <div className="flex flex-col gap-3.5 mb-6">
                            {FEATURES.map((f) => (
                                <div key={f.title} className="flex items-start gap-3">
                                    <span className="text-[18px] leading-none mt-0.5">{f.icon}</span>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-semibold text-white">{f.title}</span>
                                        <span className="text-[11.5px] text-white/50">{f.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Plan pills */}
                        <div className="flex flex-col gap-2.5 mb-6">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    onClick={() => setSelected(plan.id)}
                                    className={`relative w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all ${
                                        selected === plan.id
                                            ? "border-transparent bg-gradient-to-r from-fuchsia-500/20 via-pink-500/20 to-violet-500/20 ring-2 ring-fuchsia-400"
                                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                                    }`}
                                >
                                    {plan.badge && (
                                        <span className="absolute -top-2 left-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-[8px] font-bold uppercase tracking-wider">
                                            {plan.badge}
                                        </span>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                selected === plan.id ? "border-fuchsia-400" : "border-white/30"
                                            }`}
                                        >
                                            {selected === plan.id && (
                                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-violet-400" />
                                            )}
                                        </div>
                                        <span className="text-[13px] font-semibold text-white">{plan.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[15px] font-bold text-white">{plan.price}</span>
                                        <span className="text-[10px] text-white/40"> {plan.period}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <p className="text-[11px] text-red-400 text-center mb-3">{error}</p>
                        )}

                        <button
                            onClick={handleSubscribe}
                            disabled={processing}
                            className="w-full py-4 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-500 text-white font-bold text-[14px] tracking-wide disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(236,72,153,0.4)] active:scale-[0.98] transition-transform"
                        >
                            <Sparkles size={15} />
                            {processing ? "Opening checkout..." : "Subscribe"}
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full py-3.5 mt-2.5 rounded-full border border-white/15 text-white/70 font-semibold text-[13px] hover:bg-white/5 transition-colors"
                        >
                            Maybe later
                        </button>

                        <p className="text-[10px] text-white/30 text-center mt-4">
                            Secure payment via Razorpay · Cancel anytime
                        </p>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}