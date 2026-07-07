import { useState, useEffect } from "react";
import { PLOTS, COMPANY, whatsappLink } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { PlotSketch } from "@/components/site/PlotSketch";
import { 
  ArrowRight, Sliders, MapPin, Maximize2, MessageCircle, Layout, Layers, HardHat, FileText, Check, AlertCircle, Loader2, Phone, User
} from "lucide-react";

interface BOQLineItem {
  id?: number;
  item_name: string;
  unit: string;
  quantity: number;
  rate: number;
  amount?: number;
}

interface Project {
  id: number;
  category: "2D" | "3D" | "structure" | "BOQ";
  title: string;
  area?: string;
  planning_details?: string;
  description?: string;
  image_url?: string;
  other_info?: string;
  status: "open" | "assigned" | "completed" | "paid";
  line_items?: BOQLineItem[];
}

function formatINR(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function DesignStudio() {
  useEffect(() => {
    document.title = "Design Studio · Project Board & Customizer — NG";
  }, []);
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
  const [activeTab, setActiveTab] = useState<"2D" | "3D" | "structure" | "BOQ">("2D");
  const [portfolioProjects, setPortfolioProjects] = useState<Project[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Acceptance Form States
  const [acceptingProjectId, setAcceptingProjectId] = useState<number | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isSubmittingAccept, setIsSubmittingAccept] = useState(false);
  const [acceptError, setAcceptError] = useState("");
  const [acceptedProject, setAcceptedProject] = useState<Project | null>(null);

  // Load from API
  useEffect(() => {
    fetchActiveProjects();
  }, [activeTab]);

  const fetchActiveProjects = async () => {
    setIsLoadingList(true);
    setAcceptError("");
    try {
      if (activeTab === "BOQ") {
        const res = await fetch("/api/boq");
        const data = await res.json();
        if (Array.isArray(data)) {
          const list = data.map((p: any) => ({ ...p, category: "BOQ" as const }));
          setPortfolioProjects(list);
        } else {
          console.error("API returned non-array for BOQ:", data);
          setPortfolioProjects([]);
          if (data && typeof data === "object" && data.error) {
            setAcceptError(data.error);
          }
        }
      } else {
        const res = await fetch(`/api/projects?category=${activeTab}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPortfolioProjects(data);
        } else {
          console.error("API returned non-array for projects:", data);
          setPortfolioProjects([]);
          if (data && typeof data === "object" && data.error) {
            setAcceptError(data.error);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch drawings list", e);
      setAcceptError("Failed to fetch drawings. Please check D1 database connection.");
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleAcceptSubmit = async (e: React.FormEvent, proj: Project) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      setAcceptError("Name and Phone number are required.");
      return;
    }

    setIsSubmittingAccept(true);
    setAcceptError("");

    try {
      const isBoq = proj.category === "BOQ";
      const queryParam = isBoq ? "?type=boq" : "";
      
      const res = await fetch(`/api/projects/${proj.id}/accept${queryParam}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: clientName, phone: clientPhone }),
      });

      if (res.ok) {
        setAcceptedProject(proj);
        // Refresh list
        fetchActiveProjects();
      } else if (res.status === 409) {
        setAcceptError("Someone already accepted this project! The list has been refreshed.");
        // Refresh list immediately
        fetchActiveProjects();
      } else {
        const data = await res.json() as { error?: string };
        setAcceptError(data.error ?? "Failed to accept this drawing. Please try again.");
      }
    } catch (err) {
      setAcceptError("Connection error. Please check your network.");
    } finally {
      setIsSubmittingAccept(false);
    }
  };

  const startAcceptance = (id: number) => {
    setAcceptingProjectId(id);
    setClientName("");
    setClientPhone("");
    setAcceptError("");
    setAcceptedProject(null);
  };

  const cancelAcceptance = () => {
    setAcceptingProjectId(null);
    setClientName("");
    setClientPhone("");
    setAcceptError("");
    setAcceptedProject(null);
  };

  const calculateBOQTotal = (items: BOQLineItem[] = []) => {
    return items.reduce((sum, item) => sum + ((item.quantity ?? 0) * (item.rate ?? 0)), 0);
  };

  return (
    <>
      <PageHeader
        eyebrow="Design Studio"
        title={<>Bring your plot to a <span className="text-orange">finished design.</span></>}
        intro="Browse our available land plots, explore live drawings on our project board, or input custom dimensions to commission a custom plan directly with our engineering team."
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

      {/* PORTFOLIO DRAWINGS BROWSER (PUBLIC BOARD) */}
      <section className="bg-offwhite border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="mono-label mb-6 flex items-center gap-3 text-orange">
            <span className="h-px w-10 bg-orange" />
            <span>02 · Live Project Board & Drawing Sheets (Open Portfolios)</span>
          </div>

          <div className="flex border-b border-border bg-card p-2 rounded gap-2 mb-8">
            {[
              { id: "2D", label: "2D Plans", Icon: Layout },
              { id: "3D", label: "3D Views", Icon: Layers },
              { id: "structure", label: "Structure Plans", Icon: HardHat },
              { id: "BOQ", label: "BOQ Estimates", Icon: FileText },
            ].map((t) => {
              const TabIcon = t.Icon;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    cancelAcceptance();
                    setActiveTab(t.id as any);
                  }}
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

          {isLoadingList ? (
            <div className="flex justify-center items-center py-20 gap-3 bg-card border border-border rounded">
              <Loader2 className="animate-spin text-orange h-6 w-6" />
              <span className="mono-label text-navy text-xs">Querying project board...</span>
            </div>
          ) : portfolioProjects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm font-mono bg-card border border-border rounded flex flex-col items-center justify-center p-6">
              {acceptError ? (
                <div className="flex flex-col items-center justify-center max-w-md mx-auto p-5 border border-red-200 bg-red-50 text-red-700 rounded gap-2 font-sans">
                  <AlertCircle className="h-8 w-8 text-red-600 shrink-0" />
                  <span className="font-bold text-sm">Database Binding Required</span>
                  <p className="text-xs text-red-600 font-normal leading-relaxed">{acceptError}</p>
                </div>
              ) : (
                <span>◤ All projects in this category are currently assigned. Check back later!</span>
              )}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {portfolioProjects.map((proj, i) => {
                const isAccepting = acceptingProjectId === proj.id;
                const isAcceptedSuccess = acceptedProject?.id === proj.id;

                const whatsappMsg = `Hi Next G, I have accepted the drawing project "${proj.title}" (${proj.category}) on your Project Board. My name is ${clientName} and phone is ${clientPhone}. Let's discuss next steps.`;

                return (
                  <Reveal key={proj.id} delay={i * 80}>
                    <div className="tick-frame hover-lift flex h-full flex-col border border-border bg-card">
                      {proj.image_url && (
                        <div className="aspect-[16/10] overflow-hidden bg-navy border-b border-border relative">
                          <img
                            src={proj.image_url}
                            alt={proj.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex flex-1 flex-col p-6 justify-between">
                        <div>
                          <div className="mono-label text-orange text-xs flex justify-between items-center">
                            <span>◤ {proj.category} drawing sheet</span>
                            <span className="px-2 py-0.5 border border-green-600 text-green-600 text-[9px] font-bold uppercase rounded-sm bg-green-50">Open</span>
                          </div>
                          
                          <h3 className="mt-2 font-display text-lg font-bold text-navy leading-tight">{proj.title}</h3>

                          {proj.category !== "BOQ" ? (
                            <dl className="mt-4 grid grid-cols-2 gap-4 border-y border-border py-3 my-4">
                              <div>
                                <dt className="mono-label text-muted-foreground text-[10px]">Area</dt>
                                <dd className="font-mono text-sm font-semibold text-navy">{proj.area || "—"}</dd>
                              </div>
                              <div>
                                <dt className="mono-label text-muted-foreground text-[10px]">Planning</dt>
                                <dd className="text-xs font-semibold text-navy leading-tight">{proj.planning_details || "—"}</dd>
                              </div>
                            </dl>
                          ) : (
                            <div className="mt-4 border-y border-border py-3 my-4">
                              <span className="mono-label text-muted-foreground text-[10px] block mb-2">BOQ Line Items Breakdown</span>
                              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                {(proj.line_items ?? []).map((li, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs border-b border-border/40 pb-1 last:border-b-0">
                                    <span className="text-navy">{li.item_name} <span className="text-[10px] text-muted-foreground font-mono">({li.quantity} {li.unit})</span></span>
                                    <span className="font-mono font-semibold text-navy">{(li.quantity * li.rate).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center font-mono text-xs mt-3 pt-2 border-t border-dashed border-border text-navy font-bold">
                                <span>TOTAL ESTIMATE</span>
                                <span className="text-orange">{calculateBOQTotal(proj.line_items).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}</span>
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">{proj.description}</p>
                          {proj.other_info && (
                            <div className="text-[10px] text-orange font-mono mb-4">
                              * Note: {proj.other_info}
                            </div>
                          )}
                        </div>

                        {/* Acceptance Flow Actions */}
                        <div className="mt-6 pt-4 border-t border-border/60">
                          {isAcceptedSuccess ? (
                            <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
                              <div className="flex justify-center text-green-600 mb-2">
                                <Check className="h-6 w-6 bg-green-100 rounded-full p-1" />
                              </div>
                              <h4 className="text-xs font-bold text-green-800">Drawing Successfully Accepted!</h4>
                              <p className="text-[10px] text-green-700 mt-1">Connect with Next G Studio on WhatsApp to finalize contract details.</p>
                              
                              <a
                                href={whatsappLink(whatsappMsg)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary w-full justify-center flex items-center gap-2 cursor-pointer text-xs mt-3 bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
                              >
                                <MessageCircle size={12} /> Contact via WhatsApp
                              </a>
                            </div>
                          ) : isAccepting ? (
                            <form onSubmit={(e) => handleAcceptSubmit(e, proj)} className="space-y-3 bg-offwhite/50 p-4 border border-border rounded">
                              <div className="mono-label text-[9px] text-orange flex justify-between items-center">
                                <span>◤ Confirm Acceptance</span>
                                <button type="button" onClick={cancelAcceptance} className="text-navy hover:text-orange underline font-bold cursor-pointer">Cancel</button>
                              </div>
                              
                              <div>
                                <div className="relative">
                                  <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                  <input
                                    type="text"
                                    required
                                    placeholder="Enter your name"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    className="w-full border border-border bg-card pl-7 pr-3 py-1.5 text-navy text-xs outline-none focus:border-orange rounded"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <div className="relative">
                                  <Phone size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                  <input
                                    type="tel"
                                    required
                                    placeholder="Enter phone number"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    className="w-full border border-border bg-card pl-7 pr-3 py-1.5 text-navy text-xs outline-none focus:border-orange rounded"
                                  />
                                </div>
                              </div>

                              {acceptError && (
                                <div className="flex items-start gap-1 text-[10px] text-red-600 bg-red-50 p-2 border border-red-200 rounded leading-snug">
                                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                  <span>{acceptError}</span>
                                </div>
                              )}

                              <button
                                type="submit"
                                disabled={isSubmittingAccept}
                                className="btn-primary w-full justify-center flex items-center gap-1.5 cursor-pointer text-xs"
                              >
                                {isSubmittingAccept ? (
                                  <>
                                    <Loader2 size={12} className="animate-spin text-orange" /> Submitting...
                                  </>
                                ) : (
                                  <>Confirm Drawing</>
                                )}
                              </button>
                            </form>
                          ) : (
                            <button
                              onClick={() => startAcceptance(proj.id)}
                              className="btn-primary w-full justify-center flex items-center gap-2 cursor-pointer text-xs"
                            >
                              Accept & Reserve Drawing <ArrowRight size={12} />
                            </button>
                          )}
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
