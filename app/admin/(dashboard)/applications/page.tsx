import { ApplicationsClient } from "@/components/admin/applications-client";
import { getPendingApplications } from "@/lib/queries/models";

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage() {
  const applications = await getPendingApplications();
  return <ApplicationsClient applications={applications} />;
}
