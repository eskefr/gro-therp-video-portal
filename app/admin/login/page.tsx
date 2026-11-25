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
    <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <div className="paper-texture relative hidden flex-col justify-between border-r border-border p-10 lg:flex xl:p-14">
        <Brand />
        <div className="max-w-xl">
          <p className="micro-label text-muted-foreground">Demo environment</p>
          <p className="mt-6 font-display text-6xl leading-[0.92] tracking-[-0.055em] xl:text-7xl">
            Casting, without
            <br />
            the paperwork.
          </p>
          <p className="mt-7 max-w-sm text-sm leading-7 text-muted-foreground">
            Review applications, build casts, request media, and track every
            invitation from one quiet workspace.
          </p>
        </div>
        <p className="micro-label text-muted-foreground">
          Copenhagen · Internal preview
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          <LoginForm next={next ?? "/admin"} />
        </div>
      </div>
    </div>
  );
}
