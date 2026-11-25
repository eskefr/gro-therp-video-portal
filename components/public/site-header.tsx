import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/shared/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-5 md:h-[68px] md:px-10">
        <Brand />
        <nav className="flex items-center gap-6 md:gap-9">
          <Link
            href="/archive"
            className="micro-label hidden text-muted-foreground transition hover:text-foreground sm:inline"
          >
            The Archive
          </Link>
          <Link
            href="/apply"
            className="micro-label hidden text-muted-foreground transition hover:text-foreground md:inline"
          >
            Apply
          </Link>
          <Link
            href="/apply"
            className="micro-label inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b border-foreground pb-1 text-foreground"
          >
            <span className="hidden sm:inline">Join the agency</span>
            <span className="sm:hidden">Apply</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
