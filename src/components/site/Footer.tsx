import { Link } from "@tanstack/react-router";
import { COMPANY } from "@/lib/site-data";
import { Instagram, Facebook, Youtube, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-graphite text-offwhite">
      <div className="pointer-events-none absolute inset-0 bp-grid-dark opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center bg-orange text-white" style={{ borderRadius: 2 }}>
              <span className="font-display text-lg font-bold">NG</span>
            </span>
            <div>
              <div className="mono-label text-amber">Next G Engineers</div>
              <div className="font-display text-lg font-semibold">Promoters Pvt Ltd</div>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm text-offwhite/70">
            Building Madurai's future with precision, integrity and 11+ years of hands-on engineering.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a href={COMPANY.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center border border-white/15 transition-colors hover:border-orange hover:text-orange" style={{ borderRadius: 2 }}>
              <Instagram size={16} />
            </a>
            <a href={COMPANY.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center border border-white/15 transition-colors hover:border-orange hover:text-orange" style={{ borderRadius: 2 }}>
              <Facebook size={16} />
            </a>
            <a href={COMPANY.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center border border-white/15 transition-colors hover:border-orange hover:text-orange" style={{ borderRadius: 2 }}>
              <Youtube size={16} />
            </a>
          </div>
        </div>

        <div>
          <div className="mono-label text-amber">Navigate</div>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/about", "About"],
              ["/projects", "Projects"],
              ["/design-studio", "Design Studio"],
              ["/services", "Services"],
              ["/testimonials", "Testimonials"],
              ["/contact", "Contact"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="text-offwhite/80 transition-colors hover:text-orange">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mono-label text-amber">Contact</div>
          <ul className="mt-4 space-y-3 text-sm text-offwhite/80">
            <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-orange" />{COMPANY.address}</li>
            <li className="flex gap-2"><Phone size={16} className="mt-0.5 shrink-0 text-orange" /><a href={`tel:${COMPANY.phone}`} className="font-mono">{COMPANY.phone}</a></li>
            <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-orange" /><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
            <li className="mono-label pt-1 text-offwhite/60">Hours · {COMPANY.hours}</li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-offwhite/50 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</div>
          <div className="mono-label">CIN · Est. {COMPANY.established} · Madurai · Ramanathapuram</div>
        </div>
      </div>
    </footer>
  );
}
