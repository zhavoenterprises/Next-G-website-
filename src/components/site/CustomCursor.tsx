import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
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

    // Render loop for dot positioning
    const updateCursor = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
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
      {/* Central precise dot cursor */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full bg-orange transition-all duration-150 ease-out will-change-transform ${
          isHovered
            ? "h-4 w-4 -ml-2 -mt-2 bg-orange/80 shadow-[0_0_12px_rgba(232,98,44,0.8)] scale-110"
            : isActive
            ? "h-2 w-2 -ml-1 -mt-1 bg-orange/90 scale-90"
            : "h-2.5 w-2.5 -ml-1.25 -mt-1.25 shadow-[0_0_8px_rgba(232,98,44,0.6)]"
        }`}
        style={{
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
