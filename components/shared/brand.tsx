import Image from "next/image";
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
      className={cn("group inline-flex shrink-0 items-center text-ink", className)}
      aria-label={`${BRAND.fullName} home`}
    >
      <Image
        src="/brand/peoples-archive.png"
        alt={BRAND.name}
        width={1588}
        height={149}
        priority={!compact}
        className={cn(
          "w-auto",
          compact ? "h-4" : "h-[18px] sm:h-[22px]",
        )}
      />
    </Link>
  );
}
