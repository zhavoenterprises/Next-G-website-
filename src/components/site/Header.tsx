import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { COMPANY } from "@/lib/site-data";
import { Menu, X, Phone } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/projects", label: "Projects" },
  { to: "/design-studio", label: "Design Studio" },
  { to: "/services", label: "Services" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/contact", label: "Contact" },
  { to: "/admin", label: "Admin" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        scrolled ? "bg-offwhite/95 backdrop-blur border-border" : "bg-offwhite/70 backdrop-blur border-transparent"
      }`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center bg-navy text-offwhite" style={{ borderRadius: 2 }}>
            <span className="font-display text-lg font-bold leading-none">NG</span>
          </span>
          <span className="min-w-0">
            <span className="mono-label block text-muted-foreground">Next G Engineers</span>
            <span className="block truncate font-display text-sm font-semibold text-navy">Promoters Pvt Ltd</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden xl:flex items-center gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-orange" }}
                className="px-3 py-2 text-sm font-medium text-navy transition-colors hover:text-orange"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <a
            href={`tel:${COMPANY.phone}`}
            aria-label="Call NG"
            className="grid h-9 w-9 place-items-center border border-border text-navy transition-colors hover:border-orange hover:text-orange xl:hidden"
            style={{ borderRadius: 2 }}
          >
            <Phone size={16} />
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center border border-border text-navy xl:hidden"
            style={{ borderRadius: 2 }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-offwhite xl:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-5 py-2 lg:px-8">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "text-orange" }}
                className="border-b border-border/60 py-3 text-sm font-medium text-navy last:border-b-0"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
