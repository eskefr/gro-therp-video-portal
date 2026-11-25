import "server-only";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin-session";

export async function hasAdminSession() {
  return getAdminSession();
}

export function revalidateAdminSurfaces(options?: { archive?: boolean }) {
  revalidatePath("/admin", "layout");
  if (options?.archive) revalidatePath("/archive");
}

export function actionError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
