/**
 * Role-based permission helper — hierarchy-ready from day one.
 *
 * Roles (highest → lowest):
 *   super_master_admin > department_head > manager > employee
 *
 * `can(user, action, resource)` mirrors the database RLS policies so UI
 * affordances and server checks agree with what Postgres will allow:
 *   - super_master_admin: everything, everywhere.
 *   - department_head:    full access inside their department SUBTREE
 *                         (their department + all nested descendants).
 *   - manager / employee: read inside their own department, write only
 *                         their own records.
 */

export type Role = "super_master_admin" | "department_head" | "manager" | "employee";

export const ROLE_RANK: Record<Role, number> = {
  super_master_admin: 4,
  department_head: 3,
  manager: 2,
  employee: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_master_admin: "Super Master Admin",
  department_head: "Department Head",
  manager: "Manager",
  employee: "Employee",
};

export interface Actor {
  id: string;
  role: Role;
  departmentId: string | null;
}

export interface ResourceRef {
  /** e.g. "departments" | "profiles" | "leads" */
  type: string;
  ownerId?: string | null;
  departmentId?: string | null;
  /** Department ids in the actor's subtree (own dept + descendants). */
  subtreeIds?: string[];
}

export type Action = "read" | "create" | "update" | "delete" | "manage";

export function can(actor: Actor | null | undefined, action: Action, resource: ResourceRef): boolean {
  if (!actor) return false;

  // Super Master Admin can do anything.
  if (actor.role === "super_master_admin") return true;

  const inSubtree =
    resource.departmentId != null &&
    resource.subtreeIds != null &&
    resource.subtreeIds.includes(resource.departmentId);

  const sameDepartment =
    resource.departmentId != null && resource.departmentId === actor.departmentId;

  const isOwn = resource.ownerId != null && resource.ownerId === actor.id;

  switch (actor.role) {
    case "department_head":
      return inSubtree || isOwn;
    case "manager":
      if (action === "read") return sameDepartment || isOwn;
      return isOwn;
    case "employee":
      if (action === "read") return sameDepartment || isOwn;
      return isOwn;
    default:
      return false;
  }
}

/** True when `actorRole` sits at or above `minimumRole` in the hierarchy. */
export function hasRoleAtLeast(actorRole: Role, minimumRole: Role): boolean {
  return ROLE_RANK[actorRole] >= ROLE_RANK[minimumRole];
}
