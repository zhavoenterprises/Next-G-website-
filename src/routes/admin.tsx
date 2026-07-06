import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { 
  Plus, Edit2, Trash2, LogOut, Lock, User, Check, AlertCircle, FileText, Layout, Layers, HardHat 
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin Portal · Next G Engineers" }],
  }),
  component: AdminPortal,
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

function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"2D" | "3D" | "Structure" | "BOQ">("2D");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [showFormModal, setShowFormModal] = useState(false);

  // Check login state on mount
  useEffect(() => {
    const logged = sessionStorage.getItem("ng_admin_logged") === "true";
    if (logged) {
      setIsLoggedIn(true);
    }

    // Load projects from localStorage, or load defaults if empty
    const saved = localStorage.getItem("ng_design_projects");
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        setProjects(DEFAULT_PROJECTS);
      }
    } else {
      setProjects(DEFAULT_PROJECTS);
      localStorage.setItem("ng_design_projects", JSON.stringify(DEFAULT_PROJECTS));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "nextgadmin") {
      setIsLoggedIn(true);
      sessionStorage.setItem("ng_admin_logged", "true");
      setError("");
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("ng_admin_logged");
    setUsername("");
    setPassword("");
  };

  const saveProjectsToStorage = (updatedList: Project[]) => {
    setProjects(updatedList);
    localStorage.setItem("ng_design_projects", JSON.stringify(updatedList));
  };

  const handleAddClick = () => {
    setIsEditing(false);
    setCurrentProject({
      category: activeTab,
      title: "",
      area: "",
      planningDetails: "",
      description: "",
      imageUrl: "",
      otherInfo: "",
    });
    setShowFormModal(true);
  };

  const handleEditClick = (proj: Project) => {
    setIsEditing(true);
    setCurrentProject(proj);
    setShowFormModal(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      const filtered = projects.filter((p) => p.id !== id);
      saveProjectsToStorage(filtered);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject.title || !currentProject.area || !currentProject.planningDetails) {
      alert("Please fill in all required fields.");
      return;
    }

    if (isEditing) {
      const updated = projects.map((p) => 
        p.id === currentProject.id ? (currentProject as Project) : p
      );
      saveProjectsToStorage(updated);
    } else {
      const newProj: Project = {
        ...(currentProject as Omit<Project, "id">),
        id: "p_" + Date.now(),
      };
      saveProjectsToStorage([...projects, newProj]);
    }
    setShowFormModal(false);
  };

  const filteredProjects = projects.filter((p) => p.category === activeTab);

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
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Sign in to manage projects in 2D, 3D, Structure, and BOQ sections.
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

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-xs mt-2 bg-red-50 p-3 rounded border border-red-200">
                  <AlertCircle size={14} />
                  <span>{error}</span>
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
              <span className="mono-label block text-[10px] text-amber">Admin Controls</span>
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
          {/* Tabs header */}
          <div className="flex border-b border-border bg-card p-2 rounded gap-2 mb-8">
            {[
              { id: "2D", label: "2D Sections", Icon: Layout },
              { id: "3D", label: "3D Sections", Icon: Layers },
              { id: "Structure", label: "Structure", Icon: HardHat },
              { id: "BOQ", label: "BOQ", Icon: FileText },
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

          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-navy">{activeTab} Drawings Portal</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Manage details for plans under the {activeTab} category.</p>
            </div>
            <button
              onClick={handleAddClick}
              className="btn-primary flex items-center gap-2 cursor-pointer text-xs md:text-sm"
            >
              <Plus size={14} /> Add {activeTab} Project
            </button>
          </div>

          {/* Projects Table / List */}
          <div className="bg-card border border-border shadow-sm rounded overflow-hidden">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground text-sm font-mono">
                ◤ No projects added yet under this section.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-left">
                  <thead className="bg-offwhite text-navy font-mono text-[10px] uppercase">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Area</th>
                      <th className="px-6 py-4">Planning details</th>
                      <th className="px-6 py-4">Image preview</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredProjects.map((p) => (
                      <tr key={p.id} className="hover:bg-offwhite/40">
                        <td className="px-6 py-4 font-semibold text-navy">
                          <div>{p.title}</div>
                          <div className="text-xs font-normal text-muted-foreground mt-1 line-clamp-1 max-w-xs">{p.description}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">{p.area}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">{p.planningDetails}</td>
                        <td className="px-6 py-4">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt="Preview"
                              className="h-10 w-16 object-cover border border-border rounded"
                            />
                          ) : (
                            <span className="text-xs font-mono text-muted-foreground italic">No image</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="inline-flex items-center justify-center h-8 w-8 text-navy hover:text-orange hover:bg-orange/5 border border-border hover:border-orange mr-2 cursor-pointer transition-colors"
                            style={{ borderRadius: 2 }}
                            title="Edit project"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(p.id)}
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
          <div className="bg-card w-full max-w-2xl border border-border shadow-lg p-6 md:p-8 rounded my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-2xl font-bold text-navy mb-1">
              {isEditing ? `Edit ${activeTab} Project` : `Add New ${activeTab} Project`}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">Enter project drawing specs and blueprints details.</p>

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

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Area *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1000 Sq. Meters"
                    value={currentProject.area || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, area: e.target.value })}
                    className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                  />
                </div>
                <div>
                  <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Planning Details *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 BHK, Vaastu Compliant"
                    value={currentProject.planningDetails || ""}
                    onChange={(e) => setCurrentProject({ ...currentProject, planningDetails: e.target.value })}
                    className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                  />
                </div>
              </div>

              <div>
                <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter detailed description about layout design and engineering details..."
                  value={currentProject.description || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                  className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                />
              </div>

              <div>
                <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Drawing Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://images.unsplash.com/... or leave blank"
                  value={currentProject.imageUrl || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, imageUrl: e.target.value })}
                  className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                />
              </div>

              <div>
                <label className="mono-label block text-[10px] text-navy font-semibold mb-1">Other Related Information (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Soil testing reports, municipal layout approvals"
                  value={currentProject.otherInfo || ""}
                  onChange={(e) => setCurrentProject({ ...currentProject, otherInfo: e.target.value })}
                  className="w-full border border-border bg-offwhite px-3 py-2 text-navy text-sm outline-none focus:border-orange rounded"
                />
              </div>

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
                  className="btn-primary px-4 py-2 text-xs md:text-sm cursor-pointer"
                >
                  {isEditing ? "Save Changes" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
