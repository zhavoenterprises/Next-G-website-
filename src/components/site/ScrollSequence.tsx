import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ScrollSequence() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalFrames = 300;
  const coreStep = 5;
  const imagesRef = useRef<HTMLImageElement[]>(new Array(totalFrames));
  const loadedImagesRef = useRef<Set<number>>(new Set());
  const sequenceRef = useRef({ frame: 0 });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.normalizeScroll(true);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const drawImageProp = (img: HTMLImageElement) => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const iw = img.width;
      const ih = img.height;
      const r = Math.min(w / iw, h / ih);
      
      const nw = iw * r;
      const nh = ih * r;
      const cx = (w - nw) / 2;
      const cy = (h - nh) / 2;

      ctx.drawImage(img, 0, 0, iw, ih, cx, cy, nw, nh);
    };

    const findClosestLoadedIndex = (targetIndex: number) => {
      const loaded = loadedImagesRef.current;
      if (loaded.has(targetIndex)) return targetIndex;
      
      let closest = 0;
      let minDiff = Infinity;
      for (const idx of loaded) {
        const diff = Math.abs(idx - targetIndex);
        if (diff < minDiff) {
          minDiff = diff;
          closest = idx;
        }
      }
      return closest;
    };

    const drawFrame = (frameIndex: number) => {
      const rounded = Math.round(frameIndex);
      const actualIndex = findClosestLoadedIndex(rounded);
      const img = imagesRef.current[actualIndex];
      
      if (img && img.complete) {
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        drawImageProp(img);
      }
    };

    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      drawFrame(sequenceRef.current.frame);
    };

    window.addEventListener("resize", resizeCanvas);

    let scrollTriggerInstance: ScrollTrigger | null = null;

    const initScrollTrigger = () => {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2, // Smooth follow scrub lag
        onUpdate: (self) => {
          const frameIndex = self.progress * (totalFrames - 1);
          sequenceRef.current.frame = frameIndex;
          drawFrame(frameIndex);
        }
      });
    };

    // Initial render setup
    const firstImg = new Image();
    firstImg.src = "/frames/ezgif-frame-001.jpg";
    firstImg.onload = () => {
      imagesRef.current[0] = firstImg;
      loadedImagesRef.current.add(0);
      resizeCanvas();
      initScrollTrigger(); // Initialize scroll scrubbing immediately!
      startQueue(); // Load all other frames in the background
    };

    const startQueue = () => {
      const loadQueue: number[] = [];
      for (let i = 0; i < totalFrames; i += coreStep) {
        if (i !== 0) loadQueue.push(i);
      }
      for (let i = 0; i < totalFrames; i += 2) {
        if (i % coreStep !== 0 && i !== 0) loadQueue.push(i);
      }
      for (let i = 1; i < totalFrames; i += 2) {
        if (i % 2 !== 0 && i % coreStep !== 0) loadQueue.push(i);
      }

      let queueIdx = 0;
      const maxWorkers = 5;

      const worker = () => {
        if (queueIdx >= loadQueue.length) return;
        const idx = loadQueue[queueIdx++];
        const img = new Image();
        img.src = `/frames/ezgif-frame-${String(idx + 1).padStart(3, "0")}.jpg`;
        
        img.onload = () => {
          imagesRef.current[idx] = img;
          loadedImagesRef.current.add(idx);

          if (Math.round(sequenceRef.current.frame) === idx) {
            drawFrame(idx);
          }
          worker();
        };

        img.onerror = () => {
          worker();
        };
      };

      for (let w = 0; w < maxWorkers; w++) {
        worker();
      }
    };

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-screen h-[100dvh] z-[-1] overflow-hidden pointer-events-none bg-[#0B0F19] select-none">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bp-grid-dark opacity-10" />
      
      {/* Dimming mask for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/50 via-[#0F172A]/70 to-[#0F172A]/90" />
      
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain block opacity-35 mix-blend-screen" 
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
