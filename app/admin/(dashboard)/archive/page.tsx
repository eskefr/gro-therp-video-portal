import { AdminArchiveClient } from "@/components/admin/archive-client";
import { getApprovedModels } from "@/lib/queries/models";

export const dynamic = "force-dynamic";

export default async function AdminArchivePage() {
  const models = await getApprovedModels();
  return <AdminArchiveClient models={models} />;
}
