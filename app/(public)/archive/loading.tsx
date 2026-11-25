import { Skeleton } from "@/components/ui/skeleton";

export default function ArchiveLoading() {
  return (
    <div>
      <section className="border-b border-ledger">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-20">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="mt-6 h-20 w-[min(100%,560px)]" />
        </div>
      </section>
      <div className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
        <div className="border-t border-ledger py-5">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="mt-7 grid grid-cols-1 border-t border-l border-ledger/60 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="border-r border-b border-ledger/60 p-2 sm:p-2.5"
            >
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="mt-3 h-3 w-4/5" />
              <Skeleton className="mt-1.5 h-2 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
