import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Phone, PhoneOff, Sparkles, Volume2 } from "lucide-react";
import { voiceChat } from "@/lib/agentrix-api";
import { API_URL } from "@/lib/api";

export type PlaygroundAssistant = {
  name: string;
  systemPrompt: string;
  language: string;
  conversationMode: string;
  temperature: number;
  voiceId?: string;
  voiceProvider?: string;
};

type Message = { role: "user" | "assistant"; text: string };

export function VoicePlayground({ assistant }: { assistant: PlaygroundAssistant | null }) {
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking" | "error">("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesRef = useRef<Message[]>([]);

  // Keep a ref in sync so the callbacks always have latest messages
  messagesRef.current = messages;

  const statusLabel = useMemo(() => {
    switch (status) {
      case "listening": return "Listening…";
      case "thinking": return "Thinking…";
      case "speaking": return "Speaking…";
      case "error": return "Error";
      default: return "Ready to talk";
    }
  }, [status]);

  const speak = useCallback(async (text: string) => {
    // Stop any current audio
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Check if we should use server-side TTS (ElevenLabs / OpenAI)
    if (assistant?.voiceProvider && assistant.voiceProvider !== 'browser') {
      try {
        setStatus("speaking");
        const res = await fetch(`${API_URL}/voice-chat/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceId: assistant.voiceId,
            voiceProvider: assistant.voiceProvider
          })
        });

        if (!res.ok) {
          if (res.status === 404) {
            setStatus("error");
            throw new Error("Server Outdated: Restart npm run server");
          }
          throw new Error(await res.text());
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setStatus("idle");
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setStatus("idle");
          toast({ variant: "destructive", title: "Audio Error", description: "Failed to play audio." });
          audioRef.current = null;
        };

        try {
          await audio.play();
        } catch (e) {
          console.error("Autoplay failed:", e);
        }
        return;
      } catch (e) {
        console.error("Server TTS failed, falling back to browser:", e);
        const msg = e instanceof Error ? e.message : "TTS Failed";
        toast({
          variant: "destructive",
          title: "TTS Error",
          description: msg.includes("Restart") ? msg : "Using browser voice as fallback."
        });
        // Fall through to browser logic
      }
    }

    // Fallback: Browser Speech Synthesis
    if (!("speechSynthesis" in window)) {
      setStatus("idle");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = assistant?.language ?? "en";
    utterance.volume = 1.0;
    synthRef.current = utterance;

    utterance.onend = () => setStatus("idle");
    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setStatus("idle");
    };

    setStatus("speaking");
    setTimeout(() => window.speechSynthesis.speak(utterance), 50);
  }, [assistant?.voiceProvider, assistant?.voiceId, assistant?.language, toast]);



  const getAIResponse = useCallback(async (userText: string) => {
    setStatus("thinking");
    const newMessages = [...messagesRef.current, { role: "user" as const, text: userText }];
    setMessages(newMessages);

    try {
      const data = await voiceChat.invoke({
        userMessage: userText,
        systemPrompt: assistant?.systemPrompt ?? "You are a helpful voice assistant.",
        temperature: assistant?.temperature ?? 0.7,
        conversationHistory: newMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.text,
        })),
      });

      const reply = data?.reply ?? "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      speak(reply);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to get response";
      toast({ variant: "destructive", title: "AI Error", description: msg });
      setStatus("idle");
    }
  }, [assistant, speak, toast]);

  const startTalking = useCallback(() => {
    if (!assistant) {
      toast({ variant: "destructive", title: "No assistant", description: "Select or create an assistant first." });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Not supported", description: "Speech recognition is not supported in this browser. Try Chrome." });
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = assistant.language ?? "en";
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        getAIResponse(transcript);
      } else {
        setStatus("idle");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "aborted" && event.error !== "no-speech") {
        toast({ variant: "destructive", title: "Mic error", description: event.error });
      }
      setStatus("idle");
    };

    recognition.onend = () => {
      // Recognition ended without result
    };

    try {
      recognition.start();
      setStatus("listening");
    } catch (e) {
      console.error("Failed to start recognition:", e);
      toast({ variant: "destructive", title: "Mic error", description: "Could not start microphone." });
      setStatus("idle");
    }
  }, [assistant, getAIResponse, toast]);

  const stopTalking = useCallback(() => {
    recognitionRef.current?.abort();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setStatus("idle");
  }, []);

  const isActive = status !== "idle";

  return (
    <Card className="border-border/40 bg-card shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-sm">Voice Playground</CardTitle>
        <CardDescription className="text-[11px]">Talk directly with your assistant</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status bar */}
        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/30 px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="font-display text-[11px] truncate">{assistant?.name ?? "No assistant"}</p>
            <p className="text-[10px] text-muted-foreground">{statusLabel}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Volume2 className="h-3 w-3" /> {assistant?.voiceProvider ?? "browser"}
          </span>
        </div>

        {/* Voice ID display */}
        {assistant?.voiceId && (
          <div className="rounded-md border border-border/20 bg-secondary/20 px-3 py-1.5 text-[10px] text-muted-foreground truncate">
            Voice: {assistant.voiceId}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-md bg-destructive/10 p-2 text-center text-xs font-bold text-destructive">
            Server Update Required! Restart `npm run server`
          </div>
        )}

        {/* Orb */}
        <div className="relative grid place-items-center overflow-hidden rounded-xl border border-border/30 bg-background py-8">
          <div className="pointer-events-none absolute inset-0" style={{ background: "var(--gradient-mesh)" }} />
          <motion.div
            className={`relative grid h-24 w-24 place-items-center rounded-full border bg-background/80 shadow-pop transition-colors ${isActive ? "border-primary/40" : "border-primary/20"}`}
            animate={reduceMotion ? undefined : {
              scale: status === "listening" ? [1, 1.15, 1] : status === "speaking" ? [1, 1.1, 1] : status === "thinking" ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className={`grid h-10 w-10 place-items-center rounded-xl shadow-glow transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {status === "listening" ? <Mic className="h-5 w-5 animate-pulse" /> :
                status === "speaking" ? <Sparkles className="h-5 w-5" /> :
                  status === "thinking" ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> :
                    <Phone className="h-5 w-5" />}
            </div>
          </motion.div>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-lg border border-border/20 bg-secondary/20 p-2">
            {messages.slice(-6).map((m, i) => (
              <div key={i} className={`text-[10px] leading-relaxed ${m.role === "user" ? "text-muted-foreground" : "text-foreground"}`}>
                <span className="font-display font-semibold">{m.role === "user" ? "You" : assistant?.name ?? "AI"}:</span> {m.text}
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        {isActive ? (
          <Button variant="destructive" className="w-full" onClick={stopTalking}>
            <PhoneOff className="h-3.5 w-3.5" /> End Conversation
          </Button>
        ) : (
          <Button variant="hero" className="w-full" onClick={startTalking}>
            <Phone className="h-3.5 w-3.5" /> Talk to Assistant
          </Button>
        )}
        <p className="text-center text-[10px] text-muted-foreground">Uses AI voice synthesis & browser speech recognition.</p>
      </CardContent>
    </Card>
  );
}
