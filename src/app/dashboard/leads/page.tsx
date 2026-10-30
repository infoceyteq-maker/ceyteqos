import type { Metadata } from "next";

import { EmptyState } from "@/components/dashboard/widgets";
import { LeadsIcon, MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";
import type { RestaurantSubmission, SubmissionStatus } from "@/lib/database.types";
import { getRestaurantSubmissions } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Leads & Forms" };

const STATUS_STYLE: Record<SubmissionStatus, { text: string; dot: string }> = {
  new: { text: "text-blue-brand", dot: "bg-radium" },
  contacted: { text: "text-warning", dot: "bg-warning" },
  qualified: { text: "text-navy", dot: "bg-navy" },
  converted: { text: "text-success", dot: "bg-success" },
  rejected: { text: "text-danger", dot: "bg-danger" },
};

function SubmissionStatusPill({ status }: { status: SubmissionStatus }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.new;
  return (
    <span
      className={`neu-inset-sm inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function contactLinks(submission: RestaurantSubmission) {
  const links: { key: string; href: string; label: string; icon: React.ReactNode }[] = [];
  if (submission.email) {
    links.push({
      key: "email",
      href: `mailto:${submission.email}`,
      label: submission.email,
      icon: <MailIcon className="h-4 w-4" />,
    });
  }
  if (submission.phone) {
    links.push({
      key: "phone",
      href: `tel:${submission.phone.replace(/\s+/g, "")}`,
      label: submission.phone,
      icon: <PhoneIcon className="h-4 w-4" />,
    });
  }
  if (submission.whatsapp) {
    links.push({
      key: "whatsapp",
      href: `https://wa.me/${submission.whatsapp.replace(/[^\d]/g, "")}`,
      label: submission.whatsapp,
      icon: <WhatsAppIcon className="h-4 w-4" />,
    });
  }
  return links;
}

export default async function LeadsPage() {
  const submissions = await getRestaurantSubmissions(50);
  const newCount = submissions.filter((s) => s.status === "new").length;

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy">
            Leads &amp; Forms
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-body">
            Restaurant enquiries captured by the Digital Race intake
            (<code className="text-xs font-bold text-navy">POST /api/restaurant-submissions</code>).
            Newest first — triage, assignment and status workflows build on this list.
          </p>
        </div>

        <div className="neu-dark rounded-card px-5 py-4 text-center">
          <p className="font-display text-2xl font-extrabold text-white">{newCount}</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-radium-light">
            New submissions
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={<LeadsIcon className="h-8 w-8" />}
          title="No submissions yet"
          text="The intake endpoint is live and writing to the restaurant_submissions table. As soon as the public form receives an enquiry, it will appear here."
        />
      ) : (
        <div className="neu-raised rounded-card-lg p-4 sm:p-6">
          <div className="neu-inset overflow-x-auto rounded-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.14em] text-soft">
                  <th scope="col" className="px-5 py-4 font-bold">Restaurant</th>
                  <th scope="col" className="px-5 py-4 font-bold">Contact</th>
                  <th scope="col" className="px-5 py-4 font-bold">Location</th>
                  <th scope="col" className="px-5 py-4 font-bold">Status</th>
                  <th scope="col" className="px-5 py-4 font-bold">Received</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => {
                  const links = contactLinks(submission);
                  return (
                    <tr key={submission.id} className="align-top">
                      <td className="px-5 py-4">
                        <span className="block font-bold text-navy">
                          {submission.restaurant_name}
                        </span>
                        <span className="block text-xs text-soft">
                          {[submission.cuisine_type, submission.contact_name]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </span>
                        {submission.message && (
                          <span className="mt-1 block max-w-xs truncate text-xs text-body">
                            {submission.message}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {links.length === 0 ? (
                          <span className="text-soft">—</span>
                        ) : (
                          <span className="space-y-1">
                            {links.map((link) => (
                              <a
                                key={link.key}
                                href={link.href}
                                target={link.key === "whatsapp" ? "_blank" : undefined}
                                rel={link.key === "whatsapp" ? "noreferrer" : undefined}
                                className="flex items-center gap-1.5 font-semibold text-blue-brand hover:text-navy"
                              >
                                <span className="text-radium">{link.icon}</span>
                                {link.label}
                              </a>
                            ))}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-body">
                        {[submission.city, submission.country].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <SubmissionStatusPill status={submission.status} />
                      </td>
                      <td className="px-5 py-4 text-body">
                        {formatDateTime(submission.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
