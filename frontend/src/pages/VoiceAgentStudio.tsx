import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { assistants as assistantsApi } from "@/lib/agentrix-api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { VoicePlayground } from "@/components/voice/VoicePlayground";
import {
  Mic, Plus, Save, LogOut, Sparkles, Trash2, Brain,
  AudioWaveform, Languages, Wrench, Volume2, Phone,
  Code, Copy, Check, ChevronRight, Settings, Layout,
  Activity, Zap, Shield, Wand2, Orbit
} from "lucide-react";
import agentrixLogo from "@/assets/agentrix-logo.png";

type VoiceAssistantRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  language: string;
  conversation_mode: string;
  temperature: number;
  voice_provider: string;
  voice_id: string | null;
  voice_speed: number;
  tools: any;
  created_at: string;
  updated_at: string;
};

const defaultAssistantDraft = (): Partial<VoiceAssistantRow> => ({
  name: "New assistant",
  description: "",
  system_prompt: "You are a friendly voice assistant. Keep responses short and helpful.",
  language: "en",
  conversation_mode: "friendly",
  temperature: 0.7,
  voice_provider: "elevenlabs",
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  voice_speed: 1.0,
  tools: { agentId: "", model: "gpt-4o", transcriber: "deepgram", functions: [] as string[] },
});

const MODELS = [
  { value: "gpt-4o", label: "OpenAI GPT-4o", icon: Brain },
  { value: "gpt-4o-mini", label: "OpenAI GPT-4o Mini", icon: Brain },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet", icon: Sparkles },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", icon: Zap },
];

const VOICES = [
  { value: "JBFqnCBsd6RMkjVDRZzb", label: "George — warm, authoritative" },
  { value: "EXAVITQu4vr4xnSDxMaL", label: "Sarah — clear, professional" },
  { value: "IKne3meq5aSn9XLyUdCD", label: "Charlie — energetic, youthful" },
];

export default function VoiceAgentStudio() {
  const [assistants, setAssistants] = useState<VoiceAssistantRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<VoiceAssistantRow>>(defaultAssistantDraft());
  const [loading, setLoading] = useState(false);
  const [builderTab, setBuilderTab] = useState("model");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({ name: "", businessType: "", requirements: "" });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const userId = user?.id;

  const activeAssistant = useMemo(() => assistants.find((a) => a.id === activeId) ?? null, [assistants, activeId]);
  const tools = useMemo(() => (draft.tools ?? {}) as Record<string, any>, [draft.tools]);

  const setTool = useCallback((key: string, val: any) => {
    setDraft((p) => ({ ...p, tools: { ...(p.tools ?? {}), [key]: val } }));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await assistantsApi.list();
      const rows = ((data as any[]) ?? []).map((r: any) => ({
        id: r._id || r.id,
        user_id: r.userId,
        name: r.name,
        description: r.description ?? null,
        system_prompt: r.systemPrompt ?? '',
        language: r.language ?? 'en',
        conversation_mode: r.conversationMode ?? 'friendly',
        temperature: r.temperature ?? 0.7,
        voice_provider: r.voiceProvider ?? 'elevenlabs',
        voice_id: r.voiceId ?? null,
        voice_speed: r.voiceSpeed ?? 1.0,
        tools: r.tools ?? {},
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      })) as VoiceAssistantRow[];
      setAssistants(rows);
      if (rows[0] && !activeId) setActiveId(rows[0].id);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Error", description: "Could not fetch assistants." });
    } finally {
      setLoading(false);
    }
  }, [toast, activeId]);

  useEffect(() => { if (userId) load(); }, [userId, load]);

  useEffect(() => {
    if (!activeAssistant) return;
    setDraft({ ...activeAssistant, tools: activeAssistant.tools ?? defaultAssistantDraft().tools });
  }, [activeAssistant]);

  const saveAssistant = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      await assistantsApi.update(activeId, {
        name: draft.name ?? "Untitled",
        description: draft.description ?? null,
        systemPrompt: draft.system_prompt ?? "",
        language: draft.language ?? "en",
        conversationMode: draft.conversation_mode ?? "neutral",
        temperature: Number(draft.temperature ?? 0.7),
        voiceProvider: draft.voice_provider ?? "elevenlabs",
        voiceId: draft.voice_id ?? null,
        voiceSpeed: Number(draft.voice_speed ?? 1.0),
        tools: draft.tools ?? {},
      });
      toast({ title: "Configuration Updated", description: "Changes saved to the 3D core." });
      await load();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to persist changes." });
    } finally {
      setLoading(false);
    }
  }, [activeId, draft, toast, load]);

  const deleteAssistant = async () => {
    if (!activeId) return;
    if (!confirm("Are you sure? This action is irreversible.")) return;
    setLoading(true);
    try {
      await assistantsApi.remove(activeId);
      setAssistants((p) => p.filter((a) => a.id !== activeId));
      setActiveId(null);
      toast({ title: "Assistant Purged" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete." });
    } finally {
      setLoading(false);
    }
  };

  const handleWizardSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const generatedPrompt = `You are an advanced 3D Voice AI for ${wizardData.businessType} named ${wizardData.name}. Goal: ${wizardData.requirements}.`;
      const defaults = defaultAssistantDraft();
      await assistantsApi.create({
        name: wizardData.name || "New Protocol",
        description: wizardData.businessType,
        systemPrompt: generatedPrompt,
        ...defaults,
      });
      await load();
      setWizardOpen(false);
      toast({ title: "Protocol Initiated", description: "Your new AI is ready." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create." });
    } finally {
      setLoading(false);
    }
  };

  const signOut = useCallback(async () => {
    logout();
    navigate("/", { replace: true });
  }, [navigate, logout]);

  if (!userId) return null;

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden preserve-3d">
      {/* HEADER */}
      <header className="h-14 border-b border-white/[0.04] bg-background/80 backdrop-blur-3xl flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="h-7 w-7 p-1 rounded-lg border border-white/10 bg-white/5">
              <img src={agentrixLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-[11px] font-bold tracking-[0.25em] text-white uppercase">
              Studio<span className="text-primary">.7D</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-white/5">
            <Link to="/phone-numbers"><Phone className="mr-2 h-3 w-3" /> Comms</Link>
          </Button>
          <div className="h-4 w-px bg-white/10" />
          <Button onClick={saveAssistant} disabled={loading || !activeId} className="h-8 px-5 rounded-full bg-primary text-white text-[10px] font-black tracking-widest btn-glow hover:scale-105 transition-all">
            <Save className="mr-2 h-3.5 w-3.5" /> Deploy
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8 rounded-full hover:bg-white/5">
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-80 border-r border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl flex flex-col">
          <div className="p-6 border-b border-white/[0.05] flex justify-between items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Assistants</h2>
            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => setWizardOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {assistants.map((a) => (
              <button
                key={a.id}
                onClick={() => setActiveId(a.id)}
                className={`w-full group relative p-4 rounded-2xl transition-all duration-300 text-left border \${a.id === activeId ? "bg-primary/10 border-primary/30 shadow-3d" : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-display font-bold \${a.id === activeId ? "text-white" : "text-muted-foreground group-hover:text-white"}`}>{a.name}</span>
                  {a.id === activeId && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                </div>
                <div className="flex gap-2 text-[9px] font-black uppercase tracking-wider opacity-60">
                  <span className="flex items-center gap-1"><Languages className="h-2 w-2" /> {a.language}</span>
                  <span className="flex items-center gap-1"><Zap className="h-2 w-2" /> {a.conversation_mode}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* EDITOR */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <section className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {!activeId ? (
              <div className="h-full flex items-center justify-center text-center">
                <div className="max-w-md">
                  <Orbit className="h-16 w-16 text-primary/20 mx-auto mb-6" />
                  <h3 className="text-xl font-black tracking-tight mb-2">NO PROTOCOL ACTIVE</h3>
                  <p className="text-muted-foreground mb-8 uppercase tracking-widest text-[10px]">Select an assistant or spawn a new one to begin.</p>
                  <Button onClick={() => setWizardOpen(true)} className="bg-white text-black font-black rounded-full px-8 h-14 hover:scale-105 transition-all">
                    <Plus className="mr-2 h-5 w-5" /> Initiate New AI
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <input
                      value={draft.name ?? ""}
                      onChange={(e) => setDraft(p => ({ ...p, name: e.target.value }))}
                      className="bg-transparent border-none text-2xl font-black tracking-tighter text-white focus:outline-none focus:ring-0 w-full italic"
                    />
                    <input
                      value={draft.description ?? ""}
                      onChange={(e) => setDraft(p => ({ ...p, description: e.target.value }))}
                      className="bg-transparent border-none text-muted-foreground font-medium text-sm focus:outline-none focus:ring-0 w-full uppercase tracking-widest"
                      placeholder="Protocol description..."
                    />
                  </div>
                  <Button variant="ghost" onClick={deleteAssistant} className="h-12 w-12 rounded-2xl text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                <Tabs value={builderTab} onValueChange={setBuilderTab} className="space-y-10">
                  <TabsList className="bg-white/5 border border-white/10 rounded-2xl h-14 p-1.5 w-full flex justify-between overflow-x-auto no-scrollbar">
                    {["model", "voice", "functions", "integration"].map((tab) => (
                      <TabsTrigger key={tab} value={tab} className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={builderTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TabsContent value="model" className="mt-0 space-y-8">
                        <div className="glass-card rounded-[2.5rem] p-8 border-white/10 space-y-8">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AI CORE ENGINE</Label>
                              <Select value={tools.model ?? "gpt-4o"} onValueChange={(v) => setTool("model", v)}>
                                <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-bold">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-white/10">
                                  {MODELS.map(m => (
                                    <SelectItem key={m.value} value={m.value} className="focus:bg-primary font-bold">
                                      {m.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center ml-1">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CREATIVITY RATIO</Label>
                                <span className="text-xs font-black text-primary">{(draft.temperature ?? 0.7).toFixed(1)}</span>
                              </div>
                              <div className="h-14 flex items-center px-4 bg-white/5 rounded-2xl border border-white/10">
                                <Slider value={[draft.temperature ?? 0.7]} onValueChange={([v]) => setDraft(p => ({ ...p, temperature: v }))} min={0} max={1.5} step={0.1} className="w-full" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">SYSTEM DIRECTIVES</Label>
                            <Textarea
                              value={draft.system_prompt ?? ""}
                              onChange={(e) => setDraft(p => ({ ...p, system_prompt: e.target.value }))}
                              className="min-h-[250px] rounded-[2.5rem] bg-white/5 border-white/10 p-8 font-medium leading-relaxed resize-none focus:ring-primary focus:border-primary"
                              placeholder="Define the behavior protocol..."
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="voice" className="mt-0">
                        <div className="glass-card rounded-[2.5rem] p-8 border-white/10 space-y-10">
                          <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">NEURAL PROVIDER</Label>
                              <div className="h-14 flex items-center px-6 bg-white/5 rounded-2xl border border-white/10 font-black uppercase tracking-widest text-xs">
                                {draft.voice_provider}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">VOICE ID OVERRIDE</Label>
                              <Input value={draft.voice_id ?? ""} onChange={(e) => setDraft(p => ({ ...p, voice_id: e.target.value }))} className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-mono" />
                            </div>
                          </div>

                          <div className="grid gap-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">PREMIUM NEURAL PROFILES</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {VOICES.map(v => (
                                <button key={v.value} onClick={() => setDraft(p => ({ ...p, voice_id: v.value }))} className={`p-6 rounded-2xl border text-left transition-all group \${draft.voice_id === v.value ? "bg-primary border-primary shadow-3d" : "bg-white/5 border-white/10 hover:border-primary/50"}`}>
                                  <div className="flex justify-between items-center mb-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center \${draft.voice_id === v.value ? "bg-white/20" : "bg-primary/10"}`}>
                                      <Volume2 className={`h-5 w-5 \${draft.voice_id === v.value ? "text-white" : "text-primary"}`} />
                                    </div>
                                    {draft.voice_id === v.value && <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                                  </div>
                                  <p className={`font-display font-bold text-sm \${draft.voice_id === v.value ? "text-white" : "text-muted-foreground group-hover:text-white"}`}>{v.label.split("—")[0]}</p>
                                  <p className={`text-[10px] uppercase tracking-widest mt-1 opacity-60 \${draft.voice_id === v.value ? "text-white" : "text-muted-foreground"}`}>HD Neural</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="integration" className="mt-0">
                        <div className="glass-card rounded-[2.5rem] p-10 border-white/10 space-y-10">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                              <Code className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-black italic tracking-tighter">SDK INTEGRATION</h3>
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Universal Deployment Module</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">PROTOCOL ID</Label>
                              <div className="flex gap-4">
                                <Input readOnly value={activeId || ""} className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-mono font-bold text-xs" />
                                <Button variant="outline" className="h-14 w-14 rounded-2xl border-white/10 hover:bg-white/5" onClick={() => { navigator.clipboard.writeText(activeId || ""); toast({ title: "Copied" }); }}>
                                  <Copy className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">WEB INJECTION MODULE</Label>
                              <div className="rounded-[2.5rem] bg-zinc-950 border border-white/10 p-8 relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-4">
                                  <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/10" onClick={() => { navigator.clipboard.writeText(`<script src="https://agentrix.ai/v1/sdk.js"></script>`); toast({ title: "Copied" }); }}>
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <pre className="text-xs font-mono text-primary-foreground/70 leading-relaxed overflow-x-auto">
                                  <code>{`<script src="https://agentrix.ai/v1/sdk.js"></script>
<script>
  Agentrix.spawn({
    id: "${activeId || ""}",
    key: "AGENTRIX_PR_101",
    theme: "dark-3d"
  });
</script>`}</code>
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </motion.div>
                  </AnimatePresence>
                </Tabs>
              </div>
            )}
          </section>

          {/* PLAYGROUND SIDEPANEL */}
          <aside className="w-full lg:w-[450px] border-l border-white/[0.05] bg-white/[0.01] backdrop-blur-3xl overflow-y-auto custom-scrollbar">
            <div className="p-10">
              <div className="glass-card rounded-[2.5rem] p-8 border-white/10 shadow-3d mb-10">
                <VoicePlayground
                  assistant={{
                    name: draft.name ?? "New AI",
                    systemPrompt: draft.system_prompt ?? "",
                    language: draft.language ?? "en",
                    temperature: draft.temperature ?? 0.7,
                    voiceId: draft.voice_id ?? undefined,
                    voiceProvider: draft.voice_provider ?? "elevenlabs"
                  }}
                />
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">CORE METRICS</h4>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "LATENCY", val: "142ms", icon: Activity },
                    { label: "ACCURACY", val: "99.4%", icon: Shield },
                    { label: "UPTIME", val: "100%", icon: Zap },
                    { label: "LOAD", val: "Optimal", icon: Layout },
                  ].map(stat => (
                    <div key={stat.label} className="glass-card rounded-2xl p-6 border-white/5 hover:border-primary/20 transition-all">
                      <stat.icon className="h-4 w-4 text-primary mb-4" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                      <p className="font-display font-black text-white italic">{stat.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* ONBOARDING WIZARD */}
      <AnimatePresence>
        {wizardOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-3xl bg-black/80">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateX: -20 }}
              className="w-full max-w-2xl glass-card rounded-[3rem] p-12 border-white/10 shadow-3d overflow-hidden preserve-3d"
            >
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
              <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent/20 blur-[100px] rounded-full" />

              <div className="relative z-10 text-center mb-12">
                <Wand2 className="h-16 w-16 text-primary mx-auto mb-6 animate-float-slow" />
                <h2 className="text-5xl font-black italic tracking-tighter text-white">SPAWN NEW AI</h2>
                <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] mt-2">Neural Configuration Wizard</p>
              </div>

              <div className="relative z-10 space-y-8">
                {wizardStep === 1 ? (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground ml-1">AI NAME</Label>
                      <Input autoFocus placeholder="e.g. Athena" value={wizardData.name} onChange={e => setWizardData(p => ({ ...p, name: e.target.value }))} className="h-16 rounded-2xl bg-white/5 border-white/10 px-8 font-bold text-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground ml-1">BUSINESS DOMAIN</Label>
                      <Input placeholder="e.g. Fintech Support" value={wizardData.businessType} onChange={e => setWizardData(p => ({ ...p, businessType: e.target.value }))} className="h-16 rounded-2xl bg-white/5 border-white/10 px-8 font-bold text-lg" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground ml-1">BEHAVIORAL REQUIREMENTS</Label>
                      <Textarea placeholder="Explain the AI mission..." value={wizardData.requirements} onChange={e => setWizardData(p => ({ ...p, requirements: e.target.value }))} className="min-h-[160px] rounded-[2.5rem] bg-white/5 border-white/10 p-8 font-bold text-lg resize-none" />
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                  <Button variant="ghost" onClick={() => wizardStep === 1 ? setWizardOpen(false) : setWizardStep(1)} className="font-bold text-muted-foreground hover:text-white">
                    {wizardStep === 1 ? "CANCEL" : "BACK"}
                  </Button>
                  <Button onClick={() => wizardStep === 1 ? setWizardStep(2) : handleWizardSubmit()} disabled={loading} className="bg-white text-black font-black rounded-full px-10 h-16 shadow-3d hover:scale-105 transition-all">
                    {wizardStep === 1 ? "CONTINUE" : (loading ? "SPAWNING..." : "LAUNCH AI")} <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
