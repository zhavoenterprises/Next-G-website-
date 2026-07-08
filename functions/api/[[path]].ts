import bcrypt from "bcryptjs";

interface Env {
  DB: any;
  BUCKET: any;
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET?: string;
}

let dbInitialized = false;

async function initializeDatabase(db: any) {
  if (dbInitialized) return;
  
  await db.exec("CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT CHECK(category IN ('2D','3D','structure')), title TEXT NOT NULL, area TEXT, planning_details TEXT, description TEXT, image_url TEXT, other_info TEXT, status TEXT DEFAULT 'open' CHECK(status IN ('open','assigned','completed','paid')), accepted_by_name TEXT, accepted_by_phone TEXT, accepted_at TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);");

  await db.exec("CREATE TABLE IF NOT EXISTS boq_projects (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, status TEXT DEFAULT 'open' CHECK(status IN ('open','assigned','completed','paid')), accepted_by_name TEXT, accepted_by_phone TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);");

  await db.exec("CREATE TABLE IF NOT EXISTS boq_line_items (id INTEGER PRIMARY KEY AUTOINCREMENT, boq_project_id INTEGER REFERENCES boq_projects(id) ON DELETE CASCADE, item_name TEXT, unit TEXT, quantity REAL, rate REAL, amount REAL);");

  // Phase 2 Migrations: Column additions
  try {
    await db.exec("ALTER TABLE projects ADD COLUMN source_file_url TEXT;").catch(() => {});
    await db.exec("ALTER TABLE projects ADD COLUMN progress_percent INTEGER DEFAULT 0;").catch(() => {});
    await db.exec("ALTER TABLE projects ADD COLUMN progress_notes TEXT;").catch(() => {});
  } catch (e) {}

  try {
    await db.exec("ALTER TABLE boq_projects ADD COLUMN source_file_url TEXT;").catch(() => {});
    await db.exec("ALTER TABLE boq_projects ADD COLUMN progress_percent INTEGER DEFAULT 0;").catch(() => {});
    await db.exec("ALTER TABLE boq_projects ADD COLUMN progress_notes TEXT;").catch(() => {});
  } catch (e) {}

  dbInitialized = true;
}

async function signSession(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function verifyAdminSession(request: Request, env: Env): Promise<boolean> {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith("ng_admin_session="));
  if (!sessionCookie) return false;

  const cookieValue = decodeURIComponent(sessionCookie.split("=")[1]);
  const parts = cookieValue.split(":");
  if (parts.length !== 3) return false;

  const [userWord, timestampStr, signature] = parts;
  if (userWord !== "admin") return false;

  const timestamp = Number(timestampStr);
  if (isNaN(timestamp) || Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    return false;
  }

  const secret = env.SESSION_SECRET ?? "ng_session_fallback_secret_key_12345";
  const expectedSignature = await signSession(`admin:${timestampStr}`, secret);
  return signature === expectedSignature;
}

function apiResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...headers,
    },
  });
}

export const onRequest = async (context: {
  request: Request;
  env: Env;
  params: { path?: string[] };
}) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // D1 Binding validation
  if (!env.DB) {
    return apiResponse(
      { error: "D1 Database binding 'DB' is missing. Please configure it in your Cloudflare Pages settings." },
      500
    );
  }

  // Initialize DB tables automatically if needed
  try {
    await initializeDatabase(env.DB);
  } catch (err: any) {
    return apiResponse({ error: `Database initialization failed: ${err.message}` }, 500);
  }

  // ----------------------------------------------------
  // PUBLIC ROUTES
  // ----------------------------------------------------

  // GET /api/projects?category=2D
  if (url.pathname === "/api/projects" && request.method === "GET") {
    const category = url.searchParams.get("category");
    if (!category || !["2D", "3D", "structure"].includes(category)) {
      return apiResponse({ error: "Invalid category. Must be '2D', '3D', or 'structure'" }, 400);
    }
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM projects WHERE category = ? AND status = 'open' ORDER BY id DESC"
      )
        .bind(category)
        .all();
      return apiResponse(results);
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // GET /api/boq
  if (url.pathname === "/api/boq" && request.method === "GET") {
    try {
      const { results: projects } = await env.DB.prepare(
        "SELECT * FROM boq_projects WHERE status = 'open' ORDER BY id DESC"
      ).all();
      const { results: items } = await env.DB.prepare("SELECT * FROM boq_line_items").all();

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
    const parts = url.pathname.split("/");
    const id = parseInt(parts[3], 10);
    const isBoq = url.searchParams.get("type") === "boq";

    if (isNaN(id)) {
      return apiResponse({ error: "Invalid project ID" }, 400);
    }

    try {
      const body = (await request.json()) as { name?: string; phone?: string };
      if (!body.name || !body.phone) {
        return apiResponse({ error: "Name and phone number are required" }, 400);
      }

      if (isBoq) {
        // Atomic status update check for BOQ
        const result = await env.DB.prepare(
          "UPDATE boq_projects SET status='assigned', accepted_by_name=?, accepted_by_phone=? WHERE id=? AND status='open'"
        )
          .bind(body.name, body.phone, id)
          .run();

        if (result.meta.changes === 0) {
          return apiResponse({ error: "already taken" }, 409);
        }
        return apiResponse({ success: true });
      } else {
        // Atomic status update check for Standard (2D, 3D, structure)
        const result = await env.DB.prepare(
          "UPDATE projects SET status='assigned', accepted_by_name=?, accepted_by_phone=?, accepted_at=datetime('now') WHERE id=? AND status='open'"
        )
          .bind(body.name, body.phone, id)
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

  // GET /api/client/projects
  if (url.pathname === "/api/client/projects" && request.method === "GET") {
    const phone = url.searchParams.get("phone");
    if (!phone) {
      return apiResponse({ error: "Phone number parameter is required" }, 400);
    }
    try {
      const { results: standard } = await env.DB.prepare(
        "SELECT * FROM projects WHERE accepted_by_phone = ? ORDER BY id DESC"
      ).bind(phone).all();

      const { results: boqProjects } = await env.DB.prepare(
        "SELECT * FROM boq_projects WHERE accepted_by_phone = ? ORDER BY id DESC"
      ).bind(phone).all();

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
        boq: boqWithItems
      });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // GET /api/images/:filename (R2 image server proxy)
  if (url.pathname.startsWith("/api/images/")) {
    if (!env.BUCKET) {
      return new Response("R2 image storage binding 'BUCKET' is missing.", { status: 500 });
    }
    const filename = url.pathname.replace("/api/images/", "");
    try {
      const object = await env.BUCKET.get(filename);
      if (!object) {
        return new Response("Image not found", { status: 404 });
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=31536000");
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
    const passwordHash = env.ADMIN_PASSWORD_HASH;
    if (!passwordHash) {
      return apiResponse(
        { error: "ADMIN_PASSWORD_HASH environment variable is not configured on Cloudflare." },
        500
      );
    }

    try {
      const body = (await request.json()) as { username?: string; password?: string };
      if (body.username !== "admin" || !body.password) {
        return apiResponse({ error: "Invalid username or password credentials" }, 401);
      }

      const match = bcrypt.compareSync(body.password, passwordHash);
      if (!match) {
        return apiResponse({ error: "Invalid username or password credentials" }, 401);
      }

      const timestamp = Date.now();
      const secret = env.SESSION_SECRET ?? "ng_session_fallback_secret_key_12345";
      const signature = await signSession(`admin:${timestamp}`, secret);
      const cookieValue = `admin:${timestamp}:${signature}`;

      return apiResponse({ success: true }, 200, {
        "Set-Cookie": `ng_admin_session=${encodeURIComponent(cookieValue)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  // POST /api/admin/logout
  if (url.pathname === "/api/admin/logout" && request.method === "POST") {
    return apiResponse({ success: true }, 200, {
      "Set-Cookie": `ng_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`,
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
      const { results: standard } = await env.DB.prepare("SELECT * FROM projects ORDER BY id DESC").all();
      const { results: boqProjects } = await env.DB.prepare("SELECT * FROM boq_projects ORDER BY id DESC").all();
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

  // POST /api/admin/upload (Image upload to R2)
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

      const fileExtension = file.name.split(".").pop() ?? "jpg";
      const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;
      const arrayBuffer = await file.arrayBuffer();

      await env.BUCKET.put(uniqueFilename, arrayBuffer, {
        httpMetadata: { contentType: file.type || "image/jpeg" },
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
        // Create BOQ project
        const info = await env.DB.prepare(
          "INSERT INTO boq_projects (title, description, source_file_url, progress_percent, progress_notes) VALUES (?, ?, ?, ?, ?)"
        )
          .bind(
            body.title, 
            body.description,
            body.source_file_url || null,
            Number(body.progress_percent) || 0,
            body.progress_notes || null
          )
          .run();

        const boqId = info.meta.last_row_id;

        if (body.line_items && Array.isArray(body.line_items)) {
          for (const item of body.line_items) {
            const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
            await env.DB.prepare(
              "INSERT INTO boq_line_items (boq_project_id, item_name, unit, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)"
            )
              .bind(
                boqId,
                item.item_name,
                item.unit,
                Number(item.quantity) || 0,
                Number(item.rate) || 0,
                amount
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

        await env.DB.prepare(
          "INSERT INTO projects (category, title, area, planning_details, description, image_url, other_info, source_file_url, progress_percent, progress_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )
          .bind(
            body.category,
            body.title,
            body.area || "",
            body.planning_details || "",
            body.description || "",
            body.image_url || "",
            body.other_info || "",
            body.source_file_url || null,
            Number(body.progress_percent) || 0,
            body.progress_notes || null
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
          await env.DB.prepare("DELETE FROM boq_line_items WHERE boq_project_id = ?").bind(id).run();
          await env.DB.prepare("DELETE FROM boq_projects WHERE id = ?").bind(id).run();
        } else {
          await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
        }
        return apiResponse({ success: true });
      }

      // Edit action
      if (isBoq) {
        await env.DB.prepare("UPDATE boq_projects SET title = ?, description = ?, source_file_url = ?, progress_percent = ?, progress_notes = ? WHERE id = ?")
          .bind(
            body.title,
            body.description,
            body.source_file_url || null,
            Number(body.progress_percent) || 0,
            body.progress_notes || null,
            id
          )
          .run();

        await env.DB.prepare("DELETE FROM boq_line_items WHERE boq_project_id = ?").bind(id).run();

        if (body.line_items && Array.isArray(body.line_items)) {
          for (const item of body.line_items) {
            const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
            await env.DB.prepare(
              "INSERT INTO boq_line_items (boq_project_id, item_name, unit, quantity, rate, amount) VALUES (?, ?, ?, ?, ?, ?)"
            )
              .bind(
                id,
                item.item_name,
                item.unit,
                Number(item.quantity) || 0,
                Number(item.rate) || 0,
                amount
              )
              .run();
          }
        }
      } else {
        await env.DB.prepare(
          "UPDATE projects SET title = ?, area = ?, planning_details = ?, description = ?, image_url = ?, other_info = ?, source_file_url = ?, progress_percent = ?, progress_notes = ? WHERE id = ?"
        )
          .bind(
            body.title,
            body.area || "",
            body.planning_details || "",
            body.description || "",
            body.image_url || "",
            body.other_info || "",
            body.source_file_url || null,
            Number(body.progress_percent) || 0,
            body.progress_notes || null,
            id
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
      const body = (await request.json()) as { status?: string; progress_percent?: number; progress_notes?: string };
      if (!body.status || !["open", "assigned", "completed", "paid"].includes(body.status)) {
        return apiResponse({ error: "Invalid status state" }, 400);
      }

      if (isBoq) {
        await env.DB.prepare("UPDATE boq_projects SET status = ?, progress_percent = ?, progress_notes = ? WHERE id = ?")
          .bind(
            body.status, 
            body.progress_percent !== undefined ? Number(body.progress_percent) : 0,
            body.progress_notes || null,
            id
          )
          .run();
      } else {
        await env.DB.prepare("UPDATE projects SET status = ?, progress_percent = ?, progress_notes = ? WHERE id = ?")
          .bind(
            body.status, 
            body.progress_percent !== undefined ? Number(body.progress_percent) : 0,
            body.progress_notes || null,
            id
          )
          .run();
      }
      return apiResponse({ success: true });
    } catch (e: any) {
      return apiResponse({ error: e.message }, 500);
    }
  }

  return apiResponse({ error: "API Endpoint not found" }, 404);
};
