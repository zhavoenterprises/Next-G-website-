import { createFileRoute } from "@tanstack/react-router";
import { DESIGN_SERVICES, SERVICES } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Check } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services · Construction, Design & Engineering — NG" },
      { name: "description", content: "Residential, villa, commercial and plotted development. In-house architecture, structural, MEP, land survey and BOQ on every approved project." },
      { property: "og:title", content: "NG Services" },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title={<>What we build. <span className="text-orange">What we deliver.</span></>}
        intro="From single independent homes to plotted layouts and commercial structures — with engineering discipline on every drawing."
      />

      <section className="bg-offwhite">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="tick-frame hover-lift h-full border border-border bg-card p-8">
                  <div className="mono-label text-orange">SERVICE 0{i + 1}</div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-navy">{s.title}</h3>
                  <p className="mt-3 text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-border bg-navy text-offwhite">
        <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Design & engineering"
              invert
              title={<>Included on <span className="text-orange">every approved project.</span></>}
              intro="Our in-house engineering team delivers a full drawing set with each approved build — no outsourced surprises."
            />
          </div>
          <Reveal>
            <ul className="divide-y divide-white/10 border border-white/10 bg-graphite/30">
              {DESIGN_SERVICES.map((d, i) => (
                <li key={d} className="flex items-center gap-4 p-5">
                  <span className="mono-label w-8 text-amber">0{i + 1}</span>
                  <Check size={16} className="text-orange" />
                  <span className="font-medium">{d}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
