import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mouseRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if device supports hover (i.e. has a mouse)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mediaQuery.matches) return;

    setIsVisible(true);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => setIsActive(true);
    const onMouseUp = () => setIsActive(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Check if target is interactive
      const isInteractive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        window.getComputedStyle(target).cursor === "pointer";

      setIsHovered(!!isInteractive);
    };

    const onMouseLeaveWindow = () => setIsVisible(false);
    const onMouseEnterWindow = () => setIsVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseleave", onMouseLeaveWindow);
    document.addEventListener("mouseenter", onMouseEnterWindow);

    // Disable default cursor globally when CustomCursor is loaded on hoverable devices
    const styleElement = document.createElement("style");
    styleElement.id = "custom-cursor-style";
    styleElement.innerHTML = `
      @media (hover: hover) and (pointer: fine) {
        *, *::before, *::after, html, body, a, button, [role='button'], input, select, textarea {
          cursor: none !important;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Smooth loop for cursor trailing (LERP)
    const updateCursor = () => {
      const lerpFactor = 0.15; // Liquid smooth interpolation
      
      // Update trail position (outer ring)
      trailRef.current.x += (mouseRef.current.x - trailRef.current.x) * lerpFactor;
      trailRef.current.y += (mouseRef.current.y - trailRef.current.y) * lerpFactor;

      // Render dot instantly at mouse coordinates
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
      }

      // Render ring with lag at trail coordinates
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${trailRef.current.x}px, ${trailRef.current.y}px, 0)`;
      }

      frameRef.current = requestAnimationFrame(updateCursor);
    };

    frameRef.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseleave", onMouseLeaveWindow);
      document.removeEventListener("mouseenter", onMouseEnterWindow);
      
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      
      const styleEl = document.getElementById("custom-cursor-style");
      if (styleEl) styleEl.remove();
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Central precise dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-1 -mt-1 h-2 w-2 rounded-full bg-orange shadow-[0_0_8px_rgba(232,98,44,0.6)]"
        style={{ willChange: "transform" }}
      />

      {/* Premium Outer CAD-style Drafting Crosshair Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -ml-5 -mt-5 rounded-full border transition-all duration-300 ease-out will-change-transform flex items-center justify-center ${
          isHovered
            ? "h-10 w-10 border-orange bg-orange/10 shadow-[0_0_15px_rgba(232,98,44,0.2)] scale-110"
            : isActive
            ? "h-10 w-10 border-orange bg-orange/20 scale-90"
            : "h-10 w-10 border-navy/20 bg-navy/[0.005]"
        }`}
        style={{
          boxSizing: "border-box",
        }}
      >
        {/* Drafting Tick Marks */}
        <div className={`absolute top-0.5 w-[1.5px] h-1.5 bg-orange/60 transition-transform duration-300 ${isHovered ? "scale-y-150 translate-y-0.5" : ""}`} />
        <div className={`absolute bottom-0.5 w-[1.5px] h-1.5 bg-orange/60 transition-transform duration-300 ${isHovered ? "scale-y-150 -translate-y-0.5" : ""}`} />
        <div className={`absolute left-0.5 h-[1.5px] w-1.5 bg-orange/60 transition-transform duration-300 ${isHovered ? "scale-x-150 translate-x-0.5" : ""}`} />
        <div className={`absolute right-0.5 h-[1.5px] w-1.5 bg-orange/60 transition-transform duration-300 ${isHovered ? "scale-x-150 -translate-x-0.5" : ""}`} />
      </div>
    </div>
  );
}
