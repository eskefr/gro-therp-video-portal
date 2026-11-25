import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Brand({
  href = "/archive",
  className,
  compact = false,
}: {
  href?: string;
  className?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex shrink-0 items-baseline gap-2 whitespace-nowrap text-foreground",
        className,
      )}
      aria-label={`${BRAND.fullName} home`}
    >
      <span className="font-display text-[1.15rem] font-medium tracking-[-0.03em] uppercase sm:text-[1.35rem]">
        {BRAND.name}
      </span>
      {!compact && (
        <span className="micro-label hidden text-muted-foreground sm:inline">
          Casting
        </span>
      )}
    </Link>
  );
}
