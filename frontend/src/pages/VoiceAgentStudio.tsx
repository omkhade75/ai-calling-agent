import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
import { Mic, Plus, Save, LogOut, Sparkles, Trash2, Brain, AudioWaveform, Languages, Wrench, Volume2, Phone, Code, Copy, Check, ChevronRight } from "lucide-react";
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
  system_prompt: "You are a friendly voice assistant. Keep responses short, ask clarifying questions, and be helpful.",
  language: "en",
  conversation_mode: "friendly",
  temperature: 0.7,
  voice_provider: "elevenlabs",
  voice_id: "JBFqnCBsd6RMkjVDRZzb",
  voice_speed: 1.0,
  tools: { agentId: "", model: "gpt-4o", transcriber: "deepgram", functions: [] as string[] },
});

const MODELS = [
  { value: "gpt-4o", label: "OpenAI GPT-4o" },
  { value: "gpt-4o-mini", label: "OpenAI GPT-4o Mini" },
  { value: "gpt-3.5-turbo", label: "OpenAI GPT-3.5 Turbo" },
  { value: "claude-3.5-sonnet", label: "Anthropic Claude 3.5 Sonnet" },
  { value: "claude-3-haiku", label: "Anthropic Claude 3 Haiku" },
  { value: "gemini-2.5-flash", label: "Google Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro", label: "Google Gemini 2.5 Pro" },
  { value: "llama-3.1-70b", label: "Meta Llama 3.1 70B" },
];

const VOICES = [
  { value: "JBFqnCBsd6RMkjVDRZzb", label: "George — warm, authoritative" },
  { value: "EXAVITQu4vr4xnSDxMaL", label: "Sarah — clear, professional" },
  { value: "CwhRBWXzGAHq8TQ4Fs17", label: "Roger — calm, narrator" },
  { value: "FGY2WhTYpPnrIDTdsKH5", label: "Laura — gentle, friendly" },
  { value: "IKne3meq5aSn9XLyUdCD", label: "Charlie — energetic, youthful" },
  { value: "pFZP5JQG7iQjIQuC4Bku", label: "Lily — soft, warm" },
  { value: "onwK4e9ZLuTAKqWW03F9", label: "Daniel — deep, confident" },
  { value: "iP95p4xoKVk53GoZ742B", label: "Chris — casual, conversational" },
];

const TRANSCRIBERS = [
  { value: "deepgram", label: "Deepgram Nova-2" },
  { value: "assembly-ai", label: "AssemblyAI" },
  { value: "whisper", label: "OpenAI Whisper" },
  { value: "google-stt", label: "Google Cloud STT" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "hi", label: "Hindi" },
  { value: "ar", label: "Arabic" },
];

const MODES = [
  { value: "friendly", label: "Friendly" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "neutral", label: "Neutral" },
  { value: "professional", label: "Professional" },
];

const FUNCTIONS = [
  { value: "webhook", label: "Webhook POST" },
  { value: "crm-update", label: "CRM Update" },
  { value: "calendar-book", label: "Calendar Booking" },
  { value: "knowledge-lookup", label: "Knowledge Base Lookup" },
  { value: "send-email", label: "Send Email" },
  { value: "transfer-call", label: "Transfer Call" },
];

export default function VoiceAgentStudio() {
  const [assistants, setAssistants] = useState<VoiceAssistantRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<VoiceAssistantRow>>(defaultAssistantDraft());
  const [loading, setLoading] = useState(false);
  const [builderTab, setBuilderTab] = useState("model");

  // Onboarding Wizard State
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    name: "",
    businessType: "",
    requirements: "",
  });

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
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Load error", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }, [toast, activeId]);

  useEffect(() => {
    if (userId) {
      load();
    }
  }, [userId, load]);

  useEffect(() => {
    if (!activeAssistant) return;
    setDraft({ ...activeAssistant, tools: activeAssistant.tools ?? defaultAssistantDraft().tools });
  }, [activeAssistant]);

  const handleWizardSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Generate system prompt based on inputs
      const generatedPrompt = `You are a professional voice assistant for ${wizardData.businessType || "a business"} named ${wizardData.name}.
Your primary goal is to: ${wizardData.requirements}.

Guidelines:
- Speak clearly and concisely.
- Be polite and professional at all times.
- Ask clarifying questions if the user's request is ambiguous.
- If you don't know the answer, politely offer to transfer the call to a human agent.
- Keep responses short (under 2-3 sentences) to maintain a natural conversation flow.`;

      const defaults = defaultAssistantDraft();
      const data = await assistantsApi.create({
        name: wizardData.name || `Assistant ${assistants.length + 1}`,
        description: `${wizardData.businessType} Assistant`,
        systemPrompt: generatedPrompt,
        language: defaults.language,
        conversationMode: defaults.conversation_mode,
        temperature: defaults.temperature,
        voiceProvider: defaults.voice_provider,
        voiceId: defaults.voice_id,
        voiceSpeed: defaults.voice_speed,
        tools: defaults.tools,
      }) as any;

      const row: VoiceAssistantRow = {
        id: data._id || data.id,
        user_id: data.userId,
        name: data.name,
        description: data.description ?? null,
        system_prompt: data.systemPrompt ?? '',
        language: data.language ?? 'en',
        conversation_mode: data.conversationMode ?? 'friendly',
        temperature: data.temperature ?? 0.7,
        voice_provider: data.voiceProvider ?? 'elevenlabs',
        voice_id: data.voiceId ?? null,
        voice_speed: data.voiceSpeed ?? 1.0,
        tools: data.tools ?? {},
        created_at: data.createdAt,
        updated_at: data.updatedAt,
      };

      setAssistants((p) => [row, ...p]);
      setActiveId(row.id);
      toast({ title: "Assistant Created", description: `"${row.name}" has been configured.` });
      setWizardOpen(false);
      setWizardStep(1);
      setWizardData({ name: "", businessType: "", requirements: "" });
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Error", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  };

  const deleteAssistant = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    try {
      await assistantsApi.remove(activeId);
      setAssistants((p) => p.filter((a) => a.id !== activeId));
      setActiveId(null);
      toast({ title: "Deleted" });
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Error", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }, [activeId, toast]);

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
      toast({ title: "Saved" });
      await load();
    } catch (e: unknown) {
      toast({ variant: "destructive", title: "Error", description: e instanceof Error ? e.message : "Failed" });
    } finally {
      setLoading(false);
    }
  }, [activeId, draft, toast, load]);

  const signOut = useCallback(async () => {
    logout();
    navigate("/", { replace: true });
  }, [navigate, logout]);

  if (!userId) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading studio…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 glass">
        <div className="flex h-12 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-foreground/90 hover:text-primary transition-colors">
            <div className="flex h-8 w-8 shrink-0 overflow-hidden rounded-lg relative drop-shadow-md">
              <img src={agentrixLogo} alt="AGENTRIX" className="h-full w-full object-cover absolute inset-0" />
            </div>
            AGENTRIX <span className="text-primary">Studio</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" asChild><Link to="/phone-numbers"><Phone className="h-3.5 w-3.5" /> Numbers</Link></Button>
            <Button variant="ghost" size="sm" onClick={() => setWizardOpen(true)} disabled={loading}><Plus className="h-3.5 w-3.5" /> New</Button>
            <Button variant="hero" size="sm" onClick={saveAssistant} disabled={loading || !activeId}><Save className="h-3.5 w-3.5" /> Save</Button>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: assistant list */}
        <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b border-sidebar-border px-4 py-3">
              <p className="font-display text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">Assistants</p>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {assistants.length === 0 ? (
                <p className="px-2 py-4 text-xs text-sidebar-foreground/50">No assistants yet.</p>
              ) : (
                <div className="grid gap-1">
                  {assistants.map((a) => (
                    <button key={a.id} onClick={() => setActiveId(a.id)}
                      className={`group relative flex w-full flex-col gap-1 rounded-xl px-4 py-3 text-left transition-all hover:bg-sidebar-accent/50 ${a.id === activeId ? "bg-sidebar-accent shadow-sm ring-1 ring-sidebar-ring/20" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"}`}>
                      {a.id === activeId && <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />}
                      <div className="flex items-center justify-between">
                        <p className={`font-display text-sm font-semibold transition-colors ${a.id === activeId ? "text-primary" : "text-sidebar-foreground group-hover:text-primary"}`}>{a.name}</p>
                        {a.id === activeId && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.5)]" />}
                      </div>
                      <p className="line-clamp-1 text-[10px] text-muted-foreground/80 font-medium tracking-wide uppercase">{a.conversation_mode} · {a.language}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Builder */}
        <main className="flex flex-1 flex-col overflow-y-auto lg:flex-row">
          <section className="flex-1 overflow-y-auto border-r border-border/30 p-4 lg:p-6">
            {!activeId ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Select or create an assistant to get started.</p>
                  <Button variant="hero" size="sm" className="mt-3" onClick={() => setWizardOpen(true)} disabled={loading}>
                    <Plus className="h-3.5 w-3.5" /> Create Assistant
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-2xl">
                {/* Name & description */}
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <Input value={draft.name ?? ""} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                      className="border-none bg-transparent px-0 font-display text-lg font-bold focus-visible:ring-0" placeholder="Assistant name" />
                    <Input value={draft.description ?? ""} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                      className="mt-1 border-none bg-transparent px-0 text-xs text-muted-foreground focus-visible:ring-0" placeholder="Short description…" />
                  </div>
                  <Button variant="ghost" size="icon" onClick={deleteAssistant} disabled={loading} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Separator className="mb-5" />

                {/* Tabbed builder — Vapi style */}
                <Tabs value={builderTab} onValueChange={setBuilderTab}>
                  <TabsList className="mb-6 inline-flex h-9 items-center justify-start rounded-none border-b border-border/40 bg-transparent p-0 w-full gap-6">
                    <TabsTrigger value="model" className="rounded-none border-b-2 border-transparent px-2 pb-2 pt-1.5 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-primary/80 transition-all">Model</TabsTrigger>
                    <TabsTrigger value="voice" className="rounded-none border-b-2 border-transparent px-2 pb-2 pt-1.5 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-primary/80 transition-all">Voice</TabsTrigger>
                    <TabsTrigger value="transcriber" className="rounded-none border-b-2 border-transparent px-2 pb-2 pt-1.5 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-primary/80 transition-all">Transcriber</TabsTrigger>
                    <TabsTrigger value="functions" className="rounded-none border-b-2 border-transparent px-2 pb-2 pt-1.5 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-primary/80 transition-all">Functions</TabsTrigger>
                    <TabsTrigger value="advanced" className="rounded-none border-b-2 border-transparent px-2 pb-2 pt-1.5 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-primary/80 transition-all">Advanced</TabsTrigger>
                    <TabsTrigger value="integration" className="rounded-none border-b-2 border-transparent px-2 pb-2 pt-1.5 font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none bg-transparent hover:text-primary/80 transition-all">Integration</TabsTrigger>
                  </TabsList>

                  {/* INTEGRATION TAB */}
                  <TabsContent value="integration" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3 bg-secondary/5 border-b border-border/40">
                        <CardTitle className="font-display text-sm flex items-center gap-2"><Code className="h-4 w-4 text-primary" /> Business Integration</CardTitle>
                        <CardDescription className="text-xs">Copy these credentials to deploy this assistant on your website.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5 pt-5">
                        <div className="grid gap-2">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground">Assistant ID</Label>
                          <div className="flex gap-2">
                            <Input readOnly value={activeId || ""} className="bg-muted font-mono text-xs" />
                            <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(activeId || ""); toast({ title: "Copied!" }); }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Unique identifier for this assistant configuration.</p>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground">Web Embed Code</Label>
                          <div className="rounded-lg border bg-slate-950 p-3 relative group">
                            <pre className="text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono">
                              {`<script src="https://cdn.agentrix.com/widget.js"></script>
<script>
  Agentrix.init({
    assistantId: "${activeId}",
    apiKey: "${user?.publicKey || 'YOUR_PUBLIC_KEY'}",
    position: "bottom-right"
  });
</script>`}
                            </pre>
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { navigator.clipboard.writeText(`<script src="https://cdn.agentrix.com/widget.js"></script>\n<script>\n  Agentrix.init({\n    assistantId: "${activeId}",\n    apiKey: "${user?.publicKey || 'YOUR_PUBLIC_KEY'}",\n    position: "bottom-right"\n  });\n</script>`); toast({ title: "Copied!" }); }}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Place this code in your website's &lt;body&gt; tag.</p>
                        </div>

                        <Separator />

                        <div className="grid gap-2">
                          <Label className="text-xs font-semibold uppercase text-muted-foreground">API Usage</Label>
                          <div className="rounded-lg border bg-muted p-3">
                            <p className="text-xs text-muted-foreground">
                              You can also trigger calls programmatically:
                            </p>
                            <code className="mt-2 block rounded bg-background p-2 text-[10px] font-mono border">
                              POST https://api.agentrix.com/v1/call<br />
                              Authorization: Bearer {user?.publicKey || "YOUR_PUBLIC_KEY"}<br />
                              &#123; "assistantId": "{activeId}", "phone": "+919876543210" &#125;
                            </code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* MODEL TAB */}
                  <TabsContent value="model" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">LLM Provider</CardTitle>
                        <CardDescription className="text-xs">Choose the model that powers your assistant's intelligence.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Model</Label>
                          <Select value={tools.model ?? "gpt-4o"} onValueChange={(v) => setTool("model", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">System Prompt</Label>
                          <Textarea value={draft.system_prompt ?? ""} onChange={(e) => setDraft((p) => ({ ...p, system_prompt: e.target.value }))}
                            className="min-h-[120px] text-xs" placeholder="You are a helpful assistant…" />
                        </div>
                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Temperature</Label>
                            <span className="text-xs text-muted-foreground">{(draft.temperature ?? 0.7).toFixed(1)}</span>
                          </div>
                          <Slider value={[draft.temperature ?? 0.7]} onValueChange={([v]) => setDraft((p) => ({ ...p, temperature: v }))}
                            min={0} max={2} step={0.1} className="w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* VOICE TAB */}
                  <TabsContent value="voice" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Voice Configuration</CardTitle>
                        <CardDescription className="text-xs">Select the voice and tune its characteristics.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Voice Provider</Label>
                          <Select value={draft.voice_provider ?? "elevenlabs"} onValueChange={(v) => setDraft((p) => ({ ...p, voice_provider: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                              <SelectItem value="openai-tts">OpenAI TTS</SelectItem>
                              <SelectItem value="playht">PlayHT</SelectItem>
                              <SelectItem value="deepgram-tts">Deepgram Aura</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Voice Preset</Label>
                          <div className="space-y-1">
                            {VOICES.map((v) => (
                              <div key={v.value} className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition cursor-pointer ${draft.voice_id === v.value ? "border-primary/30 bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground hover:border-border"}`}
                                onClick={() => setDraft((p) => ({ ...p, voice_id: v.value }))}>
                                <span>{v.label}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                                  e.stopPropagation();
                                  window.speechSynthesis.cancel();
                                  const u = new SpeechSynthesisUtterance(`Hi, I'm ${v.label.split("—")[0].trim()}. How can I help you today?`);
                                  u.lang = draft.language ?? "en";
                                  window.speechSynthesis.speak(u);
                                }}>
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Custom Voice ID</Label>
                          <Input value={draft.voice_id ?? ""} onChange={(e) => setDraft((p) => ({ ...p, voice_id: e.target.value }))}
                            placeholder="Paste any ElevenLabs / provider voice ID" className="text-xs font-mono" />
                          <p className="text-[10px] text-muted-foreground">Override the preset above with any voice ID from your provider.</p>
                        </div>
                        <div className="grid gap-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs">Speed</Label>
                            <span className="text-xs text-muted-foreground">{(draft.voice_speed ?? 1.0).toFixed(1)}x</span>
                          </div>
                          <Slider value={[draft.voice_speed ?? 1.0]} onValueChange={([v]) => setDraft((p) => ({ ...p, voice_speed: v }))}
                            min={0.5} max={2.0} step={0.1} className="w-full" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* TRANSCRIBER TAB */}
                  <TabsContent value="transcriber" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Speech-to-Text</CardTitle>
                        <CardDescription className="text-xs">Choose a transcription provider for real-time STT.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Transcriber</Label>
                          <Select value={tools.transcriber ?? "deepgram"} onValueChange={(v) => setTool("transcriber", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {TRANSCRIBERS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Language</Label>
                          <Select value={draft.language ?? "en"} onValueChange={(v) => setDraft((p) => ({ ...p, language: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* FUNCTIONS TAB */}
                  <TabsContent value="functions" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Tool Calling & Functions</CardTitle>
                        <CardDescription className="text-xs">Enable actions your assistant can perform during conversations.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {FUNCTIONS.map((fn) => {
                            const enabled = ((tools.functions ?? []) as string[]).includes(fn.value);
                            return (
                              <button key={fn.value} onClick={() => {
                                const prev = (tools.functions ?? []) as string[];
                                setTool("functions", enabled ? prev.filter((f: string) => f !== fn.value) : [...prev, fn.value]);
                              }}
                                className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left text-xs transition ${enabled ? "border-primary/30 bg-primary/5 text-foreground" : "border-border/40 text-muted-foreground hover:border-border"}`}>
                                <span>{fn.label}</span>
                                <span className={`inline-flex h-5 w-9 items-center rounded-full px-0.5 transition ${enabled ? "bg-primary" : "bg-secondary"}`}>
                                  <span className={`h-4 w-4 rounded-full bg-background shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* ADVANCED TAB */}
                  <TabsContent value="advanced" className="space-y-4">
                    <Card className="border-border/40 bg-card shadow-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-sm">Advanced Settings</CardTitle>
                        <CardDescription className="text-xs">Runtime configuration and deployment options.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Conversation Mode</Label>
                          <Select value={draft.conversation_mode ?? "neutral"} onValueChange={(v) => setDraft((p) => ({ ...p, conversation_mode: v }))}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {MODES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">First Message</Label>
                          <Input value={tools.firstMessage ?? ""} onChange={(e) => setTool("firstMessage", e.target.value)}
                            placeholder="Hi! How can I help you today?" className="text-xs" />
                          <p className="text-[10px] text-muted-foreground">The greeting your assistant says when a conversation starts.</p>
                        </div>
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Max Duration (seconds)</Label>
                          <Input type="number" value={tools.maxDuration ?? 300} onChange={(e) => setTool("maxDuration", Number(e.target.value))}
                            className="text-xs" min={30} max={3600} />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </section>

          {/* Voice playground sidebar */}
          <aside className="w-full shrink-0 overflow-y-auto border-t border-sidebar-border bg-sidebar p-4 lg:w-80 lg:border-t-0 lg:border-l lg:p-4">
            <VoicePlayground
              assistant={{
                name: draft.name ?? "New Assistant",
                systemPrompt: draft.system_prompt ?? "",
                language: draft.language ?? "en",
                conversationMode: draft.conversation_mode ?? "friendly",
                temperature: draft.temperature ?? 0.7,
                voiceId: draft.voice_id ?? undefined,
                voiceProvider: draft.voice_provider ?? "elevenlabs",
              }}
            />
          </aside>
        </main>
      </div>

      {/* Onboarding Wizard Dialog */}
      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-6 space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight">Setup your Assistant</h2>
              <p className="text-sm text-muted-foreground">This helps us customize the AI for your business.</p>
            </div>

            <div className="space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label>Assistant Name</Label>
                    <Input autoFocus placeholder="e.g. Sarah" value={wizardData.name} onChange={(e) => setWizardData(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Input placeholder="e.g. Dental Clinic, Real Estate" value={wizardData.businessType} onChange={(e) => setWizardData(p => ({ ...p, businessType: e.target.value }))} />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <Label>What should this assistant do?</Label>
                    <CardDescription className="mb-2">Explain its goal, e.g. "Book appointments and answer FAQs about pricing."</CardDescription>
                    <Textarea
                      placeholder="e.g. Answer calls, screen leads, and book meetings on the calendar."
                      className="min-h-[120px]"
                      value={wizardData.requirements}
                      onChange={(e) => setWizardData(p => ({ ...p, requirements: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between pt-4 border-t border-border/50">
                {wizardStep === 1 ? (
                  <Button variant="ghost" onClick={() => setWizardOpen(false)}>Cancel</Button>
                ) : (
                  <Button variant="ghost" onClick={() => setWizardStep(1)}>Back</Button>
                )}

                {wizardStep === 1 ? (
                  <Button onClick={() => setWizardStep(2)} disabled={!wizardData.name || !wizardData.businessType}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleWizardSubmit} disabled={!wizardData.requirements || loading}>
                    {loading ? "Creating..." : "Create Assistant"} <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
