import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
  backHref,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 border-b border-ledger pb-4">
      {backHref && (
        <Link
          href={backHref.href}
          className="micro-label mb-3 inline-flex items-center gap-1.5 text-graphite hover:text-ink"
        >
          <ArrowLeft className="size-3" />
          {backHref.label}
        </Link>
      )}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          {eyebrow && (
            <p className="micro-label text-graphite">{eyebrow}</p>
          )}
          <h1 className="mt-1 font-display text-3xl leading-none tracking-[-0.03em] sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-xl text-sm leading-6 text-graphite">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
