"use client";

import Link from "next/link";
import { ArrowUpRight, Film, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CreateCastDialog } from "@/components/admin/create-cast-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { MicroBadge } from "@/components/shared/status-badge";
import { formatShootDates } from "@/lib/dates";
import type { CastWithCount } from "@/types/app";

export function JobsClient({ casts }: { casts: CastWithCount[] }) {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Casts & jobs"
        title="Casting board"
        action={<CreateCastDialog />}
      />

      {casts.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {casts.map((cast) => (
            <Link
              key={cast.id}
              href={`/admin/jobs/${cast.id}`}
              className="double-rule group flex flex-col justify-between border border-ledger bg-card p-5 transition hover:bg-manila/25"
            >
              <div className="flex items-start justify-between gap-3">
                <MicroBadge tone={cast.status}>{cast.status}</MicroBadge>
                <ArrowUpRight className="size-4 text-graphite opacity-0 transition group-hover:opacity-100" />
              </div>
              <div className="mt-8">
                <p className="micro-label text-graphite">
                  {cast.client_name || "Independent"}
                </p>
                <h2 className="mt-2 font-display text-3xl leading-[1.02] tracking-[-0.03em]">
                  {cast.title}
                </h2>
                <p className="mt-3 font-mono text-[12px] text-graphite">
                  {formatShootDates(cast.shoot_start, cast.shoot_end)}
                  {cast.location ? ` · ${cast.location}` : ""}
                </p>
              </div>
              <div className="mt-7 flex items-center gap-5 border-t border-ledger pt-4">
                <span className="micro-label inline-flex items-center gap-1.5 text-graphite">
                  <Users className="size-3" />
                  {cast.memberCount} models
                </span>
                <span className="micro-label inline-flex items-center gap-1.5 text-graphite">
                  <Film className="size-3" />
                  {cast.mediaCount} media
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No casts yet."
          description="Create your first cast, add talent from the archive, and send a magic link."
        />
      )}
    </div>
  );
}
