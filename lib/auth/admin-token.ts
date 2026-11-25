import { jwtVerify, SignJWT } from "jose";

export const ADMIN_COOKIE_NAME = "grotherp_admin";
const TOKEN_TTL = "7d";

function getSecret() {
  const configured = process.env.ADMIN_SESSION_SECRET;
  if (!configured && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET must be set in production.");
  }
  return new TextEncoder().encode(
    configured || "development-only-session-secret-change-this-now",
  );
}

export async function createAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .setSubject("grotherp-admin")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string | undefined | null) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      subject: "grotherp-admin",
    });
    return payload.role === "admin";
  } catch {
    return false;
  }
}
