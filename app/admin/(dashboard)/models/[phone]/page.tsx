import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Film } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ModelApprovalActions } from "@/components/admin/model-approval-actions";
import { MediaGallery } from "@/components/shared/media-gallery";
import {
  InvitationStatusBadge,
  MicroBadge,
} from "@/components/shared/status-badge";
import { formatDate, formatDateTime, formatShootDates } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import { getModelProfile } from "@/lib/queries/model-profile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Model profile",
  robots: { index: false, follow: false },
};

export default async function ModelProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ phone: string }>;
  searchParams: Promise<{
    from?: string;
    cast?: string;
    invitation?: string;
  }>;
}) {
  const [{ phone }, query] = await Promise.all([params, searchParams]);
  const profile = await getModelProfile(phone);
  if (!profile) notFound();

  const { model } = profile;
  const backHref =
    query.from === "applications"
      ? { href: "/admin/applications", label: "Applications" }
      : query.from === "invitations"
        ? { href: "/admin/invitations", label: "Invitations" }
        : query.from === "cast" && query.cast
          ? { href: `/admin/jobs/${query.cast}`, label: "Cast" }
          : { href: "/admin/archive", label: "Archive" };

  const details = [
    ["Phone", formatPhone(model.phone)],
    ["Email", model.email || "—"],
    ["City", model.city || "—"],
    ["Age", model.age != null ? String(model.age) : "—"],
    ["Height", model.height_cm != null ? `${model.height_cm} cm` : "—"],
    ["Bust", model.bust_cm != null ? `${model.bust_cm} cm` : "—"],
    ["Waist", model.waist_cm != null ? `${model.waist_cm} cm` : "—"],
    ["Hips", model.hips_cm != null ? `${model.hips_cm} cm` : "—"],
    ["Shoe", model.shoe_size != null ? String(model.shoe_size) : "—"],
    ["Hair", model.hair_color || "—"],
    ["Eyes", model.eye_color || "—"],
  ];

  return (
    <div>
      <AdminPageHeader
        backHref={backHref}
        eyebrow={`${model.initials}${model.age ? ` · ${model.age}` : ""}`}
        title={model.name}
      />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside>
          <img
            src={model.headshot_url}
            alt={model.name}
            className="aspect-[4/5] w-full max-w-[260px] object-cover lg:max-w-none"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <MicroBadge tone={model.status}>
              {model.status === "approved" ? "Approved" : "Pending review"}
            </MicroBadge>
            {model.is_hidden && (
              <MicroBadge tone="hidden">Hidden profile</MicroBadge>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <section>
            <h2 className="font-display text-2xl tracking-[-0.02em]">
              Information
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
              {details.map(([label, value]) => (
                <div key={label}>
                  <dt className="micro-label text-graphite">{label}</dt>
                  <dd className="mt-1 break-words text-sm">{value}</dd>
                </div>
              ))}
            </dl>
            {model.bio && (
              <div className="mt-6">
                <h3 className="micro-label text-graphite">About</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite">
                  {model.bio}
                </p>
              </div>
            )}
          </section>

          {model.status === "pending" && (
            <section className="mt-8 border border-ledger bg-manila/35 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="micro-label text-graphite">Application</p>
                  <p className="mt-2 text-sm">
                    Received {formatDate(model.created_at)}
                    {profile.applicationSource
                      ? ` · via ${profile.applicationSource.castTitle}`
                      : " · direct application"}
                  </p>
                  {profile.applicationSource && (
                    <Link
                      href={`#invitation-${profile.applicationSource.invitationId}`}
                      className="micro-label mt-2 inline-flex items-center gap-1.5 text-graphite underline underline-offset-4 hover:text-ink"
                    >
                      View submission
                      <ArrowUpRight className="size-3" />
                    </Link>
                  )}
                </div>
                {model.is_hidden && (
                  <MicroBadge tone="hidden">Private profile requested</MicroBadge>
                )}
              </div>
              <div className="mt-4">
                <ModelApprovalActions
                  modelId={model.id}
                  modelName={model.name}
                />
              </div>
            </section>
          )}

          <section className="mt-10">
            <div className="flex items-baseline justify-between gap-3 border-b border-ledger pb-2">
              <h2 className="font-display text-2xl tracking-[-0.02em]">
                Cast history
              </h2>
              <span className="micro-label text-graphite">
                {profile.casts.length}{" "}
                {profile.casts.length === 1 ? "job" : "jobs"}
              </span>
            </div>

            {profile.casts.length ? (
              <div className="mt-4 divide-y divide-ledger/30">
                {profile.casts.map((entry) => (
                  <article key={entry.memberId} className="py-5 first:pt-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/admin/jobs/${entry.cast.id}`}
                          className="font-display text-xl tracking-[-0.02em] hover:underline"
                        >
                          {entry.cast.title}
                        </Link>
                        <p className="mt-1 font-mono text-[12px] text-graphite">
                          {entry.cast.client_name || "Independent"} ·{" "}
                          {formatShootDates(
                            entry.cast.shoot_start,
                            entry.cast.shoot_end,
                          )}
                          {entry.cast.location
                            ? ` · ${entry.cast.location}`
                            : ""}
                        </p>
                      </div>
                      <MicroBadge tone={entry.cast.status}>
                        {entry.cast.status}
                      </MicroBadge>
                    </div>
                    {entry.roleNotes && (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-graphite">
                        {entry.roleNotes}
                      </p>
                    )}
                    <div className="mt-3 max-w-xl">
                      <MediaGallery
                        media={entry.media}
                        title={entry.cast.title}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 border border-dashed border-ledger px-5 py-6 text-sm text-graphite">
                No cast history yet.
              </p>
            )}
          </section>

          <section className="mt-10">
            <div className="flex items-baseline justify-between gap-3 border-b border-ledger pb-2">
              <h2 className="font-display text-2xl tracking-[-0.02em]">
                Invitations
              </h2>
              <span className="micro-label text-graphite">
                {profile.invitations.length}{" "}
                {profile.invitations.length === 1 ? "link" : "links"}
              </span>
            </div>

            {profile.invitations.length ? (
              <div className="mt-4 space-y-4">
                {profile.invitations.map((entry) => {
                  const highlighted = query.invitation === entry.id;
                  return (
                    <article
                      key={entry.id}
                      id={`invitation-${entry.id}`}
                      className={`scroll-mt-8 border p-4 ${
                        highlighted
                          ? "border-ledger bg-manila/30"
                          : "border-ledger/40 bg-card"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/jobs/${entry.castId}`}
                              className="font-display text-xl tracking-[-0.02em] hover:underline"
                            >
                              {entry.castTitle}
                            </Link>
                            {highlighted && (
                              <MicroBadge tone="neutral">
                                Opened from tracker
                              </MicroBadge>
                            )}
                          </div>
                          <p className="mt-1 font-mono text-[12px] text-graphite">
                            {entry.type === "media"
                              ? "Media request"
                              : "Cast invite"}
                            {entry.requireMediaUpload ? " · media required" : ""}
                            {" · "}
                            {entry.submittedAt
                              ? `Submitted ${formatDateTime(entry.submittedAt)}`
                              : entry.draftSavedAt
                                ? `Draft saved ${formatDateTime(entry.draftSavedAt)}`
                                : `Expires ${formatDateTime(entry.expiresAt)}`}
                          </p>
                        </div>
                        <InvitationStatusBadge
                          status={entry.status}
                          hasTarget={entry.type === "media"}
                        />
                      </div>

                      <div className="mt-4 max-w-xl">
                        <MediaGallery
                          media={entry.media}
                          title={entry.castTitle}
                        />
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <Link
                          href={`/invite/${entry.token}`}
                          target="_blank"
                          className="micro-label inline-flex items-center gap-1.5 text-graphite hover:text-ink"
                        >
                          Open invite
                          <ArrowUpRight className="size-3" />
                        </Link>
                        {entry.mediaSource === "draft" && (
                          <span className="micro-label inline-flex items-center gap-1.5 text-graphite">
                            <Film className="size-3" />
                            Draft uploads
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 border border-dashed border-ledger px-5 py-6 text-sm text-graphite">
                No invitations for this model yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
