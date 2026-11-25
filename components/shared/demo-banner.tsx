"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import {
  DEMO_MEDIA_REQUEST_TOKEN,
  DEMO_INVITE_TOKEN,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const isEnabled = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

export function DemoBanner() {
  const pathname = usePathname();

  if (!isEnabled) return null;

  const links = [
    { href: "/admin", label: "Admin View", match: "/admin" },
    { href: "/archive", label: "Public Archive", match: "/archive" },
    {
      href: `/invite/${DEMO_INVITE_TOKEN}`,
      label: "Test Invite Link",
      match: "/invite",
    },
  ];

  return (
    <div className="demo-banner relative z-[60] flex min-h-9 items-center justify-center border-b border-ledger bg-ink px-4 py-2 text-paper">
      <div className="flex w-full max-w-[1500px] flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-between">
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-3 text-manila" />
          <span className="micro-label text-manila">Demo mode</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
          {links.map((link) => {
            const active =
              link.match === "/invite"
                ? pathname.startsWith("/invite")
                : pathname.startsWith(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "micro-label inline-flex items-center gap-1 text-paper/75",
                  active && "text-paper",
                )}
              >
                <span
                  className={cn(
                    "inline-block size-1 border border-paper/30 bg-transparent",
                    active && "border-manila bg-manila",
                  )}
                />
                {link.label}
              </Link>
            );
          })}
          <Link
            href={`/invite/${DEMO_MEDIA_REQUEST_TOKEN}`}
            className="micro-label hidden items-center gap-1 text-paper/50 transition hover:text-paper lg:inline-flex"
          >
            Media request
            <ArrowUpRight className="size-3" />
          </Link>
        </nav>
        <span className="micro-label hidden text-graphite sm:block">
          Not a live environment
        </span>
      </div>
    </div>
  );
}
