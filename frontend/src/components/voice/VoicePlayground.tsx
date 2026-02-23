import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Phone, PhoneOff, Sparkles, Volume2, Orbit, Activity, Shield, Zap } from "lucide-react";
import { voiceChat } from "@/lib/agentrix-api";
import { API_URL } from "@/lib/api";

export type PlaygroundAssistant = {
  name: string;
  systemPrompt: string;
  language: string;
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesRef = useRef<Message[]>([]);

  messagesRef.current = messages;

  const statusLabel = useMemo(() => {
    switch (status) {
      case "listening": return "LISTENING...";
      case "thinking": return "THINKING...";
      case "speaking": return "SPEAKING...";
      case "error": return "SYSTEM ERROR";
      default: return "READY FOR TRANSMISSION";
    }
  }, [status]);

  const speak = useCallback(async (text: string) => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

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

        if (!res.ok) throw new Error("TTS Failure");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setStatus("idle");
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.play();
        return;
      } catch (e) {
        toast({ variant: "destructive", title: "Neural Fallback", description: "Reverting to browser synthesis." });
      }
    }

    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = assistant?.language ?? "en";
    utterance.onend = () => setStatus("idle");
    setStatus("speaking");
    window.speechSynthesis.speak(utterance);
  }, [assistant, toast]);

  const getAIResponse = useCallback(async (userText: string) => {
    setStatus("thinking");
    const newMessages = [...messagesRef.current, { role: "user" as const, text: userText }];
    setMessages(newMessages);

    try {
      const data = await voiceChat.invoke({
        userMessage: userText,
        systemPrompt: assistant?.systemPrompt ?? "You are a helpful assistant.",
        temperature: assistant?.temperature ?? 0.7,
        conversationHistory: newMessages.slice(-4).map((m) => ({
          role: m.role,
          content: m.text,
        })),
      });

      const reply = data?.reply ?? "Error processing protocol.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      speak(reply);
    } catch (e) {
      setStatus("idle");
    }
  }, [assistant, speak]);

  const startTalking = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    window.speechSynthesis.cancel();
    const recognition = new SpeechRecognition();
    recognition.lang = assistant?.language ?? "en";
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) getAIResponse(transcript);
      else setStatus("idle");
    };

    recognition.onerror = () => setStatus("idle");
    recognition.start();
    setStatus("listening");
  }, [assistant, getAIResponse]);

  const stopTalking = useCallback(() => {
    recognitionRef.current?.abort();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (audioRef.current) audioRef.current.pause();
    setStatus("idle");
  }, []);

  const isActive = status !== "idle";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4">Neural Interface</h4>
        <div className="relative h-64 w-full flex items-center justify-center">
          {/* Animated Rings */}
          <AnimatePresence>
            {isActive && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: 0.1 }}
                  exit={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 0.2 }}
                  exit={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute inset-0 rounded-full border-2 border-primary"
                />
              </>
            )}
          </AnimatePresence>

          {/* Core Orb */}
          <motion.div
            animate={isActive ? {
              scale: [1, 1.1, 1],
              rotate: [0, 90, 180, 270, 360]
            } : {}}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className={`relative h-40 w-40 rounded-full flex items-center justify-center border-4 transition-all duration-500 \${isActive ? "border-primary bg-primary/10 shadow-[0_0_50px_rgba(124,58,237,0.3)]" : "border-white/10 bg-white/5"}`}
          >
            <div className={`h-32 w-32 rounded-full border border-white/10 flex items-center justify-center \${isActive ? "animate-pulse" : ""}`}>
              {status === "listening" ? <Mic className="h-10 w-10 text-primary" /> :
                status === "speaking" ? <Activity className="h-10 w-10 text-primary" /> :
                  status === "thinking" ? <Orbit className="h-10 w-10 text-primary animate-spin" /> :
                    <Zap className="h-10 w-10 text-muted-foreground opacity-20" />}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="glass-card rounded-[2rem] p-6 border-white/10 space-y-4">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <span>Terminal Status</span>
          <span className={isActive ? "text-primary animate-pulse" : ""}>{statusLabel}</span>
        </div>

        {messages.length > 0 && (
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {messages.slice(-4).map((m, i) => (
              <div key={i} className={`p-4 rounded-2xl text-xs font-medium leading-relaxed \${m.role === "assistant" ? "bg-primary/10 border border-primary/20 text-white" : "bg-white/5 border border-white/10 text-muted-foreground ml-4"}`}>
                <p className="opacity-40 uppercase font-black tracking-tighter text-[8px] mb-1">{m.role}</p>
                {m.text}
              </div>
            ))}
          </div>
        )}

        <div className="pt-4">
          {isActive ? (
            <Button onClick={stopTalking} className="w-full h-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive font-black hover:bg-destructive/20 transition-all">
              <PhoneOff className="mr-3 h-5 w-5" /> TERMINATE SESSION
            </Button>
          ) : (
            <Button onClick={startTalking} className="w-full h-16 rounded-2xl bg-primary text-white font-black shadow-3d hover:scale-105 transition-all">
              <Phone className="mr-3 h-5 w-5" /> INITIATE TRANSMISSION
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
