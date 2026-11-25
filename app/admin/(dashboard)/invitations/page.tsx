import { InvitationsClient } from "@/components/admin/invitations-client";
import { getInvitationList } from "@/lib/queries/invitations";

export const dynamic = "force-dynamic";

export default async function AdminInvitationsPage() {
  const invitations = await getInvitationList();
  return <InvitationsClient invitations={invitations} />;
}
