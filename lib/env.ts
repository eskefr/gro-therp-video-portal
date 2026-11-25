import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getServerEnv() {
  return {
    supabaseUrl: required("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseSecretKey: required("SUPABASE_SECRET_KEY"),
    adminPasscode: required("ADMIN_PASSCODE"),
    adminSessionSecret: required("ADMIN_SESSION_SECRET"),
  };
}

export function getPublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return { supabaseUrl: url, supabasePublishableKey: key };
}
