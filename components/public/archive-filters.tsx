"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

export function ArchiveFilters() {
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
    <div className="space-y-7">
      <div>
        <label
          htmlFor="archive-search"
          className="text-sm font-medium text-neutral-950"
        >
          Index
        </label>
        <input
          id="archive-search"
          value={filters.q}
          onChange={(event) =>
            setFilters({ ...filters, q: event.target.value })
          }
          placeholder="initials"
          aria-label="Search models by initials"
          className="mt-2 w-full border-b border-neutral-300 bg-transparent pb-1.5 text-sm text-neutral-950 outline-none placeholder:text-neutral-500 focus:border-neutral-950"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-neutral-950">Age</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 lg:flex-col lg:gap-y-1">
          {ageRanges.map((range) => {
            const active = ageIsActive(range.min, range.max);
            return (
              <button
                key={range.label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  update({ ageMin: range.min, ageMax: range.max })
                }
                className={cn(
                  "w-fit text-left text-sm transition-colors",
                  active
                    ? "font-medium text-neutral-950 underline underline-offset-4"
                    : "text-neutral-500 hover:text-neutral-950",
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={clear}
          className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-950"
        >
          Reset
        </button>
      )}
    </div>
  );
}
