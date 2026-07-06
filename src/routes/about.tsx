import { createFileRoute } from "@tanstack/react-router";
import { COMPANY, TEAM, VALUES } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { User } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About NG — 11+ Years of Trusted Engineering in Madurai" },
      { name: "description", content: "Founded 2020, led by Megathaf Halima S. Learn about the vision, mission and team behind Next G Engineers Promoters Pvt Ltd." },
      { property: "og:title", content: "About Next G Engineers Promoters" },
      { property: "og:description", content: "Madurai's most trusted name in construction — precision, integrity and lasting value." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow={`About · Est. ${COMPANY.established}`}
        title={<>Precision engineering, built <span className="text-orange">on relationships.</span></>}
        intro={`Next G Engineers Promoters Pvt Ltd is a construction and real estate development firm serving Madurai, Ramanathapuram and the surrounding Tamil Nadu districts.`}
      />

      {/* Story */}
      <section className="bg-offwhite">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1fr] lg:px-8">
          <Reveal>
            <div className="mono-label text-orange">◤ Our story</div>
            <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">
              Founded in 2020. Rooted in 11+ years of on-site experience.
            </h2>
            <p className="mt-5 text-muted-foreground">
              NG was founded by <strong className="text-navy">Megathaf Halima S</strong> as a
              disciplined engineering firm for families and businesses who wanted a builder they
              could trust with their most important asset — a home, a plot, a commercial space.
            </p>
            <p className="mt-3 text-muted-foreground">
              Today we execute residential, commercial and plotted development projects across
              Madurai, Ramanathapuram, Keelakarai and Paramakudi — with in-house engineering, honest
              costing and delivery timelines we stand behind.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="tick-frame border border-border bg-card p-8">
              <div className="mono-label text-orange">◤ Vision</div>
              <p className="mt-3 text-navy">
                To be Madurai's most trusted name in construction — where every structure we deliver
                reflects precision, integrity, and lasting value for the families and businesses who
                build with us.
              </p>
              <div className="mono-label mt-8 text-orange">◤ Mission</div>
              <p className="mt-3 text-navy">
                We deliver residential and commercial projects on time and on budget, backed by
                transparent engineering, honest communication, and 11+ years of hands-on execution —
                so every client recommends us to someone they care about.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="relative border-y border-border bg-navy text-offwhite">
        <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-60" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading eyebrow="Core values" invert title={<>Four principles. <span className="text-orange">Every project.</span></>} />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <div className="h-full border border-white/10 bg-graphite/30 p-6 transition-colors hover:border-orange">
                  <div className="mono-label text-amber">0{i + 1}</div>
                  <h3 className="mt-3 font-display text-xl font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-offwhite/70">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-offwhite">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading eyebrow="Leadership & site team" title={<>The people <span className="text-orange">behind every drawing.</span></>} />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TEAM.map((m, i) => (
              <Reveal key={m.name} delay={i * 100}>
                <div className="tick-frame hover-lift h-full border border-border bg-card">
                  <div className="relative aspect-[4/5] overflow-hidden bg-navy">
                    <div className="absolute inset-0 bp-grid-dark opacity-60" />
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-amber/40 bg-graphite/60">
                        <User size={40} className="text-amber/70" />
                      </div>
                    </div>
                    <div className="mono-label absolute inset-x-4 top-4 flex justify-between text-amber/80">
                      <span>NG · TEAM</span>
                      <span>0{i + 1}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="font-display text-lg font-semibold text-navy">{m.name}</div>
                    <div className="mono-label text-orange">{m.role}</div>
                    <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
