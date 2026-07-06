import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { Carousel, TestimonialCard, type iTestimonial } from "@/components/ui/retro-testimonial";
import { ShimmerText } from "@/components/ui/shimmer-text";

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

const testimonialList: (iTestimonial & { id: string; bgImage: string })[] = [
  {
    id: "t1",
    name: "Tangalakshmi",
    designation: "Residential Project, Madurai",
    description: "Next G built our dream home in Madurai. The structural drawing precision was amazing, and the billing was 100% transparent. Highly recommend!",
    profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    bgImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "t2",
    name: "Ameena Beevi",
    designation: "Residential Project, Ramanathapuram",
    description: "They handled everything from drawings to final finishes. Outstanding engineering discipline and completed right on schedule.",
    profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "t3",
    name: "Fazila",
    designation: "Commercial Project, Keelakarai",
    description: "Next G completed our retail outlet construction in Keelakarai. Clean execution, no surprises in cost, and excellent site safety.",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150",
    bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "t4",
    name: "Muthukumar",
    designation: "Plotted Development, Paramakudi",
    description: "Superb planning and coordination for our plotted layout. They handled all approvals and delivered complete infrastructure.",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    bgImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "t5",
    name: "Dr. Syed",
    designation: "Independent Villa, Madurai",
    description: "As a doctor, I had zero time to supervise. Next G's site engineers managed everything with professional reports. Extremely satisfied.",
    profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150",
    bgImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "t6",
    name: "Rajesh Kumar",
    designation: "Commercial Office, Ramanathapuram",
    description: "Their BOQ-backed costing is their biggest strength. Not a single rupee of cost escalation from the initial quote.",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
  },
];

function TestimonialsPage() {
  const cards = testimonialList.map((t, index) => (
    <TestimonialCard
      key={t.id}
      testimonial={t}
      index={index}
      backgroundImage={t.bgImage}
    />
  ));

  return (
    <>
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
        <Carousel items={cards} />
      </section>
    </>
  );
}
