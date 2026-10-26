import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key). Safe to use in client components —
 * Row Level Security protects every table.
 *
 * Falls back to harmless placeholders when env vars are missing so the app
 * can still render (e.g. CI builds) instead of crashing at import time.
 * Auth calls will simply fail until real values are provided.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return createBrowserClient(url, anonKey);
}
