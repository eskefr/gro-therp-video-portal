import "server-only";

import { getPendingApplications } from "@/lib/queries/models";
import { getRecentInvitations } from "@/lib/queries/invitations";
import { getRecentCasts } from "@/lib/queries/casts";

export async function getDashboardData() {
  const [applications, invitations, casts] = await Promise.all([
    getPendingApplications(),
    getRecentInvitations(5),
    getRecentCasts(4),
  ]);

  return {
    recentApplications: applications.slice(0, 5),
    recentInvitations: invitations,
    recentCasts: casts,
  };
}
