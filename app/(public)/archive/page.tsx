import type { Metadata } from "next";
import { ArchiveFilters } from "@/components/public/archive-filters";
import { ArchivePagination } from "@/components/public/archive-pagination";
import { ModelCard } from "@/components/public/model-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getPublicModelFacets,
  getPublicModels,
} from "@/lib/queries/models";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Archive",
  description:
    "Explore the Gro-Therp roster of models and castable talent. Filter by city, height, hair, and eyes.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readValue(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function readNumber(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = Number(readValue(params, key));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = readNumber(params, "page") ?? 1;
  const filters = {
    q: readValue(params, "q")?.slice(0, 80),
    city: readValue(params, "city"),
    hair: readValue(params, "hair"),
    eyes: readValue(params, "eyes"),
    heightMin: readNumber(params, "heightMin"),
    heightMax: readNumber(params, "heightMax"),
    page,
  };

  const [result, facets] = await Promise.all([
    getPublicModels(filters),
    getPublicModelFacets(),
  ]);

  const baseParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first && key !== "page") baseParams[key] = first;
  }

  const hasFilters = Boolean(
    filters.q ||
      filters.city ||
      filters.hair ||
      filters.eyes ||
      filters.heightMin ||
      filters.heightMax,
  );

  return (
    <div>
      <section className="paper-texture double-rule border-b border-ledger">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="micro-label text-graphite">
                Represented talent · {result.total}{" "}
                {result.total === 1 ? "face" : "faces"}
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-6xl leading-[0.88] tracking-[-0.055em] sm:text-7xl xl:text-[6.5rem]">
                The Archive
              </h1>
            </div>
            <div className="max-w-xs lg:pb-3">
              <p className="text-sm leading-6 text-graphite">
                Faces we believe in. A living roster of models and talent for
                editorial, campaign, runway, and moving image.
              </p>
              <p className="stamp mt-5">
                Copenhagen · Representing worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1500px] px-5 md:px-10">
        <ArchiveFilters facets={facets} total={result.total} />

        {result.models.length ? (
          <>
            <div className="grid grid-cols-2 gap-4 py-10 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {result.models.map((model, index) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  priority={index < 4}
                  catalogNumber={`GT / ${String((result.page - 1) * result.pageSize + index + 1).padStart(3, "0")}`}
                />
              ))}
            </div>
            <ArchivePagination
              page={result.page}
              totalPages={result.totalPages}
              baseParams={baseParams}
            />
          </>
        ) : (
          <EmptyState
            className="my-16"
            title={hasFilters ? "No faces match that search." : "The archive is being refreshed."}
            description={
              hasFilters
                ? "Try widening the height range, choosing a different city, or clearing the filters."
                : "New faces are added regularly. Please check back soon."
            }
            action={
              hasFilters ? (
                <a
                  href="/archive"
                  className="micro-label border-b border-ledger pb-1"
                >
                  Clear filters
                </a>
              ) : null
            }
          />
        )}
      </div>
    </div>
  );
}
