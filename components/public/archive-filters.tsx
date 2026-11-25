"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { PublicModelFacets } from "@/types/app";

interface FilterState {
  q: string;
  city: string;
  hair: string;
  eyes: string;
  heightMin: string;
  heightMax: string;
}

const selectClass =
  "h-10 w-full appearance-none rounded-none border border-input bg-card px-3 pr-8 text-sm outline-none focus:border-ring";

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="micro-label mb-2 block text-muted-foreground">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={selectClass}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
          ↓
        </span>
      </span>
    </label>
  );
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
  const [open, setOpen] = useState(false);
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
    const next = {
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

  const activeCount = Object.entries(filters).filter(
    ([key, value]) => key !== "q" && Boolean(value),
  ).length;

  const body = (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      <SelectField
        label="City"
        value={filters.city}
        onChange={(value) => update({ city: value })}
        options={facets.cities}
        placeholder="All cities"
      />
      <SelectField
        label="Hair"
        value={filters.hair}
        onChange={(value) => update({ hair: value })}
        options={facets.hairColors}
        placeholder="Any hair"
      />
      <SelectField
        label="Eyes"
        value={filters.eyes}
        onChange={(value) => update({ eyes: value })}
        options={facets.eyeColors}
        placeholder="Any eyes"
      />
      <label className="block">
        <span className="micro-label mb-2 block text-muted-foreground">
          Height from
        </span>
        <select
          value={filters.heightMin}
          onChange={(event) => update({ heightMin: event.target.value })}
          className={selectClass}
        >
          <option value="">Any height</option>
          <option value="165">165 cm</option>
          <option value="170">170 cm</option>
          <option value="175">175 cm</option>
          <option value="180">180 cm</option>
          <option value="185">185 cm</option>
        </select>
      </label>
      <label className="block">
        <span className="micro-label mb-2 block text-muted-foreground">
          Height to
        </span>
        <select
          value={filters.heightMax}
          onChange={(event) => update({ heightMax: event.target.value })}
          className={selectClass}
        >
          <option value="">No limit</option>
          <option value="175">175 cm</option>
          <option value="180">180 cm</option>
          <option value="185">185 cm</option>
          <option value="190">190 cm</option>
          <option value="195">195 cm</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="border-y border-border py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.q}
            onChange={(event) => setFilters({ ...filters, q: event.target.value })}
            placeholder="Search by name"
            aria-label="Search models by name"
            className="h-10 rounded-none border-input bg-card pl-9"
          />
          {filters.q && (
            <button
              type="button"
              onClick={() => {
                setFilters({ ...filters, q: "" });
                update({ q: "" });
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="hidden flex-1 lg:block">{body}</div>

        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="micro-label h-10 gap-2 rounded-none">
                <SlidersHorizontal className="size-3.5" />
                Filters
                {activeCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                    {activeCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl font-normal">
                  Filter the archive
                </SheetTitle>
              </SheetHeader>
              <div className="mt-7">{body}</div>
              <Button
                className="micro-label mt-8 h-11 w-full rounded-none"
                onClick={() => setOpen(false)}
              >
                Show {total} models
              </Button>
              <button
                type="button"
                onClick={() => {
                  clear();
                  setOpen(false);
                }}
                className="micro-label mt-4 w-full text-center text-muted-foreground"
              >
                Clear all filters
              </button>
            </SheetContent>
          </Sheet>
          <p className="text-xs text-muted-foreground">
            {total} {total === 1 ? "face" : "faces"}
          </p>
        </div>

        {(activeCount > 0 || filters.q || filters.heightMax) && (
          <button
            type="button"
            onClick={clear}
            className={cn(
              "micro-label hidden shrink-0 items-center gap-1.5 text-muted-foreground hover:text-foreground lg:flex",
            )}
          >
            <X className="size-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
