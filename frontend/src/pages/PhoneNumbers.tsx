import { useState, useCallback, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { assistants as assistantsApi } from "@/lib/agentrix-api";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Mic, Plus, Trash2, Phone, LogOut, ArrowLeft, PhoneCall,
  PhoneIncoming, PhoneOutgoing, Settings, Copy, Check, X, Search, AudioWaveform,
  Globe, Shield, Zap, Activity, Orbit
} from "lucide-react";
import agentrixLogo from "@/assets/agentrix-logo.png";

const PROVIDERS = [
  {
    value: "twilio",
    label: "Twilio",
    fields: [
      { key: "accountSid", label: "Account SID", placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" },
      { key: "authToken", label: "Auth Token", placeholder: "Your Twilio Auth Token", secret: true },
      { key: "phoneNumber", label: "Phone Number", placeholder: "+919876543210" },
    ],
  },
  {
    value: "vapi",
    label: "Vapi (Free Number)",
    fields: [
      { key: "phoneNumber", label: "Phone Number", placeholder: "+14155551234" },
    ],
  },
];

type PhoneNumber = {
  id: string;
  number: string;
  provider: string;
  label: string;
  assistantId: string | null;
  inboundEnabled: boolean;
  outboundEnabled: boolean;
  status: "active" | "inactive";
  credentials: Record<string, string>;
  createdAt: string;
};

type VoiceAssistant = { id: string; name: string };

type CallLog = {
  id: string;
  numberId: string;
  direction: "inbound" | "outbound";
  to: string;
  from: string;
  duration: number;
  status: "completed" | "failed" | "in-progress" | "ringing";
  timestamp: string;
  assistantName?: string;
};

export default function PhoneNumbers() {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [assistants, setAssistants] = useState<VoiceAssistant[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [importOpen, setImportOpen] = useState(false);
  const [importProvider, setImportProvider] = useState("twilio");
  const [importFields, setImportFields] = useState<Record<string, string>>({});
  const [importLabel, setImportLabel] = useState("");

  const [outboundTo, setOutboundTo] = useState("");
  const [outboundAssistant, setOutboundAssistant] = useState("none");
  const [calling, setCalling] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const userId = user?.id;

  const selectedNumber = numbers.find((n) => n.id === selectedId) ?? null;
  const providerConfig = PROVIDERS.find((p) => p.value === importProvider);

  useEffect(() => {
    if (userId) {
      assistantsApi.list().then((rows: any[]) => {
        setAssistants((rows ?? []).map((r: any) => ({ id: r._id || r.id, name: r.name })));
      }).catch(() => { });
    }
  }, [userId]);

  const importNumber = useCallback(() => {
    const phoneNumber = importFields.phoneNumber?.trim();
    if (!phoneNumber) {
      toast({ variant: "destructive", title: "Phone number is required" });
      return;
    }
    const newNum: PhoneNumber = {
      id: crypto.randomUUID(),
      number: phoneNumber,
      provider: importProvider,
      label: importLabel.trim() || phoneNumber,
      assistantId: null,
      inboundEnabled: true,
      outboundEnabled: true,
      status: "active",
      credentials: { ...importFields },
      createdAt: new Date().toISOString(),
    };
    setNumbers((prev) => [...prev, newNum]);
    setSelectedId(newNum.id);
    setImportFields({});
    setImportLabel("");
    setImportOpen(false);
    toast({ title: "Number Linked", description: `${newNum.number} integrated.` });
  }, [importFields, importProvider, importLabel, toast]);

  const removeNumber = useCallback((id: string) => {
    setNumbers((prev) => prev.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast({ title: "Module Deactivated" });
  }, [selectedId, toast]);

  const updateNumber = useCallback((id: string, updates: Partial<PhoneNumber>) => {
    setNumbers((prev) => prev.map((n) => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const makeOutboundCall = useCallback(() => {
    if (!selectedNumber || !outboundTo.trim()) return;
    setCalling(true);
    const log: CallLog = {
      id: crypto.randomUUID(),
      numberId: selectedNumber.id,
      direction: "outbound",
      from: selectedNumber.number,
      to: outboundTo.trim(),
      duration: 0,
      status: "ringing",
      timestamp: new Date().toISOString(),
      assistantName: outboundAssistant !== "none" ? assistants.find((a) => a.id === outboundAssistant)?.name : undefined,
    };
    setCallLogs((prev) => [log, ...prev]);

    setTimeout(() => {
      setCallLogs((prev) => prev.map((l) => l.id === log.id ? { ...l, status: "completed", duration: 42 } : l));
      setCalling(false);
      setOutboundTo("");
      toast({ title: "Session Completed" });
    }, 4000);
  }, [selectedNumber, outboundTo, outboundAssistant, assistants, toast]);

  const signOut = useCallback(async () => {
    logout();
    navigate("/", { replace: true });
  }, [navigate, logout]);

  if (!userId) return null;

  const filteredNumbers = numbers.filter((n) =>
    n.number.includes(searchQuery) || n.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden preserve-3d">
      {/* HEADER */}
      <header className="h-20 border-b border-white/[0.05] bg-background/80 backdrop-blur-3xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-4">
          <Link to="/app" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="h-10 w-10 p-1.5 rounded-xl border border-white/10 bg-white/5 shadow-2xl">
              <img src={agentrixLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <span className="font-display text-xl font-black tracking-widest text-white uppercase italic">
              Comms<span className="text-primary">.3D</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-white">
            <Link to="/app"><ArrowLeft className="mr-2 h-4 w-4" /> Studio</Link>
          </Button>
          <div className="h-6 w-px bg-white/10" />
          <Button variant="ghost" size="icon" onClick={signOut} className="rounded-full hover:bg-white/5">
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-80 border-r border-white/[0.05] bg-white/[0.02] backdrop-blur-3xl flex flex-col">
          <div className="p-6 border-b border-white/[0.05] flex justify-between items-center space-y-2">
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Network</h2>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-primary/20 hover:text-primary" onClick={() => setImportOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Filter nodes..." className="h-10 pl-9 bg-white/5 border-white/10 rounded-xl text-xs font-bold" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredNumbers.map((n) => (
              <button
                key={n.id}
                onClick={() => setSelectedId(n.id)}
                className={`w-full group relative p-4 rounded-2xl transition-all duration-300 text-left border \${n.id === selectedId ? "bg-primary/10 border-primary/30 shadow-3d" : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono text-xs font-black \${n.id === selectedId ? "text-white" : "text-muted-foreground group-hover:text-white"}`}>{n.number}</span>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/10 text-muted-foreground">{n.status}</Badge>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 text-muted-foreground">{n.label}</p>
                <div className="flex gap-2 mt-3">
                  {n.inboundEnabled && <div className="h-1 w-4 rounded-full bg-primary" />}
                  {n.outboundEnabled && <div className="h-1 w-4 rounded-full bg-emerald-500" />}
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* DETAILS */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {!selectedNumber ? (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md">
                <Orbit className="h-16 w-16 text-primary/20 mx-auto mb-6" />
                <h3 className="text-2xl font-black tracking-tight mb-2 italic">NO NODE CONNECTED</h3>
                <p className="text-muted-foreground mb-8 uppercase tracking-widest text-[10px]">Select a communication node to begin transmission.</p>
                <Button onClick={() => setImportOpen(true)} className="bg-white text-black font-black rounded-full px-8 h-14 hover:scale-105 transition-all">
                  <Plus className="mr-2 h-5 w-5" /> Import Network Node
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Active Communication Node</p>
                  <h1 className="text-5xl font-black italic tracking-tighter text-white">{selectedNumber.number}</h1>
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-xs mt-2">{selectedNumber.label} — {selectedNumber.provider}</p>
                </div>
                <Button variant="ghost" onClick={() => removeNumber(selectedNumber.id)} className="h-12 w-12 rounded-2xl text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>

              <Tabs defaultValue="inbound" className="space-y-10">
                <TabsList className="bg-white/5 border border-white/10 rounded-2xl h-14 p-1.5 w-full flex justify-between">
                  {["inbound", "outbound", "logs", "settings"].map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="inbound" className="mt-0">
                  <div className="glass-card rounded-[2.5rem] p-8 border-white/10 space-y-8">
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10 shadow-3d">
                      <div>
                        <h4 className="font-black italic text-xl">INBOUND RECEPTION</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Allow incoming neural transmissions</p>
                      </div>
                      <button onClick={() => updateNumber(selectedNumber.id, { inboundEnabled: !selectedNumber.inboundEnabled })} className={`h-8 w-14 rounded-full p-1 transition-all \${selectedNumber.inboundEnabled ? "bg-primary" : "bg-white/10"}`}>
                        <div className={`h-6 w-6 rounded-full bg-white shadow-lg transition-all \${selectedNumber.inboundEnabled ? "translate-x-6" : ""}`} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ASSIGNED AI PROTOCOL</Label>
                      <Select value={selectedNumber.assistantId ?? "none"} onValueChange={v => updateNumber(selectedNumber.id, { assistantId: v === "none" ? null : v })}>
                        <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10">
                          <SelectItem value="none">UNASSIGNED</SelectItem>
                          {assistants.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="outbound" className="mt-0">
                  <div className="glass-card rounded-[2.5rem] p-8 border-white/10 space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">NODE ENABLED</Label>
                        <div className="h-14 flex items-center justify-between px-6 bg-white/5 rounded-2xl border border-white/10">
                          <span className="text-[10px] font-black">OUTBOUND STATUS</span>
                          <button onClick={() => updateNumber(selectedNumber.id, { outboundEnabled: !selectedNumber.outboundEnabled })} className={`h-6 w-10 rounded-full p-1 transition-all \${selectedNumber.outboundEnabled ? "bg-emerald-500" : "bg-white/10"}`}>
                            <div className={`h-4 w-4 rounded-full bg-white transition-all \${selectedNumber.outboundEnabled ? "translate-x-4" : ""}`} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">AI OPERATOR</Label>
                        <Select value={outboundAssistant} onValueChange={setOutboundAssistant}>
                          <SelectTrigger className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-950 border-white/10">
                            <SelectItem value="none">MANUAL OPERATOR</SelectItem>
                            {assistants.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">INITIATE TRANSMISSION</Label>
                      <div className="flex gap-4">
                        <Input value={outboundTo} onChange={e => setOutboundTo(e.target.value)} placeholder="+1 000 000 0000" className="h-16 rounded-2xl bg-white/5 border-white/10 px-8 font-mono font-black text-xl italic" />
                        <Button onClick={makeOutboundCall} disabled={calling || !outboundTo} className="h-16 px-10 rounded-2xl bg-white text-black font-black shadow-3d hover:scale-105 transition-all">
                          {calling ? <Orbit className="h-6 w-6 animate-spin" /> : <><PhoneCall className="mr-3 h-5 w-5" /> DIAL</>}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="mt-0">
                  <div className="glass-card rounded-[2.5rem] p-8 border-white/10 italic font-black text-muted-foreground text-center py-20">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    NO RECENT TRANSMISSIONS DETECTED
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

      {/* IMPORT DIALOG */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-xl glass-card rounded-[3rem] p-12 border-white/10 shadow-3d overflow-hidden preserve-3d bg-black/90">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" />
          <DialogHeader className="relative z-10 text-center mb-10">
            <DialogTitle className="text-4xl font-black italic tracking-tighter">LINK NEW NODE</DialogTitle>
            <DialogDescription className="text-muted-foreground font-black uppercase tracking-widest text-[9px] mt-2">Expansion Module Initiated</DialogDescription>
          </DialogHeader>

          <div className="relative z-10 space-y-6">
            <div className="space-y-2">
              <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground ml-1">PROVIDER</Label>
              <div className="grid grid-cols-2 gap-4">
                {PROVIDERS.map(p => (
                  <button key={p.value} onClick={() => setImportProvider(p.value)} className={`h-14 rounded-2xl border font-black uppercase tracking-widest text-[10px] transition-all \${importProvider === p.value ? "bg-primary border-primary text-white shadow-3d" : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/20"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {providerConfig?.fields.map(f => (
              <div key={f.key} className="space-y-2">
                <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground ml-1">{f.label}</Label>
                <Input type={f.secret ? "password" : "text"} value={importFields[f.key] ?? ""} onChange={e => setImportFields(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-mono font-bold" />
              </div>
            ))}

            <div className="space-y-2">
              <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground ml-1">NODE ALIAS</Label>
              <Input value={importLabel} onChange={e => setImportLabel(e.target.value)} placeholder="e.g. Primary Alpha" className="h-14 rounded-2xl bg-white/5 border-white/10 px-6 font-black italic" />
            </div>
          </div>

          <DialogFooter className="relative z-10 pt-8 mt-4 border-t border-white/5">
            <Button variant="ghost" onClick={() => setImportOpen(false)} className="font-bold text-muted-foreground hover:text-white">CANCEL</Button>
            <Button onClick={importNumber} className="bg-white text-black font-black rounded-full px-10 h-16 shadow-3d hover:scale-105 transition-all">
              LINK NODE <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
