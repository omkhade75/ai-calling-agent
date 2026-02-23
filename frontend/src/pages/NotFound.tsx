import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Orbit, Home, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error at:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background overflow-hidden relative">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/10 blur-[150px] rounded-full opacity-50" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-white/[0.02] rounded-full"
        />
      </div>

      <div className="relative z-10 text-center max-w-xl px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, type: "spring" }}
          className="mb-12"
        >
          <div className="relative inline-block">
            <h1 className="text-[12rem] font-black italic tracking-tighter text-white opacity-10 leading-none">404</h1>
            <Orbit className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 text-primary animate-pulse" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-4xl font-black italic tracking-tight text-white uppercase">SIGNAL LOST IN SPACE</h2>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">
            The coordinate <span className="text-primary font-mono">{location.pathname}</span> does not exist in our 3D neural network.
          </p>

          <div className="pt-10">
            <Link to="/">
              <button className="bg-white text-black font-black rounded-full px-12 h-16 shadow-3d hover:scale-110 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                <Home className="h-5 w-5" /> RE-ENTER CORE
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Small floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
          }}
          animate={{
            y: [0, -100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
};

export default NotFound;
