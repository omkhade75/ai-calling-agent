import { useEffect, useRef } from "react";

export function MouseEffect() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const trailRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const dot = dotRef.current;
        const ring = ringRef.current;
        const trail = trailRef.current;
        if (!dot || !ring || !trail) return;

        let mouseX = 0, mouseY = 0;
        let trailX = 0, trailY = 0;
        let ringX = 0, ringY = 0;
        let rafId: number;

        const onMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Dot follows instantly
            dot.style.left = `${mouseX}px`;
            dot.style.top = `${mouseY}px`;
        };

        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

        const animate = () => {
            // Ring with slight lag
            ringX = lerp(ringX, mouseX, 0.18);
            ringY = lerp(ringY, mouseY, 0.18);
            ring.style.left = `${ringX}px`;
            ring.style.top = `${ringY}px`;

            // Trail with more lag
            trailX = lerp(trailX, mouseX, 0.08);
            trailY = lerp(trailY, mouseY, 0.08);
            trail.style.left = `${trailX}px`;
            trail.style.top = `${trailY}px`;

            rafId = requestAnimationFrame(animate);
        };

        const onEnterInteractive = () => {
            document.body.classList.add("cursor-hover");
        };
        const onLeaveInteractive = () => {
            document.body.classList.remove("cursor-hover");
        };

        // Attach to clickable elements
        const attachHover = () => {
            document.querySelectorAll("a, button, [role='button'], input, select, textarea, label").forEach((el) => {
                el.addEventListener("mouseenter", onEnterInteractive);
                el.addEventListener("mouseleave", onLeaveInteractive);
            });
        };

        window.addEventListener("mousemove", onMove);
        rafId = requestAnimationFrame(animate);
        attachHover();

        // Reattach on DOM changes (for dynamic elements)
        const observer = new MutationObserver(attachHover);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("mousemove", onMove);
            cancelAnimationFrame(rafId);
            observer.disconnect();
        };
    }, []);

    return (
        <>
            {/* Dot – instant follow */}
            <div
                ref={dotRef}
                id="cursor-dot"
                style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99999 }}
            />
            {/* Ring – lagged follow */}
            <div
                ref={ringRef}
                id="cursor-ring"
                style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99998 }}
            />
            {/* Glow Trail – heavy lag */}
            <div
                ref={trailRef}
                id="cursor-trail"
                style={{ position: "fixed", top: 0, left: 0, pointerEvents: "none", zIndex: 99997 }}
            />
        </>
    );
}
