import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE_NAME,
  createAdminToken,
  verifyAdminToken,
} from "@/lib/auth/admin-token";

export async function getAdminSession() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdmin() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) redirect("/admin/login");
}

export async function createAdminSessionCookie() {
  const token = await createAdminToken();
  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}
