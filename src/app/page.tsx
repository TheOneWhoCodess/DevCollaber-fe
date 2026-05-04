"use client";

import { Mail, Twitter, Github, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";


/* ── Video URLs ────────────────────────────────────────────── */
const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_045634_e1c98c76-1265-4f5c-882a-4276f2080894.mp4";
const ABOUT_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_151551_992053d1-3d3e-4b8c-abac-45f22158f411.mp4";
const CTA_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055729_72d66327-b59e-4ae9-bb70-de6ccb5ecdb0.mp4";

const DEV_CARDS = [
  {
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_053923_22c0a6a5-313c-474c-85ff-3b50d25e944a.mp4",
    score: "94/100",
  },
  {
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_054411_511c1b7a-fb2f-42ef-bf6c-32c0b1a06e79.mp4",
    score: "87/100",
  },
  {
    video:
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_055427_ac7035b5-9f3b-4289-86fc-941b2432317d.mp4",
    score: "91/100",
  },
];

/* ── Page ────────────────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();
  return (
    <main className="relative">
      {/* Texture overlay */}
      <div
        className="fixed inset-0 z-50 pointer-events-none"
        style={{
          backgroundImage:
            "url(https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260331_093806_1b7cf34d-4959-472d-925a-4618058b5c5c.png)",
          backgroundSize: "cover",
          mixBlendMode: "lighten",
          opacity: 0.6,
        }}
      />

      {/* ── SECTION 1: HERO ───────────────────────────────────── */}
      <section className="relative w-full h-screen overflow-hidden rounded-b-[32px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-background/30" />

        <div className="relative z-10 h-full max-w-[1831px] mx-auto px-6 sm:px-10 lg:px-16 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between pt-8 lg:pt-10">
            {/* Logo */}
            <span className="font-grotesk text-base uppercase tracking-widest text-cream">
              DevCollab
            </span>

            {/* Nav (desktop) */}
            <nav className="hidden lg:block liquid-glass rounded-[28px] px-[52px] py-[24px]">
              <ul className="flex gap-10">
                {["Homepage", "How It Works", "Discover", "FAQ", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="/discover"
                        className="font-grotesk text-[13px] uppercase text-cream hover:text-neon transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </nav>

            {/* Desktop social icons */}
            <div className="hidden lg:flex flex-col gap-3">
              {[Mail, Twitter, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="liquid-glass w-14 h-14 flex items-center justify-center rounded-[1rem] hover:bg-white/10 transition-colors"
                >
                  <Icon size={20} className="text-cream" />
                </button>
              ))}
            </div>
          </div>

          {/* Hero heading */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative lg:ml-32 max-w-[780px]">
              <h1 className="font-grotesk text-[40px] sm:text-[60px] md:text-[75px] lg:text-[90px] uppercase leading-[1.05] lg:leading-[1] text-cream">
                Beyond screens and{" "}
                <span className="text-cream/60">( its )</span>
                <br />
                endless noise
              </h1>
              {/* Cursive accent */}
              <span
                className="absolute -right-4 top-1/2 -translate-y-1/2 font-condiment text-[24px] sm:text-[32px] md:text-[40px] lg:text-[48px] text-neon -rotate-1 opacity-90"
                style={{ mixBlendMode: "exclusion" }}
              >
                Dev matching
              </span>
            </div>

            <button
              onClick={() => router.push("/auth")}
              className="mt-10 lg:mt-14 lg:ml-32 self-start liquid-glass rounded-[16px] px-8 py-4 font-grotesk text-[13px] uppercase tracking-widest text-cream hover:bg-white/10 active:scale-[0.98] transition-all duration-150 border border-neon/20"
            >
              <span className="text-neon mr-2">→</span> Get Started
            </button>

            {/* Mobile social icons */}
            <div className="flex lg:hidden gap-3 mt-10 justify-center">
              {[Mail, Twitter, Github].map((Icon, i) => (
                <button
                  key={i}
                  className="liquid-glass w-14 h-14 flex items-center justify-center rounded-[1rem] hover:bg-white/10 transition-colors"
                >
                  <Icon size={20} className="text-cream" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: ABOUT ──────────────────────────────────── */}
      <section className="relative w-full min-h-screen overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={ABOUT_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/40" />

        <div className="relative z-10 max-w-[1831px] mx-auto px-6 sm:px-10 lg:px-16 py-16 sm:py-20 lg:py-24">
          {/* Top row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-0 mb-20 lg:mb-32">
            {/* Left: heading */}
            <div className="relative">
              <h2 className="font-grotesk text-[32px] sm:text-[44px] lg:text-[60px] uppercase leading-tight text-cream">
                Hello!{" "}
                <span className="text-cream/70">I&apos;m</span>
                <br />
                devcollab
              </h2>
              {/* Cursive overlay */}
              <span
                className="absolute bottom-0 right-0 translate-y-4 font-condiment text-[36px] sm:text-[52px] lg:text-[68px] text-neon rotate-1 opacity-90"
                style={{ mixBlendMode: "exclusion" }}
              >
                DevCollab
              </span>
            </div>

            {/* Right: description */}
            <p className="font-mono text-[14px] lg:text-[16px] uppercase text-cream max-w-[266px] leading-relaxed">
              A platform built for developers who build together. Find your
              co-founder, teammate, or collaborator — by skill, not luck.
            </p>
          </div>

          {/* Bottom row: decorative text columns */}
          <div className="flex justify-between">
            {/* Left column */}
            <div className="flex flex-col gap-6 w-1/2 lg:w-5/12">
              {[0, 1].map((i) => (
                <p
                  key={i}
                  className="font-mono text-[13px] uppercase leading-relaxed opacity-10 text-[#010828] lg:text-cream"
                >
                  A platform built for developers who build together. Find your
                  co-founder, teammate, or collaborator — by skill, not luck.
                </p>
              ))}
            </div>
            {/* Right column (desktop only) */}
            <div className="hidden lg:flex flex-col gap-6 w-5/12">
              {[0, 1].map((i) => (
                <p
                  key={i}
                  className="font-mono text-[13px] uppercase leading-relaxed opacity-10 text-cream"
                >
                  A platform built for developers who build together. Find your
                  co-founder, teammate, or collaborator — by skill, not luck.
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: DEV PROFILES ───────────────────────────── */}
      <section className="bg-background w-full py-16 sm:py-20 lg:py-24">
        <div className="max-w-[1831px] mx-auto px-6 sm:px-10 lg:px-16">
          {/* Header row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-14">
            {/* Left: heading */}
            <div>
              <h2 className="font-grotesk text-[32px] sm:text-[44px] lg:text-[60px] uppercase leading-tight text-cream">
                Collection of
              </h2>
              <div className="ml-12 sm:ml-24 lg:ml-32">
                <span
                  className="font-condiment text-[36px] sm:text-[52px] lg:text-[68px] text-neon"
                  style={{ mixBlendMode: "normal" }}
                >
                  Dev{" "}
                </span>
                <span className="font-grotesk text-[32px] sm:text-[44px] lg:text-[60px] uppercase text-cream">
                  profiles
                </span>
              </div>
            </div>

            {/* Right: see all button */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-baseline gap-3">
                <span className="font-grotesk text-[32px] sm:text-[44px] lg:text-[60px] uppercase text-cream">
                  SEE
                </span>
                <div className="flex flex-col">
                  <span className="font-grotesk text-[20px] sm:text-[28px] lg:text-[36px] uppercase text-cream leading-none">
                    ALL
                  </span>
                  <span className="font-grotesk text-[20px] sm:text-[28px] lg:text-[36px] uppercase text-cream leading-none">
                    DEVS
                  </span>
                </div>
              </div>
              {/* Neon underline bar */}
              <div className="w-full h-[6px] sm:h-[8px] lg:h-[10px] bg-neon rounded-full" />
            </div>
          </div>

          {/* Dev Profiles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEV_CARDS.map((card, i) => (
              <div
                key={i}
                className="liquid-glass rounded-[32px] p-[18px] hover:bg-white/10 transition-colors"
              >
                {/* Square video */}
                <div className="relative w-full pb-[100%] rounded-[24px] overflow-hidden mb-4">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  >
                    <source src={card.video} type="video/mp4" />
                  </video>
                </div>

                {/* Overlay bar */}
                <div className="liquid-glass rounded-[20px] px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-cream/70 uppercase font-mono mb-0.5">
                      MATCH SCORE:
                    </p>
                    <p className="text-[16px] text-cream font-grotesk">
                      {card.score}
                    </p>
                  </div>
                  <button className="w-12 h-12 rounded-full bg-gradient-to-br from-[#b724ff] to-[#7c3aed] flex items-center justify-center shadow-lg shadow-purple-500/50 hover:scale-110 transition-transform">
                    <ChevronRight size={20} className="text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: CTA ────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto block"
        >
          <source src={CTA_VIDEO} type="video/mp4" />
        </video>

        {/* Text content overlay */}
        <div className="absolute inset-0 flex items-center justify-end lg:pr-[20%] lg:pl-[15%] pr-6 pl-6">
          <div className="relative text-right max-w-[800px]">
            {/* Cursive accent */}
            <span
              className="absolute -top-8 left-0 font-condiment text-[17px] sm:text-[28px] md:text-[44px] lg:text-[68px] text-neon -rotate-1 opacity-90"
              style={{ mixBlendMode: "exclusion" }}
            >
              Start building
            </span>

            {/* Main heading */}
            <h2 className="font-grotesk text-[16px] sm:text-[24px] md:text-[40px] lg:text-[60px] uppercase leading-[1.05] text-cream">
              <span className="block mb-4 sm:mb-6 md:mb-10 lg:mb-12">
                JOIN US.
              </span>
              FIND YOUR STACK.
              <br />
              SHIP WHAT MATTERS.
              <br />
              BUILD THE FUTURE.
            </h2>
          </div>
        </div>

        {/* Social icons bottom-left */}
        <div className="absolute left-[8%] bottom-[12%] sm:bottom-[14%] md:bottom-[16%] lg:bottom-[20%]">
          <div className="liquid-glass rounded-[0.5rem] sm:rounded-[0.75rem] lg:rounded-[1.25rem] overflow-hidden flex flex-col">
            {[Mail, Twitter, Github].map((Icon, i) => (
              <button
                key={i}
                className={`flex items-center justify-center hover:bg-white/10 transition-colors
                  w-[14vw] sm:w-[14.375rem] md:w-[10.78125rem] lg:w-[16.77rem]
                  h-[14vw] sm:h-auto md:h-auto lg:h-[5rem]
                  py-4 sm:py-5
                  ${i < 2 ? "border-b border-white/10" : ""}`}
              >
                <Icon size={20} className="text-cream" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}