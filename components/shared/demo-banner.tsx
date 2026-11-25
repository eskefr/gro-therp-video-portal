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
    <div className="demo-banner relative z-[60] flex min-h-9 items-center justify-center bg-[#171410] px-4 py-2 text-[#f4efe5]">
      <div className="flex w-full max-w-[1500px] flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-between">
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-3 text-[#b9a88d]" />
          <span className="micro-label text-[#b9a88d]">Demo mode</span>
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
                  "micro-label inline-flex items-center gap-1 text-[#efe8dc]",
                  active && "text-white",
                )}
              >
                <span
                  className={cn(
                    "inline-block size-1 rounded-full bg-[#9c8b70]",
                    active && "bg-[#e6b98f]",
                  )}
                />
                {link.label}
              </Link>
            );
          })}
          <Link
            href={`/invite/${DEMO_MEDIA_REQUEST_TOKEN}`}
            className="micro-label hidden items-center gap-1 text-[#a99a83] transition hover:text-white lg:inline-flex"
          >
            Media request
            <ArrowUpRight className="size-3" />
          </Link>
        </nav>
        <span className="micro-label hidden text-[#7f7464] sm:block">
          Not a live environment
        </span>
      </div>
    </div>
  );
}
