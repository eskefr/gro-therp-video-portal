import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { BRAND } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ledger bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-5 md:h-[72px] md:px-10">
        <Brand />
        <nav className="flex items-center gap-5 md:gap-8">
          <Link
            href="/archive"
            className="micro-label hidden text-graphite transition hover:text-ink sm:inline"
          >
            Archive
          </Link>
          <a
            href={`mailto:${BRAND.email}`}
            className="micro-label hidden text-graphite transition hover:text-ink md:inline"
          >
            Contact
          </a>
          <Link
            href="/apply"
            className="micro-label inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border border-ledger px-3 py-2.5 text-ink transition hover:bg-manila"
          >
            Apply
            <ArrowUpRight className="size-3" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
