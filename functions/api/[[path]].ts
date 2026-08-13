import bcrypt from "bcryptjs";

interface Env {
  DB: any;
  BUCKET: any;
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET?: string;
  // Optional bindings — features below activate only when these are configured.
  TURNSTILE_SECRET?: string; // Cloudflare Turnstile secret key (bot protection)
  RATE_LIMIT?: any; // KV namespace binding used for login/accept rate limiting
}

// ----------------------------------------------------
// SECURITY CONSTANTS
// ----------------------------------------------------
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

// Upload restrictions (item: restrict file uploads)
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// Input length caps (item: validate input / block field tampering)
const LIMIT = {
  title: 200,
  area: 120,
  text: 8000,
  info: 5000,
  name: 120,
  phone: 25,
  note: 4000,
  itemName: 200,
  unit: 40,
};

let dbInitialized = false;

async function initializeDatabase(db: any) {
  if (dbInitialized) return;

  // Create freelancer board tables
  await db.exec(
    "CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT CHECK(category IN ('2D','3D','structure')), title TEXT NOT NULL, area TEXT, planning_details TEXT, description TEXT, image_url TEXT, other_info TEXT, status TEXT DEFAULT 'open' CHECK(status IN ('open','assigned','completed','paid')), accepted_by_name TEXT, accepted_by_phone TEXT, accepted_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);",
  );

  await db.exec(
    "CREATE TABLE IF NOT EXISTS boq_projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'open' CHECK(status IN ('open','assigned','completed','paid')), accepted_by_name TEXT, accepted_by_phone TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);",
  );

  await db.exec(
    "CREATE TABLE IF NOT EXISTS boq_line_items (id INTEGER PRIMARY KEY AUTOINCREMENT, boq_project_id INTEGER REFERENCES boq_projects(id) ON DELETE CASCADE, item_name TEXT, unit TEXT, quantity REAL, rate REAL, amount REAL);",
  );

  // Clean client_projects if it is the old schema (missing category)
  try {
    const clientProjectsSchema = await db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='client_projects'")
      .first();
    if (
      clientProjectsSchema &&
      clientProjectsSchema.sql &&
      !clientProjectsSchema.sql.includes("category")
    ) {
      await db.exec("DROP TABLE IF EXISTS progress_logs;");
      await db.exec("DROP TABLE IF EXISTS client_projects;");
    }
  } catch (e) {}

  // Create decoupled client tracker tables
  await db.exec(
    "CREATE TABLE IF NOT EXISTS client_projects (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT CHECK(category IN ('2D','3D','structure','BOQ')), title TEXT NOT NULL, area TEXT, planning_details TEXT, description TEXT, image_url TEXT, other_info TEXT, status TEXT DEFAULT 'assigned' CHECK(status IN ('assigned','completed','paid')), client_name TEXT, client_phone TEXT, progress_percent INTEGER DEFAULT 0, source_file_url TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);",
  );

  // Drop old progress_logs if it links to wrong table (projects)
  try {
    const logTableSchema = await db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='progress_logs'")
      .first();
    if (
      logTableSchema &&
      logTableSchema.sql &&
      logTableSchema.sql.includes("REFERENCES projects")
    ) {
      await db.exec("DROP TABLE progress_logs;");
    }
  } catch (e) {}

  // Create progress_logs table referencing client_projects
  await db.exec(
    "CREATE TABLE IF NOT EXISTS progress_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, note TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_id) REFERENCES client_projects(id) ON DELETE CASCADE);",
  );

  // Clean freelancer projects table by dropping accidental columns if they exist
  try {
    const projectsSchema = await db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='projects'")
      .first();
    if (projectsSchema && projectsSchema.sql) {
      if (projectsSchema.sql.includes("progress_percent")) {
        await db.exec("ALTER TABLE projects DROP COLUMN progress_percent;").catch(() => {});
      }
      if (projectsSchema.sql.includes("source_file_url")) {
        await db.exec("ALTER TABLE projects DROP COLUMN source_file_url;").catch(() => {});
      }
      if (projectsSchema.sql.includes("progress_notes")) {
        await db.exec("ALTER TABLE projects DROP COLUMN progress_notes;").catch(() => {});
      }
    }
  } catch (e) {}

  // Clean freelancer boq_projects table by dropping accidental columns if they exist
  try {
    const boqSchema = await db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='boq_projects'")
      .first();
    if (boqSchema && boqSchema.sql) {
      if (boqSchema.sql.includes("progress_percent")) {
        await db.exec("ALTER TABLE boq_projects DROP COLUMN progress_percent;").catch(() => {});
      }
      if (boqSchema.sql.includes("source_file_url")) {
        await db.exec("ALTER TABLE boq_projects DROP COLUMN source_file_url;").catch(() => {});
      }
      if (boqSchema.sql.includes("progress_notes")) {
        await db.exec("ALTER TABLE boq_projects DROP COLUMN progress_notes;").catch(() => {});
      }
    }
  } catch (e) {}

  dbInitialized = true;
}

// ----------------------------------------------------
// SESSION SIGNING (HMAC-SHA256)
// ----------------------------------------------------
async function signSession(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Constant-time string comparison to avoid signature timing leaks.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyAdminSession(request: Request, env: Env): Promise<boolean> {
  // Fail closed: without a configured secret, no session can be trusted.
  const secret = env.SESSION_SECRET;
  if (!secret) return false;

  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith("ng_admin_session="));
  if (!sessionCookie) return false;

  const cookieValue = decodeURIComponent(sessionCookie.split("=")[1] ?? "");
  const parts = cookieValue.split(":");
  if (parts.length !== 3) return false;

  const [userWord, timestampStr, signature] = parts;
  if (userWord !== "admin") return false;

  const timestamp = Number(timestampStr);
  if (isNaN(timestamp) || Date.now() - timestamp > SESSION_TTL_MS) {
    return false;
  }

  const expectedSignature = await signSession(`admin:${timestampStr}`, secret);
  return timingSafeEqual(signature, expectedSignature);
}

// ----------------------------------------------------
// BOT PROTECTION (Cloudflare Turnstile — gate, don't replace)
// ----------------------------------------------------
async function verifyTurnstile(
  token: unknown,
  secret: string,
  ip: string,
  expectedHostname: string,
  expectedAction: string,
): Promise<boolean> {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10_000),
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });
    if (!r.ok) return false;
    const data: any = await r.json();
    if (!data.success) return false;
    if (expectedAction && data.action !== expectedAction) return false;
    if (expectedHostname && data.hostname !== expectedHostname) return false;
    return true;
  } catch {
    return false; // network/timeout/non-JSON — fail closed
  }
}

// ----------------------------------------------------
// RATE LIMITING (KV-backed; no-op until RATE_LIMIT binding exists)
// ----------------------------------------------------
async function rateLimit(
  env: Env,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  if (!env.RATE_LIMIT) return true; // not configured — allow
  const k = `rl:${key}`;
  try {
    const current = await env.RATE_LIMIT.get(k);
    const count = current ? parseInt(current, 10) : 0;
    if (count >= limit) return false;
    await env.RATE_LIMIT.put(k, String(count + 1), { expirationTtl: windowSeconds });
    return true;
  } catch {
    return true; // KV error — do not lock users out
  }
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

// ----------------------------------------------------
// INPUT VALIDATION HELPERS
// ----------------------------------------------------
function requiredString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > max) return null;
  return trimmed;
}

function optionalString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

function isValidPhone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return /^[+\d][\d\s\-()]{6,24}$/.test(trimmed);
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = Number(value);
  if (!isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function safeNumber(value: unknown, min = 0): number {
  const n = Number(value);
  if (!isFinite(n) || n < min) return min;
  return n;
}

// ----------------------------------------------------
// RESPONSE (JSON + security headers + locked-down CORS)
// ----------------------------------------------------
function buildHeaders(url: URL, extra: Record<string, string>): Record<string, string> {
  return {
    "content-type": "application/json",
    // Same-origin only. The SPA and API share an origin, so no wildcard needed.
    "Access-Control-Allow-Origin": url.origin,
    "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
    // Security headers
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "Cache-Control": "no-store",
    ...extra,
  };
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
  params: { path?: string[] };
}) => {
  const { request, env } = context;
  const url = new URL(request.url);

  const apiResponse = (data: any, status = 200, headers: Record<string, string> = {}) =>
    new Response(JSON.stringify(data), { status, headers: buildHeaders(url, headers) });

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: buildHeaders(url, {}) });
  }

  // D1 Binding validation
  if (!env.DB) {
    return apiResponse(
      {
        error:
          "D1 Database binding 'DB' is missing. Please configure it in your Cloudflare Pages settings.",
      },
      500,
    );
  }

  // Initialize DB tables automatically if needed
  try {
    await initializeDatabase(env.DB);
  } catch (err: any) {
    return apiResponse({ error: `Database initialization failed: ${err.message}` }, 500);
  }

  const clientIp = getClientIp(request);

  // ----------------------------------------------------
  // PUBLIC ROUTES
  // ----------------------------------------------------

  // GET /api/projects?category=2D  (public: only display columns, no contact info)
  if (url.pathname === "/api/projects" && request.method === "GET") {
    const category = url.searchParams.get("category");
    if (!category || !["2D", "3D", "structure"].includes(category)) {
      return apiResponse({ error: "Invalid category. Must be '2D', '3D', or 'structure'" }, 400);
    }
    try {
      const { results } = await env.DB.prepare(
        "SELECT id, category, title, area, planning_details, description, image_url, other_info, status, created_at FROM projects WHERE category = ? AND status = 'open' ORDER BY id DESC",
      )
        .bind(category)
        .all();
      return apiResponse(results);
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // GET /api/boq  (public: only display columns, no contact info)
  if (url.pathname === "/api/boq" && request.method === "GET") {
    try {
      const { results: projects } = await env.DB.prepare(
        "SELECT id, title, description, status, created_at FROM boq_projects WHERE status = 'open' ORDER BY id DESC",
      ).all();
      const { results: items } = await env.DB.prepare(
        "SELECT id, boq_project_id, item_name, unit, quantity, rate, amount FROM boq_line_items",
      ).all();

      const itemsByProject: Record<number, any[]> = {};
      items.forEach((item: any) => {
        if (!itemsByProject[item.boq_project_id]) {
          itemsByProject[item.boq_project_id] = [];
        }
        itemsByProject[item.boq_project_id].push(item);
      });

      const responseData = projects.map((p: any) => ({
        ...p,
        line_items: itemsByProject[p.id] ?? [],
      }));

      return apiResponse(responseData);
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // POST /api/projects/:id/accept
  if (
    url.pathname.startsWith("/api/projects/") &&
    url.pathname.endsWith("/accept") &&
    request.method === "POST"
  ) {
    // Rate limit accept spam per IP (no-op until RATE_LIMIT KV is bound).
    if (!(await rateLimit(env, `accept:${clientIp}`, 30, 3600))) {
      return apiResponse({ error: "Too many requests. Please try again later." }, 429);
    }

    const parts = url.pathname.split("/");
    const id = parseInt(parts[3], 10);
    const isBoq = url.searchParams.get("type") === "boq";

    if (isNaN(id)) {
      return apiResponse({ error: "Invalid project ID" }, 400);
    }

    try {
      const body = (await request.json()) as { name?: string; phone?: string };
      const name = requiredString(body.name, LIMIT.name);
      if (!name) {
        return apiResponse({ error: "A valid name is required" }, 400);
      }
      if (!isValidPhone(body.phone)) {
        return apiResponse({ error: "A valid phone number is required" }, 400);
      }
      const phone = (body.phone as string).trim();

      if (isBoq) {
        // Atomic status update check for BOQ
        const result = await env.DB.prepare(
          "UPDATE boq_projects SET status='assigned', accepted_by_name=?, accepted_by_phone=? WHERE id=? AND status='open'",
        )
          .bind(name, phone, id)
          .run();

        if (result.meta.changes === 0) {
          return apiResponse({ error: "already taken" }, 409);
        }
        return apiResponse({ success: true });
      } else {
        // Atomic status update check for Standard (2D, 3D, structure)
        const result = await env.DB.prepare(
          "UPDATE projects SET status='assigned', accepted_by_name=?, accepted_by_phone=?, accepted_at=datetime('now') WHERE id=? AND status='open'",
        )
          .bind(name, phone, id)
          .run();

        if (result.meta.changes === 0) {
          return apiResponse({ error: "already taken" }, 409);
        }
        return apiResponse({ success: true });
      }
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // GET /api/images/:filename (R2 image server proxy)
  if (url.pathname.startsWith("/api/images/")) {
    if (!env.BUCKET) {
      return new Response("R2 image storage binding 'BUCKET' is missing.", { status: 500 });
    }
    // Reject path traversal / nested keys — only a flat filename is valid.
    const filename = url.pathname.replace("/api/images/", "");
    if (!/^[A-Za-z0-9._-]+$/.test(filename)) {
      return new Response("Invalid image name", { status: 400 });
    }
    try {
      const object = await env.BUCKET.get(filename);
      if (!object) {
        return new Response("Image not found", { status: 404 });
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000");
      headers.set("X-Content-Type-Options", "nosniff");
      return new Response(object.body, { headers });
    } catch (e: any) {
      return new Response(e.message, { status: 500 });
    }
  }

  // ----------------------------------------------------
  // ADMIN AUTH ROUTES
  // ----------------------------------------------------

  // POST /api/admin/login
  if (url.pathname === "/api/admin/login" && request.method === "POST") {
    // Fail closed if the signing secret is not configured.
    const secret = env.SESSION_SECRET;
    if (!secret) {
      return apiResponse(
        { error: "SESSION_SECRET environment variable is not configured on Cloudflare." },
        500,
      );
    }

    const passwordHash = env.ADMIN_PASSWORD_HASH;
    if (!passwordHash) {
      return apiResponse(
        { error: "ADMIN_PASSWORD_HASH environment variable is not configured on Cloudflare." },
        500,
      );
    }

    // Brute-force protection: rate limit per IP (no-op until RATE_LIMIT KV is bound).
    if (!(await rateLimit(env, `login:${clientIp}`, 10, 900))) {
      return apiResponse({ error: "Too many login attempts. Please try again later." }, 429);
    }

    try {
      const body = (await request.json()) as {
        username?: string;
        password?: string;
        turnstileToken?: string;
      };

      // Bot protection — enforced only when TURNSTILE_SECRET is configured.
      if (env.TURNSTILE_SECRET) {
        const ok = await verifyTurnstile(
          body.turnstileToken,
          env.TURNSTILE_SECRET,
          clientIp,
          url.hostname,
          "admin_login",
        );
        if (!ok) {
          return apiResponse({ error: "Bot verification failed. Please try again." }, 403);
        }
      }

      if (body.username !== "admin" || !body.password) {
        return apiResponse({ error: "Invalid username or password credentials" }, 401);
      }

      const match = bcrypt.compareSync(body.password, passwordHash);
      if (!match) {
        return apiResponse({ error: "Invalid username or password credentials" }, 401);
      }

      const timestamp = Date.now();
      const signature = await signSession(`admin:${timestamp}`, secret);
      const cookieValue = `admin:${timestamp}:${signature}`;

      return apiResponse({ success: true }, 200, {
        "Set-Cookie": `ng_admin_session=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
      });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // POST /api/admin/logout
  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    return apiResponse({ success: true }, 200, {
      "Set-Cookie": `ng_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`,
    });
  }

  // GET /api/admin/check
  if (url.pathname === "/api/admin/check" && request.method === "GET") {
    const authenticated = await verifyAdminSession(request, env);
    return apiResponse({ authenticated });
  }

  // ----------------------------------------------------
  // ADMIN SERVICE INTERCEPTOR (AUTHENTICATED)
  // ----------------------------------------------------
  const isAuthenticated = await verifyAdminSession(request, env);
  if (!isAuthenticated) {
    return apiResponse({ error: "Unauthorized access" }, 401);
  }

  // GET /api/admin/projects/all
  if (url.pathname === "/api/admin/projects/all" && request.method === "GET") {
    try {
      const { results: standard } = await env.DB.prepare(
        "SELECT * FROM projects ORDER BY id DESC",
      ).all();
      const { results: boqProjects } = await env.DB.prepare(
        "SELECT * FROM boq_projects ORDER BY id DESC",
      ).all();
      const { results: boqItems } = await env.DB.prepare("SELECT * FROM boq_line_items").all();

      const itemsByProject: Record<number, any[]> = {};
      boqItems.forEach((item: any) => {
        if (!itemsByProject[item.boq_project_id]) {
          itemsByProject[item.boq_project_id] = [];
        }
        itemsByProject[item.boq_project_id].push(item);
      });

      const boqWithItems = boqProjects.map((p: any) => ({
        ...p,
        category: "BOQ",
        line_items: itemsByProject[p.id] ?? [],
      }));

      return apiResponse({
        standard,
        boq: boqWithItems,
      });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // POST /api/admin/upload (Image upload to R2) — type + size restricted
  if (url.pathname === "/api/admin/upload" && request.method === "POST") {
    if (!env.BUCKET) {
      return apiResponse({ error: "R2 Bucket binding 'BUCKET' is missing." }, 500);
    }
    try {
      const formData = await request.formData();
      const file = formData.get("file") as File;
      if (!file) {
        return apiResponse({ error: "No file uploaded" }, 400);
      }

      // Enforce a size cap.
      if (file.size > MAX_UPLOAD_BYTES) {
        return apiResponse({ error: "File too large. Maximum size is 5 MB." }, 413);
      }

      // Enforce an image content-type allowlist; derive the extension from the
      // allowlist (never trust the client-supplied filename extension).
      const extension = ALLOWED_IMAGE_TYPES[file.type];
      if (!extension) {
        return apiResponse({ error: "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF." }, 415);
      }

      const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${extension}`;
      const arrayBuffer = await file.arrayBuffer();

      await env.BUCKET.put(uniqueFilename, arrayBuffer, {
        httpMetadata: { contentType: file.type },
      });

      return apiResponse({ url: `/api/images/${uniqueFilename}` });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // POST /api/admin/projects
  if (url.pathname === "/api/admin/projects" && request.method === "POST") {
    try {
      const body = (await request.json()) as any;

      if (body.category === "BOQ") {
        const title = requiredString(body.title, LIMIT.title);
        if (!title) {
          return apiResponse({ error: "A valid title is required" }, 400);
        }
        // Create BOQ project
        const info = await env.DB.prepare(
          "INSERT INTO boq_projects (title, description) VALUES (?, ?)",
        )
          .bind(title, optionalString(body.description, LIMIT.text))
          .run();

        const boqId = info.meta.last_row_id;

        if (body.line_items && Array.isArray(body.line_items)) {
          for (const item of body.line_items) {
            const quantity = safeNumber(item.quantity);
            const rate = safeNumber(item.rate);
            await env.DB.prepare(
              "INSERT INTO boq_line_items (boq_project_id, item_name, unit, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)",
            )
              .bind(
                boqId,
                optionalString(item.item_name, LIMIT.itemName),
                optionalString(item.unit, LIMIT.unit),
                quantity,
                rate,
                quantity * rate,
              )
              .run();
          }
        }
        return apiResponse({ success: true, id: boqId });
      } else {
        // Create Standard project
        if (!["2D", "3D", "structure"].includes(body.category)) {
          return apiResponse({ error: "Invalid category" }, 400);
        }
        const title = requiredString(body.title, LIMIT.title);
        if (!title) {
          return apiResponse({ error: "A valid title is required" }, 400);
        }

        await env.DB.prepare(
          "INSERT INTO projects (category, title, area, planning_details, description, image_url, other_info) VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
          .bind(
            body.category,
            title,
            optionalString(body.area, LIMIT.area),
            optionalString(body.planning_details, LIMIT.text),
            optionalString(body.description, LIMIT.text),
            optionalString(body.image_url, LIMIT.info),
            optionalString(body.other_info, LIMIT.info),
          )
          .run();

        return apiResponse({ success: true });
      }
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // PATCH /api/admin/projects/:id (Edits or soft-deletes a project)
  if (
    url.pathname.startsWith("/api/admin/projects/") &&
    !url.pathname.endsWith("/status") &&
    request.method === "PATCH"
  ) {
    const parts = url.pathname.split("/");
    const id = parseInt(parts[4], 10);
    const isBoq = url.searchParams.get("type") === "boq";

    if (isNaN(id)) {
      return apiResponse({ error: "Invalid project ID" }, 400);
    }

    try {
      const body = (await request.json()) as any;

      if (body.action === "delete") {
        if (isBoq) {
          await env.DB.prepare("DELETE FROM boq_line_items WHERE boq_project_id = ?")
            .bind(id)
            .run();
          await env.DB.prepare("DELETE FROM boq_projects WHERE id = ?").bind(id).run();
        } else {
          await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
        }
        return apiResponse({ success: true });
      }

      // Edit action
      const title = requiredString(body.title, LIMIT.title);
      if (!title) {
        return apiResponse({ error: "A valid title is required" }, 400);
      }

      if (isBoq) {
        await env.DB.prepare("UPDATE boq_projects SET title = ?, description = ? WHERE id = ?")
          .bind(title, optionalString(body.description, LIMIT.text), id)
          .run();

        await env.DB.prepare("DELETE FROM boq_line_items WHERE boq_project_id = ?").bind(id).run();

        if (body.line_items && Array.isArray(body.line_items)) {
          for (const item of body.line_items) {
            const quantity = safeNumber(item.quantity);
            const rate = safeNumber(item.rate);
            await env.DB.prepare(
              "INSERT INTO boq_line_items (boq_project_id, item_name, unit, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)",
            )
              .bind(
                id,
                optionalString(item.item_name, LIMIT.itemName),
                optionalString(item.unit, LIMIT.unit),
                quantity,
                rate,
                quantity * rate,
              )
              .run();
          }
        }
      } else {
        await env.DB.prepare(
          "UPDATE projects SET title = ?, area = ?, planning_details = ?, description = ?, image_url = ?, other_info = ? WHERE id = ?",
        )
          .bind(
            title,
            optionalString(body.area, LIMIT.area),
            optionalString(body.planning_details, LIMIT.text),
            optionalString(body.description, LIMIT.text),
            optionalString(body.image_url, LIMIT.info),
            optionalString(body.other_info, LIMIT.info),
            id,
          )
          .run();
      }
      return apiResponse({ success: true });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // PATCH /api/admin/projects/:id/status
  if (
    url.pathname.startsWith("/api/admin/projects/") &&
    url.pathname.endsWith("/status") &&
    request.method === "PATCH"
  ) {
    const parts = url.pathname.split("/");
    const id = parseInt(parts[4], 10);
    const isBoq = url.searchParams.get("type") === "boq";

    if (isNaN(id)) {
      return apiResponse({ error: "Invalid project ID" }, 400);
    }

    try {
      const body = (await request.json()) as { status?: string };
      if (!body.status || !["open", "assigned", "completed", "paid"].includes(body.status)) {
        return apiResponse({ error: "Invalid status state" }, 400);
      }

      if (isBoq) {
        await env.DB.prepare("UPDATE boq_projects SET status = ? WHERE id = ?")
          .bind(body.status, id)
          .run();
      } else {
        await env.DB.prepare("UPDATE projects SET status = ? WHERE id = ?")
          .bind(body.status, id)
          .run();
      }
      return apiResponse({ success: true });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // GET /api/admin/client-projects/all
  if (url.pathname === "/api/admin/client-projects/all" && request.method === "GET") {
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM client_projects ORDER BY id DESC",
      ).all();
      return apiResponse(results);
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // POST /api/admin/client-projects
  if (url.pathname === "/api/admin/client-projects" && request.method === "POST") {
    try {
      const body = (await request.json()) as any;
      const title = requiredString(body.title, LIMIT.title);
      if (!title) {
        return apiResponse({ error: "A valid title is required" }, 400);
      }
      if (!isValidPhone(body.client_phone)) {
        return apiResponse({ error: "A valid client phone is required" }, 400);
      }
      const category = ["2D", "3D", "structure", "BOQ"].includes(body.category)
        ? body.category
        : "2D";
      const status = ["assigned", "completed", "paid"].includes(body.status)
        ? body.status
        : "assigned";
      const info = await env.DB.prepare(
        "INSERT INTO client_projects (category, title, area, planning_details, description, image_url, other_info, status, client_name, client_phone, progress_percent, source_file_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
        .bind(
          category,
          title,
          optionalString(body.area, LIMIT.area) || null,
          optionalString(body.planning_details, LIMIT.text) || null,
          optionalString(body.description, LIMIT.text) || null,
          optionalString(body.image_url, LIMIT.info) || null,
          optionalString(body.other_info, LIMIT.info) || null,
          status,
          optionalString(body.client_name, LIMIT.name) || null,
          (body.client_phone as string).trim(),
          clampInt(body.progress_percent, 0, 100),
          optionalString(body.source_file_url, LIMIT.info) || null,
        )
        .run();
      return apiResponse({ success: true, id: info.meta.last_row_id });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // PATCH /api/admin/client-projects/:id
  if (
    url.pathname.startsWith("/api/admin/client-projects/") &&
    !url.pathname.endsWith("/logs") &&
    request.method === "PATCH"
  ) {
    const parts = url.pathname.split("/");
    const id = parseInt(parts[4], 10);
    if (isNaN(id)) {
      return apiResponse({ error: "Invalid project ID" }, 400);
    }
    try {
      const body = (await request.json()) as any;

      if (body.action === "delete") {
        await env.DB.prepare("DELETE FROM progress_logs WHERE project_id = ?").bind(id).run();
        await env.DB.prepare("DELETE FROM client_projects WHERE id = ?").bind(id).run();
        return apiResponse({ success: true });
      }

      const title = requiredString(body.title, LIMIT.title);
      if (!title) {
        return apiResponse({ error: "A valid title is required" }, 400);
      }
      if (!isValidPhone(body.client_phone)) {
        return apiResponse({ error: "A valid client phone is required" }, 400);
      }
      const category = ["2D", "3D", "structure", "BOQ"].includes(body.category)
        ? body.category
        : "2D";
      const status = ["assigned", "completed", "paid"].includes(body.status)
        ? body.status
        : "assigned";

      await env.DB.prepare(
        "UPDATE client_projects SET category = ?, title = ?, area = ?, planning_details = ?, description = ?, image_url = ?, other_info = ?, status = ?, client_name = ?, client_phone = ?, progress_percent = ?, source_file_url = ? WHERE id = ?",
      )
        .bind(
          category,
          title,
          optionalString(body.area, LIMIT.area) || null,
          optionalString(body.planning_details, LIMIT.text) || null,
          optionalString(body.description, LIMIT.text) || null,
          optionalString(body.image_url, LIMIT.info) || null,
          optionalString(body.other_info, LIMIT.info) || null,
          status,
          optionalString(body.client_name, LIMIT.name) || null,
          (body.client_phone as string).trim(),
          clampInt(body.progress_percent, 0, 100),
          optionalString(body.source_file_url, LIMIT.info) || null,
          id,
        )
        .run();
      return apiResponse({ success: true });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // GET /api/admin/client-projects/:id/logs
  if (
    url.pathname.startsWith("/api/admin/client-projects/") &&
    url.pathname.endsWith("/logs") &&
    request.method === "GET"
  ) {
    const parts = url.pathname.split("/");
    const id = parseInt(parts[4], 10);
    if (isNaN(id)) {
      return apiResponse({ error: "Invalid project ID" }, 400);
    }
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM progress_logs WHERE project_id = ? ORDER BY created_at DESC",
      )
        .bind(id)
        .all();
      return apiResponse(results);
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // POST /api/admin/client-projects/:id/logs
  if (
    url.pathname.startsWith("/api/admin/client-projects/") &&
    url.pathname.endsWith("/logs") &&
    request.method === "POST"
  ) {
    const parts = url.pathname.split("/");
    const id = parseInt(parts[4], 10);
    if (isNaN(id)) {
      return apiResponse({ error: "Invalid project ID" }, 400);
    }
    try {
      const body = (await request.json()) as { note?: string };
      const note = requiredString(body.note, LIMIT.note);
      if (!note) {
        return apiResponse({ error: "A valid log note is required" }, 400);
      }
      await env.DB.prepare("INSERT INTO progress_logs (project_id, note) VALUES (?, ?)")
        .bind(id, note)
        .run();
      return apiResponse({ success: true });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // DELETE /api/admin/client-projects/:id
  if (
    url.pathname.startsWith("/api/admin/client-projects/") &&
    !url.pathname.endsWith("/logs") &&
    request.method === "DELETE"
  ) {
    const parts = url.pathname.split("/");
    const id = parseInt(parts[4], 10);
    if (isNaN(id)) {
      return apiResponse({ error: "Invalid project ID" }, 400);
    }
    try {
      // Cascade-delete related logs first (D1 doesn't enforce FK constraints)
      await env.DB.prepare("DELETE FROM progress_logs WHERE project_id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM client_projects WHERE id = ?").bind(id).run();
      return apiResponse({ success: true });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  return apiResponse({ error: "API Endpoint not found" }, 404);
};
