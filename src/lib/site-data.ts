// ============================================================
// NG — Site Content
// All editable content lives here. No database required.
// To update: edit the arrays below and save.
// ============================================================

export const COMPANY = {
  name: "Next G Engineers Promoters Pvt Ltd",
  short: "NG",
  tagline: "Building Madurai's Future, One Project at a Time",
  established: 2020,
  yearsExperience: 11,
  phone: "8248386836",
  phoneIntl: "918248386836",
  email: "nextgengineer@gmail.com",
  hours: "10am – 7pm",
  address: "5/328A, Thillainayagapuram, Peravoor Panchayat, Ramanathapuram",
  mapUrl: "https://maps.app.goo.gl/3E3YjAQtnccZMEJE7?g_st=aw",
  mapEmbed:
    "https://www.google.com/maps?q=Peravoor+Panchayat+Ramanathapuram&output=embed",
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
  },
};

export const STATS = [
  { value: "11+", label: "Years of Experience" },
  { value: "34", label: "Projects Completed" },
  { value: "48,800+", label: "Sq.Ft Delivered" },
  { value: "01", label: "Excellence in Engineering Award" },
];

export type Project = {
  slug: string;
  name: string;
  location: string;
  status: "Completed" | "Ongoing" | "Upcoming";
  type: string;
  area?: string;
  description?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "al-ameen-nagar",
    name: "Al Ameen Nagar",
    location: "Madurai",
    status: "Completed",
    type: "Residential Layout",
  },
  {
    slug: "thirunagar",
    name: "Thirunagar",
    location: "Madurai",
    status: "Ongoing",
    type: "Residential Project",
  },
  {
    slug: "bharathi-nagar",
    name: "Bharathi Nagar",
    location: "Ramanathapuram",
    status: "Completed",
    type: "Residential Layout",
  },
  {
    slug: "keelakarai-north-street",
    name: "Keelakarai — North Street",
    location: "Keelakarai",
    status: "Ongoing",
    type: "Commercial Development",
  },
  {
    slug: "vaigai-nagar",
    name: "Vaigai Nagar",
    location: "Paramakudi",
    status: "Completed",
    type: "Residential Layout",
  },
];

export const SERVICES = [
  {
    title: "Residential Construction",
    body: "Ground-up residential builds executed with disciplined project management and transparent costing.",
  },
  {
    title: "Villa & Independent Houses",
    body: "Custom independent homes designed and built for families who want long-term value, not shortcuts.",
  },
  {
    title: "Commercial Construction",
    body: "Retail, office and mixed-use commercial structures delivered on schedule and to code.",
  },
  {
    title: "Plotted Development & Layouts",
    body: "End-to-end plotted layouts — approvals, infrastructure and handover, ready for construction.",
  },
];

export const DESIGN_SERVICES = [
  "Architecture — elevation & interior",
  "Structural drawing",
  "MEP drawing",
  "Land survey",
  "BOQ (Bill of Quantities)",
];

export const TEAM = [
  {
    name: "Megathaf Halima S",
    role: "Founder & Managing Director",
    bio: "Leads the firm's vision and client relationships.",
  },
  {
    name: "Mohammed Umar",
    role: "Project Engineer",
    bio: "Oversees project planning, scheduling and execution.",
  },
  {
    name: "Sahubar",
    role: "Site Engineer",
    bio: "Manages on-site quality, safety and daily progress.",
  },
];

export const VALUES = [
  { title: "Trust", body: "Earned over 11+ years of honest execution." },
  { title: "Integrity", body: "Transparent costing, timelines and communication." },
  { title: "Excellence", body: "Engineering discipline in every drawing and pour." },
  { title: "Timely Delivery", body: "Projects handed over on the date we commit to." },
];

export const TESTIMONIALS = [
  {
    name: "Tangalakshmi",
    project: "Residential Project",
    quote: "[Awaiting client quote]",
  },
  {
    name: "Ameena Beevi",
    project: "Residential Project",
    quote: "[Awaiting client quote]",
  },
  {
    name: "Fazila",
    project: "Commercial Project",
    quote: "[Awaiting client quote]",
  },
];

// ============================================================
// DESIGN STUDIO — Available plots
// Add new plots by pushing to this array.
// ============================================================
export type Plot = {
  id: string;
  location: string;
  lengthFt: number;
  breadthFt: number;
  designFee: number; // ₹
};

export const PLOTS: Plot[] = [
  { id: "anna-nagar", location: "Anna Nagar, Madurai", lengthFt: 40, breadthFt: 60, designFee: 15000 },
  { id: "kk-nagar", location: "K.K. Nagar, Madurai", lengthFt: 30, breadthFt: 45, designFee: 9500 },
  { id: "vilangudi", location: "Vilangudi, Madurai", lengthFt: 50, breadthFt: 80, designFee: 22000 },
];

export function whatsappLink(message: string) {
  return `https://wa.me/${COMPANY.phoneIntl}?text=${encodeURIComponent(message)}`;
}
