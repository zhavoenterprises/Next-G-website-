import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PROJECTS } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · NG · Residential & Commercial Builds Across Madurai" },
      { name: "description", content: "Selected residential, commercial and plotted development projects delivered by NG across Madurai and Ramanathapuram." },
      { property: "og:title", content: "NG Projects Portfolio" },
      { property: "og:description", content: "Al Ameen Nagar, Thirunagar, Bharathi Nagar, Keelakarai, Vaigai Nagar and more." },
      { property: "og:url", content: "/projects" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: ProjectsPage,
});

const FILTERS = ["All", "Completed", "Ongoing", "Upcoming"] as const;

function ProjectsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const list = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.status === filter);

  return (
    <>
      <PageHeader
        eyebrow="Projects · Portfolio"
        title={<>Selected work across <span className="text-orange">Madurai, Ramanathapuram & beyond.</span></>}
        intro="A snapshot of residential layouts, commercial developments and independent builds delivered by our in-house team."
      />

      <section className="bg-offwhite bp-grid">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`mono-label border px-3 py-2 transition-colors ${
                  filter === f
                    ? "border-orange bg-orange text-white"
                    : "border-border bg-card text-navy hover:border-orange"
                }`}
                style={{ borderRadius: 2 }}
              >
                {f}
              </button>
            ))}
            <div className="mono-label ml-auto text-muted-foreground">
              {list.length.toString().padStart(2, "0")} · Projects shown
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <Link
                  to="/projects/$slug"
                  params={{ slug: p.slug }}
                  className="tick-frame hover-lift group block h-full border border-border bg-card"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                    <div className="absolute inset-0 bp-grid-dark opacity-70" />
                    <div className="absolute inset-5 border border-amber/30" />
                    <div className="mono-label absolute inset-x-5 top-5 flex justify-between text-amber/80">
                      <span>SHEET {String(i + 1).padStart(2, "0")}</span>
                      <span className={`px-2 py-0.5 border ${p.status === "Completed" ? "border-amber text-amber" : p.status === "Ongoing" ? "border-orange text-orange" : "border-white/40 text-offwhite"}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="absolute inset-x-5 bottom-5 text-offwhite">
                      <div className="mono-label text-amber">{p.type}</div>
                      <div className="mt-1 font-display text-2xl font-semibold">{p.name}</div>
                      <div className="text-sm text-offwhite/60">{p.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4">
                    <span className="mono-label text-navy">View project sheet</span>
                    <ArrowUpRight size={16} className="text-navy transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
