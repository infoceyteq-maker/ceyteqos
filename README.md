# Ceyteq — General Management System

**Empowering Digital Evolution**

Phase 1: secure sign-in (password **+ 6-digit email OTP**), password reset,
and a hierarchy-ready dashboard shell, all backed by Supabase (Postgres +
Auth) and styled with Ceyteq's ash-grey 3D neumorphic design system.
Department features (Leads & Forms, Web Studio, Websites) are present as
“Coming soon” placeholders and slot into the module registry in later phases.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · Supabase
(`@supabase/supabase-js` + `@supabase/ssr`) · Zod · deployed on Vercel.

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values (see below)
npm run check:db             # → "Supabase connected: OK"
npm run seed                 # creates the first Super Master Admin
npm run dev                  # http://localhost:3000
```

Local, GitHub and Vercel builds all talk to the **same** Supabase project —
only the env vars differ per environment.

---

## 1 · Supabase project setup (one time)

1. In the [Supabase Dashboard](https://supabase.com/dashboard) open your
   project **`general system`** (create it first if it doesn't exist yet —
   pick a strong database password and the region closest to you, e.g.
   Singapore `ap-southeast-1`).
2. **Apply the schema:** go to **SQL Editor → New query**, paste the whole
   contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   and run it. It creates `departments`, `profiles`, `audit_logs`, enables
   Row Level Security with hierarchy policies, and installs the
   “new user → profile” trigger. Safe to re-run.
   *(Alternative with the CLI: `supabase link --project-ref <ref>` then `supabase db push`.)*
3. **Authentication settings** — **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (change to your Vercel domain later)
   - Redirect URLs: add `http://localhost:3000/**` and your production
     `https://<your-domain>/**`
4. **Email provider** — **Authentication → Providers → Email**:
   - *Confirm email*: **ON**
   - *OTP length*: **6** (default) · *OTP expiry*: **600** seconds (default)
   - Recommended: *Allow new users to sign up*: **OFF** (staff-only system —
     accounts are created by the seed/admin, never self-registered)
5. **⚠️ Email template — critical for the OTP code:**
   **Authentication → Email Templates → “Magic Link”** must contain the
   token variable so users receive a **code**, not a link:

   ```html
   <h2>Your Ceyteq sign-in code</h2>
   <p>Enter this 6-digit code to finish signing in:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:6px">{{ .Token }}</p>
   <p>The code expires in 10 minutes. If you didn't request it, ignore this email.</p>
   ```

6. **SMTP (strongly recommended before real use):** the built-in Supabase
   mailer is rate-limited to a few emails/hour. Configure your own under
   **Project Settings → Authentication → SMTP** (e.g. [Resend](https://resend.com)
   or Gmail Workspace SMTP), then raise **Authentication → Rate Limits** to
   match your provider.

## 2 · Environment variables

Copy `.env.example` → `.env.local` and fill (Supabase: **Project Settings → API**
and **→ Database**):

| Variable | Where / notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, e.g. `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | “anon public” key (browser-safe, RLS protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | “service_role” key — **server only, never commit** |
| `DATABASE_URL` | Database → Connection pooling string (`?sslmode=require`) — used by future tooling |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; production domain on Vercel |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First Super Master Admin, created by `npm run seed` |
| `ADMIN_FULL_NAME` | Display name for the admin (optional) |
| `AUDIT_IP_HASH_SECRET` | Optional salt for hashing IPs in `audit_logs` |

`.env.local` is git-ignored. **Never hardcode keys in the repo.**

## 3 · Verify & seed

```bash
npm run check:db   # Supabase connected: OK
npm run seed       # ✓ Super Master Admin ready: you@example.com
npm run dev
```

Then open <http://localhost:3000> → sign in with `ADMIN_EMAIL` /
`ADMIN_PASSWORD` → enter the 6-digit code from your inbox → dashboard.

> The seeded admin's email is pre-confirmed (so first login works
> immediately), but the **email OTP is still required on every sign-in**.

## How sign-in works

1. `/login` — email + password (Supabase Auth). Identical error for unknown
   email and wrong password; honeypot + rate limits + audit log.
2. A 6-digit code is emailed (Supabase Email OTP). The session exists but is
   marked **pre-OTP** — middleware blocks `/dashboard/*` until step 3.
3. `/verify` — code entry (auto-advance, paste, 60 s resend cooldown, max
   3 resends/hour). On success the session is stamped `mfa_verified_at`.
4. `/dashboard` — 30-minute **idle timeout**; signing out (or idling out)
   clears the stamp, so the next login always needs a fresh code.
5. `/forgot-password` → `/reset-password` reuse the same code mechanism;
   after a reset, **all** sessions are signed out.

Every `login`, `login_failed`, `otp_sent`, `otp_verified`, `otp_failed`,
`logout` and password event is written to `audit_logs` with an **HMAC-hashed
IP** and user agent. Hardening throughout: server-side Zod validation,
origin (CSRF) checks, per-IP/per-account rate limits, CSP + HSTS + nosniff
headers, and the service-role key confined to server code (`server-only`).

## Roles & permissions

```
super_master_admin  → everything
department_head     → own department SUBTREE (dept + all nested children)
manager / employee  → own records (read within own department)
```

Enforced twice: Postgres **RLS policies** (see the migration) and the
`can(user, action, resource)` helper in `src/lib/permissions.ts` for UI and
server checks.

## Adding a new module (Phase 2+)

1. Add one entry to **`src/lib/modules.ts`** (`key`, `label`, `icon`,
   `href`, `status: "live"`, `blurb`). Sidebar, mobile bar, drawer, search
   and overview cards update automatically — they all render from the registry.
2. Create `src/app/dashboard/<key>/page.tsx`.
3. If the module needs data: a new migration in `supabase/migrations/`,
   RLS policies mirroring `can()`, and queries through `src/lib/data.ts`.

## Project structure

```
src/
  app/                  routes: /login /verify /forgot-password /reset-password
    auth/actions.ts     server actions for every auth step
    dashboard/          shell + Overview, Departments, Employees, Settings,
                        + placeholders (leads, studio, websites, more)
    api/health/         GET /api/health — app + Supabase connectivity
  components/           brand (Logo), auth forms, dashboard chrome, icons
  lib/
    modules.ts          ★ module registry (navigation source of truth)
    site-config.ts      ★ company contacts & socials
    supabase/           client.ts (browser) · server.ts (cookies) ·
                        admin.ts (service role, server-only) · middleware.ts
    api-helpers.ts      origin check, rate limiting, IP hashing
    audit.ts · data.ts · permissions.ts · validation.ts (Zod) · format.ts
  middleware.ts         session refresh, OTP gate, 30-min idle timeout
supabase/migrations/    0001_init.sql (tables, RLS, trigger, helpers)
scripts/                check-connection.ts · seed.ts
public/brand/           ceyteq-logo.png · ceyteq-logo-sm.png · ceyteq-icon.png
assets/                 ceyteq-logo-source.jpg (original artwork)
```

Design tokens live in `src/app/globals.css`: ash-only background
(`#E4E4E6 → #EAEAEC`), neumorphic raised/inset shadows, navy `#10244A`,
radium `#4DB8E8` (buttons/glows/icons only), Sora + Manrope self-hosted via
Fontsource. Radii 24–32 px, 250 ms motion, `prefers-reduced-motion` honoured.

## Deploy to Vercel

1. Push this repo to GitHub (below).
2. Vercel → **Add New → Project** → import the repo (framework auto-detected:
   Next.js; `vercel.json` is included).
3. Add the same env vars in **Settings → Environment Variables**, with
   `NEXT_PUBLIC_SITE_URL` set to the production domain.
4. In Supabase **Authentication → URL Configuration**, set the Site URL to
   the production domain and add `https://<domain>/**` to Redirect URLs.
5. Deploy, then sanity-check `https://<domain>/api/health` → `status: ok`.

## GitHub

```bash
git add .
git commit -m "Phase 1: login + email OTP + dashboard shell"
git push
```

CI (`.github/workflows/ci.yml`) runs **typecheck + lint + build** on every
push. No secrets are required for CI — the app builds without live
credentials (optionally add `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` as repository secrets for a warm build).

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| OTP email contains a *link*, not a code | The “Magic Link” email template must include `{{ .Token }}` (step 1.5). |
| `npm run check:db` → FAIL (database) | Run `supabase/migrations/0001_init.sql` in the SQL editor. |
| No OTP emails at all | Configure custom SMTP (step 1.6); check spam; check **Authentication → Logs**. |
| Redirect loop at login | `NEXT_PUBLIC_SITE_URL` must match the origin you browse (incl. port locally). |
| “Invalid email or password” for the admin | Re-run `npm run seed` (resets the password to `ADMIN_PASSWORD`). |
| Dashboard redirect to /login on Vercel | Env vars missing in Vercel, or Site URL/redirect URLs not updated in Supabase. |
