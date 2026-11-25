import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Film } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MediaGallery } from "@/components/shared/media-gallery";
import {
  InvitationStatusBadge,
  MicroBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/dates";
import { formatPhone } from "@/lib/phone";
import { getInvitationInspection } from "@/lib/queries/invitations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invitation inspection",
  robots: { index: false, follow: false },
};

export default async function InvitationInspectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inspection = await getInvitationInspection(id);
  if (!inspection) notFound();

  const { profile } = inspection;
  const fields = [
    ["Name", profile.name],
    ["Age", profile.age != null ? String(profile.age) : null],
    ["Phone", profile.phone ? formatPhone(profile.phone) : null],
    ["Email", profile.email],
    ["City", profile.city],
    ["Height", profile.height_cm != null ? `${profile.height_cm} cm` : null],
    ["Bust", profile.bust_cm != null ? `${profile.bust_cm} cm` : null],
    ["Waist", profile.waist_cm != null ? `${profile.waist_cm} cm` : null],
    ["Hips", profile.hips_cm != null ? `${profile.hips_cm} cm` : null],
    ["Shoe", profile.shoe_size != null ? String(profile.shoe_size) : null],
    ["Hair", profile.hair_color],
    ["Eyes", profile.eye_color],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  const hasSidebar =
    Boolean(inspection.headshotUrl) ||
    profile.isHidden ||
    inspection.modelStatus === "pending";
  const hasContent = hasSidebar || fields.length > 0 || inspection.media.length > 0;

  return (
    <div>
      <AdminPageHeader
        backHref={{ href: "/admin/invitations", label: "Invitations" }}
        eyebrow={inspection.castTitle}
        title={inspection.recipientName || "General cast invite"}
        action={
          <Button
            asChild
            variant="outline"
            className="micro-label h-10 gap-2 rounded-none"
          >
            <Link
              href={`/invite/${inspection.token}`}
              target="_blank"
              rel="noreferrer"
            >
              Open invite
              <ArrowUpRight className="size-3.5" />
            </Link>
          </Button>
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-ledger pb-4">
        <InvitationStatusBadge
          status={inspection.status}
          hasTarget={inspection.isMediaRequest}
        />
        <span className="micro-label text-graphite">
          {inspection.isMediaRequest ? "Media request" : "Cast invite"}
        </span>
        {inspection.requireMediaUpload && (
          <span className="micro-label inline-flex items-center gap-1.5 text-graphite">
            <Film className="size-3" />
            Media required
          </span>
        )}
        <span className="font-mono text-[12px] text-graphite">
          Expires {formatDateTime(inspection.expiresAt)}
        </span>
        {inspection.submittedAt && (
          <span className="font-mono text-[12px] text-graphite">
            Submitted {formatDateTime(inspection.submittedAt)}
          </span>
        )}
        {!inspection.submittedAt && inspection.draftSavedAt && (
          <span className="font-mono text-[12px] text-graphite">
            Draft saved {formatDateTime(inspection.draftSavedAt)}
          </span>
        )}
      </div>

      {hasContent ? (
        <div
          className={
            hasSidebar ? "grid gap-8 lg:grid-cols-[240px_1fr]" : undefined
          }
        >
          {hasSidebar && (
            <div>
              {inspection.headshotUrl && (
                <img
                  src={inspection.headshotUrl}
                  alt={profile.name || "Casting headshot"}
                  className="aspect-[4/5] w-full object-cover"
                />
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.isHidden && (
                  <MicroBadge tone="hidden">Private profile requested</MicroBadge>
                )}
                {inspection.modelStatus === "pending" && (
                  <MicroBadge tone="pending">Awaiting approval</MicroBadge>
                )}
              </div>
              {inspection.modelStatus === "pending" && (
                <Link
                  href="/admin/applications"
                  className="micro-label mt-4 inline-flex items-center gap-1.5 text-graphite underline underline-offset-4 hover:text-ink"
                >
                  Review application
                  <ArrowUpRight className="size-3" />
                </Link>
              )}
            </div>
          )}

          <div className="min-w-0">
            <section>
              <h2 className="font-display text-2xl tracking-[-0.02em]">Profile</h2>
              {fields.length ? (
                <dl className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                  {fields.map(([label, value]) => (
                    <div key={label}>
                      <dt className="micro-label text-graphite">{label}</dt>
                      <dd className="mt-1 break-words text-sm">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-3 text-sm text-graphite">
                  No profile details submitted yet.
                </p>
              )}
              {profile.bio && (
                <div className="mt-6">
                  <h3 className="micro-label text-graphite">About</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite">
                    {profile.bio}
                  </p>
                </div>
              )}
            </section>

            <section className="mt-8 border-t border-ledger pt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl tracking-[-0.02em]">
                  Uploads
                </h2>
                <span className="micro-label text-graphite">
                  {inspection.media.length
                    ? `${inspection.media.length} ${
                        inspection.media.length === 1 ? "file" : "files"
                      }${inspection.mediaSource === "draft" ? " in draft" : ""}`
                    : "None"}
                </span>
              </div>
              <div className="mt-4 max-w-xl">
                <MediaGallery
                  media={inspection.media}
                  title={inspection.recipientName || "Invitation uploads"}
                />
              </div>
            </section>
          </div>
        </div>
      ) : (
        <p className="border border-dashed border-ledger px-5 py-8 text-sm text-graphite">
          Nothing has been submitted for this invitation yet.
        </p>
      )}
    </div>
  );
}
