import Link from "next/link";

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
    <div className="mt-14 flex items-center justify-between text-sm text-neutral-500">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="hover:text-neutral-950">
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span>
        {String(page).padStart(2, "0")} /{" "}
        {String(totalPages).padStart(2, "0")}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="hover:text-neutral-950">
          Next
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
