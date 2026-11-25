import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/admin-session";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <AdminNav />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-8 md:px-8 md:py-11 xl:px-12">
          {children}
        </div>
      </main>
    </div>
  );
}
