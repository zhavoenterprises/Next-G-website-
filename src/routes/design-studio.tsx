import { useState, useEffect, useMemo } from "react";
import { PLOTS, COMPANY, whatsappLink } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { PlotSketch } from "@/components/site/PlotSketch";
import { 
  ArrowRight, Sliders, MapPin, Maximize2, MessageCircle, Layout, Layers, HardHat, FileText, Check, AlertCircle, Loader2, Phone, User,
  Search, Download, ZoomIn, ZoomOut, RotateCcw, X
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

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState<"all" | "small" | "medium" | "large">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "assigned">("all");

  // Lightbox States
  const [selectedLightboxProject, setSelectedLightboxProject] = useState<Project | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // Filtered Projects computation
  const filteredProjects = useMemo(() => {
    return portfolioProjects.filter((proj) => {
      // 1. Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = proj.title?.toLowerCase().includes(query);
        const matchesDesc = proj.description?.toLowerCase().includes(query);
        const matchesArea = proj.area?.toLowerCase().includes(query);
        const matchesPlanning = proj.planning_details?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesArea && !matchesPlanning) {
          return false;
        }
      }

      // 2. Area Filter (Small < 1000, Medium 1000-2000, Large > 2000)
      if (areaFilter !== "all" && proj.category !== "BOQ") {
        const areaStr = proj.area || "";
        const matchNum = areaStr.match(/\d+/g);
        if (matchNum) {
          let value = parseInt(matchNum[0], 10);
          if (areaStr.toLowerCase().includes("meter") || areaStr.toLowerCase().includes("sqm") || areaStr.toLowerCase().includes("sq.m")) {
            value = Math.round(value * 10.76); // convert sq.m to sq.ft
          }
          if (areaFilter === "small" && value >= 1000) return false;
          if (areaFilter === "medium" && (value < 1000 || value > 2000)) return false;
          if (areaFilter === "large" && value <= 2000) return false;
        }
      }

      // 3. Status Filter
      if (statusFilter !== "all") {
        if (statusFilter === "open" && proj.status !== "open") return false;
        if (statusFilter === "assigned" && proj.status === "open") return false;
      }

      return true;
    });
  }, [portfolioProjects, searchQuery, areaFilter, statusFilter]);

  // PDF print handler
  const printBOQEstimate = (proj: Project) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the estimate.");
      return;
    }

    const items = proj.line_items ?? [];
    const total = items.reduce((sum, item) => sum + ((item.quantity ?? 0) * (item.rate ?? 0)), 0);

    const rowsHtml = items.map((item, idx) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.item_name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.unit}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.quantity.toLocaleString("en-IN")}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.rate.toLocaleString("en-IN")}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹${(item.quantity * item.rate).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>BOQ Estimate - ${proj.title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
            .header { border-bottom: 3px solid #E8622C; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo-area { display: flex; align-items: center; gap: 15px; }
            .logo-square { background: #1B254B; color: #fff; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; border-radius: 4px; }
            .company-name { font-size: 20px; font-weight: 700; color: #1B254B; margin: 0; }
            .company-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #E8622C; margin: 0; }
            .meta-area { text-align: right; font-size: 13px; color: #666; }
            .meta-title { font-size: 24px; font-weight: 700; color: #1B254B; margin: 0 0 5px 0; }
            .project-details { background: #f9f9f9; border: 1px solid #eee; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
            .project-title { font-size: 18px; font-weight: bold; color: #1B254B; margin: 0 0 10px 0; }
            .project-desc { font-size: 13px; color: #555; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th { background: #1B254B; color: #fff; padding: 12px 10px; font-weight: 600; text-align: left; }
            .total-row { font-size: 15px; background: #fff; }
            .total-label { font-weight: 700; color: #1B254B; font-size: 16px; border-top: 2px solid #1B254B; }
            .total-value { font-weight: 700; color: #E8622C; font-size: 18px; border-top: 2px solid #1B254B; text-align: right; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 50px; text-align: center; font-size: 11px; color: #888; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print();" style="background: #E8622C; color: #fff; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Print / Save PDF</button>
          </div>
          
          <div class="header">
            <div class="logo-area">
              <div class="logo-square">NG</div>
              <div>
                <h1 class="company-name">${COMPANY.name}</h1>
                <p class="company-sub">Engineering & Construction Promoters</p>
              </div>
            </div>
            <div class="meta-area">
              <h2 class="meta-title">ESTIMATE SHEET</h2>
              <div>Date: ${new Date().toLocaleDateString("en-IN")}</div>
              <div>Ref: NG/EST/${proj.id}/${new Date().getFullYear()}</div>
            </div>
          </div>

          <div class="project-details">
            <h3 class="project-title">${proj.title}</h3>
            <p class="project-desc">${proj.description || "No description provided."}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 60px; text-align: center;">S.No</th>
                <th>Item Specification</th>
                <th style="width: 80px; text-align: center;">Unit</th>
                <th style="width: 100px; text-align: right;">Quantity</th>
                <th style="width: 100px; text-align: right;">Rate</th>
                <th style="width: 120px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="4" style="border: none;"></td>
                <td class="total-label" style="padding: 15px 10px;">GRAND TOTAL</td>
                <td class="total-value" style="padding: 15px 10px;">₹${total.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px;">
            <div>
              <p style="font-weight: bold; color: #1B254B; margin-bottom: 50px;">Prepared By:</p>
              <p style="border-top: 1px solid #333; width: 180px; padding-top: 5px; text-align: center;">Next G Engineering Team</p>
            </div>
            <div style="text-align: right;">
              <p style="font-weight: bold; color: #1B254B; margin-bottom: 50px;">Approved By:</p>
              <p style="border-top: 1px solid #333; width: 180px; padding-top: 5px; text-align: center; display: inline-block;">Authorized Signatory</p>
            </div>
          </div>

          <div class="footer">
            <p>${COMPANY.address} | Phone: +91 ${COMPANY.phone} | Email: ${COMPANY.email}</p>
            <p>This is a computer-generated estimate sheet. Valid for 30 days from date of generation.</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
                    setSearchQuery("");
                    setAreaFilter("all");
                    setStatusFilter("all");
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

          {/* SEARCH & FILTERS PANEL */}
          <div className="grid gap-4 md:grid-cols-3 bg-card border border-border p-4 rounded mb-8">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search by title, area, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-border bg-offwhite pl-9 pr-4 py-2 text-sm text-navy outline-none transition-colors focus:border-orange rounded"
              />
            </div>

            {/* Area Size Filter (only show if not BOQ tab) */}
            {activeTab !== "BOQ" ? (
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value as any)}
                className="border border-border bg-offwhite px-3 py-2 text-sm text-navy outline-none transition-colors focus:border-orange rounded cursor-pointer"
              >
                <option value="all">All Area Sizes</option>
                <option value="small">Small (&lt; 1,000 Sq.Ft)</option>
                <option value="medium">Medium (1,000 - 2,000 Sq.Ft)</option>
                <option value="large">Large (&gt; 2,000 Sq.Ft)</option>
              </select>
            ) : (
              <div className="text-xs text-muted-foreground/60 flex items-center px-3 border border-dashed border-border bg-offwhite/50 rounded font-mono">
                ◤ Area filter disabled for BOQ
              </div>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-border bg-offwhite px-3 py-2 text-sm text-navy outline-none transition-colors focus:border-orange rounded cursor-pointer"
            >
              <option value="all">All Statuses (Available & Taken)</option>
              <option value="open">Available Only</option>
              <option value="assigned">Assigned / In Progress</option>
            </select>
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
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm font-mono bg-card border border-border rounded flex flex-col items-center justify-center p-6">
              <AlertCircle className="h-8 w-8 text-orange mb-2" />
              <span>◤ No drawings match your search query or filters.</span>
              <button 
                onClick={() => { setSearchQuery(""); setAreaFilter("all"); setStatusFilter("all"); }}
                className="mt-4 text-xs text-orange border border-orange px-3 py-1.5 hover:bg-orange hover:text-white transition-colors rounded cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((proj, i) => {
                const isAccepting = acceptingProjectId === proj.id;
                const isAcceptedSuccess = acceptedProject?.id === proj.id;

                const whatsappMsg = `Hi Next G, I have accepted the drawing project "${proj.title}" (${proj.category}) on your Project Board. My name is ${clientName} and phone is ${clientPhone}. Let's discuss next steps.`;

                return (
                  <Reveal key={proj.id} delay={i * 80}>
                    <div id={`project-card-${proj.id}`} className="tick-frame hover-lift flex h-full flex-col border border-border bg-card">
                      {proj.image_url && (
                        <button
                          onClick={() => {
                            setSelectedLightboxProject(proj);
                            setZoomScale(1);
                          }}
                          className="aspect-[16/10] overflow-hidden bg-navy border-b border-border relative group w-full text-left cursor-zoom-in block outline-none"
                        >
                          <img
                            src={proj.image_url}
                            alt={proj.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-mono">
                            <Maximize2 size={14} />
                            <span>View Fullscreen</span>
                          </div>
                        </button>
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
                              <div className="mt-3 flex justify-end">
                                <button
                                  onClick={() => printBOQEstimate(proj)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 border border-orange/40 text-orange hover:bg-orange hover:text-white transition-colors text-[10px] font-mono rounded cursor-pointer outline-none"
                                >
                                  <Download size={10} />
                                  <span>Export Estimate PDF</span>
                                </button>
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

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {selectedLightboxProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8">
          <div className="absolute inset-0 cursor-zoom-out" onClick={() => setSelectedLightboxProject(null)} />
          
          <div className="relative z-10 w-full max-w-6xl bg-navy/90 border border-white/10 rounded overflow-hidden flex flex-col md:grid md:grid-cols-[1fr_350px] md:h-[80vh] shadow-2xl">
            {/* Image Viewer Pane */}
            <div className="relative bg-black flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden min-h-[300px] flex-1">
              <img
                src={selectedLightboxProject.image_url}
                alt={selectedLightboxProject.title}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomScale})` }}
              />
              
              {/* Zoom Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-navy/80 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                <button
                  onClick={() => setZoomScale(s => Math.max(0.5, s - 0.25))}
                  className="p-1 hover:text-orange text-offwhite transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-mono min-w-12 text-center text-offwhite/85">{Math.round(zoomScale * 100)}%</span>
                <button
                  onClick={() => setZoomScale(s => Math.min(3, s + 0.25))}
                  className="p-1 hover:text-orange text-offwhite transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoomScale(1)}
                  className="p-1 hover:text-orange text-offwhite/60 transition-colors border-l border-white/15 pl-2 ml-1 cursor-pointer"
                  title="Reset Zoom"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Sidebar Details Panel */}
            <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-navy text-offwhite">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <span className="mono-label text-orange text-xs">◤ {selectedLightboxProject.category} Drawing Sheet</span>
                  <button
                    onClick={() => setSelectedLightboxProject(null)}
                    className="text-offwhite/60 hover:text-white transition-colors p-1 border border-white/10 rounded cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <h3 className="mt-4 font-display text-xl md:text-2xl font-bold leading-tight">{selectedLightboxProject.title}</h3>
                
                <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-white/10 py-4 my-6 font-sans">
                  <div>
                    <dt className="mono-label text-offwhite/50 text-[10px]">Area</dt>
                    <dd className="font-mono text-sm font-semibold mt-0.5">{selectedLightboxProject.area || "—"}</dd>
                  </div>
                  <div>
                    <dt className="mono-label text-offwhite/50 text-[10px]">Planning Details</dt>
                    <dd className="text-xs font-semibold mt-0.5 leading-snug">{selectedLightboxProject.planning_details || "—"}</dd>
                  </div>
                </dl>

                <div>
                  <h4 className="mono-label text-offwhite/50 text-[10px] uppercase">Drawing Description</h4>
                  <p className="text-xs text-offwhite/80 leading-relaxed mt-2 font-sans">{selectedLightboxProject.description}</p>
                </div>

                {selectedLightboxProject.other_info && (
                  <div className="mt-6 p-3 bg-orange/10 border border-orange/20 rounded text-xs text-orange font-mono">
                    * Note: {selectedLightboxProject.other_info}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3 font-sans">
                <div className="flex justify-between items-center text-xs text-offwhite/60">
                  <span>Drawing Status:</span>
                  <span className={`px-2 py-0.5 border rounded-sm text-[9px] font-bold uppercase ${
                    selectedLightboxProject.status === "open"
                      ? "border-green-500 text-green-400 bg-green-500/10"
                      : "border-amber-500 text-amber-400 bg-amber-500/10"
                  }`}>{selectedLightboxProject.status}</span>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedLightboxProject(null);
                    const cardElement = document.getElementById(`project-card-${selectedLightboxProject.id}`);
                    if (cardElement) {
                      cardElement.scrollIntoView({ behavior: "smooth", block: "center" });
                      setTimeout(() => {
                        const acceptBtn = cardElement.querySelector(".btn-accept-trigger") as HTMLButtonElement;
                        if (acceptBtn) acceptBtn.click();
                      }, 400);
                    }
                  }}
                  className="btn-primary w-full justify-center"
                >
                  Configure / Accept drawing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
