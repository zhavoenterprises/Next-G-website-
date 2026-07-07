import { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, LogOut, Lock, User, AlertCircle, FileText, Layers, HardHat,
  Quote, FolderKanban, Sparkles, Building, MapPin, Calendar, Briefcase, Check,
} from "lucide-react";
import { PROJECTS } from "@/lib/site-data";
import { toast } from "sonner";

// ============================================================================
// TYPES
// ============================================================================
interface DesignProject {
  id: string;
  category: "2D" | "3D" | "Structure" | "BOQ";
  title: string;
  area: string;
  planningDetails: string;
  description: string;
  imageUrl?: string;
  otherInfo?: string;
}

interface GeneralProject {
  slug: string;
  name: string;
  location: string;
  status: "Completed" | "Ongoing" | "Upcoming";
  type: string;
  area?: string;
  description?: string;
}

interface Testimonial {
  id: string;
  name: string;
  designation: string;
  description: string;
  profileImage: string;
  bgImage: string;
}

type Panel = "design" | "general" | "testimonials";

// ============================================================================
// DEFAULT MOCK DATA
// ============================================================================
const DEFAULT_DESIGN_PROJECTS: DesignProject[] = [
  { id: "p1", category: "2D", title: "1000 Square Meter Modern House Plan", area: "1000 Sq. Meters", planningDetails: "3 BHK, Double Floor, Modern Elevation", description: "Detailed 2D floor plan layout containing dimensional bedroom details, kitchen positioning, and car parking space.", imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600", otherInfo: "Best suited for East facing layouts. Vaastu compliant." },
  { id: "p2", category: "2D", title: "1200 Sq. Ft. Independent Villa Layout", area: "1200 Sq. Feet", planningDetails: "2 BHK, Single Floor, Vaastu Compliant", description: "East facing villa layout with spacious hall, open kitchen, and private portico.", imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600", otherInfo: "Includes compound wall layouts." },
  { id: "p3", category: "3D", title: "Contemporary Villa 3D Exterior", area: "2400 Sq. Feet", planningDetails: "Modern Architecture, Wood & Stone finishes", description: "Photorealistic 3D rendering of the building exterior with night lighting simulation and landscaping plan.", imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600", otherInfo: "Simulated using real materials." },
  { id: "p4", category: "Structure", title: "Residential G+2 Reinforcement Detail", area: "3000 Sq. Feet", planningDetails: "Column & Beams framing, Foundation details", description: "Structural engineering blueprint detailing reinforcement steel bar size specs, spacing, and concrete mix design.", imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600", otherInfo: "Designed for earthquake zone II." },
  { id: "p5", category: "BOQ", title: "Budget Estimate for 1500 Sq. Ft. House", area: "1500 Sq. Feet", planningDetails: "Premium Finish, Materials breakdown", description: "Detailed Bill of Quantities showing cement, steel, bricks, flooring, sand, and plumbing cost estimates.", imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600", otherInfo: "Based on local Madurai material rates." },
];

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: "t1", name: "Tangalakshmi", designation: "Residential Project, Madurai", description: "Next G built our dream home in Madurai. The structural drawing precision was amazing, and the billing was 100% transparent. Highly recommend!", profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150", bgImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=600" },
  { id: "t2", name: "Ameena Beevi", designation: "Residential Project, Ramanathapuram", description: "They handled everything from drawings to final finishes. Outstanding engineering discipline and completed right on schedule.", profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150", bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600" },
  { id: "t3", name: "Fazila", designation: "Commercial Project, Keelakarai", description: "Next G completed our retail outlet construction in Keelakarai. Clean execution, no surprises in cost, and excellent site safety.", profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150", bgImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600" },
  { id: "t4", name: "Muthukumar", designation: "Plotted Development, Paramakudi", description: "Superb planning and coordination for our plotted layout. They handled all approvals and delivered complete infrastructure.", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150", bgImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600" },
  { id: "t5", name: "Dr. Syed", designation: "Independent Villa, Madurai", description: "As a doctor, I had zero time to supervise. Next G's site engineers managed everything with professional reports. Extremely satisfied.", profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150", bgImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600" },
  { id: "t6", name: "Rajesh Kumar", designation: "Commercial Office, Ramanathapuram", description: "Their BOQ-backed costing is their biggest strength. Not a single rupee of cost escalation from the initial quote.", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150", bgImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600" },
];

const inputClass = "w-full border border-border bg-white px-3.5 py-2.5 text-navy placeholder-muted-foreground/60 text-sm outline-none transition-all focus:border-orange focus:ring-1 focus:ring-orange/40 rounded-lg";
const labelClass = "block text-[10px] text-orange uppercase tracking-wider font-semibold mb-1.5 font-mono";

// ============================================================================
// SHARED UI PRIMITIVES
// ============================================================================
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}{required && " *"}</label>
      {children}
    </div>
  );
}

function StatCard({ title, value, desc, icon: Icon, color }: { title: string; value: number; desc: string; icon: any; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden">
      <div className={`absolute top-0 right-0 p-3 opacity-[0.08] ${color}`}>
        <Icon size={48} />
      </div>
      <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-mono">{title}</span>
      <h3 className="text-3xl font-bold font-display text-navy mt-1.5">{value}</h3>
      <p className="text-[10px] text-muted-foreground/80 mt-1">{desc}</p>
    </div>
  );
}

function PanelHeader({ title, desc, actionLabel, onAction }: { title: string; desc: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#EEEBE3]/30 p-4 border border-border rounded-xl">
      <div>
        <h3 className="font-display text-lg font-bold text-navy">{title}</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onAction}
        className="shrink-0 py-2.5 px-4 bg-orange text-white hover:bg-orange/95 font-mono text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-orange/15 cursor-pointer active:scale-95"
      >
        <Plus size={14} /> {actionLabel}
      </button>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground text-xs font-mono">
      ◤ {message}
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-2">
      <button
        onClick={onEdit}
        title="Edit"
        className="inline-flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-orange hover:bg-orange/10 border border-border hover:border-orange rounded-lg cursor-pointer transition-all active:scale-90"
      >
        <Edit2 size={12} />
      </button>
      <button
        onClick={onDelete}
        title="Delete"
        className="inline-flex items-center justify-center h-8 w-8 text-destructive hover:text-white hover:bg-destructive border border-border hover:border-destructive rounded-lg cursor-pointer transition-all active:scale-90"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: GeneralProject["status"] }) {
  const styles = {
    Completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    Ongoing: "border-orange/20 bg-orange/10 text-orange",
    Upcoming: "border-cyan-500/20 bg-cyan-500/10 text-cyan-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold whitespace-nowrap ${styles[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

function Modal({ title, badge, onClose, children }: { title: string; badge: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full max-w-2xl shadow-2xl p-6 md:p-8 rounded-2xl my-8 max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border pb-4 mb-6">
          <span className="text-[9px] uppercase tracking-widest text-orange font-bold font-mono">{badge}</span>
          <h3 className="font-display text-2xl font-bold text-navy mt-1">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Fields marked with * are required.</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex gap-3 justify-end pt-4 border-t border-border mt-6">
      <button
        type="button"
        onClick={onCancel}
        className="border border-border text-muted-foreground hover:text-navy bg-transparent hover:bg-secondary px-5 py-2.5 text-xs font-mono font-medium tracking-wide transition-all rounded-lg cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="py-2.5 px-6 bg-orange text-white hover:bg-orange/95 font-mono text-xs font-semibold rounded-lg shadow-md shadow-orange/15 cursor-pointer"
      >
        {submitLabel}
      </button>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activePanel, setActivePanel] = useState<Panel>("design");
  const [designTab, setDesignTab] = useState<"2D" | "3D" | "Structure" | "BOQ">("2D");

  const [designProjects, setDesignProjects] = useState<DesignProject[]>([]);
  const [generalProjects, setGeneralProjects] = useState<GeneralProject[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formDesign, setFormDesign] = useState<Partial<DesignProject>>({});
  const [formGeneral, setFormGeneral] = useState<Partial<GeneralProject>>({});
  const [formTestimonial, setFormTestimonial] = useState<Partial<Testimonial>>({});

  useEffect(() => {
    const logged = sessionStorage.getItem("ng_admin_logged") === "true";
    if (logged) setIsLoggedIn(true);

    const savedDesign = localStorage.getItem("ng_design_projects");
    if (savedDesign) {
      try { setDesignProjects(JSON.parse(savedDesign)); } catch { setDesignProjects(DEFAULT_DESIGN_PROJECTS); }
    } else {
      setDesignProjects(DEFAULT_DESIGN_PROJECTS);
      localStorage.setItem("ng_design_projects", JSON.stringify(DEFAULT_DESIGN_PROJECTS));
    }

    const savedGeneral = localStorage.getItem("ng_general_projects");
    if (savedGeneral) {
      try { setGeneralProjects(JSON.parse(savedGeneral)); } catch { setGeneralProjects(PROJECTS); }
    } else {
      setGeneralProjects(PROJECTS);
      localStorage.setItem("ng_general_projects", JSON.stringify(PROJECTS));
    }

    const savedTestimonials = localStorage.getItem("ng_testimonials");
    if (savedTestimonials) {
      try { setTestimonialsList(JSON.parse(savedTestimonials)); } catch { setTestimonialsList(DEFAULT_TESTIMONIALS); }
    } else {
      setTestimonialsList(DEFAULT_TESTIMONIALS);
      localStorage.setItem("ng_testimonials", JSON.stringify(DEFAULT_TESTIMONIALS));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "nextgadmin") {
      setIsLoggedIn(true);
      sessionStorage.setItem("ng_admin_logged", "true");
      setLoginError("");
      toast.success("Welcome back, administrator!");
    } else {
      setLoginError("Invalid username or password credentials.");
      toast.error("Access denied: invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("ng_admin_logged");
    setUsername("");
    setPassword("");
    toast.success("Logged out successfully.");
  };

  const switchPanel = (p: Panel) => { setActivePanel(p); setShowModal(false); };

  // ---- Design Studio CRUD ----
  const saveDesignProjects = (list: DesignProject[]) => {
    setDesignProjects(list);
    localStorage.setItem("ng_design_projects", JSON.stringify(list));
  };
  const openAddDesign = () => {
    setEditMode(false);
    setFormDesign({ category: designTab, title: "", area: "", planningDetails: "", description: "", imageUrl: "", otherInfo: "" });
    setShowModal(true);
  };
  const openEditDesign = (item: DesignProject) => { setEditMode(true); setFormDesign(item); setShowModal(true); };
  const deleteDesign = (id: string) => {
    if (confirm("Remove this Design Studio plan?")) {
      saveDesignProjects(designProjects.filter((p) => p.id !== id));
      toast.success("Design Studio plan deleted.");
    }
  };
  const submitDesign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesign.title || !formDesign.area || !formDesign.planningDetails || !formDesign.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (editMode) {
      saveDesignProjects(designProjects.map((p) => (p.id === formDesign.id ? (formDesign as DesignProject) : p)));
      toast.success("Design Studio plan updated.");
    } else {
      saveDesignProjects([...designProjects, { ...(formDesign as Omit<DesignProject, "id">), id: "p_" + Date.now() }]);
      toast.success("New Design Studio plan created.");
    }
    setShowModal(false);
  };

  // ---- General Portfolio CRUD ----
  const saveGeneralProjects = (list: GeneralProject[]) => {
    setGeneralProjects(list);
    localStorage.setItem("ng_general_projects", JSON.stringify(list));
  };
  const openAddGeneral = () => {
    setEditMode(false);
    setFormGeneral({ slug: "", name: "", location: "", status: "Completed", type: "Residential Project", area: "", description: "" });
    setShowModal(true);
  };
  const openEditGeneral = (item: GeneralProject) => { setEditMode(true); setFormGeneral(item); setShowModal(true); };
  const deleteGeneral = (slug: string) => {
    if (confirm("Remove this general project?")) {
      saveGeneralProjects(generalProjects.filter((p) => p.slug !== slug));
      toast.success("General project deleted.");
    }
  };
  const submitGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGeneral.name || !formGeneral.location || !formGeneral.type) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const slug = formGeneral.slug || formGeneral.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (editMode) {
      saveGeneralProjects(generalProjects.map((p) => (p.slug === formGeneral.slug ? { ...(formGeneral as GeneralProject), slug } : p)));
      toast.success("General project updated.");
    } else {
      if (generalProjects.some((p) => p.slug === slug)) {
        toast.error("A project with this title/slug already exists.");
        return;
      }
      saveGeneralProjects([...generalProjects, { ...(formGeneral as Omit<GeneralProject, "slug">), slug }]);
      toast.success("New general project created.");
    }
    setShowModal(false);
  };

  // ---- Testimonials CRUD ----
  const saveTestimonials = (list: Testimonial[]) => {
    setTestimonialsList(list);
    localStorage.setItem("ng_testimonials", JSON.stringify(list));
  };
  const openAddTestimonial = () => {
    setEditMode(false);
    setFormTestimonial({ name: "", designation: "", description: "", profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150", bgImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600" });
    setShowModal(true);
  };
  const openEditTestimonial = (item: Testimonial) => { setEditMode(true); setFormTestimonial(item); setShowModal(true); };
  const deleteTestimonial = (id: string) => {
    if (confirm("Delete this testimonial?")) {
      saveTestimonials(testimonialsList.filter((t) => t.id !== id));
      toast.success("Testimonial deleted.");
    }
  };
  const submitTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTestimonial.name || !formTestimonial.designation || !formTestimonial.description) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (editMode) {
      saveTestimonials(testimonialsList.map((t) => (t.id === formTestimonial.id ? (formTestimonial as Testimonial) : t)));
      toast.success("Testimonial updated.");
    } else {
      saveTestimonials([...testimonialsList, { ...(formTestimonial as Omit<Testimonial, "id">), id: "t_" + Date.now() }]);
      toast.success("New testimonial added.");
    }
    setShowModal(false);
  };

  const filteredDesignProjects = designProjects.filter((p) => p.category === designTab);

  const NAV_ITEMS: { id: Panel; label: string; icon: any; count: number }[] = [
    { id: "design", label: "Design Studio", icon: Layers, count: designProjects.length },
    { id: "general", label: "Portfolio", icon: FolderKanban, count: generalProjects.length },
    { id: "testimonials", label: "Testimonials", icon: Quote, count: testimonialsList.length },
  ];

  const PANEL_TITLES: Record<Panel, string> = {
    design: "Design Studio Plans",
    general: "General Portfolio",
    testimonials: "Client Testimonials",
  };

  // ==========================================================================
  // LOGIN SCREEN
  // ==========================================================================
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-offwhite text-navy flex flex-col justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(31,27,77,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,27,77,0.06)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto w-full max-w-md z-10">
          <div className="flex justify-center">
            <span className="grid h-14 w-14 place-items-center bg-orange text-white font-display text-2xl font-bold rounded shadow-lg shadow-orange/20 relative group">
              <span className="absolute inset-0 rounded bg-orange blur opacity-40 group-hover:opacity-75 transition-opacity" />
              <span className="relative z-10">NG</span>
            </span>
          </div>
          <h2 className="mt-8 text-center text-4xl font-display font-bold tracking-tight text-navy">Portal Control Panel</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground font-mono">◤ Authorized personnel only</p>
        </div>

        <div className="mt-8 mx-auto w-full max-w-md z-10">
          <div className="bg-card py-8 px-6 border border-border rounded-2xl sm:px-10 shadow-xl">
            <form className="space-y-6" onSubmit={handleLogin}>
              <FormField label="Username">
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" className={`${inputClass} pl-10`} />
                </div>
              </FormField>

              <FormField label="Password">
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/80" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputClass} pl-10`} />
                </div>
              </FormField>

              {loginError && (
                <div className="flex items-start gap-2.5 text-destructive text-xs bg-destructive/10 p-3 rounded-lg border border-destructive/20 font-mono">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <button type="submit" className="w-full py-2.5 px-4 bg-orange text-white hover:bg-orange/95 transition-all font-mono font-bold tracking-wider text-sm rounded-lg shadow-lg shadow-orange/20 cursor-pointer active:scale-[0.98]">
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // DASHBOARD
  // ==========================================================================
  return (
    <div className="min-h-screen bg-offwhite text-navy flex font-sans">
      {/* ---------- SIDEBAR ---------- */}
      <aside className="w-64 shrink-0 bg-navy text-white flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center bg-orange text-white font-display font-bold rounded-lg">NG</span>
          <div className="min-w-0">
            <div className="font-display font-bold text-sm leading-tight truncate">Next G Engineers</div>
            <div className="text-[9px] font-mono text-white/50 tracking-widest">ADMIN CONSOLE</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activePanel === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => switchPanel(item.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  active ? "bg-orange text-white shadow-md shadow-orange/20" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3"><Icon size={16} /> {item.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${active ? "bg-white/20" : "bg-white/10"}`}>{item.count}</span>
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-all cursor-pointer">
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* ---------- MAIN ---------- */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur flex items-center justify-between px-6 lg:px-8 shrink-0 sticky top-0 z-30">
          <div className="min-w-0">
            <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Admin</div>
            <h1 className="font-display text-lg font-bold text-navy truncate">{PANEL_TITLES[activePanel]}</h1>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-2.5 py-1 rounded-full shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Saved locally
          </span>
        </header>

        <div className="flex-1 px-6 lg:px-8 py-8 space-y-6 max-w-7xl w-full">
          {/* ===================== DESIGN STUDIO PANEL ===================== */}
          {activePanel === "design" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Studio Plans" value={designProjects.length} desc="Across all blueprint levels" icon={Layers} color="text-amber-500" />
                <StatCard title="2D Floor Plans" value={designProjects.filter((p) => p.category === "2D").length} desc="CAD layout drawings" icon={FileText} color="text-orange" />
                <StatCard title="3D Elevations" value={designProjects.filter((p) => p.category === "3D").length} desc="Architectural renders" icon={Sparkles} color="text-purple-600" />
                <StatCard title="Structure & BOQ" value={designProjects.filter((p) => p.category === "Structure" || p.category === "BOQ").length} desc="Blueprints & estimates" icon={HardHat} color="text-cyan-600" />
              </div>

              <div className="flex border-b border-border gap-1 overflow-x-auto">
                {(["2D", "3D", "Structure", "BOQ"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDesignTab(tab)}
                    className={`shrink-0 px-4 py-3 text-xs font-mono font-medium border-b-2 transition-all cursor-pointer ${
                      designTab === tab ? "border-orange text-orange font-semibold" : "border-transparent text-muted-foreground hover:text-navy"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <PanelHeader
                title={`${designTab} Engineering Drawings`}
                desc="Create, update, and manage drawing blueprints visible inside the design studio selector."
                actionLabel="New Drawing"
                onAction={openAddDesign}
              />

              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {filteredDesignProjects.length === 0 ? (
                  <EmptyState message="No drawings under this category" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-left">
                      <thead className="bg-[#EEEBE3]/50 text-navy font-semibold font-mono text-[9px] uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 w-[38%]">Drawing</th>
                          <th className="px-6 py-4 w-[14%]">Built Area</th>
                          <th className="px-6 py-4 w-[22%]">Planning</th>
                          <th className="px-6 py-4 w-[12%]">Preview</th>
                          <th className="px-6 py-4 w-[14%] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm bg-card">
                        {filteredDesignProjects.map((p) => (
                          <tr key={p.id} className="hover:bg-[#EEEBE3]/30 transition-colors">
                            <td className="px-6 py-4 align-top">
                              <span className="font-semibold text-navy block">{p.title}</span>
                              <span className="text-xs text-muted-foreground mt-1 line-clamp-1 block">{p.description}</span>
                            </td>
                            <td className="px-6 py-4 align-top font-mono text-xs text-amber-600 font-medium">{p.area}</td>
                            <td className="px-6 py-4 align-top text-muted-foreground text-xs">{p.planningDetails}</td>
                            <td className="px-6 py-4 align-top">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt="preview" className="h-9 w-14 object-cover border border-border rounded" />
                              ) : (
                                <span className="text-[10px] font-mono text-muted-foreground/60 italic">No image</span>
                              )}
                            </td>
                            <td className="px-6 py-4 align-top">
                              <RowActions onEdit={() => openEditDesign(p)} onDelete={() => deleteDesign(p.id)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== GENERAL PORTFOLIO PANEL ===================== */}
          {activePanel === "general" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Portfolio Works" value={generalProjects.length} desc="Residential & commercial" icon={FolderKanban} color="text-amber-500" />
                <StatCard title="Completed" value={generalProjects.filter((p) => p.status === "Completed").length} desc="Successfully delivered" icon={Check} color="text-emerald-600" />
                <StatCard title="Ongoing" value={generalProjects.filter((p) => p.status === "Ongoing").length} desc="On-site engineers active" icon={HardHat} color="text-orange" />
                <StatCard title="Upcoming" value={generalProjects.filter((p) => p.status === "Upcoming").length} desc="In blueprint phase" icon={Calendar} color="text-cyan-600" />
              </div>

              <PanelHeader
                title="General Portfolio Works"
                desc="Create, update, and manage construction projects visible on the /projects page."
                actionLabel="New Project"
                onAction={openAddGeneral}
              />

              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {generalProjects.length === 0 ? (
                  <EmptyState message="No portfolio projects yet" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-left">
                      <thead className="bg-[#EEEBE3]/50 text-navy font-semibold font-mono text-[9px] uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 w-[36%]">Project</th>
                          <th className="px-6 py-4 w-[18%]">Location</th>
                          <th className="px-6 py-4 w-[18%]">Type</th>
                          <th className="px-6 py-4 w-[14%]">Status</th>
                          <th className="px-6 py-4 w-[14%] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm bg-card">
                        {generalProjects.map((p) => (
                          <tr key={p.slug} className="hover:bg-[#EEEBE3]/30 transition-colors">
                            <td className="px-6 py-4 align-top">
                              <span className="font-semibold text-navy block">{p.name}</span>
                              <span className="text-xs text-muted-foreground mt-1 line-clamp-1 block">{p.description || "Awaiting description..."}</span>
                              <span className="text-[9.5px] text-orange font-mono mt-1 block">{p.slug}</span>
                            </td>
                            <td className="px-6 py-4 align-top font-mono text-xs text-navy">
                              <span className="flex items-center gap-1"><MapPin size={11} className="text-muted-foreground shrink-0" /> {p.location}</span>
                            </td>
                            <td className="px-6 py-4 align-top text-amber-700 text-xs font-mono">{p.type}</td>
                            <td className="px-6 py-4 align-top"><StatusBadge status={p.status} /></td>
                            <td className="px-6 py-4 align-top">
                              <RowActions onEdit={() => openEditGeneral(p)} onDelete={() => deleteGeneral(p.slug)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================== TESTIMONIALS PANEL ===================== */}
          {activePanel === "testimonials" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Reviews" value={testimonialsList.length} desc="Shown on visitor page" icon={Quote} color="text-orange" />
                <StatCard title="Residential" value={testimonialsList.filter((t) => t.designation.includes("Residential")).length} desc="Homeowner stories" icon={Building} color="text-amber-500" />
                <StatCard title="Commercial" value={testimonialsList.filter((t) => t.designation.includes("Commercial")).length} desc="Retail & office builds" icon={Briefcase} color="text-purple-600" />
                <StatCard title="Regions" value={[...new Set(testimonialsList.map((t) => t.designation.split(",")[1]?.trim() || "Madurai"))].length} desc="Cities represented" icon={MapPin} color="text-cyan-600" />
              </div>

              <PanelHeader
                title="Client Testimonials"
                desc="Create, update, and manage quotes shown in the testimonials carousel."
                actionLabel="New Testimonial"
                onAction={openAddTestimonial}
              />

              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {testimonialsList.length === 0 ? (
                  <EmptyState message="No testimonials yet" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border text-left">
                      <thead className="bg-[#EEEBE3]/50 text-navy font-semibold font-mono text-[9px] uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 w-[22%]">Client</th>
                          <th className="px-6 py-4 w-[36%]">Quote</th>
                          <th className="px-6 py-4 w-[12%]">Avatar</th>
                          <th className="px-6 py-4 w-[16%]">Background</th>
                          <th className="px-6 py-4 w-[14%] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm bg-card">
                        {testimonialsList.map((t) => (
                          <tr key={t.id} className="hover:bg-[#EEEBE3]/30 transition-colors">
                            <td className="px-6 py-4 align-top">
                              <span className="font-semibold text-navy block">{t.name}</span>
                              <span className="text-xs text-muted-foreground mt-1 font-mono block">{t.designation}</span>
                            </td>
                            <td className="px-6 py-4 align-top text-muted-foreground text-xs">
                              <span className="line-clamp-2 italic block">"{t.description}"</span>
                            </td>
                            <td className="px-6 py-4 align-top">
                              {t.profileImage ? (
                                <img src={t.profileImage} alt={t.name} className="h-8 w-8 object-cover rounded-full border border-border shadow-sm" />
                              ) : (
                                <span className="text-[10px] font-mono text-muted-foreground/60">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4 align-top">
                              {t.bgImage ? (
                                <img src={t.bgImage} alt="bg" className="h-9 w-14 object-cover border border-border rounded" />
                              ) : (
                                <span className="text-[10px] font-mono text-muted-foreground/60">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4 align-top">
                              <RowActions onEdit={() => openEditTestimonial(t)} onDelete={() => deleteTestimonial(t.id)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== MODALS ===================== */}
      {showModal && activePanel === "design" && (
        <Modal title={editMode ? `Edit ${designTab} Drawing` : `New ${designTab} Studio Plan`} badge="DESIGN STUDIO" onClose={() => setShowModal(false)}>
          <form onSubmit={submitDesign} className="space-y-4">
            <FormField label="Drawing Title" required>
              <input type="text" required placeholder="e.g. 1500 Sq Ft Vaastu Floor Plan" value={formDesign.title || ""} onChange={(e) => setFormDesign({ ...formDesign, title: e.target.value })} className={inputClass} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Built-up Area" required>
                <input type="text" required placeholder="e.g. 1500 Sq. Feet" value={formDesign.area || ""} onChange={(e) => setFormDesign({ ...formDesign, area: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Planning Specifications" required>
                <input type="text" required placeholder="e.g. 3 BHK, Single Floor, East Facing" value={formDesign.planningDetails || ""} onChange={(e) => setFormDesign({ ...formDesign, planningDetails: e.target.value })} className={inputClass} />
              </FormField>
            </div>
            <FormField label="Detailed Description" required>
              <textarea required rows={4} placeholder="Structural columns, plumbing layouts, design features..." value={formDesign.description || ""} onChange={(e) => setFormDesign({ ...formDesign, description: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Blueprint Image URL">
              <input type="text" placeholder="https://images.unsplash.com/..." value={formDesign.imageUrl || ""} onChange={(e) => setFormDesign({ ...formDesign, imageUrl: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Supplemental Info">
              <input type="text" placeholder="e.g. Vaastu calculations, concrete specifications" value={formDesign.otherInfo || ""} onChange={(e) => setFormDesign({ ...formDesign, otherInfo: e.target.value })} className={inputClass} />
            </FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editMode ? "Save changes" : "Create plan"} />
          </form>
        </Modal>
      )}

      {showModal && activePanel === "general" && (
        <Modal title={editMode ? "Edit Portfolio Project" : "New Portfolio Project"} badge="GENERAL PORTFOLIO" onClose={() => setShowModal(false)}>
          <form onSubmit={submitGeneral} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Project Name" required>
                <input type="text" required placeholder="e.g. Al Ameen Nagar Villa" value={formGeneral.name || ""} onChange={(e) => setFormGeneral({ ...formGeneral, name: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Location" required>
                <input type="text" required placeholder="e.g. Madurai" value={formGeneral.location || ""} onChange={(e) => setFormGeneral({ ...formGeneral, location: e.target.value })} className={inputClass} />
              </FormField>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="Classification" required>
                <input type="text" required placeholder="e.g. Residential Project" value={formGeneral.type || ""} onChange={(e) => setFormGeneral({ ...formGeneral, type: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Status" required>
                <select value={formGeneral.status || "Completed"} onChange={(e) => setFormGeneral({ ...formGeneral, status: e.target.value as any })} className={inputClass}>
                  <option value="Completed">Completed</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </FormField>
              <FormField label="Site Area">
                <input type="text" placeholder="e.g. 1800 Sq. Ft." value={formGeneral.area || ""} onChange={(e) => setFormGeneral({ ...formGeneral, area: e.target.value })} className={inputClass} />
              </FormField>
            </div>
            <FormField label="Slug identifier" required>
              <input type="text" placeholder="Auto-derived from title (e.g. al-ameen-nagar)" disabled={editMode} value={formGeneral.slug || ""} onChange={(e) => setFormGeneral({ ...formGeneral, slug: e.target.value })} className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed`} />
              {!editMode && <p className="text-[10px] text-muted-foreground/80 mt-1">Leave blank to auto-generate from the project name.</p>}
            </FormField>
            <FormField label="Case Study Description">
              <textarea rows={4} placeholder="Materials, finishes, and handover info..." value={formGeneral.description || ""} onChange={(e) => setFormGeneral({ ...formGeneral, description: e.target.value })} className={inputClass} />
            </FormField>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editMode ? "Save changes" : "Create project"} />
          </form>
        </Modal>
      )}

      {showModal && activePanel === "testimonials" && (
        <Modal title={editMode ? "Edit Testimonial" : "New Testimonial"} badge="CLIENT TESTIMONIALS" onClose={() => setShowModal(false)}>
          <form onSubmit={submitTestimonial} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Client Name" required>
                <input type="text" required placeholder="e.g. Tangalakshmi" value={formTestimonial.name || ""} onChange={(e) => setFormTestimonial({ ...formTestimonial, name: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Project & Location" required>
                <input type="text" required placeholder="e.g. Residential Project, Madurai" value={formTestimonial.designation || ""} onChange={(e) => setFormTestimonial({ ...formTestimonial, designation: e.target.value })} className={inputClass} />
              </FormField>
            </div>
            <FormField label="Quote / Review" required>
              <textarea required rows={4} placeholder="What the client shared about working with Next G..." value={formTestimonial.description || ""} onChange={(e) => setFormTestimonial({ ...formTestimonial, description: e.target.value })} className={inputClass} />
            </FormField>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Avatar Image URL">
                <input type="text" placeholder="https://images.unsplash.com/..." value={formTestimonial.profileImage || ""} onChange={(e) => setFormTestimonial({ ...formTestimonial, profileImage: e.target.value })} className={inputClass} />
              </FormField>
              <FormField label="Card Background URL">
                <input type="text" placeholder="https://images.unsplash.com/..." value={formTestimonial.bgImage || ""} onChange={(e) => setFormTestimonial({ ...formTestimonial, bgImage: e.target.value })} className={inputClass} />
              </FormField>
            </div>
            <ModalActions onCancel={() => setShowModal(false)} submitLabel={editMode ? "Save changes" : "Add testimonial"} />
          </form>
        </Modal>
      )}
    </div>
  );
}