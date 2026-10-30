import { NextResponse } from "next/server";

import {
  getClientIp,
  getUserAgent,
  hashIp,
  isRateLimited,
} from "@/lib/api-helpers";
import { logAudit } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { restaurantSubmissionSchema } from "@/lib/validation";

/**
 * /api/restaurant-submissions — Digital Race public intake + staff read.
 *
 * POST (public): accepts a JSON restaurant enquiry from the public form.
 *   Hardened with Zod validation, a honeypot field and per-IP rate
 *   limiting. Inserted via the service-role client so the hashed IP and
 *   user agent can be recorded; the table's anon INSERT policy remains
 *   as a backstop for direct PostgREST submissions.
 *
 * GET (staff): returns the latest submissions the signed-in user may see
 *   (Row Level Security decides — Super Master Admin sees everything).
 *   Unauthenticated callers get 401. `?limit=` caps at 100.
 */
export const dynamic = "force-dynamic";

const FIFTEEN_MIN = 15 * 60 * 1000;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = restaurantSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot / validation failures share one generic message.
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 422 },
    );
  }

  const ip = await getClientIp();
  if (isRateLimited(`restaurant-submission:ip:${ip}`, 5, FIFTEEN_MIN)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  const { companyWebsite: _honeypot, ...fields } = parsed.data;
  void _honeypot;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("restaurant_submissions")
    .insert({
      restaurant_name: fields.restaurant_name,
      contact_name: fields.contact_name ?? null,
      email: fields.email ?? null,
      phone: fields.phone ?? null,
      whatsapp: fields.whatsapp ?? null,
      address: fields.address ?? null,
      city: fields.city ?? null,
      country: fields.country ?? "Sri Lanka",
      website: fields.website ?? null,
      google_maps_url: fields.google_maps_url ?? null,
      cuisine_type: fields.cuisine_type ?? null,
      branches_count: fields.branches_count ?? null,
      message: fields.message ?? null,
      source: fields.source ?? "website",
      // Keep the full validated payload so no field is ever lost.
      payload: fields as Record<string, unknown>,
      ip_hash: hashIp(ip),
      user_agent: await getUserAgent(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "We couldn't save your submission. Please try again shortly." },
      { status: 502 },
    );
  }

  await logAudit("restaurant_submission_created", {
    email: fields.email ?? null,
    metadata: { submission_id: data.id, source: fields.source ?? "website" },
  });

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const limitParam = Number(new URL(request.url).searchParams.get("limit") ?? 50);
  const limit = Number.isFinite(limitParam)
    ? Math.min(100, Math.max(1, Math.floor(limitParam)))
    : 50;

  const { data, error } = await supabase
    .from("restaurant_submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: "Could not load submissions." }, { status: 502 });
  }

  return NextResponse.json({ submissions: data ?? [] });
}
