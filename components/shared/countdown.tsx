"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { cn } from "@/lib/utils";

export function Countdown({
  expiresAt,
  className,
  prefix = "Expires",
}: {
  expiresAt: string;
  className?: string;
  prefix?: string;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const target = new Date(expiresAt);
      if (Number.isNaN(target.getTime()) || target.getTime() <= Date.now()) {
        setLabel("Expired");
        return;
      }
      setLabel(
        `${prefix} ${formatDistanceToNowStrict(target, { addSuffix: false })}`,
      );
    };

    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, [expiresAt, prefix]);

  return (
    <span
      className={cn("font-mono tracking-[0.01em]", className)}
      suppressHydrationWarning
    >
      {label ?? "—"}
    </span>
  );
}
