import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { BRAND } from "@/lib/constants";

export function ExpiredState() {
  return (
    <div className="border border-border bg-card px-6 py-14 text-center sm:px-10 md:py-20">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-[#e2c5bf] bg-[#f1dfdb] text-[#8c3f32]">
        <Clock3 className="size-5" />
      </span>
      <p className="micro-label mt-6 text-muted-foreground">Invitation closed</p>
      <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
        This invitation link
        <br />
        has expired.
      </h2>
      <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
        The form is no longer accepting responses. If you were expecting to
        submit something, contact the casting team and they can send a fresh
        link.
      </p>
      <a
        href={`mailto:${BRAND.email}`}
        className="micro-label mt-8 inline-flex items-center gap-1.5 border-b border-foreground pb-1"
      >
        Contact casting
        <ArrowUpRight className="size-3" />
      </a>
      <p className="mt-8 text-xs text-muted-foreground">
        Not part of this cast?{" "}
        <Link href="/apply" className="text-foreground underline underline-offset-4">
          Apply to the agency
        </Link>
        .
      </p>
    </div>
  );
}
