"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MicroBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import { modelProfilePath } from "@/lib/admin-links";
import { formatDate } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import type { PendingApplication } from "@/types/app";

export function ApplicationsClient({
  applications,
}: {
  applications: PendingApplication[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return applications;
    return applications.filter((application) =>
      [application.name, application.phone, application.city, application.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [applications, query]);

  return (
    <div>
      <AdminPageHeader eyebrow="Applications" title="The pending queue" />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-graphite" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search applications"
            className="h-10 rounded-none bg-paper pl-9"
          />
        </div>
        <p className="micro-label text-graphite">{filtered.length} pending</p>
      </div>

      {filtered.length ? (
        <div className="double-rule overflow-x-auto border border-ledger bg-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ledger">
                {["Applicant", "Contact", "Stats", "Source", "Received", ""].map(
                  (label) => (
                    <th
                      key={label}
                      className="micro-label px-4 py-3 text-graphite"
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((application) => {
                const href = modelProfilePath(application.phone, {
                  from: "applications",
                });
                return (
                  <tr
                    key={application.id}
                    className="group cursor-pointer transition hover:bg-manila/30"
                    onClick={() => router.push(href)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={application.headshot_url}
                          alt={application.name}
                          className="size-11 shrink-0 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={href}
                              onClick={(event) => event.stopPropagation()}
                              className="font-medium hover:underline"
                            >
                              {application.name}
                            </Link>
                            {application.is_hidden && (
                              <MicroBadge tone="hidden">Hidden</MicroBadge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-graphite">
                            {application.city || "City not provided"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px]">
                      <p>{formatPhone(application.phone)}</p>
                      <p className="mt-0.5 font-mono text-[12px] text-graphite">
                        {application.email || "No email"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-graphite">
                      {application.height_cm
                        ? `${application.height_cm} cm`
                        : "—"}
                      <br />
                      {application.hair_color || "—"} /{" "}
                      {application.eye_color || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {application.source ? (
                        <span className="text-xs">
                          Via cast invite
                          <span className="mt-0.5 block text-graphite">
                            {application.source.castTitle}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-graphite">
                          Direct application
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-graphite">
                      {formatDate(application.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ArrowUpRight className="ml-auto size-4 text-graphite opacity-0 transition group-hover:opacity-100" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title={
            applications.length
              ? "No matching applications."
              : "The queue is clear."
          }
          description={
            applications.length
              ? "Try a different name, phone number, or city."
              : "New applications and cast-invite registrations will appear here."
          }
        />
      )}
    </div>
  );
}
