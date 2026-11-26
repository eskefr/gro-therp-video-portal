import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ClipboardList,
  EyeOff,
  Link2,
  Users,
} from "lucide-react";
import { InvitationStatusBadge, MicroBadge } from "@/components/shared/status-badge";
import { Countdown } from "@/components/shared/countdown";
import { modelProfilePath } from "@/lib/admin-links";
import { getAdminStats } from "@/lib/queries/models";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getEffectiveInvitationStatus } from "@/lib/invitations/status";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [stats, dashboard] = await Promise.all([
    getAdminStats(),
    getDashboardData(),
  ]);

  const statCards = [
    { label: "Approved models", value: stats.approved, icon: Users, href: "/admin/archive" },
    { label: "Pending applications", value: stats.pending, icon: ClipboardList, href: "/admin/applications" },
    { label: "Hidden profiles", value: stats.hidden, icon: EyeOff, href: "/admin/archive" },
    { label: "Open casts", value: stats.openCasts, icon: BriefcaseBusiness, href: "/admin/jobs" },
    { label: "Active links", value: stats.activeInvitations, icon: Link2, href: "/admin/invitations" },
  ];

  return (
    <div>
      <h1 className="sr-only">Agency overview</h1>

      <div className="ledger-grid grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-paper px-4 py-4 transition last:col-span-2 hover:bg-manila/55 xl:last:col-span-1"
            >
              <Icon className="size-3.5 text-ledger" />
              <p className="mt-4 font-display text-4xl tracking-[-0.04em]">
                {String(card.value).padStart(2, "0")}
              </p>
              <p className="micro-label mt-1.5 text-graphite">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="border border-ledger bg-card">
          <div className="flex items-center justify-between border-b border-ledger bg-manila/40 px-4 py-3">
            <h2 className="font-display text-xl tracking-[-0.02em]">
              Waiting for review
            </h2>
            <Link
              href="/admin/applications"
              className="micro-label inline-flex items-center gap-1.5 text-graphite hover:text-ink"
            >
              View queue
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          {dashboard.recentApplications.length ? (
            <div className="divide-y divide-border">
              {dashboard.recentApplications.map((application) => (
                <Link
                  key={application.id}
                  href={modelProfilePath(application.phone, {
                    from: "applications",
                  })}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-manila/35"
                >
                  <img
                    src={application.headshot_url}
                    alt={application.name}
                    className="size-10 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{application.name}</p>
                    <p className="mt-0.5 truncate text-xs text-graphite">
                      {application.city || "City not provided"}
                      {application.source
                        ? ` · via ${application.source.castTitle}`
                        : " · direct application"}
                    </p>
                  </div>
                  {application.is_hidden && <MicroBadge tone="hidden">Hidden</MicroBadge>}
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-4 py-8 text-sm text-graphite">
              The queue is clear.
            </p>
          )}
        </section>

        <section className="border border-ledger bg-card">
          <div className="flex items-center justify-between border-b border-ledger bg-manila/40 px-4 py-3">
            <h2 className="font-display text-xl tracking-[-0.02em]">
              Recent invitations
            </h2>
            <Link
              href="/admin/invitations"
              className="micro-label inline-flex items-center gap-1.5 text-graphite hover:text-ink"
            >
              Track all
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
          {dashboard.recentInvitations.length ? (
            <div className="divide-y divide-border">
              {dashboard.recentInvitations.map((invitation) => {
                const status = getEffectiveInvitationStatus(invitation);
                const linkedModel =
                  invitation.claimed_model ?? invitation.target_model;
                const href = linkedModel
                  ? modelProfilePath(linkedModel.phone, {
                      from: "invitations",
                      invitationId: invitation.id,
                    })
                  : `/admin/invitations/${invitation.id}`;
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        <Link href={href} className="hover:underline">
                          {linkedModel?.name || "General cast invite"}
                        </Link>
                      </p>
                      <p className="mt-0.5 truncate text-xs text-graphite">
                        {invitation.cast.title}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <InvitationStatusBadge status={status} compact />
                      <Countdown
                        expiresAt={invitation.expires_at}
                        className="text-[12px] text-graphite"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-4 py-8 text-sm text-graphite">
              No invitations generated yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
