"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterState {
  q: string;
  ageMin: string;
  ageMax: string;
}

const ageRanges = [
  { label: "All", min: "", max: "" },
  { label: "18–25", min: "18", max: "25" },
  { label: "26–35", min: "26", max: "35" },
  { label: "36–45", min: "36", max: "45" },
  { label: "46–55", min: "46", max: "55" },
  { label: "56–70", min: "56", max: "70" },
];

function FilterLink({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "micro-label border-b pb-0.5 text-graphite transition hover:text-ink",
        active ? "border-ledger text-ink" : "border-transparent",
      )}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span className="text-[12px] text-ledger/45">/</span>;
}

export function ArchiveFilters({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    q: searchParams.get("q") ?? "",
    ageMin: searchParams.get("ageMin") ?? "",
    ageMax: searchParams.get("ageMax") ?? "",
  });
  const firstRender = useRef(true);

  function buildQuery(next: FilterState) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value.trim()) params.set(key, value.trim());
      else params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const current = searchParams.get("q") ?? "";
    if (filters.q === current) return;

    const timer = window.setTimeout(() => {
      router.replace(buildQuery(filters), { scroll: false });
    }, 450);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  function update(patch: Partial<FilterState>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    router.replace(buildQuery(next), { scroll: false });
  }

  function clear() {
    const next: FilterState = { q: "", ageMin: "", ageMax: "" };
    setFilters(next);
    router.replace(pathname, { scroll: false });
  }

  const hasFilters = Boolean(filters.q || filters.ageMin || filters.ageMax);
  const ageIsActive = (min: string, max: string) =>
    filters.ageMin === min && filters.ageMax === max;

  return (
    <div className="border-t border-ledger/70">
      <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full max-w-xl items-center gap-5">
          <span className="micro-label w-24 shrink-0 text-graphite">Index</span>
          <div className="flex flex-1 items-center gap-2 border-b border-ledger pb-2">
            <Search className="size-3.5 shrink-0 text-ledger" />
            <input
              value={filters.q}
              onChange={(event) =>
                setFilters({ ...filters, q: event.target.value })
              }
              placeholder="Search initials"
              aria-label="Search models by initials"
              className="w-full bg-transparent font-mono text-xs text-ink outline-none placeholder:text-graphite"
            />
            {filters.q && (
              <button
                type="button"
                onClick={() => {
                  setFilters({ ...filters, q: "" });
                  update({ q: "" });
                }}
                className="shrink-0 text-graphite hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-5">
          <span className="stamp hidden text-[12px] text-graphite sm:inline">
            {String(total).padStart(2, "0")} {total === 1 ? "entry" : "entries"}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={clear}
              className="micro-label inline-flex items-center gap-1.5 border-b border-ledger pb-0.5 text-ink"
            >
              <X className="size-3" />
              Reset index
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-ledger/35 py-3 sm:flex-row sm:items-baseline sm:gap-5">
        <span className="micro-label w-24 shrink-0 text-graphite">Age</span>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
          {ageRanges.map((range, index) => (
            <span key={range.label} className="flex items-baseline gap-2">
              <FilterLink
                active={ageIsActive(range.min, range.max)}
                onClick={() =>
                  update({ ageMin: range.min, ageMax: range.max })
                }
              >
                {range.label}
              </FilterLink>
              {index < ageRanges.length - 1 && <Separator />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
