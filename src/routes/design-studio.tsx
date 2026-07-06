import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PLOTS, whatsappLink } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { PlotSketch } from "@/components/site/PlotSketch";
import { 
  ArrowRight, Sliders, MapPin, Maximize2, MessageCircle, Layout, Layers, HardHat, FileText 
} from "lucide-react";

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

interface Project {
  id: string;
  category: "2D" | "3D" | "Structure" | "BOQ";
  title: string;
  area: string;
  planningDetails: string;
  description: string;
  imageUrl?: string;
  otherInfo?: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: "p1",
    category: "2D",
    title: "1000 Square Meter Modern House Plan",
    area: "1000 Sq. Meters",
    planningDetails: "3 BHK, Double Floor, Modern Elevation",
    description: "Detailed 2D floor plan layout containing dimensional bedroom details, kitchen positioning, and car parking space.",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600",
    otherInfo: "Best suited for East facing layouts. Vaastu compliant.",
  },
  {
    id: "p2",
    category: "2D",
    title: "1200 Sq. Ft. Independent Villa Layout",
    area: "1200 Sq. Feet",
    planningDetails: "2 BHK, Single Floor, Vaastu Compliant",
    description: "East facing villa layout with spacious hall, open kitchen, and private portico.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600",
    otherInfo: "Includes compound wall layouts.",
  },
  {
    id: "p3",
    category: "3D",
    title: "Contemporary Villa 3D Exterior",
    area: "2400 Sq. Feet",
    planningDetails: "Modern Architecture, Wood & Stone finishes",
    description: "Photorealistic 3D rendering of the building exterior with night lighting simulation and landscaping plan.",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600",
    otherInfo: "Simulated using real materials.",
  },
  {
    id: "p4",
    category: "Structure",
    title: "Residential G+2 Reinforcement Detail",
    area: "3000 Sq. Feet",
    planningDetails: "Column & Beams framing, Foundation details",
    description: "Structural engineering blueprint detailing reinforcement steel bar size specs, spacing, and concrete mix design.",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600",
    otherInfo: "Designed for earthquake zone II.",
  },
  {
    id: "p5",
    category: "BOQ",
    title: "Budget Estimate for 1500 Sq. Ft. House",
    area: "1500 Sq. Feet",
    planningDetails: "Premium Finish, Materials breakdown",
    description: "Detailed Bill of Quantities showing cement, steel, bricks, flooring, sand, and plumbing cost estimates.",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600",
    otherInfo: "Based on local Madurai material rates.",
  },
];

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function DesignStudio() {
  // Custom plot states
  const [length, setLength] = useState(40);
  const [breadth, setBreadth] = useState(30);
  const [location, setLocation] = useState("");

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

  const customMsg = `Hi NG, I'd like to commission a custom design for my plot. Dimensions: ${length}ft x ${breadth}ft (${sqft} sqft). Estimated fee: ${formatINR(designFee)}.${location ? " Location: " + location + "." : ""}`;

  // Portfolio states
  const [activeTab, setActiveTab] = useState<"2D" | "3D" | "Structure" | "BOQ">("2D");
  const [portfolioProjects, setPortfolioProjects] = useState<Project[]>([]);

  // Load from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem("ng_design_projects");
    if (saved) {
      try {
        setPortfolioProjects(JSON.parse(saved));
      } catch (e) {
        setPortfolioProjects(DEFAULT_PROJECTS);
      }
    } else {
      setPortfolioProjects(DEFAULT_PROJECTS);
      localStorage.setItem("ng_design_projects", JSON.stringify(DEFAULT_PROJECTS));
    }
  }, []);

  const activeProjects = portfolioProjects.filter((p) => p.category === activeTab);

  return (
    <>
      <PageHeader
        eyebrow="Design Studio"
        title={<>Bring your plot to a <span className="text-orange">finished design.</span></>}
        intro="Browse our available land plots or input your own dimensions to commission a custom architectural design directly with our engineering team — at a fixed, transparent cost. No agents, no back-and-forth."
      />

      {/* INTERACTIVE CUSTOMIZER SECTION */}
      <section className="bg-offwhite border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
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
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
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
                  className="btn-primary w-full sm:w-auto"
                >
                  Commission Custom Design <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORTFOLIO DRAWINGS BROWSER */}
      <section className="bg-offwhite border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3 text-orange">
            <span className="h-px w-10 bg-orange" />
            <span>02 · Browse Design Portfolios & Drawing Sheets</span>
          </div>

          <div className="flex border-b border-border bg-card p-2 rounded gap-2 mb-8">
            {[
              { id: "2D", label: "2D Plans", Icon: Layout },
              { id: "3D", label: "3D Views", Icon: Layers },
              { id: "Structure", label: "Structure", Icon: HardHat },
              { id: "BOQ", label: "BOQ Estimates", Icon: FileText },
            ].map((t) => {
              const TabIcon = t.Icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 flex justify-center items-center gap-2 py-3 text-xs md:text-sm font-mono border cursor-pointer transition-all ${
                    activeTab === t.id
                      ? "border-orange bg-orange text-white"
                      : "border-transparent bg-transparent text-navy hover:bg-muted"
                  }`}
                  style={{ borderRadius: 2 }}
                >
                  <TabIcon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {activeProjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm font-mono bg-card border border-border rounded">
              ◤ No projects posted in this section yet.
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {activeProjects.map((proj, i) => {
                const queryText = `Hi Next G, I'm interested in the ${proj.category} Project: "${proj.title}" (Area: ${proj.area}). Can we discuss this design?`;
                return (
                  <Reveal key={proj.id} delay={i * 80}>
                    <div className="tick-frame hover-lift flex h-full flex-col border border-border bg-card">
                      {proj.imageUrl && (
                        <div className="aspect-[16/10] overflow-hidden bg-navy border-b border-border relative">
                          <img
                            src={proj.imageUrl}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-6 justify-between">
                        <div>
                          <div className="mono-label text-orange text-xs">◤ {proj.category} drawing sheet</div>
                          <h3 className="mt-2 font-display text-lg font-bold text-navy leading-tight">{proj.title}</h3>

                          <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-border py-3 my-4">
                            <div>
                              <dt className="mono-label text-muted-foreground text-[10px]">Area</dt>
                              <dd className="font-mono text-sm font-semibold text-navy">{proj.area}</dd>
                            </div>
                            <div>
                              <dt className="mono-label text-muted-foreground text-[10px]">Planning</dt>
                              <dd className="text-xs font-semibold text-navy leading-tight">{proj.planningDetails}</dd>
                            </div>
                          </dl>

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{proj.description}</p>
                          {proj.otherInfo && (
                            <div className="mt-3 text-[10px] text-orange font-mono">
                              * {proj.otherInfo}
                            </div>
                          )}
                        </div>

                        <div className="mt-6">
                          <a
                            href={whatsappLink(queryText)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary w-full justify-center flex items-center gap-2 cursor-pointer text-sm"
                          >
                            <MessageCircle size={14} /> Enquire on WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* EXISTING PRE-DEFINED LAND PLOTS */}
      <section className="bg-offwhite bp-grid">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mono-label mb-8 flex items-center gap-3 text-orange">
            <span className="h-px w-10 bg-orange" />
            <span>03 · Browse Sample / Available Land Plots</span>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {PLOTS.map((plot, i) => {
              const plotSqft = plot.lengthFt * plot.breadthFt;
              const msg = `Hi, I want to make a design for this land — ${plot.location}, ${plot.lengthFt}ft x ${plot.breadthFt}ft (${plotSqft} sqft). Shall we discuss?`;
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
                          <dd className="font-mono text-lg font-semibold text-navy">{plotSqft.toLocaleString("en-IN")}<span className="text-xs text-muted-foreground"> sqft</span></dd>
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
