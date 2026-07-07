import { useState } from "react";
import { COMPANY, whatsappLink } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Enquiry from ${form.name} (${form.phone}${form.email ? ", " + form.email : ""}):\n\n${form.message}`;
    window.open(whatsappLink(msg), "_blank");
    setSent(true);
  };

  return (
    <>
      <title>Contact NG · Madurai & Ramanathapuram Construction Firm</title>
      <meta name="description" content={`Reach Next G Engineers Promoters — call ${COMPANY.phone}, email ${COMPANY.email}, or visit our office in Ramanathapuram.`} />

      <PageHeader
        eyebrow="Contact"
        title={<>Let's build <span className="text-orange">something lasting.</span></>}
        intro="Call, WhatsApp, or send an enquiry — we respond within business hours the same day."
      />

      <section className="bg-offwhite">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          {/* Info */}
          <div className="space-y-4">
            {[
              { Icon: MapPin, label: "Address", value: COMPANY.address, href: COMPANY.mapUrl },
              { Icon: Phone, label: "Phone / WhatsApp", value: COMPANY.phone, href: `tel:${COMPANY.phone}`, mono: true },
              { Icon: Mail, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
              { Icon: Clock, label: "Working hours", value: COMPANY.hours },
            ].map(({ Icon, label, value, href, mono }) => (
              <div key={label} className="tick-frame flex items-start gap-4 border border-border bg-card p-5">
                <div className="grid h-11 w-11 shrink-0 place-items-center bg-navy text-orange" style={{ borderRadius: 2 }}>
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="mono-label text-orange">{label}</div>
                  {href ? (
                    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`mt-1 block break-words text-navy hover:text-orange ${mono ? "font-mono" : ""}`}>
                      {value}
                    </a>
                  ) : (
                    <div className="mt-1 text-navy">{value}</div>
                  )}
                </div>
              </div>
            ))}

            <a href={whatsappLink("Hi NG, I'd like to enquire about a project.")} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
              <MessageCircle size={16} /> Chat on WhatsApp
            </a>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="tick-frame border border-border bg-card p-6 md:p-8">
            <div className="mono-label text-orange">◤ Enquiry form</div>
            <h2 className="mt-2 font-display text-2xl font-bold text-navy">Send us a message</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label="Phone" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
              <div className="md:col-span-2">
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              </div>
              <div className="md:col-span-2">
                <label className="mono-label mb-2 block text-muted-foreground">Message *</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full border border-border bg-offwhite px-4 py-3 text-navy outline-none transition-colors focus:border-orange"
                  style={{ borderRadius: 2 }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary mt-6 w-full">
              <Send size={16} /> Send enquiry via WhatsApp
            </button>

            {sent && (
              <div className="mono-label mt-4 text-orange">◤ Opening WhatsApp — thank you.</div>
            )}
          </form>
        </div>

        {/* Map */}
        <div className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
          <div className="tick-frame overflow-hidden border border-border bg-card">
            <iframe
              title="NG office location"
              src={COMPANY.mapEmbed}
              width="100%"
              height="420"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Field({
  label, value, onChange, type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mono-label mb-2 block text-muted-foreground">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border bg-offwhite px-4 py-3 text-navy outline-none transition-colors focus:border-orange"
        style={{ borderRadius: 2 }}
      />
    </div>
  );
}
