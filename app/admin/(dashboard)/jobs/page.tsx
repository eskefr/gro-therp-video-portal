import { JobsClient } from "@/components/admin/jobs-client";
import { getCastsWithCounts } from "@/lib/queries/casts";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  const casts = await getCastsWithCounts();
  return <JobsClient casts={casts} />;
}
