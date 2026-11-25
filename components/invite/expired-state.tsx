import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { BRAND } from "@/lib/constants";

export function ExpiredState() {
  return (
    <div className="double-rule border border-ledger bg-card px-6 py-14 text-center sm:px-10 md:py-20">
      <span className="mx-auto flex size-12 items-center justify-center border border-[#9a3b2e] bg-[#f1e5e1] text-[#7f3b31]">
        <Clock3 className="size-5" />
      </span>
      <p className="stamp mt-6">Invitation closed</p>
      <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
        This invitation link
        <br />
        has expired.
      </h2>
      <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-graphite">
        The form is no longer accepting responses. If you were expecting to
        submit something, contact the casting team and they can send a fresh
        link.
      </p>
      <a
        href={`mailto:${BRAND.email}`}
        className="micro-label mt-8 inline-flex items-center gap-1.5 border-b border-ledger pb-1"
      >
        Contact casting
        <ArrowUpRight className="size-3" />
      </a>
      <p className="mt-8 text-xs text-graphite">
        Not part of this cast?{" "}
        <Link href="/apply" className="text-ink underline underline-offset-4">
          Apply to the agency
        </Link>
        .
      </p>
    </div>
  );
}
