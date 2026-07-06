import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { 
  ArrowRight, ArrowUpRight, ShieldCheck, Ruler, HardHat, Award, 
  Check, Phone, Mail, MapPin, Clock, Send, MessageCircle, Sliders, Maximize2 
} from "lucide-react";
import { 
  COMPANY, PROJECTS, SERVICES, DESIGN_SERVICES, STATS, TEAM, VALUES, PLOTS, whatsappLink 
} from "@/lib/site-data";
import { Counter } from "@/components/site/Counter";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { HeroVisual } from "@/components/site/HeroVisual";
import { PlotSketch } from "@/components/site/PlotSketch";
import { Carousel, TestimonialCard, type iTestimonial } from "@/components/ui/retro-testimonial";
import { ShimmerText } from "@/components/ui/shimmer-text";

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

const FILTERS = ["All", "Completed", "Ongoing", "Upcoming"] as const;

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function Home() {
  // Projects state
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const filteredProjects = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.status === filter);

  // Design Studio Customizer state
  const [length, setLength] = useState(40);
  const [breadth, setBreadth] = useState(30);
  const [plotLocation, setPlotLocation] = useState("");

  const sqft = length * breadth;
  const baseFee = 5000;
  const ratePerSqft = 3.5;
  const designFee = baseFee + sqft * ratePerSqft;

  let recommendedLayout = "Compact 1 BHK Independent House";
  if (sqft >= 2400) {
    recommendedLayout = "Premium 4 BHK Villa / Commercial Development";
  } else if (sqft >= 1500) {
    recommendedLayout = "Spacious 3 BHK Double-Floor Duplex Villa";
  } else if (sqft >= 800) {
    recommendedLayout = "Standard 2 BHK Single-Floor / Duplex Residence";
  }

  const customMsg = `Hi NG, I'd like to commission a custom design for my plot. Dimensions: ${length}ft x ${breadth}ft (${sqft} sqft). Estimated fee: ${formatINR(designFee)}.${plotLocation ? " Location: " + plotLocation + "." : ""}`;

  // Contact form state
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Enquiry from ${form.name} (${form.phone}${form.email ? ", " + form.email : ""}):\n\n${form.message}`;
    window.open(whatsappLink(msg), "_blank");
    setSent(true);
  };

  // Testimonials mapping
  const testimonialCards = testimonialList.map((t, index) => (
    <TestimonialCard
      key={t.id}
      testimonial={t}
      index={index}
      backgroundImage={t.bgImage}
    />
  ));

  return (
    <>
      {/* HERO SECTION */}
      <section id="home" className="relative overflow-hidden bg-graphite text-offwhite">
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
              <Link to="/" hash="projects" className="btn-primary cursor-pointer">
                View Our Projects <ArrowRight size={16} />
              </Link>
              <Link to="/" hash="design-studio" className="btn-ghost text-offwhite cursor-pointer">
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

      {/* ABOUT SECTION */}
      <section id="about" className="relative bg-offwhite border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading 
            eyebrow={`About · Est. ${COMPANY.established}`} 
            title={<>Precision engineering, built <span className="text-orange">on relationships.</span></>}
            intro={`Next G Engineers Promoters Pvt Ltd is a construction and real estate development firm serving Madurai, Ramanathapuram and the surrounding Tamil Nadu districts.`}
          />

          <div className="grid gap-12 mt-12 lg:grid-cols-2">
            <Reveal>
              <div className="mono-label text-orange">◤ Our story</div>
              <h2 className="mt-3 text-3xl font-bold text-navy md:text-4xl">
                Founded in {COMPANY.established}. Rooted in 11+ years of on-site experience.
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
              <div className="tick-frame border border-border bg-card p-8 h-full flex flex-col justify-center">
                <div className="mono-label text-orange">◤ Vision</div>
                <p className="mt-3 text-navy text-sm md:text-base">
                  To be Madurai's most trusted name in construction — where every structure we deliver
                  reflects precision, integrity, and lasting value for the families and businesses who
                  build with us.
                </p>
                <div className="mono-label mt-8 text-orange">◤ Mission</div>
                <p className="mt-3 text-navy text-sm md:text-base">
                  We deliver residential and commercial projects on time and on budget, backed by
                  transparent engineering, honest communication, and 11+ years of hands-on execution —
                  so every client recommends us to someone they care about.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Core Values */}
          <div className="mt-20">
            <div className="mono-label mb-8 text-orange flex items-center gap-2">
              <span className="h-px w-8 bg-orange" />
              ◤ Core Values
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={i * 80}>
                  <div className="h-full border border-border bg-card p-6 transition-all hover:border-orange">
                    <div className="mono-label text-orange font-bold">0{i + 1}</div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-navy">{v.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Leadership Team */}
          <div className="mt-20">
            <div className="mono-label mb-8 text-orange flex items-center gap-2">
              <span className="h-px w-8 bg-orange" />
              ◤ Leadership & Site Team
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {TEAM.map((m, i) => (
                <Reveal key={m.name} delay={i * 100}>
                  <div className="tick-frame hover-lift h-full border border-border bg-card flex flex-col justify-between">
                    <div className="relative aspect-[4/5] overflow-hidden bg-navy">
                      <div className="absolute inset-0 bp-grid-dark opacity-60" />
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="grid h-24 w-24 place-items-center rounded-full border-2 border-amber/40 bg-graphite/60">
                          <span className="font-display text-2xl font-bold text-amber">{m.name.charAt(0)}</span>
                        </div>
                      </div>
                      <div className="absolute inset-x-4 bottom-4 text-offwhite">
                        <div className="mono-label text-amber">{m.role}</div>
                        <div className="mt-1 font-display text-xl font-semibold">{m.name}</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="relative bg-offwhite border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading 
            eyebrow="Services" 
            title={<>What we build. <span className="text-orange">What we deliver.</span></>}
            intro="From single independent homes to plotted layouts and commercial structures — with engineering discipline on every drawing."
          />

          <div className="grid gap-6 md:grid-cols-2 mt-12">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <div className="tick-frame hover-lift h-full border border-border bg-card p-8">
                  <div className="mono-label text-orange">SERVICE 0{i + 1}</div>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-navy">{s.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Design & Engineering Checklist */}
          <div className="mt-16 relative border border-border bg-navy text-offwhite overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-40" aria-hidden />
            <div className="relative grid gap-8 p-8 md:p-12 lg:grid-cols-2 items-center">
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
                      <span className="font-medium text-sm md:text-base">{d}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section id="projects" className="relative bg-offwhite border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
            <SectionHeading
              eyebrow="Projects · Portfolio"
              title={<>Selected work across <span className="text-orange">Madurai & Ramanathapuram.</span></>}
              intro="A snapshot of residential layouts, commercial developments and independent builds delivered by our in-house team."
            />
            
            {/* Staggered Filter Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`mono-label border px-3 py-2 text-xs transition-colors cursor-pointer ${
                    filter === f
                      ? "border-orange bg-orange text-white"
                      : "border-border bg-card text-navy hover:border-orange"
                  }`}
                  style={{ borderRadius: 2 }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((p, i) => (
              <Reveal key={`${filter}-${p.slug}`} delay={i * 60}>
                <Link
                  to="/projects/$slug"
                  params={{ slug: p.slug }}
                  className="tick-frame hover-lift group block h-full border border-border bg-card cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-navy">
                    <div className="absolute inset-0 bp-grid-dark opacity-70" />
                    <div className="absolute inset-5 border border-amber/30" />
                    <div className="mono-label absolute inset-x-5 top-5 flex justify-between text-amber/80">
                      <span>SHEET {String(i + 1).padStart(2, "0")}</span>
                      <span className={`px-2 py-0.5 border text-[10px] ${p.status === "Completed" ? "border-amber text-amber" : p.status === "Ongoing" ? "border-orange text-orange" : "border-white/40 text-offwhite"}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="absolute inset-x-5 bottom-5 text-offwhite">
                      <div className="mono-label text-amber text-xs">{p.type}</div>
                      <div className="mt-1 font-display text-xl md:text-2xl font-semibold">{p.name}</div>
                      <div className="text-xs text-offwhite/60">{p.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-5 py-4 bg-card">
                    <span className="mono-label text-navy text-xs">View project sheet</span>
                    <ArrowUpRight size={16} className="text-navy transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-orange" />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DESIGN STUDIO SECTION */}
      <section id="design-studio" className="relative bg-offwhite border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Design Studio"
            title={<>Bring your plot to a <span className="text-orange">finished design.</span></>}
            intro="Browse our available land plots or input your own dimensions to commission a custom architectural design directly with our engineering team — at a fixed, transparent cost. No agents, no back-and-forth."
          />

          {/* Interactive customizer */}
          <div className="mt-12">
            <div className="mono-label mb-6 flex items-center gap-3 text-orange">
              <Sliders size={14} />
              <span>01 · Interactive Dimension Customizer</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] items-stretch">
              {/* Controls */}
              <div className="tick-frame border border-border bg-card p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-2xl font-bold text-navy">Plot Dimensions</h3>
                  <p className="text-sm text-muted-foreground mt-1">Adjust sliders or type directly to calculate design parameters.</p>

                  {/* Length Input */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-2">
                      <label className="mono-label text-navy font-semibold text-xs">Plot Length (ft)</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="15" 
                          max="150" 
                          value={length} 
                          onChange={(e) => setLength(Math.max(15, Math.min(150, Number(e.target.value) || 15)))}
                          className="w-16 font-mono text-center text-sm border border-border bg-offwhite py-1 text-navy rounded outline-none focus:border-orange"
                        />
                        <span className="text-xs text-muted-foreground">ft</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="150"
                      value={length}
                      onChange={(e) => setLength(Number(e.target.value))}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-orange"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                      <span>15 FT</span>
                      <span>80 FT</span>
                      <span>150 FT</span>
                    </div>
                  </div>

                  {/* Breadth Input */}
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <label className="mono-label text-navy font-semibold text-xs">Plot Breadth (ft)</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          min="15" 
                          max="150" 
                          value={breadth} 
                          onChange={(e) => setBreadth(Math.max(15, Math.min(150, Number(e.target.value) || 15)))}
                          className="w-16 font-mono text-center text-sm border border-border bg-offwhite py-1 text-navy rounded outline-none focus:border-orange"
                        />
                        <span className="text-xs text-muted-foreground">ft</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="150"
                      value={breadth}
                      onChange={(e) => setBreadth(Number(e.target.value))}
                      className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-orange"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
                      <span>15 FT</span>
                      <span>80 FT</span>
                      <span>150 FT</span>
                    </div>
                  </div>

                  {/* Location Input */}
                  <div className="mt-6">
                    <label className="mono-label mb-2 block text-navy font-semibold text-xs">Plot Location (Optional)</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="e.g. Anna Nagar, Madurai"
                        value={plotLocation}
                        onChange={(e) => setPlotLocation(e.target.value)}
                        className="w-full border border-border bg-offwhite pl-9 pr-4 py-2.5 text-sm text-navy outline-none transition-colors focus:border-orange rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Specs Summary */}
                <div className="mt-8 pt-6 border-t border-border">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="mono-label text-muted-foreground text-[10px]">Total Area</dt>
                      <dd className="font-mono text-lg font-bold text-navy mt-0.5">{sqft.toLocaleString("en-IN")} <span className="text-xs font-sans font-normal text-muted-foreground">sqft</span></dd>
                    </div>
                    <div>
                      <dt className="mono-label text-muted-foreground text-[10px]">Layout Suggestion</dt>
                      <dd className="text-xs font-semibold text-navy mt-0.5 leading-tight">{recommendedLayout}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Live Preview & Pricing */}
              <div className="tick-frame border border-border bg-graphite text-offwhite p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-40" />
                
                <div className="relative z-10">
                  <div className="mono-label text-amber/80 flex justify-between items-center text-xs">
                    <span>◤ Live blueprint generator</span>
                    <span className="flex items-center gap-1"><Maximize2 size={10} /> Auto-scale</span>
                  </div>
                  
                  {/* Dynamically scaled sketch with light lines on dark background */}
                  <div className="border border-white/10 bg-navy/40 p-4 mt-4 backdrop-blur">
                    <PlotSketch lengthFt={length} breadthFt={breadth} color="#F7F6F3" accent="#E8622C" />
                  </div>
                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div>
                    <div className="mono-label text-amber/80 text-xs">Estimated Design Fee</div>
                    <div className="font-mono text-2xl md:text-3xl font-bold text-orange mt-1">{formatINR(designFee)}</div>
                    <div className="text-[10px] text-offwhite/50 mt-1 font-mono">₹5,000 base + ₹3.50/sqft</div>
                  </div>
                  <a
                    href={whatsappLink(customMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full sm:w-auto cursor-pointer"
                  >
                    Commission Custom Design <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Plots listing */}
          <div className="mt-20">
            <div className="mono-label mb-8 flex items-center gap-3 text-orange">
              <span className="h-px w-10 bg-orange" />
              <span>02 · Browse Sample / Available Land Plots</span>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {PLOTS.map((plot, i) => {
                const plotSqft = plot.lengthFt * plot.breadthFt;
                const sampleMsg = `Hi, I want to make a design for this land — ${plot.location}, ${plot.lengthFt}ft x ${plot.breadthFt}ft (${plotSqft} sqft). Shall we discuss?`;
                return (
                  <Reveal key={plot.id} delay={i * 90}>
                    <div className="tick-frame hover-lift flex h-full flex-col border border-border bg-card">
                      <div className="border-b border-border bg-offwhite/60 p-5">
                        <PlotSketch lengthFt={plot.lengthFt} breadthFt={plot.breadthFt} />
                      </div>
                      <div className="flex flex-1 flex-col p-6 justify-between">
                        <div>
                          <div className="mono-label text-orange text-xs">◤ Available plot</div>
                          <h3 className="mt-2 font-display text-lg font-semibold text-navy leading-tight">{plot.location}</h3>

                          <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-border py-4">
                            <div>
                              <dt className="mono-label text-muted-foreground text-[10px]">Length</dt>
                              <dd className="font-mono text-base font-semibold text-navy">{plot.lengthFt}<span className="text-[10px] text-muted-foreground"> ft</span></dd>
                            </div>
                            <div>
                              <dt className="mono-label text-muted-foreground text-[10px]">Breadth</dt>
                              <dd className="font-mono text-base font-semibold text-navy">{plot.breadthFt}<span className="text-[10px] text-muted-foreground"> ft</span></dd>
                            </div>
                            <div>
                              <dt className="mono-label text-muted-foreground text-[10px]">Area</dt>
                              <dd className="font-mono text-base font-semibold text-navy">{plotSqft.toLocaleString("en-IN")}<span className="text-[10px] text-muted-foreground"> sqf</span></dd>
                            </div>
                          </dl>
                        </div>

                        <div className="mt-5 pt-2">
                          <div className="flex items-end justify-between mb-4">
                            <div>
                              <div className="mono-label text-muted-foreground text-[10px]">Design fee</div>
                              <div className="font-mono text-xl font-semibold text-orange">{formatINR(plot.designFee)}</div>
                            </div>
                            <div className="mono-label text-right text-muted-foreground text-[10px] leading-tight">Fixed cost<br/>All-inclusive</div>
                          </div>

                          <a
                            href={whatsappLink(sampleMsg)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary w-full cursor-pointer text-sm"
                          >
                            Start to Design <ArrowRight size={14} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="relative bg-offwhite border-b border-border overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 pt-20 lg:px-8">
          <SectionHeading
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
        </div>
        
        <div className="pb-20">
          <Carousel items={testimonialCards} />
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="relative bg-offwhite">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading
            eyebrow="Contact"
            title={<>Let's build <span className="text-orange">something lasting.</span></>}
            intro="Call, WhatsApp, or send an enquiry — we respond within business hours the same day."
          />

          <div className="grid gap-10 mt-12 lg:grid-cols-[1fr_1.1fr]">
            {/* Info cards */}
            <div className="space-y-4">
              {[
                { Icon: MapPin, label: "Address", value: COMPANY.address, href: COMPANY.mapUrl },
                { Icon: Phone, label: "Phone / WhatsApp", value: COMPANY.phone, href: `tel:${COMPANY.phone}`, mono: true },
                { Icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
                { Icon: Clock, label: "Working hours", value: COMPANY.hours },
              ].map(({ Icon, label, value, href, mono }) => (
                <div key={label} className="tick-frame flex items-start gap-4 border border-border bg-card p-5">
                  <div className="grid h-11 w-11 shrink-0 place-items-center bg-navy text-orange" style={{ borderRadius: 2 }}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <div className="mono-label text-orange text-xs">{label}</div>
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`mt-1 block break-words text-navy hover:text-orange text-sm ${mono ? "font-mono" : ""}`}>
                        {value}
                      </a>
                    ) : (
                      <div className="mt-1 text-navy text-sm">{value}</div>
                    )}
                  </div>
                </div>
              ))}

              <a 
                href={whatsappLink("Hi NG, I'd like to enquire about a project.")} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary w-full cursor-pointer"
              >
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>

            {/* Message form */}
            <form onSubmit={handleFormSubmit} className="tick-frame border border-border bg-card p-6 md:p-8">
              <div className="mono-label text-orange">◤ Enquiry form</div>
              <h2 className="mt-2 font-display text-2xl font-bold text-navy">Send us a message</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
                <div className="md:col-span-2">
                  <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
                </div>
                <div className="md:col-span-2">
                  <label className="mono-label mb-2 block text-muted-foreground text-xs">Message *</label>
                  <textarea
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    className="w-full border border-border bg-offwhite px-4 py-3 text-navy outline-none transition-colors focus:border-orange text-sm"
                    style={{ borderRadius: 2 }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary mt-6 w-full cursor-pointer">
                <Send size={16} /> Send enquiry via WhatsApp
              </button>

              {sent && (
                <div className="mono-label mt-4 text-orange text-xs">◤ Opening WhatsApp — thank you.</div>
              )}
            </form>
          </div>

          {/* Location Map */}
          <div className="mt-12">
            <div className="tick-frame overflow-hidden border border-border bg-card">
              <iframe
                title="NG office location"
                src={COMPANY.mapEmbed}
                width="100%"
                height="420"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label, value, onChange, type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mono-label mb-2 block text-muted-foreground text-xs">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-offwhite px-4 py-3 text-navy outline-none transition-colors focus:border-orange text-sm rounded"
      />
    </div>
  );
}
