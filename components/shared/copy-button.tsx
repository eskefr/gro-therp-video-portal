"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy link",
  variant = "outline",
  className,
}: {
  value: string;
  label?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const absolute = value.startsWith("/")
      ? new URL(value, window.location.origin).toString()
      : value;

    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      onClick={copy}
      className={cn("micro-label gap-2", className)}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
}
