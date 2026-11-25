import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function ArchivePagination({
  page,
  totalPages,
  baseParams,
}: {
  page: number;
  totalPages: number;
  baseParams: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (nextPage: number) => {
    const params = new URLSearchParams(baseParams);
    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/archive?${query}` : "/archive";
  };

  return (
    <div className="mt-12 flex items-center justify-between border-t border-ledger pt-6">
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className="micro-label inline-flex items-center gap-2 text-graphite hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="stamp text-graphite">
        {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </span>
      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className="micro-label inline-flex items-center gap-2 text-graphite hover:text-ink"
        >
          Next
          <ArrowRight className="size-3.5" />
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
