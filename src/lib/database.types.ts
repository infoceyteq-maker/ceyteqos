import type { Role } from "@/lib/permissions";

/** Row shapes for the Phase 1 schema (supabase/migrations/0001_init.sql). */

export type UserStatus = "active" | "invited" | "suspended" | "disabled";
export type DepartmentStatus = "active" | "archived";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  department_id: string | null;
  manager_id: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  head_user_id: string | null;
  status: DepartmentStatus;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  email: string | null;
  action: string;
  ip_hash: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type SubmissionStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "converted"
  | "rejected";

/** Public restaurant enquiry (0002_restaurant_submissions.sql). */
export interface RestaurantSubmission {
  id: string;
  restaurant_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  country: string;
  website: string | null;
  google_maps_url: string | null;
  cuisine_type: string | null;
  branches_count: number | null;
  message: string | null;
  source: string;
  status: SubmissionStatus;
  payload: Record<string, unknown>;
  department_id: string | null;
  assigned_to: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}
