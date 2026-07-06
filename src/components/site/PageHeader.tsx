import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-graphite text-offwhite">
      <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-70" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange to-transparent" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28 lg:px-8">
        <div className="mono-label text-amber">◤ {eyebrow}</div>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-[1.02] md:text-5xl lg:text-6xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-base text-offwhite/70 md:text-lg">{intro}</p>}
      </div>
      {/* Corner ticks */}
      <span className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l-2 border-t-2 border-orange" aria-hidden />
      <span className="pointer-events-none absolute right-4 bottom-4 h-3 w-3 border-b-2 border-r-2 border-orange" aria-hidden />
    </section>
  );
}
