"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { PublicModelFacets } from "@/types/app";
import { cn } from "@/lib/utils";

interface FilterState {
  q: string;
  city: string;
  hair: string;
  eyes: string;
  heightMin: string;
  heightMax: string;
}

const heightRanges = [
  { label: "All", min: "", max: "" },
  { label: "To 170", min: "", max: "169" },
  { label: "170–175", min: "170", max: "175" },
  { label: "175–180", min: "175", max: "180" },
  { label: "180–185", min: "180", max: "185" },
  { label: "185+", min: "185", max: "" },
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

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-t border-ledger/35 py-3 sm:flex-row sm:items-baseline sm:gap-5">
      <span className="micro-label w-24 shrink-0 text-graphite">{label}</span>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
        {children}
      </div>
    </div>
  );
}

function Separator() {
  return <span className="text-[10px] text-ledger/45">/</span>;
}

export function ArchiveFilters({
  facets,
  total,
}: {
  facets: PublicModelFacets;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    q: searchParams.get("q") ?? "",
    city: searchParams.get("city") ?? "",
    hair: searchParams.get("hair") ?? "",
    eyes: searchParams.get("eyes") ?? "",
    heightMin: searchParams.get("heightMin") ?? "",
    heightMax: searchParams.get("heightMax") ?? "",
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
    const next: FilterState = {
      q: "",
      city: "",
      hair: "",
      eyes: "",
      heightMin: "",
      heightMax: "",
    };
    setFilters(next);
    router.replace(pathname, { scroll: false });
  }

  const hasFilters = Boolean(
    filters.q ||
      filters.city ||
      filters.hair ||
      filters.eyes ||
      filters.heightMin ||
      filters.heightMax,
  );

  const heightIsActive = (min: string, max: string) =>
    filters.heightMin === min && filters.heightMax === max;

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
              placeholder="Search the casting index"
              aria-label="Search models by name"
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
          <span className="stamp hidden text-[10px] text-graphite sm:inline">
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

      <FilterRow label="Location">
        <FilterLink active={!filters.city} onClick={() => update({ city: "" })}>
          All
        </FilterLink>
        {facets.cities.map((city) => (
          <span key={city} className="flex items-baseline gap-2">
            <Separator />
            <FilterLink
              active={filters.city === city}
              onClick={() => update({ city })}
            >
              {city}
            </FilterLink>
          </span>
        ))}
      </FilterRow>

      <FilterRow label="Hair">
        <FilterLink active={!filters.hair} onClick={() => update({ hair: "" })}>
          All
        </FilterLink>
        {facets.hairColors.map((hair) => (
          <span key={hair} className="flex items-baseline gap-2">
            <Separator />
            <FilterLink
              active={filters.hair === hair}
              onClick={() => update({ hair })}
            >
              {hair}
            </FilterLink>
          </span>
        ))}
      </FilterRow>

      <FilterRow label="Eyes">
        <FilterLink active={!filters.eyes} onClick={() => update({ eyes: "" })}>
          All
        </FilterLink>
        {facets.eyeColors.map((eyes) => (
          <span key={eyes} className="flex items-baseline gap-2">
            <Separator />
            <FilterLink
              active={filters.eyes === eyes}
              onClick={() => update({ eyes })}
            >
              {eyes}
            </FilterLink>
          </span>
        ))}
      </FilterRow>

      <FilterRow label="Height / cm">
        {heightRanges.map((range, index) => (
          <span key={range.label} className="flex items-baseline gap-2">
            {index > 0 && <Separator />}
            <FilterLink
              active={heightIsActive(range.min, range.max)}
              onClick={() =>
                update({
                  heightMin: range.min,
                  heightMax: range.max,
                })
              }
            >
              {range.label}
            </FilterLink>
          </span>
        ))}
      </FilterRow>
    </div>
  );
}
