import { createFileRoute } from "@tanstack/react-router";
import { PLOTS, whatsappLink } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { PlotSketch } from "@/components/site/PlotSketch";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/design-studio")({
  head: () => ({
    meta: [
      { title: "Design Studio · Bring Your Plot to a Finished Design — NG" },
      { name: "description", content: "Browse available land plots and commission a custom architectural design at a fixed cost. WhatsApp our engineers to start." },
      { property: "og:title", content: "NG Design Studio" },
      { property: "og:description", content: "Plot-to-plan design service — fixed fee, direct-to-engineer." },
      { property: "og:url", content: "/design-studio" },
    ],
    links: [{ rel: "canonical", href: "/design-studio" }],
  }),
  component: DesignStudio,
});

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function DesignStudio() {
  return (
    <>
      <PageHeader
        eyebrow="Design Studio"
        title={<>Bring your plot to a <span className="text-orange">finished design.</span></>}
        intro="Browse our available land plots and commission a custom architectural design directly with our engineering team — at a fixed, transparent cost. No agents, no back-and-forth."
      />

      <section className="bg-offwhite bp-grid">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mono-label mb-8 flex items-center gap-3 text-orange">
            <span className="h-px w-10 bg-orange" />
            {PLOTS.length.toString().padStart(2, "0")} plots available
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PLOTS.map((plot, i) => {
              const sqft = plot.lengthFt * plot.breadthFt;
              const msg = `Hi, I want to make a design for this land — ${plot.location}, ${plot.lengthFt}ft x ${plot.breadthFt}ft (${sqft} sqft). Shall we discuss?`;
              return (
                <Reveal key={plot.id} delay={i * 90}>
                  <div className="tick-frame hover-lift flex h-full flex-col border border-border bg-card">
                    <div className="border-b border-border bg-offwhite/60 p-5">
                      <PlotSketch lengthFt={plot.lengthFt} breadthFt={plot.breadthFt} />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="mono-label text-orange">◤ Available plot</div>
                      <h3 className="mt-2 font-display text-xl font-semibold text-navy">{plot.location}</h3>

                      <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-border py-4">
                        <div>
                          <dt className="mono-label text-muted-foreground">Length</dt>
                          <dd className="font-mono text-lg font-semibold text-navy">{plot.lengthFt}<span className="text-xs text-muted-foreground"> ft</span></dd>
                        </div>
                        <div>
                          <dt className="mono-label text-muted-foreground">Breadth</dt>
                          <dd className="font-mono text-lg font-semibold text-navy">{plot.breadthFt}<span className="text-xs text-muted-foreground"> ft</span></dd>
                        </div>
                        <div>
                          <dt className="mono-label text-muted-foreground">Area</dt>
                          <dd className="font-mono text-lg font-semibold text-navy">{sqft.toLocaleString("en-IN")}<span className="text-xs text-muted-foreground"> sqft</span></dd>
                        </div>
                      </dl>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <div className="mono-label text-muted-foreground">Design fee</div>
                          <div className="font-mono text-2xl font-semibold text-orange">{formatINR(plot.designFee)}</div>
                        </div>
                        <div className="mono-label text-right text-muted-foreground">Fixed cost<br/>All-inclusive</div>
                      </div>

                      <a
                        href={whatsappLink(msg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary mt-6 w-full"
                      >
                        Start to Design <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mono-label mt-16 max-w-2xl text-muted-foreground">
            Have your own plot? Message us on WhatsApp with the dimensions and location and we'll
            quote a fixed design fee within the same day.
          </div>
        </div>
      </section>
    </>
  );
}
