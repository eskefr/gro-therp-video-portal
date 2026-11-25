import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CastDetailClient } from "@/components/admin/cast-detail-client";
import { getCastDetail } from "@/lib/queries/casts";
import { getApprovedModels } from "@/lib/queries/models";
import { signMediaCollections } from "@/lib/storage/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = await getCastDetail(id);
  return {
    title: detail?.cast.title ?? "Cast",
    robots: { index: false, follow: false },
  };
}

export default async function CastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getCastDetail(id);
  if (!detail) notFound();

  const [availableModels, signedMedia] = await Promise.all([
    getApprovedModels(),
    signMediaCollections(detail.members.map((member) => member.submission_media)),
  ]);

  const members = detail.members.map((member, index) => ({
    ...member,
    submission_media: signedMedia[index] ?? [],
  }));

  return (
    <CastDetailClient
      cast={detail.cast}
      members={members}
      invitations={detail.invitations}
      availableModels={availableModels}
    />
  );
}
