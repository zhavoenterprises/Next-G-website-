import { useState, useEffect } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { Carousel, TestimonialCard, type iTestimonial } from "@/components/ui/retro-testimonial";
import { ShimmerText } from "@/components/ui/shimmer-text";

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<(iTestimonial & { id: string; bgImage: string })[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("ng_testimonials");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTestimonials(parsed);
        }
      } catch (e) {
        // ignore corrupt data
      }
    }
  }, []);

  const cards = testimonials.map((t, index) => (
    <TestimonialCard
      key={t.id || 	_}
      testimonial={t}
      index={index}
      backgroundImage={t.bgImage}
    />
  ));

  return (
    <>
      <title>Testimonials · Next G Engineers Promoters Pvt Ltd</title>
      <meta name="description" content="Real stories from residential and commercial clients of Next G Engineers Promoters in Madurai and Ramanathapuram." />
      <PageHeader
        eyebrow="Testimonials"
        title={
          <>
            Recommended by the{" "}
            <ShimmerText variant="orange" className="font-display italic font-semibold">
              families we've built for.
            </ShimmerText>
          </>
        }
        intro="Read real stories from residential and commercial clients who experienced our transparent, BOQ-backed engineering discipline first-hand."
      />
      <section className="bg-offwhite bp-grid overflow-hidden py-12">
        {testimonials.length > 0 ? (
          <Carousel items={cards} />
        ) : (
          <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8 text-center">
            <p className="mono-label text-muted-foreground mb-3">Coming Soon</p>
            <p className="font-display text-3xl font-semibold text-navy">Client stories are on the way.</p>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We're collecting testimonials from our completed projects. Check back soon.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
