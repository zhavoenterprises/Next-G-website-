import React, { useState, useMemo } from "react";
import { 
  Calculator, FileText, Download, ShieldCheck, HelpCircle, HardHat, PhoneCall, Check, BarChart3, Info
} from "lucide-react";
import { COMPANY } from "@/lib/site-data";
import { Reveal } from "@/components/site/Reveal";

// Packages specs definitions
const PACKAGES = {
  standard: {
    name: "Standard Package",
    rate: 1800,
    desc: "Quality construction with basic specifications — ideal for budget-friendly residential projects.",
    cement: "Coromandel / Dalmia PPC Cement",
    steel: "Kamachi / ARS TMT Fe 500 Steel",
    bricks: "Local chamber-burnt red bricks",
    flooring: "Vitrified flooring tiles (Basic range, ₹50/sqft)",
    bathrooms: "Parryware fittings & sanitaryware",
    doors: "Basic solid wood main door, flush internal doors",
    wiring: "Kund Kund / Orbit wires with standard modular switches",
  },
  premium: {
    name: "Premium Package",
    rate: 2250,
    desc: "Premium quality construction with modern finishes and branded fittings — our most popular choice.",
    cement: "Ultratech / Ramco Supergrade PPC Cement",
    steel: "Tata Tiscon / JSW TMT Fe 550 Steel",
    bricks: "High-quality country clay bricks",
    flooring: "Double-charged vitrified tiles (Kajaria/Somany, ₹80/sqft)",
    bathrooms: "Jaquar fittings & premium sanitaryware",
    doors: "Teakwood main door frame & shutter, premium internal doors",
    wiring: "Finolex / Havells FR wires with Anchor Roma switches",
  },
  luxury: {
    name: "Luxury Package",
    rate: 2800,
    desc: "Top-tier premium materials, architectural finishes, customized modular fitouts, and luxury sanitaryware.",
    cement: "Ultratech Premium / Ramco Supergrade Cement",
    steel: "Tata Tiscon Fe 550D / Vizag Steel",
    bricks: "High-compressive wire-cut red bricks",
    flooring: "Italian Marble or high-end Glazed Vitrified Tiles (₹150/sqft)",
    bathrooms: "Kohler / Hindware Italian range bath fixtures",
    doors: "Teakwood main and internal door frames with teak shutters",
    wiring: "Havells / Polycab FRLS wires with Legrand/Schneider switches",
  }
} as const;

export default function CostCalculator() {
  const [area, setArea] = useState<number>(1500);
  const [floors, setFloors] = useState<number>(1);
  const [selectedPkg, setSelectedPkg] = useState<keyof typeof PACKAGES>("premium");

  // Calculate costs and quantities
  const estimate = useMemo(() => {
    const pkg = PACKAGES[selectedPkg];
    const totalArea = area * floors;
    const totalCost = totalArea * pkg.rate;

    // Cost distributions (in percentage & absolute values)
    const breakdown = {
      cement: { label: "Cement", pct: 13, val: totalCost * 0.13, qty: Math.round(totalArea * 0.4), unit: "bags" },
      steel: { label: "Steel", pct: 21, val: totalCost * 0.21, qty: parseFloat((totalArea * 3.8 / 1000).toFixed(2)), unit: "tons" },
      sand: { label: "Sand & Aggregates", pct: 12, val: totalCost * 0.12, qty: Math.round(totalArea * 1.8), unit: "cft" },
      bricks: { label: "Bricks", pct: 5, val: totalCost * 0.05, qty: Math.round(totalArea * 8.5), unit: "pcs" },
      finishing: { label: "Finishing & Fittings", pct: 24, val: totalCost * 0.24, qty: null, unit: "" },
      labor: { label: "Labor & Supervision", pct: 25, val: totalCost * 0.25, qty: null, unit: "" },
    };

    return {
      totalArea,
      totalCost,
      breakdown,
      pkg
    };
  }, [area, floors, selectedPkg]);

  // Export Proposal PDF
  const exportProposalPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to save your proposal PDF.");
      return;
    }

    const { totalArea, totalCost, breakdown, pkg } = estimate;

    printWindow.document.write(`
      <html>
        <head>
          <title>Construction Estimate - ${pkg.name}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
            .header { border-bottom: 3px solid #E8622C; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .logo-area { display: flex; align-items: center; gap: 15px; }
            .logo-square { background: #1B254B; color: #fff; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; border-radius: 4px; }
            .company-name { font-size: 20px; font-weight: 700; color: #1B254B; margin: 0; }
            .company-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #E8622C; margin: 0; }
            .meta-area { text-align: right; font-size: 13px; color: #666; }
            .meta-title { font-size: 24px; font-weight: 700; color: #1B254B; margin: 0 0 5px 0; }
            .spec-box { background: #f9f9f9; border: 1px solid #eee; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
            .spec-grid { display: grid; grid-cols-3; gap: 20px; margin-top: 15px; font-size: 14px; }
            .spec-card { border-left: 3px solid #E8622C; padding-left: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            th { background: #1B254B; color: #fff; padding: 12px 10px; font-weight: 600; text-align: left; }
            td { padding: 10px; border-bottom: 1px solid #ddd; }
            .total-row { font-size: 16px; font-weight: bold; background: #fff; }
            .total-label { color: #1B254B; border-top: 2px solid #1B254B; }
            .total-value { color: #E8622C; border-top: 2px solid #1B254B; text-align: right; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 50px; text-align: center; font-size: 11px; color: #888; }
            @media print {
              body { margin: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="text-align: right; margin-bottom: 20px;">
            <button onclick="window.print();" style="background: #E8622C; color: #fff; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 4px; cursor: pointer;">Print / Save PDF</button>
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
              <h2 class="meta-title">BUDGET ESTIMATE PROPOSAL</h2>
              <div>Date: ${new Date().toLocaleDateString("en-IN")}</div>
              <div>Rate Class: ₹${pkg.rate}/Sq.Ft</div>
            </div>
          </div>

          <div class="spec-box">
            <h3 style="margin: 0; color: #1B254B;">Project Details — ${pkg.name}</h3>
            <div style="display: flex; gap: 40px; margin-top: 15px; font-size: 14px;">
              <div><strong>Plot Built area:</strong> ${area} Sq.Ft</div>
              <div><strong>Floors:</strong> ${floors} (Ground + ${floors - 1})</div>
              <div><strong>Total Construction Area:</strong> ${totalArea} Sq.Ft</div>
            </div>
          </div>

          <h3 style="color: #1B254B; border-left: 3px solid #E8622C; padding-left: 8px;">Cost & Material Quantity Estimation</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align: center;">Distribution %</th>
                <th style="text-align: right;">Estimated Quantity</th>
                <th style="text-align: right;">Estimated Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Cement</strong> (${pkg.cement})</td>
                <td style="text-align: center;">${breakdown.cement.pct}%</td>
                <td style="text-align: right;">${breakdown.cement.qty.toLocaleString()} ${breakdown.cement.unit}</td>
                <td style="text-align: right;">₹${breakdown.cement.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr>
                <td><strong>Steel</strong> (${pkg.steel})</td>
                <td style="text-align: center;">${breakdown.steel.pct}%</td>
                <td style="text-align: right;">${breakdown.steel.qty.toLocaleString()} ${breakdown.steel.unit}</td>
                <td style="text-align: right;">₹${breakdown.steel.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr>
                <td><strong>Sand & Aggregates</strong></td>
                <td style="text-align: center;">${breakdown.sand.pct}%</td>
                <td style="text-align: right;">${breakdown.sand.qty.toLocaleString()} ${breakdown.sand.unit}</td>
                <td style="text-align: right;">₹${breakdown.sand.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr>
                <td><strong>Bricks</strong> (${pkg.bricks})</td>
                <td style="text-align: center;">${breakdown.bricks.pct}%</td>
                <td style="text-align: right;">${breakdown.bricks.qty.toLocaleString()} ${breakdown.bricks.unit}</td>
                <td style="text-align: right;">₹${breakdown.bricks.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr>
                <td><strong>Finishing & Fittings</strong> (Flooring: ${pkg.flooring}, Bath: ${pkg.bathrooms}, Electrical: ${pkg.wiring})</td>
                <td style="text-align: center;">${breakdown.finishing.pct}%</td>
                <td style="text-align: right;">—</td>
                <td style="text-align: right;">₹${breakdown.finishing.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr>
                <td><strong>Labor & Supervision</strong></td>
                <td style="text-align: center;">${breakdown.labor.pct}%</td>
                <td style="text-align: right;">—</td>
                <td style="text-align: right;">₹${breakdown.labor.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
              </tr>
              <tr class="total-row">
                <td colspan="2" style="border: none;"></td>
                <td class="total-label" style="padding-top: 15px;">ESTIMATED GRAND TOTAL</td>
                <td class="total-value" style="padding-top: 15px;">₹${totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 45px; display: flex; justify-content: space-between; font-size: 13px;">
            <div>
              <p style="font-weight: bold; color: #1B254B; margin-bottom: 50px;">Prepared By:</p>
              <p style="border-top: 1px solid #333; width: 180px; padding-top: 5px; text-align: center;">Next G Engineering Team</p>
            </div>
            <div>
              <p style="font-weight: bold; color: #1B254B; margin-bottom: 50px;">Client Acknowledgment:</p>
              <p style="border-top: 1px solid #333; width: 180px; padding-top: 5px; text-align: center;">Authorized Signature</p>
            </div>
          </div>

          <div class="footer">
            <p>${COMPANY.address} | Phone: +91 ${COMPANY.phone} | Email: ${COMPANY.email}</p>
            <p>Disclaimer: This cost calculation is based on typical regional building parameters and is valid as a budget reference. Final structural drawing specification pricing may vary.</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 350);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // WhatsApp Proposal Message Link
  const whatsappMsg = `Hi Next G Engineers, I used your Cost Estimator tool. Here is my project outline:\n- Plot Area: ${area} Sq.Ft\n- Floors: ${floors}\n- Selected Package: ${PACKAGES[selectedPkg].name}\n- Budget Estimate: ₹${estimate.totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}\nLet's connect to discuss my plans!`;
  const whatsappLink = `https://wa.me/${COMPANY.phoneIntl}?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <>
      {/* Hero Section */}
      <section className="bg-navy py-12 text-offwhite border-b border-white/10 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <Reveal>
            <span className="mono-label text-orange text-xs block mb-3">◤ Construction Cost Calculator</span>
            <h1 className="font-display text-3xl font-bold md:text-5xl leading-tight text-white max-w-3xl">
              Calculate Your Building Estimate Instantly
            </h1>
            <p className="mt-4 text-sm text-offwhite/75 font-mono max-w-xl">
              Select your specifications, calculate materials volume (cement, steel, bricks), and generate a proposal report instantly.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="bg-offwhite py-12 min-h-screen">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            
            {/* Inputs Panel (Left) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="tick-frame bg-card border border-border p-6 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-border pb-4 text-navy">
                  <Calculator size={18} className="text-orange" />
                  <span className="font-mono text-sm font-semibold uppercase">01 · Build Specifications</span>
                </div>

                {/* Built-up Area Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="mono-label text-xs text-navy font-bold">Built-up Area (Sq.Ft)</label>
                    <span className="font-mono text-xs text-orange font-bold">{area.toLocaleString()} Sq.Ft</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="10000"
                    step="50"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-orange"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono mt-1">
                    <span>500 sqft</span>
                    <span>5,000 sqft</span>
                    <span>10,000 sqft</span>
                  </div>
                </div>

                {/* Floors Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="mono-label text-xs text-navy font-bold">Number of Floors</label>
                    <span className="font-mono text-xs text-orange font-bold">
                      {floors === 1 ? "Ground Only" : `Ground + ${floors - 1} Floors`}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFloors(f)}
                        className={`flex-1 py-2 border font-mono text-xs transition-colors cursor-pointer rounded-sm ${
                          floors === f 
                            ? "border-orange bg-orange text-white" 
                            : "border-border bg-offwhite text-navy hover:bg-muted"
                        }`}
                      >
                        {f === 1 ? "G" : `G+${f - 1}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Construction Quality Packages */}
                <div>
                  <label className="mono-label text-xs text-navy font-bold block mb-3">Construction Package</label>
                  <div className="flex flex-col gap-3">
                    {(Object.keys(PACKAGES) as Array<keyof typeof PACKAGES>).map((key) => {
                      const p = PACKAGES[key];
                      const isSelected = selectedPkg === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedPkg(key)}
                          className={`w-full text-left p-4 border transition-all flex flex-col gap-1 cursor-pointer rounded ${
                            isSelected 
                              ? "border-orange bg-orange/5" 
                              : "border-border bg-offwhite hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-display font-bold text-sm text-navy">{p.name}</span>
                            <span className={`font-mono text-xs font-bold ${isSelected ? "text-orange" : "text-muted-foreground"}`}>
                              ₹{p.rate}/sqft
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed font-sans">{p.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Package Materials Specifications */}
              <div className="tick-frame bg-navy text-offwhite border border-white/10 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <ShieldCheck size={18} className="text-orange" />
                  <span className="font-mono text-xs font-semibold uppercase">Material Specifications</span>
                </div>
                <div className="flex flex-col gap-3 font-sans text-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="mono-label text-white/50 text-[10px]">Cement Brand</span>
                    <span className="font-semibold text-offwhite/90">{estimate.pkg.cement}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="mono-label text-white/50 text-[10px]">Reinforcement Steel</span>
                    <span className="font-semibold text-offwhite/90">{estimate.pkg.steel}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="mono-label text-white/50 text-[10px]">Brick Type</span>
                    <span className="font-semibold text-offwhite/90">{estimate.pkg.bricks}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="mono-label text-white/50 text-[10px]">Flooring Specs</span>
                    <span className="font-semibold text-offwhite/90">{estimate.pkg.flooring}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="mono-label text-white/50 text-[10px]">Bathroom Fixtures</span>
                    <span className="font-semibold text-offwhite/90">{estimate.pkg.bathrooms}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimates Results Panel (Right) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Grand Total Card */}
              <div className="tick-frame bg-card border border-border p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <span className="mono-label text-muted-foreground text-[10px] uppercase">Calculated Construction Cost</span>
                  <h2 className="text-3xl font-mono font-bold text-orange mt-1">
                    {estimate.totalCost.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    Based on {estimate.totalArea.toLocaleString()} Sq.Ft total construction area ({floors} floors)
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={exportProposalPDF}
                    className="flex-1 flex justify-center items-center gap-2 border border-border hover:border-orange hover:text-orange px-4 py-2.5 font-mono text-xs text-navy transition-colors cursor-pointer rounded"
                  >
                    <Download size={14} /> Export PDF
                  </button>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex justify-center items-center gap-2 bg-orange hover:bg-orange/95 text-white px-4 py-2.5 font-mono text-xs transition-colors cursor-pointer rounded"
                  >
                    <PhoneCall size={14} /> Send WhatsApp
                  </a>
                </div>
              </div>

              {/* Material Breakdown & Quantities Grid */}
              <div className="tick-frame bg-card border border-border p-6 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-border pb-4 text-navy">
                  <BarChart3 size={18} className="text-orange" />
                  <span className="font-mono text-sm font-semibold uppercase">02 · Material Breakdown & Estimates</span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  
                  {/* Cement Estimation */}
                  <div className="border border-border/80 bg-offwhite/50 p-4 rounded flex flex-col justify-between">
                    <div>
                      <span className="mono-label text-muted-foreground text-[10px]">CEMENT</span>
                      <div className="text-lg font-bold font-mono text-navy mt-1">
                        {estimate.breakdown.cement.qty.toLocaleString()} Bags
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Allocation (13%):</span>
                      <span className="font-mono font-semibold text-navy">
                        ₹{estimate.breakdown.cement.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Steel Estimation */}
                  <div className="border border-border/80 bg-offwhite/50 p-4 rounded flex flex-col justify-between">
                    <div>
                      <span className="mono-label text-muted-foreground text-[10px]">STEEL</span>
                      <div className="text-lg font-bold font-mono text-navy mt-1">
                        {estimate.breakdown.steel.qty.toLocaleString()} Tons
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Allocation (21%):</span>
                      <span className="font-mono font-semibold text-navy">
                        ₹{estimate.breakdown.steel.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Sand & Aggregate Estimation */}
                  <div className="border border-border/80 bg-offwhite/50 p-4 rounded flex flex-col justify-between">
                    <div>
                      <span className="mono-label text-muted-foreground text-[10px]">SAND & AGGREGATE</span>
                      <div className="text-lg font-bold font-mono text-navy mt-1">
                        {estimate.breakdown.sand.qty.toLocaleString()} CFT
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Allocation (12%):</span>
                      <span className="font-mono font-semibold text-navy">
                        ₹{estimate.breakdown.sand.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Bricks Estimation */}
                  <div className="border border-border/80 bg-offwhite/50 p-4 rounded flex flex-col justify-between">
                    <div>
                      <span className="mono-label text-muted-foreground text-[10px]">BRICKS</span>
                      <div className="text-lg font-bold font-mono text-navy mt-1">
                        {estimate.breakdown.bricks.qty.toLocaleString()} Pcs
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/50 flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Allocation (5%):</span>
                      <span className="font-mono font-semibold text-navy">
                        ₹{estimate.breakdown.bricks.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Secondary breakdown sliders/bars */}
                <div className="border-t border-border pt-6 flex flex-col gap-4">
                  <span className="mono-label text-navy text-xs font-bold block mb-2">Budget Distribution Chart</span>
                  <div className="flex flex-col gap-3 font-sans text-xs">
                    
                    {/* Labor allocation bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1 text-navy font-semibold">
                        <span>Labor & Masonry Supervision</span>
                        <span>25% · ₹{estimate.breakdown.labor.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                        <div className="bg-navy h-full rounded-full" style={{ width: "25%" }} />
                      </div>
                    </div>

                    {/* Finishing allocation bar */}
                    <div>
                      <div className="flex justify-between items-center mb-1 text-navy font-semibold">
                        <span>Finishing work (Tiling, Plumbing, Painting, Woodwork)</span>
                        <span>24% · ₹{estimate.breakdown.finishing.val.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                        <div className="bg-orange h-full rounded-full" style={{ width: "24%" }} />
                      </div>
                    </div>

                  </div>
                </div>

                <div className="bg-orange/5 border border-orange/15 p-4 rounded text-xs text-navy leading-relaxed flex gap-2.5 items-start font-sans">
                  <Info size={16} className="text-orange shrink-0 mt-0.5" />
                  <p>
                    * The above estimates show basic material volumetric weights required based on regular design constants. Actual quantity requirements may fluctuate depending on floor layout variations, local site soil parameters, and foundations specifications.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
