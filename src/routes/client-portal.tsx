import React, { useState, useEffect } from "react";
import { 
  User, Phone, FileText, Download, Loader2, LogOut, ArrowRight, ShieldCheck, CheckCircle2, Clock, AlertTriangle, HelpCircle
} from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

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
  accepted_by_name?: string;
  accepted_by_phone?: string;
  accepted_at?: string;
  line_items?: BOQLineItem[];
  source_file_url?: string;
  progress_percent?: number;
  progress_notes?: string;
}

export default function ClientPortal() {
  const [phone, setPhone] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [clientPhone, setClientPhone] = useState<string | null>(null);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Check for saved session
  useEffect(() => {
    const savedPhone = localStorage.getItem("ng_client_phone");
    if (savedPhone) {
      setClientPhone(savedPhone);
      fetchClientProjects(savedPhone);
    }
  }, []);

  const fetchClientProjects = async (phoneNumber: string) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/client/projects?phone=${encodeURIComponent(phoneNumber)}`);
      if (!res.ok) {
        throw new Error("Failed to load projects. Please try again.");
      }
      const data = await res.json() as { standard: Project[]; boq: Project[] };
      const mergedList = [...(data.standard ?? []), ...(data.boq ?? [])];
      
      setProjects(mergedList);
      if (mergedList.length > 0) {
        setSelectedProject(mergedList[0]);
      } else {
        setErrorMsg("No active projects found associated with this phone number. Have you accepted a project drawing sheet on our Design Studio page?");
      }
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsLoggingIn(true);
    setErrorMsg("");
    
    // Simple verification - load projects
    try {
      const res = await fetch(`/api/client/projects?phone=${encodeURIComponent(phone)}`);
      if (!res.ok) {
        throw new Error("Unable to fetch data. Please try again.");
      }
      const data = await res.json() as { standard: Project[]; boq: Project[] };
      const mergedList = [...(data.standard ?? []), ...(data.boq ?? [])];

      if (mergedList.length === 0) {
        setErrorMsg("No active projects found. Ensure the phone number matches the one you entered when accepting a drawing sheet.");
        setIsLoggingIn(false);
        return;
      }

      localStorage.setItem("ng_client_phone", phone);
      setClientPhone(phone);
      setProjects(mergedList);
      setSelectedProject(mergedList[0]);
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ng_client_phone");
    setClientPhone(null);
    setProjects([]);
    setSelectedProject(null);
    setPhone("");
    setErrorMsg("");
  };

  // Get active milestones based on progress percent
  const getMilestones = (p: Project) => {
    const pct = p.progress_percent ?? 0;
    const isCompleted = p.status === "completed" || p.status === "paid";
    
    return [
      { id: 1, label: "Planning & CAD Drafting", desc: "Drawing specifications and layouts design", active: true, completed: pct >= 20 || isCompleted },
      { id: 2, label: "Foundation & Excavation", desc: "Soil leveling, excavation, and foundation concrete pouring", active: pct >= 20, completed: pct >= 50 || isCompleted },
      { id: 3, label: "Structure & Brickwork", desc: "Pillar casting, brickwork masonry, and roof slab laying", active: pct >= 50, completed: pct >= 80 || isCompleted },
      { id: 4, label: "Plastering & Finishes", desc: "Plastering walls, tiling, electrical wiring, and basic plumbing setup", active: pct >= 80, completed: pct === 100 || isCompleted },
      { id: 5, label: "Final Project Handover", desc: "Visual inspection and drawing blueprints handover", active: pct === 100 || isCompleted, completed: isCompleted },
    ];
  };

  // Login page layout
  if (!clientPhone) {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <span className="grid h-12 w-12 place-items-center bg-navy text-offwhite rounded">
              <span className="font-display text-xl font-bold leading-none">NG</span>
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-navy">
            Next G Client Portal
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground font-mono">
            ◤ Enter your phone number to track your project progress
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 border border-border sm:rounded-lg sm:px-10 shadow-sm">
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label className="mono-label block text-xs text-navy font-semibold mb-2">Registered Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number (e.g. 9876543210)"
                    className="w-full border border-border bg-offwhite pl-9 pr-4 py-2 text-navy text-sm outline-none transition-colors focus:border-orange rounded"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded flex gap-2 items-start font-sans">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                  <p>{errorMsg}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="btn-primary w-full justify-center cursor-pointer text-sm disabled:opacity-50"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Verifying Portal Access...
                    </>
                  ) : (
                    <>
                      Access Client Portal <ArrowRight size={14} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header bar */}
      <section className="bg-navy py-12 text-offwhite border-b border-white/10 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <Reveal>
            <span className="mono-label text-orange text-xs block mb-3">◤ Registered Client Dashboard</span>
            <h1 className="font-display text-3xl font-bold md:text-4xl leading-tight text-white">
              Welcome Back, {projects[0]?.accepted_by_name || "Client"}
            </h1>
            <p className="mt-2 text-xs text-offwhite/60 font-mono">
              Registered Phone: +91 {clientPhone}
            </p>
          </Reveal>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-white/20 hover:border-orange hover:text-orange px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer text-offwhite bg-navy/50"
            style={{ borderRadius: 2 }}
          >
            <LogOut size={12} /> Log Out
          </button>
        </div>
      </section>

      {/* Main dashboard content */}
      <section className="bg-offwhite py-12 min-h-screen">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20 gap-3">
              <Loader2 className="animate-spin text-orange h-8 w-8" />
              <span className="mono-label text-navy text-xs">Querying project timeline...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm font-mono bg-card border border-border rounded p-6">
              ◤ No projects found. Have you accepted a project on our Design Studio page?
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-12">
              
              {/* Project selector side-bar (Left) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <span className="mono-label text-navy text-xs font-bold uppercase tracking-wider pl-1">
                  Active Project Sheets ({projects.length})
                </span>
                
                <div className="flex flex-col gap-3">
                  {projects.map((p) => {
                    const isSelected = selectedProject?.id === p.id && selectedProject?.category === p.category;
                    return (
                      <button
                        key={`${p.category}-${p.id}`}
                        onClick={() => setSelectedProject(p)}
                        className={`w-full text-left p-4 border transition-all flex flex-col gap-1 cursor-pointer rounded ${
                          isSelected 
                            ? "border-orange bg-orange/5" 
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-[9px] text-orange uppercase font-bold tracking-wider">
                            ◤ {p.category} drawing
                          </span>
                          <span className={`inline-flex px-1.5 py-0.5 border text-[8px] font-bold uppercase rounded-sm ${
                            p.status === "open" ? "border-amber text-amber" :
                            p.status === "assigned" ? "border-orange text-orange" :
                            "border-green-600 text-green-600 bg-green-50"
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <h4 className="font-display font-bold text-sm text-navy mt-1 truncate">{p.title}</h4>
                        <div className="text-[10px] text-muted-foreground mt-1 flex justify-between">
                          <span>Area: {p.area || "Estimate"}</span>
                          <span>Progress: {p.progress_percent ?? 0}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Progress Sheet Details (Right) */}
              {selectedProject && (
                <div className="lg:col-span-8 flex flex-col gap-6">
                  
                  {/* Summary Overview Card */}
                  <div className="tick-frame bg-card border border-border p-6 shadow-sm flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="mono-label text-orange text-xs">◤ Active Project Timeline</span>
                        <h2 className="text-2xl font-display font-bold text-navy mt-1 leading-snug">
                          {selectedProject.title}
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          Drawing Class: {selectedProject.category} | Area Size: {selectedProject.area || "Specified in details"}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-[10px] mono-label text-muted-foreground">CONSTRUCTION PROGRESS</div>
                        <div className="text-3xl font-mono font-bold text-orange mt-0.5">
                          {selectedProject.progress_percent ?? 0}%
                        </div>
                      </div>
                    </div>

                    {/* Simple Progress Bar */}
                    <div className="w-full bg-border h-2 rounded-full overflow-hidden mt-2">
                      <div 
                        className="bg-orange h-full rounded-full transition-all duration-500" 
                        style={{ width: `${selectedProject.progress_percent ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Flow */}
                  <div className="tick-frame bg-card border border-border p-6 shadow-sm flex flex-col gap-6">
                    <h3 className="font-mono text-sm font-semibold uppercase text-navy border-b border-border pb-4">
                      Construction Milestone Stages
                    </h3>

                    <div className="relative pl-6 border-l border-border/80 flex flex-col gap-8 ml-3 py-2">
                      {getMilestones(selectedProject).map((m) => (
                        <div key={m.id} className="relative flex gap-4 items-start font-sans">
                          {/* Indicator Dot */}
                          <div className={`absolute -left-[35px] top-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors bg-card ${
                            m.completed 
                              ? "border-green-600 text-green-600 bg-green-50" 
                              : m.active 
                              ? "border-orange text-orange animate-pulse" 
                              : "border-border text-muted-foreground/30 bg-offwhite"
                          }`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              m.completed ? "bg-green-600" : m.active ? "bg-orange" : "bg-transparent"
                            }`} />
                          </div>

                          <div>
                            <h4 className={`text-sm font-bold leading-none ${
                              m.completed ? "text-green-600" : m.active ? "text-navy" : "text-muted-foreground/60"
                            }`}>
                              Stage {m.id} · {m.label}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                              {m.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Logs / Notes */}
                  <div className="tick-frame bg-card border border-border p-6 shadow-sm flex flex-col gap-4">
                    <h3 className="font-mono text-xs font-bold uppercase text-navy border-b border-border pb-3 flex items-center gap-1.5">
                      <Clock size={14} className="text-orange" /> Next G Engineer Logs & Updates
                    </h3>
                    {selectedProject.progress_notes ? (
                      <p className="text-xs text-navy leading-relaxed font-sans bg-offwhite/50 border border-border p-4 rounded whitespace-pre-line italic">
                        "{selectedProject.progress_notes}"
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground italic font-sans py-2">
                        No progress updates logged by engineers yet. Check back soon for construction site notes.
                      </p>
                    )}
                  </div>

                  {/* CAD/DWG File Manager Downloads */}
                  <div className="tick-frame bg-navy text-offwhite border border-white/10 p-6 flex flex-col justify-between md:flex-row items-center gap-6">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="text-orange h-8 w-8 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-display font-bold text-sm">Download Layout Source Files</h4>
                        <p className="text-xs text-offwhite/70 leading-relaxed mt-1 font-sans">
                          Accredited clients get direct access to download the structural CAD/DWG blueprint sheets or finalized print layouts.
                        </p>
                      </div>
                    </div>
                    
                    {selectedProject.source_file_url ? (
                      <a
                        href={selectedProject.source_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary shrink-0 w-full md:w-auto text-center justify-center gap-2 cursor-pointer"
                      >
                        <Download size={14} /> Download Blueprint CAD
                      </a>
                    ) : (
                      <div className="w-full md:w-auto text-center md:text-right border border-dashed border-white/15 p-3 rounded font-mono text-[10px] text-offwhite/50 max-w-xs leading-normal">
                        ◤ CAD files drafting in progress by structural engineers.
                      </div>
                    )}
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </section>
    </>
  );
}
