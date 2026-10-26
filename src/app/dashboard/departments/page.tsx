import type { Metadata } from "next";

import { HierarchyTree } from "@/components/dashboard/HierarchyTree";
import { EmptyState } from "@/components/dashboard/widgets";
import { DepartmentsIcon, PlusIcon } from "@/components/icons";
import { getCurrentProfile, getDepartments, getEmployees } from "@/lib/data";

export const metadata: Metadata = { title: "Departments" };

export default async function DepartmentsPage() {
  const [profile, departments, employees] = await Promise.all([
    getCurrentProfile(),
    getDepartments(),
    getEmployees(),
  ]);

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy">
            Departments
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-body">
            The organisation tree. Departments can nest without limit — for
            example Ceyteq → Web Studio → Design. Heads, managers and
            employees inherit access from their place in this tree.
          </p>
        </div>

        <div className="text-right">
          <button
            type="button"
            disabled
            title="Department management arrives in Phase 2"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-bold"
          >
            <PlusIcon className="h-4.5 w-4.5" />
            Create department
          </button>
          <p className="mt-2 text-xs text-soft">Management tools arrive in Phase 2</p>
        </div>
      </div>

      {departments.length === 0 ? (
        <EmptyState
          icon={<DepartmentsIcon className="h-8 w-8" />}
          title="No departments yet"
          text="The structure is ready in the database (nested departments, heads and subtree permissions). The create/edit interface ships in Phase 2."
        />
      ) : (
        <div className="neu-raised rounded-card-lg p-6">
          <HierarchyTree
            departments={departments}
            adminName={profile.full_name}
            employeeCount={employees.length}
          />
        </div>
      )}
    </div>
  );
}
