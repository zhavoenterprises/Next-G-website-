import { createFileRoute } from "@tanstack/react-router";
import { TESTIMONIALS } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: "Testimonials · Words from NG Clients" },
      { name: "description", content: "Client stories from residential and commercial projects delivered by Next G Engineers Promoters." },
      { property: "og:title", content: "NG Testimonials" },
      { property: "og:url", content: "/testimonials" },
    ],
    links: [{ rel: "canonical", href: "/testimonials" }],
  }),
  component: TestimonialsPage,
});

function TestimonialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Testimonials"
        title={<>Recommended by the <span className="text-orange">families we've built for.</span></>}
        intro="Full quotes and video testimonials are being collected from our clients — a preview below."
      />
      <section className="bg-offwhite bp-grid">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 90}>
                <div className="tick-frame hover-lift h-full border border-border bg-card p-8">
                  <div className="font-display text-5xl leading-none text-orange">“</div>
                  <p className="mt-4 text-muted-foreground">{t.quote}</p>
                  <div className="mt-8 border-t border-border pt-5">
                    <div className="font-display text-lg font-semibold text-navy">{t.name}</div>
                    <div className="mono-label text-orange">{t.project}</div>
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
