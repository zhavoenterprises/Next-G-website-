# Security

This document records the security posture of the Next G Engineers site
(Cloudflare Pages + D1 + R2) and the manual steps required to fully activate it.

## Reporting

Found a vulnerability? Please email the maintainers privately rather than
opening a public issue.

## Hardening checklist

| # | Item | Status | Where |
|---|------|--------|-------|
| 1 | Hide API keys | ✅ | Secrets live in Cloudflare env / `.dev.vars` (gitignored). See `.dev.vars.example`. |
| 2 | Purge git secrets | ✅ | Full history scanned — no secrets committed. |
| 3 | Use public DB key | N/A | D1 uses server-only bindings; no client-exposed DB key exists. |
| 4 | Row-level security | N/A → covered | Single-admin model; all writes gated server-side by session auth. |
| 5 | Encrypt sensitive data | Partial | TLS in transit + D1 encryption at rest. Contact phone numbers are stored plaintext for operational use (documented, minimal). |
| 6 | Server-side auth | ✅ | `verifyAdminSession` gate before every admin route in `functions/api/[[path]].ts`. |
| 7 | Lock record access | ✅ | Only the authenticated admin can read/mutate records. |
| 8 | Block field tampering | ✅ | Server validates/whitelists/caps every field; enums enforced; numbers clamped. |
| 9 | Secure session cookies | ✅ | `HttpOnly; Secure; SameSite=Strict`, 24h expiry, HMAC-signed, constant-time compare, **fail-closed** (no fallback secret). |
| 10 | Hash passwords | ✅ | bcrypt (`bcrypt.compareSync`). |
| 11 | Rate limit login | ✅ (needs KV) | KV-backed limiter on `/api/admin/login` and `/accept`. Bind a `RATE_LIMIT` KV namespace to activate. |
| 12 | Bot protection | ✅ (needs keys) | Cloudflare Turnstile on admin login. Set `TURNSTILE_SECRET` + `VITE_TURNSTILE_SITE_KEY` to activate. |
| 13 | Parameterize queries | ✅ | Every query uses D1 `.bind()` — no string interpolation. |
| 14 | Validate all input | ✅ | Required/optional string helpers, phone regex, numeric clamps, enum checks. |
| 15 | Escape user content | ✅ | React auto-escaping; CSP as defense-in-depth; no user-controlled HTML sinks. |
| 16 | Restrict file uploads | ✅ | Image content-type allowlist (JPEG/PNG/WebP/GIF), 5 MB cap, server-derived extension, filename sanitized on read. |
| 17 | Trim API responses | ✅ | Public endpoints select display columns only — no contact info leaks. |
| 18 | Security headers | ✅ | `public/_headers` (CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP) + API responses. |
| 19 | Force HTTPS | ✅ (+ 1 toggle) | HSTS + `upgrade-insecure-requests`. Also enable **Always Use HTTPS** in Cloudflare (see below). |
| 20 | Scan dependencies | ✅ | `.github/workflows/security.yml` (npm audit + CodeQL) and `.github/dependabot.yml`. |

## Required manual steps (Cloudflare dashboard)

These cannot be done from code — an account owner must do them:

1. **Set secrets** (Pages → Settings → Environment variables / Secrets):
   - `SESSION_SECRET` — random 48+ byte hex string. **Without this, admin login is disabled by design.**
   - `ADMIN_PASSWORD_HASH` — bcrypt hash of the admin password.
2. **Enable "Always Use HTTPS"** (SSL/TLS → Edge Certificates) and set SSL mode to **Full (strict)**.
3. **(Bot protection)** Create a Turnstile widget (Cloudflare → Turnstile) for the
   production domain, then set:
   - `TURNSTILE_SECRET` (Pages secret) and
   - `VITE_TURNSTILE_SITE_KEY` (Pages build variable, public).
   The widget's `data-action` must be `admin_login` and its allowed hostnames must
   include the production domain.
4. **(Rate limiting)** Create a KV namespace and bind it as `RATE_LIMIT` to the
   Pages project. Until bound, the limiter is a safe no-op.

## Notes

- Turnstile and rate limiting are **fail-safe**: unconfigured = feature off (login
  still works), configured = enforced. This avoids locking anyone out on deploy.
- Session cookies are fail-**closed**: if `SESSION_SECRET` is missing, no session
  is ever accepted.
