import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  invert = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  invert?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <div className={`mono-label ${invert ? "text-amber" : "text-orange"}`}>
          <span className="mr-2">◤</span>{eyebrow}
        </div>
      )}
      <h2 className={`mt-3 text-3xl font-bold leading-[1.05] md:text-4xl lg:text-5xl ${invert ? "text-offwhite" : "text-navy"}`}>
        {title}
      </h2>
      {intro && (
        <p className={`mt-4 text-base md:text-lg ${invert ? "text-offwhite/70" : "text-muted-foreground"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
