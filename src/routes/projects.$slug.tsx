import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { COMPANY, PROJECTS, whatsappLink } from "@/lib/site-data";
import { PageHeader } from "@/components/site/PageHeader";
import { Download, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = PROJECTS.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Project not found · NG" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.project;
    return {
      meta: [
        { title: `${p.name} · ${p.location} — NG Projects` },
        { name: "description", content: `${p.type} in ${p.location} — status: ${p.status}. Delivered by Next G Engineers Promoters.` },
        { property: "og:title", content: `${p.name} · NG` },
        { property: "og:url", content: `/projects/${p.slug}` },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: `/projects/${p.slug}` }],
    };
  },
  component: ProjectDetail,
  notFoundComponent: () => (
    <div className="grid min-h-[60vh] place-items-center px-4 text-center">
      <div>
        <div className="mono-label text-orange">◤ Not found</div>
        <h1 className="mt-3 font-display text-3xl font-bold text-navy">This project sheet doesn't exist</h1>
        <Link to="/projects" className="btn-primary mt-6"><ArrowLeft size={16} /> Back to projects</Link>
      </div>
    </div>
  ),
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const msg = `Hi NG, I'd like a brochure/details for ${project.name}, ${project.location}.`;

  return (
    <>
      <PageHeader
        eyebrow={`${project.type} · ${project.location}`}
        title={project.name}
        intro={`Status: ${project.status}. Detailed drawings, brochure and specifications available on request.`}
      />

      <section className="bg-offwhite">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.4fr_0.9fr] lg:px-8">
          {/* Gallery placeholders */}
          <div>
            <div className="tick-frame relative aspect-[4/3] overflow-hidden border border-border bg-navy">
              <div className="absolute inset-0 bp-grid-dark opacity-70" />
              <div className="absolute inset-6 border border-amber/30" />
              <div className="absolute inset-x-6 top-6 mono-label flex justify-between text-amber/80">
                <span>NG · {project.slug.toUpperCase()}</span>
                <span>PRIMARY VIEW</span>
              </div>
              <div className="absolute inset-x-6 bottom-6 text-offwhite">
                <div className="font-display text-3xl font-semibold">{project.name}</div>
                <div className="mono-label text-amber">Image pending — awaiting site photography</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="relative aspect-[4/3] overflow-hidden border border-border bg-navy/90">
                  <div className="absolute inset-0 bp-grid-dark opacity-60" />
                  <div className="absolute inset-3 border border-amber/20" />
                  <div className="mono-label absolute left-3 top-3 text-amber/70">VIEW 0{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Meta */}
          <aside>
            <div className="tick-frame border border-border bg-card p-6">
              <div className="mono-label text-orange">◤ Project data sheet</div>
              <dl className="mt-4 divide-y divide-border text-sm">
                {[
                  ["Project", project.name],
                  ["Location", project.location],
                  ["Type", project.type],
                  ["Status", project.status],
                  ["Area", project.area ?? "On request"],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-3 py-3">
                    <dt className="mono-label text-muted-foreground">{k}</dt>
                    <dd className="text-navy">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-muted-foreground">
                {project.description ?? "Full project description, specifications and pricing available on request. Contact us for the detailed brochure."}
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a href={whatsappLink(msg)} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <Download size={16} /> Request Brochure
                </a>
                <a href={`tel:${COMPANY.phone}`} className="btn-ghost text-navy">Call {COMPANY.phone}</a>
              </div>
            </div>

            <Link to="/projects" className="mono-label mt-6 inline-flex items-center gap-2 text-navy hover:text-orange">
              <ArrowLeft size={14} /> Back to all projects
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
