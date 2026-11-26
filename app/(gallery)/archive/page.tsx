import type { Metadata } from "next";
import Link from "next/link";
import { ArchiveFilters } from "@/components/public/archive-filters";
import { ArchivePagination } from "@/components/public/archive-pagination";
import { ModelCard } from "@/components/public/model-card";
import { BRAND } from "@/lib/constants";
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
    <div className="min-h-screen bg-white text-neutral-950">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-8 md:px-8 md:py-10 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[180px_1fr] lg:gap-12 xl:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-8 lg:flex lg:h-[calc(100vh-6rem)] lg:flex-col lg:self-start">
            <Link
              href="/archive"
              className="w-fit text-[15px] font-semibold tracking-[-0.01em] text-neutral-950"
            >
              Peoples Archive
            </Link>

            <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm lg:flex-col lg:gap-y-2">
              <Link
                href="/archive"
                className="w-fit font-medium text-neutral-950 underline underline-offset-4"
              >
                Archive
              </Link>
              <Link
                href="/apply"
                className="w-fit text-neutral-500 transition-colors hover:text-neutral-950"
              >
                Apply
              </Link>
              <a
                href={`mailto:${BRAND.email}`}
                className="w-fit text-neutral-500 transition-colors hover:text-neutral-950"
              >
                Contact
              </a>
            </nav>

            <div className="mt-9">
              <ArchiveFilters />
            </div>

            <p className="mt-auto hidden text-sm text-neutral-500 lg:block">
              © {new Date().getFullYear()} Peoples Archive
            </p>
          </aside>

          <main>
            <div className="mb-7 flex items-baseline justify-between gap-4 text-sm text-neutral-500">
              <h1 className="sr-only">The Archive</h1>
              <span>Casting archive</span>
              <span>
                {result.total} {result.total === 1 ? "entry" : "entries"}
              </span>
            </div>

            {result.models.length ? (
              <>
                <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {result.models.map((model, index) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      priority={index < 4}
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
              <div className="py-24 text-center">
                <p className="text-lg font-medium text-neutral-950">
                  {hasFilters
                    ? "No faces match that search."
                    : "The archive is being refreshed."}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
                  {hasFilters
                    ? "Try a different age range, search by initials, or clear the filters."
                    : "New faces are added regularly. Please check back soon."}
                </p>
                {hasFilters && (
                  <a
                    href="/archive"
                    className="mt-6 inline-block text-sm text-neutral-950 underline underline-offset-4"
                  >
                    Clear filters
                  </a>
                )}
              </div>
            )}
          </main>

          <p className="text-sm text-neutral-500 lg:hidden">
            © {new Date().getFullYear()} Peoples Archive
          </p>
        </div>
      </div>
    </div>
  );
}
