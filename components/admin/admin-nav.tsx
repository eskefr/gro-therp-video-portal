"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  Link2,
  LogOut,
} from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { adminLogoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const demoEnabled = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/archive", label: "Archive", icon: Archive },
  { href: "/admin/applications", label: "Applications", icon: ClipboardList },
  { href: "/admin/invitations", label: "Invitations", icon: Link2 },
  { href: "/admin/jobs", label: "Casts", icon: BriefcaseBusiness },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className={cn(
        "border-b border-ledger bg-manila lg:sticky lg:top-0 lg:z-40 lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0",
        demoEnabled ? "lg:h-[calc(100vh-2.25rem)]" : "lg:h-screen",
      )}>
      <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-7">
        <Brand href="/admin" compact />
        <span className="micro-label hidden text-graphite lg:mt-2 lg:block">
          Agency workspace
        </span>
        <span className="micro-label border border-ledger px-2 py-1 text-graphite lg:hidden">
          Admin
        </span>
      </div>

      <nav className="grid grid-cols-2 gap-1 border-t border-ledger/70 px-3 py-2 sm:grid-cols-3 lg:mt-10 lg:flex lg:flex-col lg:gap-0.5 lg:border-t-0 lg:px-3 lg:py-0">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "micro-label flex items-center gap-2.5 px-3 py-2.5 text-graphite transition hover:bg-manila/30 hover:text-ink lg:px-3",
                active && "bg-paper text-ink shadow-[inset_2px_0_0_#3B6E9C]",
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-ledger/70 px-6 py-5 lg:mt-auto lg:block">
        <Link
          href="/archive"
          className="micro-label flex items-center gap-2 text-graphite transition hover:text-ink"
        >
          <Archive className="size-3.5 shrink-0" />
          <span className="whitespace-nowrap">Public archive</span>
        </Link>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="micro-label mt-4 flex items-center gap-2 text-graphite transition hover:text-ink"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 border-t border-ledger/70 px-5 py-3 lg:hidden">
        <Link
          href="/archive"
          className="micro-label text-graphite"
        >
          Public archive
        </Link>
        <form action={adminLogoutAction}>
          <button type="submit" className="micro-label text-graphite">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
