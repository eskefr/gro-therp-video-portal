import type { Metadata } from "next";
import { ArchiveFilters } from "@/components/public/archive-filters";
import { ArchivePagination } from "@/components/public/archive-pagination";
import { ModelCard } from "@/components/public/model-card";
import { EmptyState } from "@/components/shared/empty-state";
import { getPublicModels } from "@/lib/queries/models";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Archive",
  description:
    "Explore the Peoples Archive casting index by initials and age. Full profiles remain private to the agency.",
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
    ageMin: readNumber(params, "ageMin"),
    ageMax: readNumber(params, "ageMax"),
    page,
  };

  const result = await getPublicModels(filters);

  const baseParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first && key !== "page") baseParams[key] = first;
  }

  const hasFilters = Boolean(filters.q || filters.ageMin || filters.ageMax);

  return (
    <div>
      <section className="paper-texture double-rule border-b border-ledger">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="micro-label text-graphite">
                Archive casting · {result.total}{" "}
                {result.total === 1 ? "entry" : "entries"}
              </p>
              <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] tracking-[-0.05em] sm:text-6xl xl:text-7xl">
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

      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <ArchiveFilters total={result.total} />

        {result.models.length ? (
          <>
            <div className="mt-7 grid grid-cols-1 border-t border-l border-ledger/60 sm:grid-cols-2 lg:grid-cols-4">
              {result.models.map((model, index) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  priority={index < 4}
                  index={(result.page - 1) * result.pageSize + index + 1}
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
                ? "Try a different age range, search by initials, or clear the filters."
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
