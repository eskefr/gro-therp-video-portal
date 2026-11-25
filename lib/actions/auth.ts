"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
} from "@/lib/auth/admin-session";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";
import { getServerEnv } from "@/lib/env";
import type { ActionResult } from "@/types/app";

function safeEqual(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export async function adminLoginAction(input: {
  passcode: string;
  next?: string;
}): Promise<ActionResult<{ redirectTo: string }>> {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "local";
  const rateKey = `admin-login:${ip}`;
  const rate = checkRateLimit(rateKey, 8, 10 * 60 * 1000);

  if (!rate.allowed) {
    return {
      ok: false,
      error: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  const { adminPasscode } = getServerEnv();
  const supplied = input.passcode.trim();

  if (!supplied || !safeEqual(supplied, adminPasscode)) {
    return { ok: false, error: "That passcode doesn’t match. Try again." };
  }

  resetRateLimit(rateKey);
  await createAdminSessionCookie();

  const next =
    input.next && input.next.startsWith("/admin") && input.next !== "/admin/login"
      ? input.next
      : "/admin";

  return { ok: true, data: { redirectTo: next } };
}

export async function adminLogoutAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
