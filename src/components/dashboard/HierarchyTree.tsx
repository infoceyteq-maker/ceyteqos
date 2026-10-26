import type { Department } from "@/lib/database.types";
import { StatusPill } from "@/components/dashboard/widgets";

/**
 * Organisation hierarchy preview:
 *   Ceyteq (Super Master Admin) → Departments (nested) → Employees.
 * Renders the real department tree from the database; when no departments
 * exist yet it shows the intended structure as an illustrative skeleton.
 */

interface TreeNode extends Department {
  children: TreeNode[];
}

function buildTree(departments: Department[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  departments.forEach((d) => byId.set(d.id, { ...d, children: [] }));
  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function NodeRow({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <li>
      <div
        className="neu-raised-sm flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{ marginLeft: depth * 14 }}
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-radium shadow-[0_0_8px_rgba(77,184,232,0.8)]" />
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-navy">{node.name}</span>
        <StatusPill status={node.status} />
      </div>
      {node.children.length > 0 && (
        <ul className="ml-5 mt-2.5 space-y-2.5 border-l-2 border-[#c5c5ca] pl-4">
          {node.children.map((child) => (
            <NodeRow key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HierarchyTree({
  departments,
  adminName,
  employeeCount,
}: {
  departments: Department[];
  adminName: string;
  employeeCount: number;
}) {
  const roots = buildTree(departments);

  return (
    <div>
      {/* Root of the organisation */}
      <div className="neu-dark flex items-center gap-3.5 rounded-3xl px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/5 font-display text-lg font-extrabold text-radium-light shadow-[inset_0_1px_0_rgba(143,219,247,0.35)]">
          C
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-white">Ceyteq</p>
          <p className="truncate text-xs text-[#9fb8d4]">
            Super Master Admin · {adminName}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-white/5 px-3 py-1 text-[11px] font-bold text-radium-light">
          {employeeCount} {employeeCount === 1 ? "person" : "people"}
        </span>
      </div>

      {roots.length > 0 ? (
        <ul className="ml-5 mt-3 space-y-2.5 border-l-2 border-[#c5c5ca] pl-4">
          {roots.map((node) => (
            <NodeRow key={node.id} node={node} depth={0} />
          ))}
        </ul>
      ) : (
        <div className="ml-5 mt-3 space-y-2.5 border-l-2 border-dashed border-[#c5c5ca] pl-4">
          {["Departments will appear here", "Heads → Managers → Employees nested under each"].map(
            (label) => (
              <div
                key={label}
                className="neu-inset-sm flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-soft"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#c5c5ca]" />
                {label}
              </div>
            ),
          )}
          <p className="px-1 pt-1 text-xs leading-relaxed text-soft">
            No departments yet. Create the first one from the Departments
            page in Phase 2 — the tree, roles and permissions already
            support unlimited nesting.
          </p>
        </div>
      )}
    </div>
  );
}
