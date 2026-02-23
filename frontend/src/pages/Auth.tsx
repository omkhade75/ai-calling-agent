import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Eye, EyeOff, ShieldCheck, Sparkles, Orbit } from "lucide-react";
import agentrixLogo from "@/assets/agentrix-logo.png";
import { supabase } from "@/lib/supabase";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.union([z.string().min(2, "Name must be at least 2 characters"), z.literal("")]).optional(),
});

type AuthValues = z.infer<typeof authSchema>;

export default function Auth() {
  const [params] = useSearchParams();
  const defaultTab = params.get("tab") === "signup" ? "signup" : "login";
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  /* 3D Tilt Effect */
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-5, 5]);
  const springX = useSpring(rotateX, { stiffness: 100, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 100, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  useEffect(() => {
    if (user) {
      navigate("/app", { replace: true });
    }
  }, [user, navigate]);

  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "", displayName: "" },
    mode: "onSubmit",
  });

  async function onSubmit(values: AuthValues) {
    setLoading(true);
    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Initializing your secure workspace..." });
        navigate("/app", { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { data: { displayName: values.displayName?.trim() } }
        });
        if (error) throw error;
        toast({ title: "Account Created", description: "Verification email sent if required. Please sign in." });
        setTab("login");
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Action Failed", description: e?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-6 relative overflow-hidden perspective-[1000px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_50%_50%,hsla(263,90%,60%,0.08)_0%,transparent_50%)]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-white/[0.03] rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 border border-white/[0.02] rounded-full"
        />
      </div>

      <motion.div
        style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10 translate-z-20">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 transition-transform hover:scale-110">
            <div className="h-12 w-12 p-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
              <img src={agentrixLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>
          </Link>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 italic">
            {tab === "login" ? "ACCESS TERMINAL" : "CREATE IDENTITY"}
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
            Integrated Advanced AI Protocol
          </p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-1 border-white/10 overflow-hidden shadow-3d translate-z-10 bg-white/[0.02]">
          <div className="p-8 md:p-12">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 bg-white/5 rounded-2xl h-14 p-1.5 border border-white/[0.05]">
                <TabsTrigger value="login" className="rounded-xl font-bold uppercase tracking-wider transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Login</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-bold uppercase tracking-wider transition-all data-[state=active]:bg-primary data-[state=active]:text-white">Join</TabsTrigger>
              </TabsList>

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {tab === "signup" && (
                  <div className="space-y-2">
                    <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground ml-1">Business Name</Label>
                    <Input {...form.register("displayName")} className="h-14 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md px-6 focus:ring-primary focus:border-primary transition-all font-medium" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground ml-1">Secure Email</Label>
                  <Input type="email" {...form.register("email")} className="h-14 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md px-6 focus:ring-primary focus:border-primary transition-all font-medium" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="uppercase text-[10px] tracking-widest font-black text-muted-foreground">Encryption Key</Label>
                    {tab === "login" && <Link to="#" className="text-[10px] uppercase tracking-widest font-black text-primary hover:text-white transition-colors">Recover</Link>}
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...form.register("password")}
                      className="h-14 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md px-6 pr-14 focus:ring-primary focus:border-primary transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2 ml-1">
                  <Checkbox id="remember" className="rounded-lg border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <label htmlFor="remember" className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">Persist Session</label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 rounded-2xl bg-white text-black font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-3d mt-4"
                >
                  {loading ? (
                    <Orbit className="h-6 w-6 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      {tab === "login" ? "INITIALIZE" : "CREATE PROTOCOL"} <ChevronRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>
              </form>
            </Tabs>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 opacity-40 grayscale">
          <ShieldCheck className="h-5 w-5" />
          <Sparkles className="h-5 w-5" />
        </div>
      </motion.div>
    </div>
  );
}

