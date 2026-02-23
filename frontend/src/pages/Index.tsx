import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Wand2,
  PlugZap,
  Rocket,
  Sparkles,
  Bot,
  AudioWaveform,
  Globe,
  Zap,
  Shield,
  ArrowRight,
  PhoneCall,
  BrainCircuit,
  Layers,
} from "lucide-react";
import agentrixLogo from "@/assets/agentrix-logo.png";

/* ─── Data ─── */
const features = [
  { icon: Bot, title: "Custom AI Agents", desc: "Build voice assistants with custom personalities, prompts, and behaviors tailored to your use case.", color: "from-emerald-500 to-cyan-600" },
  { icon: AudioWaveform, title: "Natural Voices", desc: "Choose from premium voice models with adjustable tone, speed, and emotion for lifelike conversations.", color: "from-blue-500 to-cyan-500" },
  { icon: PlugZap, title: "Tool Calling", desc: "Connect webhooks, APIs, and CRMs. Let your assistant take actions during live conversations.", color: "from-emerald-500 to-green-500" },
  { icon: Zap, title: "Ultra-Low Latency", desc: "Sub-second response times with streaming audio and real-time WebSocket connections.", color: "from-amber-500 to-orange-500" },
  { icon: Globe, title: "Multi-Language", desc: "Deploy assistants in 30+ languages with automatic detection and seamless switching.", color: "from-pink-500 to-rose-500" },
  { icon: Shield, title: "Enterprise Ready", desc: "SOC2 compliant, end-to-end encryption, and role-based access for production deployments.", color: "from-teal-500 to-blue-600" },
];

const steps = [
  { num: "01", title: "Create Your Assistant", desc: "Define your agent's persona, system prompt, and conversation style in our intuitive builder.", icon: Wand2 },
  { num: "02", title: "Configure Voice & Behavior", desc: "Select a voice, set the tone, adjust temperature, and fine-tune how your assistant responds.", icon: Sparkles },
  { num: "03", title: "Connect Tools & APIs", desc: "Wire up webhooks, databases, and external services so your assistant can take real actions.", icon: PlugZap },
  { num: "04", title: "Deploy Anywhere", desc: "Push to production with a single click. Embed via SDK, phone number, or web widget.", icon: Rocket },
];

const integrations = [
  { name: "OpenAI", icon: BrainCircuit },
  { name: "ElevenLabs", icon: AudioWaveform },
  { name: "Twilio", icon: PhoneCall },
  { name: "Deepgram", icon: Mic },
  { name: "Anthropic", icon: Layers },
  { name: "Google AI", icon: Globe },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: "easeOut" as any },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Animated Grid Background ─── */
const GridBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
    }} />
    <motion.div
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent"
    />
    <motion.div
      animate={{ opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-teal-500/15 to-transparent"
    />
  </div>
);

/* ─── Floating Particles ─── */
const FloatingParticles = ({ count = 40 }: { count?: number }) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -30 - Math.random() * 40, 0],
          x: [0, (Math.random() - 0.5) * 30, 0],
          opacity: [0.2, 0.6, 0.2],
        }}
        transition={{
          duration: 5 + Math.random() * 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 5,
        }}
        className="absolute rounded-full"
        style={{
          width: `${1.5 + Math.random() * 3}px`,
          height: `${1.5 + Math.random() * 3}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: Math.random() > 0.5 ? 'rgb(16,185,129)' : 'rgb(6,182,212)',
        }}
      />
    ))}
  </div>
);

/* ─── Animated Orb (replaces robot image) ─── */
const HeroOrb = () => (
  <div className="relative flex items-center justify-center">
    {/* Outer glow rings */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute h-72 w-72 rounded-full border border-emerald-500/10"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
    </motion.div>

    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute h-56 w-56 rounded-full border border-teal-500/10"
    >
      <div className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
    </motion.div>

    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute h-40 w-40 rounded-full border border-emerald-400/15"
    >
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
    </motion.div>

    {/* Pulsing glow */}
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute h-52 w-52 rounded-full bg-emerald-600/20 blur-[60px]"
    />

    {/* Inner orb */}
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className="relative h-28 w-28 rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-[0_0_60px_rgba(16,185,129,0.4)]"
    >
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400/30 to-transparent" />
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent to-white/10"
      />
    </motion.div>

    {/* Floating micro-particles around orb */}
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        animate={{
          y: [0, -20, 0],
          x: [0, (i % 2 === 0 ? 10 : -10), 0],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: 3 + i * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.4,
        }}
        className="absolute h-1 w-1 rounded-full bg-emerald-400"
        style={{
          left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 8)}%`,
          top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 8)}%`,
        }}
      />
    ))}
  </div>
);

/* ─── Mouse Spotlight ─── */
const useMouseSpotlight = (ref: React.RefObject<HTMLElement | null>) => {
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    };
    el.addEventListener("mousemove", handler);
    return () => el.removeEventListener("mousemove", handler);
  }, [ref, mouseX, mouseY]);

  return { smoothX, smoothY };
};

/* ─── Ticker / Marquee ─── */
const InfiniteMarquee = () => (
  <div className="relative overflow-hidden py-6 border-y border-white/5">
    <motion.div
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="flex gap-12 whitespace-nowrap"
    >
      {[...integrations, ...integrations].map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="flex items-center gap-2 text-zinc-500">
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{item.name}</span>
          </div>
        );
      })}
    </motion.div>
  </div>
);

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { smoothX, smoothY } = useMouseSpotlight(heroRef);

  const spotlightBg = useTransform(
    [smoothX, smoothY],
    ([x, y]: number[]) =>
      `radial-gradient(600px 350px at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgba(16,185,129,0.07), transparent 70%)`
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-display text-base font-bold tracking-tight">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-white/10 shrink-0">
              <img src={agentrixLogo} alt="AGENTRIX" className="h-full w-full object-cover absolute inset-0" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">AGENTRIX</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-zinc-500 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#how-it-works" className="transition hover:text-white">How It Works</a>
            <a href="#integrations" className="transition hover:text-white">Integrations</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="hidden text-zinc-400 hover:text-white hover:bg-white/5 sm:inline-flex">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold shadow-glow">
              <Link to="/auth?tab=signup">Get Started <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ═══ HERO ═══ */}
        <section ref={heroRef} className="relative overflow-hidden min-h-[90vh] flex items-center">
          <GridBackground />
          <FloatingParticles count={50} />
          <motion.div className="pointer-events-none absolute inset-0" style={{ background: spotlightBg }} />

          {/* Gradient blobs - always moving */}
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute top-20 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -40, 30, 0], y: [0, 30, -30, 0], scale: [1, 0.9, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute bottom-20 -right-32 w-80 h-80 bg-teal-600/10 rounded-full blur-[120px]"
          />

          <div className="container relative flex flex-col lg:flex-row items-center gap-16 px-4 py-20 lg:py-0">
            {/* Left: Content */}
            <div className="flex-1 max-w-2xl">
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs text-emerald-400">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Sparkles className="h-3 w-3" />
                </motion.div>
                Now in Public Beta
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Build Custom <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                  Voice AI Agents
                </span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-6 max-w-lg text-base text-zinc-400 leading-relaxed sm:text-lg">
                Create, customize, and deploy production-ready voice assistants in minutes. Plug in any LLM, voice, or tool — and go live.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-8 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 h-12 px-6">
                  <Link to="/auth?tab=signup">Start Building <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 h-12 px-6">
                  <Link to="/app"><Mic className="h-4 w-4 mr-1" /> Try Live Demo</Link>
                </Button>
              </motion.div>

              {/* Stats inline */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="mt-12 flex items-center gap-8 text-sm">
                {[
                  { val: "148M+", label: "API Calls" },
                  { val: "<300ms", label: "Latency" },
                  { val: "344K+", label: "Developers" },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{s.val}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Animated Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex-shrink-0"
            >
              <HeroOrb />
            </motion.div>
          </div>
        </section>

        {/* ═══ INTEGRATIONS MARQUEE ═══ */}
        <section id="integrations" className="relative bg-zinc-950">
          <InfiniteMarquee />
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
          <GridBackground />
          <FloatingParticles count={20} />

          <div className="container relative px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0} className="mb-16 text-center">
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400">
                <Zap className="h-3 w-3" /> Platform Features
              </motion.div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need</h2>
              <p className="mt-4 text-base text-zinc-400 max-w-lg mx-auto">A complete platform for building, testing, and deploying voice AI at scale.</p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={staggerContainer}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title} variants={fadeUp} custom={i}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative rounded-2xl border border-white/5 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-emerald-500/20 hover:bg-zinc-900/80 cursor-default overflow-hidden">
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className={`relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="relative font-display text-base font-semibold text-white">{f.title}</h3>
                    <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">{f.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
          <GridBackground />

          {/* Animated ambient line */}
          <motion.div
            animate={{ scaleX: [0, 1, 0], x: ["-100%", "0%", "100%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
          />

          <div className="container relative px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0} className="mb-16 text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
              <p className="mt-4 text-base text-zinc-400">Four steps to your first voice agent.</p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.num}
                    initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-40px" }} variants={fadeUp} custom={i}
                    whileHover={{ y: -6 }}
                    className="group relative rounded-2xl border border-white/5 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-emerald-500/20">

                    <motion.span
                      animate={{ opacity: [0.1, 0.2, 0.1] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      className="font-display text-5xl font-bold text-emerald-500/10 absolute top-4 right-4"
                    >{s.num}</motion.span>

                    <div className="relative mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="relative font-display text-sm font-semibold text-white">{s.title}</h3>
                    <p className="relative mt-2 text-xs leading-relaxed text-zinc-400">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ IMMERSIVE SECTION ═══ */}
        <section className="relative py-24 lg:py-36 overflow-hidden">
          <FloatingParticles count={30} />

          {/* Large background orb */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-emerald-500/5"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-teal-500/5"
          />

          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-600/15 rounded-full blur-[100px]"
          />

          <div className="container relative px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0}
              className="mx-auto max-w-2xl text-center">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-4 py-1.5 text-xs text-cyan-400">
                <Zap className="h-3 w-3" /> Powered by AI
              </motion.div>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Voice Interaction</span>
              </h2>
              <p className="mt-5 text-base text-zinc-400 sm:text-lg max-w-xl mx-auto">
                Build assistants that don't just respond — they understand context, take actions, and learn from every conversation.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 h-12 px-8">
                  <Link to="/app">Open Studio <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section id="cta" className="relative py-24 lg:py-32 overflow-hidden">
          <GridBackground />
          <div className="container px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp} custom={0}
              className="mx-auto max-w-xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Ready to Build?</h2>
              <p className="mt-4 text-base text-zinc-400">Start creating your first voice agent in under 5 minutes. No credit card required.</p>
              <div className="mt-8">
                <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 h-12 px-8">
                  <Link to="/auth?tab=signup">Get Started Free <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 text-xs text-zinc-500 sm:flex-row">
          <div className="flex items-center gap-2.5 font-display font-bold text-white">
            <div className="relative h-6 w-6 overflow-hidden rounded border border-white/10 shrink-0">
              <img src={agentrixLogo} alt="AGENTRIX" className="h-full w-full object-cover absolute inset-0" />
            </div>
            AGENTRIX
          </div>
          <p>© {new Date().getFullYear()} AGENTRIX. All rights reserved.</p>
        </div>
      </footer>
    </div >
  );
};

export default Index;
