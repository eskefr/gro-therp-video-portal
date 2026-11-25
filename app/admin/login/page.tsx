import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";
import { Brand } from "@/components/shared/brand";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <Brand />
        </div>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
