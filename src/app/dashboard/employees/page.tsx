import type { Metadata } from "next";

import { RoleBadge, StatusPill } from "@/components/dashboard/widgets";
import { EmployeesIcon, PlusIcon } from "@/components/icons";
import { getDepartments, getEmployees } from "@/lib/data";
import { formatDate, initials } from "@/lib/format";

export const metadata: Metadata = { title: "Employees" };

export default async function EmployeesPage() {
  const [employees, departments] = await Promise.all([getEmployees(), getDepartments()]);
  const deptName = new Map(departments.map((d) => [d.id, d.name]));

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy">
            Employees
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-body">
            Everyone with access to the system, their role and department.
            Invitations and role management arrive in Phase 2.
          </p>
        </div>

        <div className="text-right">
          <button
            type="button"
            disabled
            title="Employee invitations arrive in Phase 2"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-3 font-display text-sm font-bold"
          >
            <PlusIcon className="h-4.5 w-4.5" />
            Invite employee
          </button>
          <p className="mt-2 text-xs text-soft">Invitations arrive in Phase 2</p>
        </div>
      </div>

      <div className="neu-raised rounded-card-lg p-4 sm:p-6">
        <div className="neu-inset overflow-x-auto rounded-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.14em] text-soft">
                <th scope="col" className="px-5 py-4 font-bold">Employee</th>
                <th scope="col" className="px-5 py-4 font-bold">Role</th>
                <th scope="col" className="px-5 py-4 font-bold">Department</th>
                <th scope="col" className="px-5 py-4 font-bold">Status</th>
                <th scope="col" className="px-5 py-4 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <span className="neu-raised-sm mx-auto grid h-14 w-14 place-items-center rounded-3xl text-radium">
                      <EmployeesIcon className="h-7 w-7" />
                    </span>
                    <p className="mt-4 font-display text-base font-bold text-navy">
                      No employees yet
                    </p>
                    <p className="mx-auto mt-1 max-w-xs text-sm text-body">
                      People you invite in Phase 2 will be listed here with
                      their role and department.
                    </p>
                  </td>
                </tr>
              ) : (
                employees.map((person) => (
                  <tr key={person.id} className="border-t border-[#d4d4d9]">
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-3">
                        <span className="neu-raised-sm grid h-9 w-9 shrink-0 place-items-center rounded-full font-display text-xs font-extrabold text-navy">
                          {initials(person.full_name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-navy">
                            {person.full_name}
                          </span>
                          <span className="block truncate text-xs text-soft">{person.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={person.role} />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-body">
                      {person.department_id ? (deptName.get(person.department_id) ?? "—") : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={person.status} />
                    </td>
                    <td className="px-5 py-3.5 font-medium text-body">
                      {formatDate(person.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
