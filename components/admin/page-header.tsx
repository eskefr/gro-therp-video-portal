import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
  backHref,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  backHref?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 border-b border-border pb-7">
      {backHref && (
        <Link
          href={backHref.href}
          className="micro-label mb-5 inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          {backHref.label}
        </Link>
      )}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="micro-label text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-3 font-display text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
