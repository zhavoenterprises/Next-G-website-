import { useEffect, useRef, useState } from "react";

// Animates a numeric value in a string like "48,800+" or "11+".
export function Counter({ value, duration = 1400 }: { value: string; duration?: number }) {
  const [display, setDisplay] = useState(value.replace(/[0-9]/g, "0"));
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          animate();
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();

    function animate() {
      const match = value.match(/([\d,]+)/);
      if (!match) { setDisplay(value); return; }
      const numeric = parseInt(match[1].replace(/,/g, ""), 10);
      const start = performance.now();
      const suffix = value.slice(match.index! + match[1].length);
      const prefix = value.slice(0, match.index!);
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.floor(numeric * eased);
        setDisplay(`${prefix}${current.toLocaleString("en-IN")}${suffix}`);
        if (t < 1) requestAnimationFrame(tick);
        else setDisplay(value);
      };
      requestAnimationFrame(tick);
    }
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}
