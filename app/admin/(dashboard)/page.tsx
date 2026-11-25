import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  ClipboardList,
  EyeOff,
  Link2,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InvitationStatusBadge } from "@/components/shared/status-badge";
import { Countdown } from "@/components/shared/countdown";
import { getAdminStats } from "@/lib/queries/models";
import { getDashboardData } from "@/lib/queries/dashboard";
import { getEffectiveInvitationStatus } from "@/lib/invitations/status";
import { formatShootDates } from "@/lib/dates";
import { MicroBadge } from "@/components/shared/status-badge";

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
      <AdminPageHeader
        eyebrow="Agency overview"
        title="Good casting starts here."
        description="A live view of the roster, the queue, and every open invitation."
        action={
          <Link
            href="/admin/jobs"
            className="micro-label inline-flex h-10 items-center gap-2 border border-ledger bg-manila px-4 text-ink transition hover:bg-[#e7d7b4]"
          >
            Manage casts
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      <div className="ledger-grid sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-paper px-5 py-6 transition hover:bg-manila/55"
            >
              <div className="flex items-start justify-between">
                <Icon className="size-4 text-ledger" />
                <ArrowUpRight className="size-3.5 text-graphite opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-7 font-display text-5xl tracking-[-0.05em]">
                {String(card.value).padStart(2, "0")}
              </p>
              <p className="micro-label mt-2 text-graphite">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="double-rule border border-ledger bg-card">
          <div className="flex items-center justify-between border-b border-ledger bg-manila/40 px-5 py-4">
            <div>
              <p className="micro-label text-graphite">Applications</p>
              <h2 className="mt-1 font-display text-2xl">Waiting for review</h2>
            </div>
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
                  href="/admin/applications"
                  className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-manila/35"
                >
                  <img
                    src={application.headshot_url}
                    alt={application.name}
                    className="size-12 shrink-0 object-cover"
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
            <p className="px-5 py-10 text-sm text-graphite">
              The queue is clear. Every application has been reviewed.
            </p>
          )}
        </section>

        <section className="double-rule border border-ledger bg-card">
          <div className="flex items-center justify-between border-b border-ledger bg-manila/40 px-5 py-4">
            <div>
              <p className="micro-label text-graphite">Magic links</p>
              <h2 className="mt-1 font-display text-2xl">Recent invitations</h2>
            </div>
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
                return (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {invitation.target_model?.name ||
                          invitation.claimed_model?.name ||
                          "General cast invite"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-graphite">
                        {invitation.cast.title}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <InvitationStatusBadge status={status} compact />
                      <Countdown
                        expiresAt={invitation.expires_at}
                        className="text-[10px] text-graphite"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-5 py-10 text-sm text-graphite">
              No invitations generated yet.
            </p>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="micro-label text-graphite">Production board</p>
            <h2 className="mt-1 font-display text-2xl">Current casts</h2>
          </div>
          <Link
            href="/admin/jobs"
            className="micro-label inline-flex items-center gap-1.5 text-graphite hover:text-ink"
          >
            All casts
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.recentCasts.map((cast, index) => (
            <Link
              key={cast.id}
              href={`/admin/jobs/${cast.id}`}
              className="group flex min-h-44 flex-col justify-between border border-ledger bg-card p-5 transition hover:bg-manila/25"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-sm text-graphite/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <MicroBadge tone={cast.status}>{cast.status}</MicroBadge>
              </div>
              <div>
                <p className="micro-label text-graphite">
                  {cast.client_name || "Independent"}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-tight tracking-[-0.02em]">
                  {cast.title}
                </h3>
                <p className="mt-2 font-mono text-[10px] text-graphite">
                  {formatShootDates(cast.shoot_start, cast.shoot_end)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
