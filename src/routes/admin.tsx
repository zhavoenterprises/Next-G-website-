import { useState, useEffect, useMemo } from "react";
import { 
  Plus, Edit2, Trash2, LogOut, Lock, User, AlertCircle, FileText, Layout, Layers, HardHat, Upload, HelpCircle, Check, Loader2, ArrowRight,
  BarChart3, PieChart, TrendingUp, Sparkles, Download
} from "lucide-react";
import { COMPANY } from "@/lib/site-data";

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
}

const STATUS_STATES = ["open", "assigned", "completed", "paid"] as const;

export default function AdminPortal() {
  useEffect(() => {
    document.title = "Admin Portal · Next G Engineers";
  }, []);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"2D" | "3D" | "structure" | "BOQ">("2D");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Analytics Metrics Calculation
  const metrics = useMemo(() => {
    let totalBOQEstimate = 0;
    let openCount = 0;
    let assignedCount = 0;
    let completedCount = 0;
    
    projects.forEach((p) => {
      if (p.status === "open") openCount++;
      else if (p.status === "assigned") assignedCount++;
      else if (p.status === "completed" || p.status === "paid") completedCount++;

      if (p.category === "BOQ") {
        const items = p.line_items ?? [];
        const boqTotal = items.reduce((sum, item) => sum + ((item.quantity ?? 0) * (item.rate ?? 0)), 0);
        totalBOQEstimate += boqTotal;
      }
    });

    const totalProjects = projects.length;
    const completionRate = totalProjects > 0 ? Math.round((completedCount / totalProjects) * 100) : 0;

    return {
      totalBOQEstimate,
      openCount,
      assignedCount,
      completedCount,
      totalProjects,
      completionRate
    };
  }, [projects]);

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

  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [showFormModal, setShowFormModal] = useState(false);

  // Loading states
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Check login state on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/admin/check");
      const data = await res.json() as { authenticated: boolean };
      if (data.authenticated) {
        setIsLoggedIn(true);
        fetchProjects();
      }
    } catch (e) {
      console.error("Session check failed", e);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch("/api/admin/projects/all");
      const data = await res.json() as { standard: Project[]; boq: Project[] };
      const mergedList = [...(data.standard ?? []), ...(data.boq ?? [])];
      setProjects(mergedList);
    } catch (e) {
      console.error("Failed to fetch projects list", e);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setIsLoggedIn(true);
        fetchProjects();
      } else {
        setLoginError(data.error ?? "Invalid username or password.");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication server.");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      setIsLoggedIn(false);
      setUsername("");
      setPassword("");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json() as { url?: string; error?: string };
      if (res.ok && data.url) {
        setCurrentProject((prev) => ({ ...prev, image_url: data.url }));
      } else {
        alert(data.error ?? "File upload failed.");
      }
    } catch (err) {
      alert("Failed to upload image file to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddClick = () => {
    setIsEditing(false);
    if (activeTab === "BOQ") {
      setCurrentProject({
        category: "BOQ",
        title: "",
        description: "",
        line_items: [{ item_name: "", unit: "", quantity: 0, rate: 0 }],
      });
    } else {
      setCurrentProject({
        category: activeTab,
        title: "",
        area: "",
        planning_details: "",
        description: "",
        image_url: "",
        other_info: "",
      });
    }
    setShowFormModal(true);
  };

  const handleEditClick = (proj: Project) => {
    setIsEditing(true);
    if (proj.category === "BOQ" && (!proj.line_items || proj.line_items.length === 0)) {
      setCurrentProject({
        ...proj,
        line_items: [{ item_name: "", unit: "", quantity: 0, rate: 0 }],
      });
    } else {
      setCurrentProject(proj);
    }
    setShowFormModal(true);
  };

  const handleDeleteClick = async (proj: Project) => {
    if (!confirm("Are you sure you want to permanently delete this project?")) return;

    try {
      const queryParam = proj.category === "BOQ" ? "?type=boq" : "";
      const res = await fetch(`/api/admin/projects/${proj.id}${queryParam}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "delete" }),
      });
      if (res.ok) {
        fetchProjects();
      } else {
        alert("Delete failed.");
      }
    } catch (e) {
      alert("Network error. Delete failed.");
    }
  };

  const handleStatusAdvance = async (proj: Project) => {
    const currentIndex = STATUS_STATES.indexOf(proj.status);
    if (currentIndex === -1 || currentIndex === STATUS_STATES.length - 1) return;

    const nextStatus = STATUS_STATES[currentIndex + 1];
    try {
      const queryParam = proj.category === "BOQ" ? "?type=boq" : "";
      const res = await fetch(`/api/admin/projects/${proj.id}/status${queryParam}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        fetchProjects();
      } else {
        alert("Failed to update project status.");
      }
    } catch (e) {
      alert("Network error. Status update failed.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject.title) {
      alert("Title is required.");
      return;
    }

    setIsSaving(true);
    try {
      const isBoq = currentProject.category === "BOQ";
      const urlPath = isEditing ? `/api/admin/projects/${currentProject.id}${isBoq ? "?type=boq" : ""}` : "/api/admin/projects";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(urlPath, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(currentProject),
      });

      if (res.ok) {
        setShowFormModal(false);
        fetchProjects();
      } else {
        const errData = await res.json() as { error?: string };
        alert(errData.error ?? "Failed to save project.");
      }
    } catch (err) {
      alert("Network error. Saving failed.");
    } finally {
      setIsSaving(false);
    }
  };

  // BOQ Line item handlers
  const handleLineItemChange = (index: number, field: keyof BOQLineItem, val: string | number) => {
    if (!currentProject.line_items) return;
    const items = [...currentProject.line_items];
    
    if (field === "quantity" || field === "rate") {
      const numVal = Number(val) || 0;
      items[index] = {
        ...items[index],
        [field]: numVal,
        amount: field === "quantity" ? numVal * items[index].rate : items[index].quantity * numVal
      };
    } else {
      items[index] = {
        ...items[index],
        [field]: val
      };
    }

    setCurrentProject((prev) => ({ ...prev, line_items: items }));
  };

  const addLineItemRow = () => {
    if (!currentProject.line_items) return;
    setCurrentProject((prev) => ({
      ...prev,
      line_items: [...(prev.line_items ?? []), { item_name: "", unit: "", quantity: 0, rate: 0 }]
    }));
  };

  const removeLineItemRow = (index: number) => {
    if (!currentProject.line_items || currentProject.line_items.length <= 1) return;
    const items = currentProject.line_items.filter((_, idx) => idx !== index);
    setCurrentProject((prev) => ({ ...prev, line_items: items }));
  };

  const calculateBOQTotal = (items: BOQLineItem[] = []) => {
    return items.reduce((sum, item) => sum + ((item.quantity ?? 0) * (item.rate ?? 0)), 0);
  };

  const filteredProjects = projects.filter((p) => p.category === activeTab);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-offwhite flex justify-center items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-orange h-8 w-8" />
          <span className="mono-label text-navy text-xs">Authenticating Portal Session...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-offwhite flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <span className="grid h-12 w-12 place-items-center bg-navy text-offwhite rounded">
              <span className="font-display text-xl font-bold leading-none">NG</span>
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-navy">
            Design Studio Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground font-mono">
            ◤ Sign in to manage 2D, 3D, Structure, and BOQ projects
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card py-8 px-4 border border-border sm:rounded-lg sm:px-10 shadow-sm">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label className="mono-label block text-xs text-navy font-semibold mb-2">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full border border-border bg-offwhite pl-9 pr-4 py-2 text-navy text-sm outline-none transition-colors focus:border-orange rounded"
                  />
                </div>
              </div>

              <div>
                <label className="mono-label block text-xs text-navy font-semibold mb-2">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full border border-border bg-offwhite pl-9 pr-4 py-2 text-navy text-sm outline-none transition-colors focus:border-orange rounded"
                  />
                </div>
              </div>

              {loginError && (
                <div className="flex items-center gap-2 text-red-600 text-xs mt-2 bg-red-50 p-3 rounded border border-red-200">
                  <AlertCircle size={14} />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center cursor-pointer text-sm"
                >
                  Sign In
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
      <div className="bg-navy text-offwhite border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-4 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center bg-orange text-white rounded">
              <span className="font-display text-sm font-bold">A</span>
            </span>
            <div>
              <span className="mono-label block text-[10px] text-amber">Admin Control Board</span>
              <span className="block font-display text-sm font-bold">Design Studio Dashboard</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-white/20 hover:border-orange hover:text-orange px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer"
            style={{ borderRadius: 2 }}
          >
            <LogOut size={12} /> Log Out
          </button>
        </div>
      </div>

      <div className="bg-offwhite min-h-screen py-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* ANALYTICS DASHBOARD STATS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Metric 1: Total BOQ Estimated Value */}
            <div className="tick-frame border border-border bg-card p-5 hover-lift">
              <div className="flex justify-between items-start">
                <div>
                  <span className="mono-label text-muted-foreground text-[10px]">Est. Pipeline Value</span>
                  <div className="text-xl font-bold font-mono text-navy mt-1">
                    {metrics.totalBOQEstimate.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="p-2 bg-orange/10 text-orange rounded">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 font-sans">
                Sum of all active BOQ specifications
              </div>
            </div>

            {/* Metric 2: Completion Rate */}
            <div className="tick-frame border border-border bg-card p-5 hover-lift">
              <div className="flex justify-between items-start">
                <div>
                  <span className="mono-label text-muted-foreground text-[10px]">Completion Rate</span>
                  <div className="text-xl font-bold font-mono text-navy mt-1">
                    {metrics.completionRate}%
                  </div>
                </div>
                <div className="p-2 bg-green-50 text-green-600 border border-green-100 rounded">
                  <Check size={16} />
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 w-full bg-border h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-600 h-full rounded-full transition-all duration-500" style={{ width: `${metrics.completionRate}%` }} />
              </div>
            </div>

            {/* Metric 3: Active Pipeline */}
            <div className="tick-frame border border-border bg-card p-5 hover-lift">
              <div className="flex justify-between items-start">
                <div>
                  <span className="mono-label text-muted-foreground text-[10px]">In Progress</span>
                  <div className="text-xl font-bold font-mono text-navy mt-1">
                    {metrics.assignedCount} <span className="text-xs font-sans font-normal text-muted-foreground">projects</span>
                  </div>
                </div>
                <div className="p-2 bg-amber-50 text-amber-600 border border-amber-100 rounded">
                  <BarChart3 size={16} />
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 font-sans">
                Assigned drawings currently in progress
              </div>
            </div>

            {/* Metric 4: Open Drawings */}
            <div className="tick-frame border border-border bg-card p-5 hover-lift">
              <div className="flex justify-between items-start">
                <div>
                  <span className="mono-label text-muted-foreground text-[10px]">Available / Open</span>
                  <div className="text-xl font-bold font-mono text-navy mt-1">
                    {metrics.openCount} <span className="text-xs font-sans font-normal text-muted-foreground">drawings</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded">
                  <Sparkles size={16} />
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 font-sans">
                Waiting for clients to accept on board
              </div>
            </div>
          </div>

          {/* Tabs header */}
          <div className="flex border-b border-border bg-card p-2 rounded gap-2 mb-8">
            {[
              { id: "2D", label: "2D Section", Icon: Layout },
              { id: "3D", label: "3D Section", Icon: Layers },
              { id: "structure", label: "Structure", Icon: HardHat },
              { id: "BOQ", label: "BOQ Section", Icon: FileText },
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
                  <span className="capitalize">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy uppercase">{activeTab} Projects Directory</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage details and work status for drawings under the {activeTab} section.</p>
            </div>
            <button
              onClick={handleAddClick}
              className="btn-primary flex items-center gap-2 cursor-pointer text-xs md:text-sm"
            >
              <Plus size={14} /> Add {activeTab} Project
            </button>
          </div>

          {/* Projects Table */}
          <div className="bg-card border border-border shadow-sm rounded overflow-hidden">
            {isLoadingList ? (
              <div className="flex justify-center items-center py-20 gap-3">
                <Loader2 className="animate-spin text-orange h-6 w-6" />
                <span className="mono-label text-navy text-xs">Querying database rows...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground text-sm font-mono">
                ◤ No projects found. Click "Add" to create the first record.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-left">
                  <thead className="bg-offwhite text-navy font-mono text-[10px] uppercase">
                    <tr>
                      <th className="px-6 py-4">Title / Description</th>
                      {activeTab !== "BOQ" && <th className="px-6 py-4">Area</th>}
                      <th className="px-6 py-4">Status / Client</th>
                      <th className="px-6 py-4">Image preview</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-offwhite/40">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-navy leading-snug">{p.title}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-1 max-w-xs">{p.description}</div>
                          {p.category === "BOQ" && (
                            <div className="text-[10px] text-orange font-mono mt-1 font-semibold">
                              Total Cost: {calculateBOQTotal(p.line_items).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                            </div>
                          )}
                          {p.category !== "BOQ" && p.planning_details && (
                            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
                              * Planning: {p.planning_details}
                            </div>
                          )}
                        </td>
                        {activeTab !== "BOQ" && (
                          <td className="px-6 py-4 font-mono text-xs">{p.area || "—"}</td>
                        )}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-semibold uppercase ${
                            p.status === "open" ? "border-amber text-amber bg-amber/5" :
                            p.status === "assigned" ? "border-orange text-orange bg-orange/5" :
                            p.status === "completed" ? "border-green-600 text-green-600 bg-green-600/5" :
                            "border-navy text-navy bg-navy/5"
                          }`}>
                            {p.status}
                          </span>
                          
                          {p.accepted_by_name && (
                            <div className="text-[10px] text-navy mt-1.5 leading-tight">
                              <strong>Client:</strong> {p.accepted_by_name}<br/>
                              <strong>Phone:</strong> <a href={`tel:${p.accepted_by_phone}`} className="underline hover:text-orange">{p.accepted_by_phone}</a>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt="Drawing"
                              className="h-10 w-16 object-cover border border-border rounded"
                            />
                          ) : (
                            <span className="text-xs font-mono text-muted-foreground italic">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {p.status !== "paid" && (
                            <button
                              onClick={() => handleStatusAdvance(p)}
                              className="inline-flex items-center gap-1 bg-navy text-offwhite hover:bg-orange text-xs px-2.5 py-1 mr-2 transition-colors cursor-pointer"
                              style={{ borderRadius: 2 }}
                            >
                              Status <ArrowRight size={10} />
                            </button>
                          )}
                          {p.category === "BOQ" && (
                            <button
                              onClick={() => printBOQEstimate(p)}
                              className="inline-flex items-center justify-center h-8 w-8 text-orange hover:text-white hover:bg-orange border border-border hover:border-orange mr-2 cursor-pointer transition-colors"
                              style={{ borderRadius: 2 }}
                              title="Print / Save Estimate PDF"
                            >
                              <Download size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => handleEditClick(p)}
                            className="inline-flex items-center justify-center h-8 w-8 text-navy hover:text-orange hover:bg-orange/5 border border-border hover:border-orange mr-2 cursor-pointer transition-colors"
                            style={{ borderRadius: 2 }}
                            title="Edit project"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(p)}
                            className="inline-flex items-center justify-center h-8 w-8 text-red-600 hover:text-white hover:bg-red-600 border border-border hover:border-red-600 cursor-pointer transition-colors"
                            style={{ borderRadius: 2 }}
                            title="Delete project"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-card w-full max-w-3xl border border-border shadow-lg p-6 md:p-8 rounded my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl font-bold text-navy mb-1">
              {isEditing ? `Edit ${activeTab} Project` : `Add New ${activeTab} Project`}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">Enter project drawing specs and layout details.</p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1000 Square Meter House Plan"
                  value={currentProject.title || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                  className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                />
              </div>

              {activeTab !== "BOQ" ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Area</label>
                      <input
                        type="text"
                        placeholder="e.g. 1000 Sq. Meters / 1500 Sq. Ft."
                        value={currentProject.area || ""}
                        onChange={(e) => setCurrentProject({ ...currentProject, area: e.target.value })}
                        className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                      />
                    </div>
                    <div>
                      <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Planning Details</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 BHK, East Facing, Vaastu Compliant"
                        value={currentProject.planning_details || ""}
                        onChange={(e) => setCurrentProject({ ...currentProject, planning_details: e.target.value })}
                        className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Description</label>
                    <textarea
                      rows={3}
                      placeholder="Enter detailed description about layouts and drawing specs..."
                      value={currentProject.description || ""}
                      onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                      className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
                    <div>
                      <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Drawing Image (R2 Storage)</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="R2 image path will auto-populate here after upload"
                        value={currentProject.image_url || ""}
                        className="w-full border border-border bg-offwhite/50 px-3 py-2 text-navy text-sm outline-none rounded text-muted-foreground"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        id="image-file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="image-file"
                        className="btn-ghost text-navy flex items-center gap-2 border border-border px-4 py-2 hover:border-orange hover:text-orange cursor-pointer"
                        style={{ borderRadius: 2 }}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-orange" /> Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={14} /> Upload Image
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Other Related Information</label>
                    <input
                      type="text"
                      placeholder="e.g. Soil reports, structure limits, municipal drawings"
                      value={currentProject.other_info || ""}
                      onChange={(e) => setCurrentProject({ ...currentProject, other_info: e.target.value })}
                      className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mono-label block text-[10px] text-navy font-semibold mb-1">BOQ Description</label>
                    <textarea
                      rows={2}
                      placeholder="Enter details about BOQ calculations, structure specs..."
                      value={currentProject.description || ""}
                      onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                      className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-border">
                      <span className="mono-label block text-[10px] text-navy font-semibold">BOQ Line Items List</span>
                      <button
                        type="button"
                        onClick={addLineItemRow}
                        className="inline-flex items-center gap-1 text-orange hover:text-navy text-xs font-bold cursor-pointer"
                      >
                        <Plus size={12} /> Add Row
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(currentProject.line_items ?? []).map((item, idx) => (
                        <div key={idx} className="grid gap-3 grid-cols-[1.5fr_0.6fr_0.6fr_0.8fr_1fr_auto] items-center bg-offwhite/50 p-2 border border-border rounded">
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Item Name (e.g. Steel Fe500)"
                              value={item.item_name}
                              onChange={(e) => handleLineItemChange(idx, "item_name", e.target.value)}
                              className="w-full border-b border-border bg-transparent px-1 py-1 text-navy text-xs outline-none focus:border-orange"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Unit (e.g. Ton)"
                              value={item.unit}
                              onChange={(e) => handleLineItemChange(idx, "unit", e.target.value)}
                              className="w-full border-b border-border bg-transparent px-1 py-1 text-navy text-xs outline-none focus:border-orange"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              required
                              min="0"
                              step="any"
                              placeholder="Qty"
                              value={item.quantity === 0 ? "" : item.quantity}
                              onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                              className="w-full border-b border-border bg-transparent px-1 py-1 text-navy text-xs font-mono outline-none focus:border-orange"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              required
                              min="0"
                              step="any"
                              placeholder="Rate"
                              value={item.rate === 0 ? "" : item.rate}
                              onChange={(e) => handleLineItemChange(idx, "rate", e.target.value)}
                              className="w-full border-b border-border bg-transparent px-1 py-1 text-navy text-xs font-mono outline-none focus:border-orange"
                            />
                          </div>
                          <div className="text-xs font-mono text-navy font-semibold px-2">
                            {((item.quantity ?? 0) * (item.rate ?? 0)).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => removeLineItemRow(idx)}
                              disabled={(currentProject.line_items ?? []).length <= 1}
                              className="h-6 w-6 inline-flex items-center justify-center text-red-500 hover:bg-red-50 border border-transparent disabled:opacity-30 rounded cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between items-center bg-navy text-offwhite p-3 rounded font-mono text-xs md:text-sm">
                      <span className="mono-label text-amber">Total Estimated Cost:</span>
                      <span className="font-bold">
                        {calculateBOQTotal(currentProject.line_items).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="border border-border text-navy hover:bg-muted px-4 py-2 text-xs md:text-sm font-mono transition-colors cursor-pointer"
                  style={{ borderRadius: 2 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="btn-primary px-4 py-2 text-xs md:text-sm cursor-pointer flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-orange" /> Saving...
                    </>
                  ) : (
                    <>{isEditing ? "Save Changes" : "Create Project"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
