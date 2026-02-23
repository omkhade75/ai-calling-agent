import { useState, useEffect } from "react";
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
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import agentrixLogo from "@/assets/agentrix-logo.png";
import { apiFetch } from "@/lib/api";
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
  const [rememberMe, setRememberMe] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login: contextLogin, user } = useAuth();

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
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;

        toast({ title: "Welcome back!", description: "Accessing your business dashboard..." });
        navigate("/app", { replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              displayName: values.displayName?.trim(),
            }
          }
        });

        if (error) throw error;

        toast({ title: "Success!", description: "Your account has been created. Please sign in." });
        setTab("login");
      }
    } catch (e: any) {
      const message = e?.message || "Something went wrong";
      if (message.includes("Invalid login credentials") || message.includes("Invalid email or password")) {
        toast({ variant: "destructive", title: "Login Failed", description: "The email or password you entered is incorrect. Please try again or create a new account." });
      } else if (message.includes("User already registered") || message.includes("already exists")) {
        toast({ title: "Account Exists", description: "You already have an account. Please sign in instead." });
        setTab("login");
      } else {
        toast({ variant: "destructive", title: "Error", description: message });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'var(--gradient-mesh)' }} />

      {/* Dynamic interactive background blobs */}
      <motion.div
        className="pointer-events-none absolute w-[500px] h-[500px] rounded-full filter blur-[100px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.8) 0%, rgba(6,182,212,0.4) 100%)',
        }}
        animate={{
          x: mousePosition.x - 250,
          y: mousePosition.y - 250,
        }}
        transition={{ type: "spring", damping: 15, stiffness: 40 }}
      />

      {/* Decorative scattered elements */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-emerald-400/30"
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + (i % 3) * 30}%`,
          }}
        />
      ))}

      <div className="w-full max-w-md space-y-6 relative z-10 perspective-1000">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-2"
        >
          <div className="flex justify-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-foreground">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-lg relative">
                <img src={agentrixLogo} alt="AGENTRIX" className="h-full w-full object-cover absolute inset-0" />
              </div>
              AGENTRIX
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {tab === "login" ? "Welcome back" : "Create an account"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {tab === "login" ? "Enter your email to sign in to your business account" : "Enter your email below to create your business account"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative group"
        >
          {/* Card glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200" />

          <Card className="clean-card shadow-2xl relative bg-zinc-950/80 backdrop-blur-xl border-white/10">
            <CardContent className="pt-6">
              <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-10">
                  <TabsTrigger value="login" className="font-semibold">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="font-semibold">Sign Up</TabsTrigger>
                </TabsList>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {tab === "signup" && (
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Business Name</Label>
                      <Input id="displayName" placeholder="Acme Corp" {...form.register("displayName")} className="bg-background" />
                      {form.formState.errors.displayName && <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" {...form.register("email")} className="bg-background" />
                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {tab === "login" && <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        {...form.register("password")}
                        className="bg-background pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>

                  <Button type="submit" className="w-full font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-glow" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Processing...</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        {tab === "login" ? "Sign In" : "Create Account"} <ChevronRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="px-8 text-center text-sm text-zinc-500 mt-6"
        >
          By clicking continue, you agree to our{" "}
          <Link to="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </motion.p>
      </div>
    </div>
  );
}
