import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Star,
} from "lucide-react";
import agentrixLogo from "@/assets/agentrix-logo.png";

/* ─── Data ─── */
const features = [
  { icon: Bot, title: "Custom AI Agents", desc: "Build voice assistants with custom personalities and behaviors tailored to your brand.", color: "from-indigo-500 to-purple-600", accent: "indigo" },
  { icon: AudioWaveform, title: "Natural Voices", desc: "Choose from premium voice models with adjustable tone and emotion for lifelike conversations.", color: "from-purple-500 to-pink-500", accent: "purple" },
  { icon: PlugZap, title: "Tool Calling", desc: "Connect webhooks and APIs. Let your assistant take actions during live conversations.", color: "from-blue-500 to-cyan-500", accent: "blue" },
  { icon: Zap, title: "Ultra-Low Latency", desc: "Sub-second response times with streaming audio and real-time WebSocket connections.", color: "from-cyan-500 to-emerald-500", accent: "cyan" },
  { icon: Globe, title: "Multi-Language", desc: "Deploy assistants in 30+ languages with automatic detection and seamless switching.", color: "from-pink-500 to-rose-500", accent: "pink" },
  { icon: Shield, title: "Enterprise Ready", desc: "SOC2 compliant, end-to-end encryption, and role-based access for your team.", color: "from-violet-500 to-indigo-600", accent: "violet" },
];

const steps = [
  { num: "01", title: "Create Your Assistant", desc: "Define persona and style.", icon: Wand2 },
  { num: "02", title: "Configure Voice", desc: "Select tone and emotion.", icon: Sparkles },
  { num: "03", title: "Connect Tools", desc: "Wire up APIs and webhooks.", icon: PlugZap },
  { num: "04", title: "Deploy Anywhere", desc: "Single click to go live.", icon: Rocket },
];

const integrations = [
  { name: "OpenAI", icon: BrainCircuit },
  { name: "ElevenLabs", icon: AudioWaveform },
  { name: "Twilio", icon: PhoneCall },
  { name: "Deepgram", icon: Mic },
  { name: "Anthropic", icon: Layers },
  { name: "Google AI", icon: Globe },
];

/* ─── 3D Tilt Hook ─── */
const useTilt = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;
    x.set(mouseXPos / width - 0.5);
    y.set(mouseYPos / height - 0.5);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { rotateX, rotateY, onMouseMove, onMouseLeave };
};

/* ─── Animated Grid Background ─── */
const GridBackground = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(hsla(263, 90%, 60%, 0.05) 1px, transparent 1px), linear-gradient(90deg, hsla(263, 90%, 60%, 0.05) 1px, transparent 1px)`,
      backgroundSize: '80px 80px',
      perspective: '1000px',
      transform: 'rotateX(20deg) scale(1.5)',
      transformOrigin: 'top',
    }} />
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
  </div>
);

/* ─── 3D Hero Orb ─── */
const HeroOrb = () => (
  <div className="relative flex items-center justify-center perspective-[1000px] preserve-3d">
    <motion.div
      animate={{
        rotateY: [0, 360],
        rotateX: [0, 10, -10, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="relative h-80 w-80 preserve-3d"
    >
      {/* Dynamic Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            rotateX: [0, 360],
            rotateZ: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10 + i * 5,
            repeat: Infinity,
            ease: "linear",
            delay: i * 2
          }}
          className="absolute inset-0 rounded-full border border-primary/20"
          style={{ transform: `rotateY(${i * 60}deg)` }}
        />
      ))}

      {/* Core Orb */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-20 rounded-full bg-gradient-to-br from-primary via-purple-500 to-accent shadow-[0_0_100px_rgba(139,92,246,0.5)] flex items-center justify-center preserve-3d"
      >
        <div className="absolute inset-2 rounded-full bg-black/20 backdrop-blur-sm" />
        <Bot className="h-12 w-12 text-white relative z-10" />

        {/* Internal Glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-white/20 blur-xl"
        />
      </motion.div>
    </motion.div>

    {/* Light Flares */}
    <div className="absolute -inset-20 bg-primary/10 blur-[120px] rounded-full" />
    <div className="absolute inset-0 bg-accent/5 blur-[80px] rounded-full translate-x-10" />
  </div>
);

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/[0.05] bg-background/80 backdrop-blur-2xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 p-1 bg-white/5">
              <img src={agentrixLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-xl font-black tracking-widest text-white uppercase">
              Agentrix
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {['Features', 'Solutions', 'Enterprise', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-muted-foreground hover:text-white transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-white">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-8 shadow-3d transition-all hover:scale-105 hover:shadow-primary/40">
              <Link to="/auth?tab=signup">Get Started <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* ═══ HERO ═══ */}
        <section ref={heroRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="relative min-h-screen flex items-center overflow-hidden">
          <GridBackground />

          <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-lg">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase text-primary-foreground/80">Next-Gen Voice AI</span>
              </div>

              <h1 className="font-display text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
                Build <br />
                <span className="text-gradient">3D Intelligent</span> <br />
                Voice Agents
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mb-12">
                The most advanced platform for creating hyper-realistic, low-latency voice assistants that actually understand your business.
              </p>

              <div className="flex flex-wrap gap-6">
                <Button asChild size="lg" className="h-16 px-10 rounded-full bg-white text-black font-black text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                  <Link to="/auth?tab=signup">Start Free Trial</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-full border-white/10 bg-white/5 backdrop-blur-xl font-bold text-lg hover:bg-white/10 transition-all">
                  <Link to="/app">View Demo</Link>
                </Button>
              </div>

              <div className="mt-20 flex items-center gap-12 opacity-60">
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white">99.9%</span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Uptime</span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white">&lt;200ms</span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Latency</span>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-3xl font-black text-white">50+</span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Voices</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <HeroOrb />
            </motion.div>
          </div>
        </section>

        {/* ═══ TRUSTED BY ═══ */}
        <section className="py-20 bg-background relative z-10">
          <div className="container mx-auto px-6">
            <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-12">Powering the worlds best teams</p>
            <div className="flex flex-wrap justify-center gap-16 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
              {integrations.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <item.icon className="h-6 w-6" />
                  <span className="text-lg font-bold tracking-tighter">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURES GRID ═══ */}
        <section id="features" className="py-32 relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mb-24">
              <h2 className="font-display text-5xl md:text-7xl font-black tracking-tighter mb-8 italic">
                Beyond <span className="text-primary">Standard</span> AI.
              </h2>
              <p className="text-2xl text-muted-foreground font-medium">
                Our architecture is built for mission-critical applications that require precision, speed, and reliability.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 perspective-[2000px]">
              {features.map((f, i) => (
                <FeatureCard key={f.title} {...f} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══ IMMERSIVE CTA ═══ */}
        <section className="py-40 relative">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden preserve-3d"
            >
              {/* Animated Background for CTA */}
              <div className="absolute inset-0 bg-primary/10 opacity-30" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl opacity-50"
              />

              <div className="relative z-10">
                <Star className="h-16 w-16 text-primary mx-auto mb-12 animate-pulse" />
                <h2 className="font-display text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-none italic">
                  READY FOR THE <br /> FUTURE?
                </h2>
                <p className="text-2xl text-muted-foreground max-w-2xl mx-auto mb-16">
                  Join 5,000+ developers building the next generation of conversational apps.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Button asChild size="lg" className="h-20 px-16 rounded-full bg-primary text-white font-black text-2xl hover:scale-110 transition-all shadow-primary/40 shadow-[0_0_50px]">
                    <Link to="/auth?tab=signup">Get Started Now</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-20 border-t border-white/5">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg border border-white/10 p-1 bg-white/5">
                <img src={agentrixLogo} alt="Logo" className="h-full w-full object-contain" />
              </div>
              <span className="font-display text-lg font-black tracking-widest text-white uppercase">Agentrix</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 Agentrix Inc. Built for the advanced era.</p>
          </div>

          <div className="flex gap-12 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Github</a>
            <a href="#" className="hover:text-white">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ─── Feature Card Component ─── */
const FeatureCard = ({ title, desc, icon: Icon, color, index }: any) => {
  const { rotateX, rotateY, onMouseMove, onMouseLeave } = useTilt();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative h-full glass-card glass-card-hover p-10 rounded-[2rem] preserve-3d"
    >
      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-8 shadow-2xl transition-transform group-hover:translate-z-10 translate-z-0`}>
        <Icon className="h-8 w-8 text-white" />
      </div>

      <h3 className="font-display text-2xl font-black text-white mb-4 translate-z-20">{title}</h3>
      <p className="text-muted-foreground leading-relaxed translate-z-10">{desc}</p>

      {/* Decorative Glow */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full group-hover:bg-primary/20 transition-all duration-700" />
    </motion.div>
  );
};

export default Index;

