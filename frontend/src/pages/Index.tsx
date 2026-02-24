import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic, Wand2, PlugZap, Rocket, Sparkles, Bot, AudioWaveform,
  Globe, Zap, Shield, ChevronRight, PhoneCall, BrainCircuit,
  Layers, ArrowUpRight,
} from "lucide-react";
import agentrixLogo from "@/assets/agentrix-logo.png";

/* ─── Data ─── */
const features = [
  { icon: Bot, title: "Custom AI Agents", desc: "Build voice assistants with custom personalities tailored precisely to your brand.", color: "from-violet-600 to-purple-700" },
  { icon: AudioWaveform, title: "Neural Voices", desc: "Premium voice synthesis with adjustable tone and emotion for lifelike conversations.", color: "from-fuchsia-600 to-pink-700" },
  { icon: PlugZap, title: "Tool Calling", desc: "Connect webhooks and APIs. Let your assistant take real actions during live calls.", color: "from-blue-600 to-cyan-600" },
  { icon: Zap, title: "Ultra-Low Latency", desc: "Sub-200ms response times with streaming audio and real-time WebSocket connections.", color: "from-emerald-600 to-cyan-700" },
  { icon: Globe, title: "30+ Languages", desc: "Deploy assistants globally with automatic language detection and seamless switching.", color: "from-rose-600 to-pink-600" },
  { icon: Shield, title: "Enterprise Security", desc: "SOC2 compliant. End-to-end encryption and role-based access for your entire team.", color: "from-amber-600 to-orange-600" },
];

const steps = [
  { num: "01", title: "Create Agent", desc: "Define persona, style and goals.", icon: Wand2 },
  { num: "02", title: "Configure Voice", desc: "Select tone, pace and emotion.", icon: Sparkles },
  { num: "03", title: "Connect Tools", desc: "Wire up APIs and webhooks.", icon: PlugZap },
  { num: "04", title: "Deploy Live", desc: "One click to production.", icon: Rocket },
];

const integrations = [
  { name: "OpenAI", icon: BrainCircuit },
  { name: "ElevenLabs", icon: AudioWaveform },
  { name: "Twilio", icon: PhoneCall },
  { name: "Deepgram", icon: Mic },
  { name: "Anthropic", icon: Layers },
  { name: "Google AI", icon: Globe },
];

/* ─── 3D Tilt Card Hook ─── */
const useTilt = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mx = useSpring(x, { stiffness: 200, damping: 25 });
  const my = useSpring(y, { stiffness: 200, damping: 25 });
  const rotateX = useTransform(my, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mx, [-0.5, 0.5], [-8, 8]);

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => { x.set(0); y.set(0); };
  return { rotateX, rotateY, onMouseMove, onMouseLeave };
};

/* ─── Perspective Grid ─── */
const GridBg = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 250]);

  return (
    <motion.div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ y }}>
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(hsla(290,100%,60%,0.08) 1px, transparent 1px),
          linear-gradient(90deg, hsla(290,100%,60%,0.08) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        transform: "perspective(800px) rotateX(25deg) scale(2.5)",
        transformOrigin: "top center",
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
    </motion.div>
  );
};

/* ─── Animated Orb ─── */
const HeroOrb = () => (
  <motion.div
    className="relative flex items-center justify-center cursor-pointer"
    whileHover={{ scale: 1.1 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    {/* Outer rotating rings */}
    {[0, 1, 2].map(i => (
      <motion.div key={i}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 12 + i * 6, repeat: Infinity, ease: "linear" }}
        className="absolute rounded-full border border-white/[0.08]"
        style={{ width: 220 + i * 80, height: 220 + i * 80, borderColor: `hsla(${290 + i * 20},100%,60%,${0.15 - i * 0.04})` }}
      />
    ))}
    {/* Accent ring */}
    <motion.div
      animate={{ rotate: [360, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
      className="absolute w-[260px] h-[260px] rounded-full"
      style={{ border: "2px dashed hsla(190,100%,60%,0.25)" }}
    />
    {/* Core entity */}
    <motion.div
      animate={{ scale: [1, 1.08, 1], boxShadow: ["0 0 50px hsla(290,100%,60%,0.4)", "0 0 100px hsla(290,100%,60%,0.7)", "0 0 50px hsla(290,100%,60%,0.4)"] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative w-36 h-36 rounded-full flex items-center justify-center transform-gpu"
      style={{ background: "radial-gradient(circle at 35% 35%, hsla(290,100%,75%,1), hsla(290,100%,45%,1))" }}
    >
      <div className="absolute inset-2 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center">
        <Bot className="h-10 w-10 text-white" />
      </div>
      <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-white/20 blur-xl"
      />
    </motion.div>
    {/* Glow aura */}
    <div className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-25"
      style={{ background: "radial-gradient(circle, hsla(290,100%,60%,1), hsla(190,100%,55%,0.6))" }}
    />
  </motion.div>
);

/* ─── Feature Card ─── */
const FeatureCard = ({ title, desc, icon: Icon, color, index }: any) => {
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group glass-card shimmer neon-border p-7 rounded-2xl preserve-3d cursor-pointer"
    >
      <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`} style={{ transform: "translateZ(20px)" }}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="font-display text-base font-bold text-white mb-2 tracking-tight" style={{ transform: "translateZ(14px)" }}>
        {title}
      </h3>
      <p className="text-[11px] text-muted-foreground leading-relaxed" style={{ transform: "translateZ(8px)" }}>
        {desc}
      </p>
      <div className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-3">
        <ArrowUpRight className="h-3 w-3 text-primary/60" />
      </div>
    </motion.div>
  );
};

/* ─── Step ─── */
const Step = ({ num, title, desc, icon: Icon, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, x: 0 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ x: 10, scale: 1.02 }}
    transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
    className="flex items-start gap-4 group cursor-pointer"
  >
    <div className="relative flex-shrink-0">
      <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/10 transition-all">
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <span className="absolute -top-1.5 -right-1.5 text-[9px] font-black text-primary/60 font-mono">{num}</span>
      {index < 3 && <div className="absolute left-1/2 top-10 h-10 border-l border-dashed border-white/[0.06]" />}
    </div>
    <div className="pb-8">
      <p className="font-bold text-[13px] text-white mb-1">{title}</p>
      <p className="text-[11px] text-muted-foreground">{desc}</p>
    </div>
  </motion.div>
);

/* ─── Page ─── */
const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt();

  return (
    <div className="min-h-screen bg-background text-foreground relative">

      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-[100] border-b border-white/[0.04] bg-background/70 backdrop-blur-2xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg border border-white/10 p-1 bg-white/5 group-hover:border-primary/30 transition-all">
              <img src={agentrixLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-sm font-bold tracking-[0.2em] text-white uppercase">
              Agentrix
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['Features', 'Solutions', 'Enterprise', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="h-8 px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-white/5">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild className="h-8 px-5 rounded-full bg-primary text-white text-[11px] font-bold tracking-widest btn-glow transition-all hover:scale-105">
              <Link to="/auth?tab=signup">Get Started <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* ══ HERO ══ */}
        <section ref={heroRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}
          className="relative min-h-screen flex items-center overflow-hidden"
        >
          <GridBg />

          <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center py-24">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-8"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary">Next-Gen Voice AI Platform</span>
              </motion.div>

              <h1 className="font-display font-black leading-[0.9] tracking-tighter mb-6 text-[clamp(2.2rem,6vw,4.5rem)]">
                Build{" "}
                <span className="text-gradient glitch" data-text="Intelligent">Intelligent</span>
                <br />
                Voice Agents<br />
                <span className="text-muted-foreground/50 text-[0.55em] font-bold tracking-normal">
                  That Actually Understand You
                </span>
              </h1>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-10">
                The most advanced platform for creating hyper-realistic, low-latency voice assistants powered by frontier AI models.
              </p>

              <div className="flex flex-wrap gap-4 mb-14">
                <Button asChild size="lg" className="h-12 px-8 rounded-full bg-white text-black text-xs font-black tracking-widest hover:bg-white/90 transition-all hover:scale-105 shadow-xl">
                  <Link to="/auth?tab=signup">Start Free Trial</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-full border-white/10 bg-white/[0.03] text-xs font-bold tracking-widest hover:bg-white/[0.06] transition-all">
                  <Link to="/app">View Live Demo</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8">
                {[
                  { val: "99.9%", label: "Uptime" },
                  { val: "<200ms", label: "Latency" },
                  { val: "50+", label: "AI Voices" },
                ].map(({ val, label }, i) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-xl font-black text-white font-mono">{val}</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">{label}</span>
                    {i < 2 && <div className="absolute ml-24 h-6 border-l border-white/[0.06]" />}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="hidden lg:flex justify-center"
            >
              <HeroOrb />
            </motion.div>
          </div>
        </section>

        {/* ══ TRUSTED BY ══ */}
        <section className="py-16 relative z-10 border-y border-white/[0.04]">
          <div className="container mx-auto px-6">
            <p className="text-center text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/50 mb-10">
              Integrated with the world's best AI infrastructure
            </p>
            <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-30 hover:opacity-60 transition-all duration-700">
              {integrations.map(({ name, icon: Icon }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-bold tracking-wider">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" className="py-28 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-white/[0.05] to-transparent" />
          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="max-w-2xl mb-20"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Core Capabilities</p>
              <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] font-black tracking-tighter leading-tight mb-4">
                Beyond Standard AI.<br />
                <span className="text-muted-foreground/40">Built for What's Next.</span>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our architecture is built for mission-critical applications that require precision, speed, and rock-solid reliability.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 perspective-[2000px]">
              {features.map((f, i) => <FeatureCard key={f.title} {...f} index={i} />)}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ══ */}
        <section className="py-28 relative overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4">Process</p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,3.2rem)] font-black tracking-tighter mb-6">
                  From Idea to Live<br />
                  in Minutes.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No boilerplate. No complexity. Just powerful voice AI configured through an intuitive 7D studio interface.
                </p>
              </motion.div>

              <div className="space-y-0">
                {steps.map((s, i) => <Step key={s.num} {...s} index={i} />)}
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <section className="py-24 relative">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass-card rounded-3xl p-12 md:p-20 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -left-1/4 w-[150%] h-[150%] opacity-20"
                style={{ background: "conic-gradient(from 0deg, hsla(290,100%,60%,0.25), transparent 30%, hsla(190,100%,55%,0.25), transparent 70%)" }}
              />
              <div className="relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mx-auto mb-8">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display text-[clamp(2rem,5vw,3.8rem)] font-black tracking-tighter mb-4 leading-tight">
                  Ship Your AI Agent.<br />
                  <span className="text-muted-foreground/40">Ship it Today.</span>
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-10">
                  Join 5,000+ developers building the next generation of conversational applications with Agentrix.
                </p>
                <Button asChild size="lg" className="h-12 px-10 rounded-full bg-primary text-white text-xs font-black tracking-widest hover:scale-105 transition-all btn-glow">
                  <Link to="/auth?tab=signup">Start Building Free <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/[0.04]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg border border-white/10 p-1 bg-white/5">
              <img src={agentrixLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-[11px] font-bold tracking-[0.2em] text-white uppercase">Agentrix</span>
            <span className="text-[10px] text-muted-foreground ml-2">© 2026 — Built for the advanced era.</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {['Twitter', 'Github', 'Discord'].map(l => (
              <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
