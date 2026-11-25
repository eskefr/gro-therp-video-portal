import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="micro-label text-muted-foreground">404 — Not found</p>
        <h1 className="mt-5 text-5xl tracking-[-0.04em] md:text-6xl">
          This page has left the set.
        </h1>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          The link may be mistyped, expired, or no longer part of the archive.
        </p>
        <Link
          href="/archive"
          className="micro-label mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1"
        >
          Return to the archive
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </main>
  );
}
