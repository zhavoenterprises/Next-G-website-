import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://nextgconstructions.in";

const siteDataPath = path.join(__dirname, "../src/lib/site-data.ts");
const siteData = fs.readFileSync(siteDataPath, "utf-8");

// Extract slugs using regex
const slugMatches = siteData.matchAll(/slug:\s*["']([^"']+)["']/g);
const slugs = Array.from(slugMatches).map((m) => m[1]);

const entries = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/design-studio", changefreq: "weekly", priority: "0.9" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/testimonials", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.7" },
  ...slugs.map((slug) => ({ path: `/projects/${slug}`, changefreq: "monthly", priority: "0.7" })),
];

const urls = entries.map(
  (e) => `  <url>\n    <loc>${BASE_URL}${e.path}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

const publicDir = path.join(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml);
console.log("Sitemap generated successfully!");
