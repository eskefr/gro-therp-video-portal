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
        "border-b border-border bg-[#eee8dc] lg:sticky lg:top-0 lg:z-40 lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-b-0",
        demoEnabled ? "lg:h-[calc(100vh-2.25rem)]" : "lg:h-screen",
      )}>
      <div className="flex items-center justify-between px-5 py-4 lg:block lg:px-6 lg:py-7">
        <Brand href="/admin" compact />
        <span className="micro-label hidden text-muted-foreground lg:mt-2 lg:block">
          Agency workspace
        </span>
        <span className="micro-label border border-border px-2 py-1 text-muted-foreground lg:hidden">
          Admin
        </span>
      </div>

      <nav className="grid grid-cols-3 gap-1 border-t border-border/70 px-3 py-2 lg:mt-10 lg:flex lg:flex-col lg:gap-0.5 lg:border-t-0 lg:px-3 lg:py-0">
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
                "micro-label flex items-center gap-2.5 px-3 py-2.5 text-muted-foreground transition hover:bg-background/60 hover:text-foreground lg:px-3",
                active && "bg-background text-foreground shadow-[inset_2px_0_0_#1a1712]",
              )}
            >
              <Icon className="size-3.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-border/70 px-6 py-5 lg:mt-auto lg:block">
        <Link
          href="/archive"
          className="micro-label flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
        >
          <Archive className="size-3.5" />
          View public archive
        </Link>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="micro-label mt-4 flex items-center gap-2 text-muted-foreground transition hover:text-foreground"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </form>
      </div>

      <div className="flex items-center gap-4 border-t border-border/70 px-5 py-3 lg:hidden">
        <Link
          href="/archive"
          className="micro-label text-muted-foreground"
        >
          Public archive
        </Link>
        <form action={adminLogoutAction}>
          <button type="submit" className="micro-label text-muted-foreground">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
