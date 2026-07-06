import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ShieldCheck, Ruler, HardHat, Award } from "lucide-react";
import { COMPANY, PROJECTS, SERVICES, STATS, TESTIMONIALS, whatsappLink } from "@/lib/site-data";
import { Counter } from "@/components/site/Counter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { HeroVisual } from "@/components/site/HeroVisual";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NG · Building Madurai's Future — Next G Engineers Promoters" },
      { name: "description", content: "Residential, commercial and plotted development in Madurai and Ramanathapuram. 11+ years of trusted engineering execution." },
      { property: "og:title", content: "NG · Building Madurai's Future" },
      { property: "og:description", content: "11+ years. 34 projects. 48,800+ sq.ft delivered." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  const featured = PROJECTS.slice(0, 4);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-graphite text-offwhite">
        <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-70" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange/10" aria-hidden />
        <span className="pointer-events-none absolute left-5 top-5 h-4 w-4 border-l-2 border-t-2 border-orange" aria-hidden />
        <span className="pointer-events-none absolute right-5 top-5 h-4 w-4 border-r-2 border-t-2 border-orange" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <div className="mono-label text-amber">◤ Est. {COMPANY.established} · Madurai · Tamil Nadu</div>
            <h1 className="mt-5 text-4xl font-bold leading-[1.02] md:text-6xl lg:text-7xl">
              Building Madurai's <span className="text-orange">Future</span>,
              <br />One Project at a Time.
            </h1>
            <p className="mt-6 max-w-xl text-base text-offwhite/70 md:text-lg">
              11+ years of trusted construction across residential, commercial and plotted
              developments — engineered with precision, delivered with integrity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/projects" className="btn-primary">
                View Our Projects <ArrowRight size={16} />
              </Link>
              <Link to="/design-studio" className="btn-ghost text-offwhite">
                Start Your Design <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="mono-label mt-10 flex items-center gap-2 text-offwhite/50">
              <span className="h-px w-8 bg-orange" />
              Recipient · Excellence in Engineering
            </div>
          </div>

          <div className="relative">
            <div className="tick-frame border border-white/10 bg-graphite/40 p-4 backdrop-blur">
              <HeroVisual />
              <div className="mono-label mt-3 flex items-center justify-between text-amber/80">
                <span>DWG · NG-001</span>
                <span>SCALE 1:100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 bg-graphite/60">
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 px-5 lg:grid-cols-4 lg:px-8">
            {STATS.map((s) => (
              <div key={s.label} className="px-3 py-6 md:px-6 md:py-8">
                <div className="font-mono text-2xl font-semibold text-orange md:text-3xl">
                  <Counter value={s.value} />
                </div>
                <div className="mono-label mt-2 text-offwhite/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="relative border-b border-border bg-offwhite">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="What sets NG apart"
            title={<>Engineering discipline, <span className="text-orange">not shortcuts.</span></>}
            intro="Every drawing, every pour, every handover is executed by an in-house team you can hold accountable."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: ShieldCheck, title: "Transparent Costing", body: "BOQ-backed budgets. No hidden line items, no post-signing surprises." },
              { Icon: Ruler, title: "Precision Drawings", body: "Architecture, structural and MEP drawings on every approved project." },
              { Icon: HardHat, title: "In-house Execution", body: "Our engineers own the site — from foundation to final finish." },
              { Icon: Award, title: "On-time Handover", body: "Timelines we commit to are the timelines we deliver on." },
            ].map(({ Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 80}>
                <div className="tick-frame hover-lift h-full border border-border bg-card p-6">
                  <div className="grid h-11 w-11 place-items-center bg-navy text-orange" style={{ borderRadius: 2 }}>
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-navy">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <section className="relative bg-offwhite bp-grid">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Selected work"
              title={<>Projects across <span className="text-orange">Madurai & Ramanathapuram.</span></>}
            />
            <Link to="/projects" className="mono-label inline-flex items-center gap-2 text-navy hover:text-orange">
              All Projects <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link
                  to="/projects/$slug"
                  params={{ slug: p.slug }}
                  className="tick-frame hover-lift group block h-full border border-border bg-card"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-navy">
                    <div className="absolute inset-0 bp-grid-dark opacity-70" />
                    <div className="absolute inset-4 border border-amber/30" />
                    <div className="absolute inset-x-4 top-4 mono-label flex justify-between text-amber/80">
                      <span>NG · {String(i + 1).padStart(2, "0")}</span>
                      <span>{p.status}</span>
                    </div>
                    <div className="absolute inset-x-4 bottom-4 text-offwhite">
                      <div className="mono-label text-amber">{p.type}</div>
                      <div className="mt-1 font-display text-xl font-semibold">{p.name}</div>
                      <div className="text-xs text-offwhite/60">{p.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="mono-label text-navy">View sheet</span>
                    <ArrowUpRight size={16} className="text-navy transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="relative border-y border-border bg-navy text-offwhite">
        <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Services"
            invert
            title={<>What we build. What we deliver.</>}
            intro="From ground-up residential builds to plotted layouts and commercial structures."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <div className="group h-full border border-white/10 bg-graphite/30 p-6 transition-colors hover:border-orange">
                  <div className="mono-label text-amber">0{i + 1}</div>
                  <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-offwhite/70">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/services" className="btn-ghost text-offwhite">Explore services <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-offwhite">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Words from our clients"
            title={<>Built on trust. <span className="text-orange">Recommended by families.</span></>}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <div className="tick-frame hover-lift h-full border border-border bg-card p-6">
                  <div className="font-display text-4xl leading-none text-orange">“</div>
                  <p className="mt-2 text-sm text-muted-foreground">{t.quote}</p>
                  <div className="mt-6 border-t border-border pt-4">
                    <div className="font-semibold text-navy">{t.name}</div>
                    <div className="mono-label text-muted-foreground">{t.project}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-graphite text-offwhite">
        <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-70" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-20 md:grid-cols-[1.2fr_0.8fr] md:items-end lg:px-8">
          <div>
            <div className="mono-label text-amber">◤ Let's build</div>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Have a plot, an idea, or a brief? <span className="text-orange">Let's talk.</span>
            </h2>
            <p className="mt-4 max-w-xl text-offwhite/70">
              Message us on WhatsApp for a same-day response, or fill in the contact form and our
              team will get in touch.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <a
              href={whatsappLink("Hi NG, I'd like to discuss a project.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Chat on WhatsApp
            </a>
            <Link to="/contact" className="btn-ghost text-offwhite">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
