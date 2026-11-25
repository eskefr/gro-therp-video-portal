import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border border-dashed border-ledger px-6 py-16 text-center",
        className,
      )}
    >
      <p className="font-display text-2xl tracking-[-0.02em]">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-graphite">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
