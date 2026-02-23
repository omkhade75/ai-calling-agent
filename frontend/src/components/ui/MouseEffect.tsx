import { useEffect, useState } from "react";
import { motion, useSpring } from "framer-motion";

export function MouseEffect() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({
                x: e.clientX,
                y: e.clientY,
            });
        };

        window.addEventListener("mousemove", updateMousePosition);

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
        };
    }, []);

    const springX = useSpring(mousePosition.x, { stiffness: 100, damping: 20 });
    const springY = useSpring(mousePosition.y, { stiffness: 100, damping: 20 });

    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
            {/* Primary Glow */}
            <motion.div
                className="pointer-events-none absolute w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 mix-blend-screen"
                style={{
                    background: "radial-gradient(circle, rgba(124, 58, 237, 0.6) 0%, rgba(6, 182, 212, 0.2) 100%)",
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
            {/* High-intensity Core */}
            <motion.div
                className="pointer-events-none absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-40 mix-blend-screen"
                style={{
                    background: "radial-gradient(circle, rgba(6, 182, 212, 0.8) 0%, rgba(124, 58, 237, 0) 100%)",
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />
        </div>
    );
}
