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
            className="micro-label inline-flex h-10 items-center gap-2 border border-foreground bg-foreground px-4 text-background transition hover:bg-foreground/85"
          >
            Manage casts
            <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="group bg-card px-5 py-6 transition hover:bg-[#f6f1e7]"
            >
              <div className="flex items-start justify-between">
                <Icon className="size-4 text-muted-foreground" />
                <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-7 font-display text-5xl tracking-[-0.05em]">
                {String(card.value).padStart(2, "0")}
              </p>
              <p className="micro-label mt-2 text-muted-foreground">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="micro-label text-muted-foreground">Applications</p>
              <h2 className="mt-1 font-display text-2xl">Waiting for review</h2>
            </div>
            <Link
              href="/admin/applications"
              className="micro-label inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
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
                  className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-background/60"
                >
                  <img
                    src={application.headshot_url}
                    alt={application.name}
                    className="size-12 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{application.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
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
            <p className="px-5 py-10 text-sm text-muted-foreground">
              The queue is clear. Every application has been reviewed.
            </p>
          )}
        </section>

        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <p className="micro-label text-muted-foreground">Magic links</p>
              <h2 className="mt-1 font-display text-2xl">Recent invitations</h2>
            </div>
            <Link
              href="/admin/invitations"
              className="micro-label inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
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
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {invitation.cast.title}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <InvitationStatusBadge status={status} compact />
                      <Countdown
                        expiresAt={invitation.expires_at}
                        className="text-[10px] text-muted-foreground"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="px-5 py-10 text-sm text-muted-foreground">
              No invitations generated yet.
            </p>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="micro-label text-muted-foreground">Production board</p>
            <h2 className="mt-1 font-display text-2xl">Current casts</h2>
          </div>
          <Link
            href="/admin/jobs"
            className="micro-label inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
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
              className="group flex min-h-44 flex-col justify-between border border-border bg-card p-5 transition hover:border-foreground/30"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-display text-2xl text-muted-foreground/40">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <MicroBadge tone={cast.status}>{cast.status}</MicroBadge>
              </div>
              <div>
                <p className="micro-label text-muted-foreground">
                  {cast.client_name || "Independent"}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-tight tracking-[-0.02em]">
                  {cast.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
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
