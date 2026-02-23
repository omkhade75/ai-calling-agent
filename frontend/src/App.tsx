import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import VoiceAgentStudio from "./pages/VoiceAgentStudio";
import PhoneNumbers from "./pages/PhoneNumbers";
import { AuthProvider } from "@/contexts/AuthContext";
import { MouseEffect } from "@/components/ui/MouseEffect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MouseEffect />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/app" element={<RequireAuth><VoiceAgentStudio /></RequireAuth>} />
            <Route path="/phone-numbers" element={<RequireAuth><PhoneNumbers /></RequireAuth>} />
            <Route path="/studio" element={<Navigate to="/app" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

import { useAuth } from "@/contexts/AuthContext";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;

  return children;
}

export default App;
