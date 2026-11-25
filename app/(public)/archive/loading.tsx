import { Skeleton } from "@/components/ui/skeleton";

export default function ArchiveLoading() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="mt-6 h-20 w-[min(100%,560px)]" />
        </div>
      </section>
      <div className="mx-auto w-full max-w-[1500px] px-5 md:px-10">
        <div className="border-y border-border py-5">
          <Skeleton className="h-10 w-full max-w-sm" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-10 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="aspect-[3/4] w-full" />
              <Skeleton className="mt-4 h-5 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
