import "server-only";

import { getPendingApplications } from "@/lib/queries/models";
import { getRecentInvitations } from "@/lib/queries/invitations";

export async function getDashboardData() {
  const [applications, invitations] = await Promise.all([
    getPendingApplications(),
    getRecentInvitations(5),
  ]);

  return {
    recentApplications: applications.slice(0, 5),
    recentInvitations: invitations,
  };
}
