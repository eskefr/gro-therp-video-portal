import Image from "next/image";
import type { PublicModel } from "@/types/app";

export function ModelCard({
  model,
  priority,
  catalogNumber,
}: {
  model: PublicModel;
  priority?: boolean;
  catalogNumber?: string;
}) {
  return (
    <article className="group border border-ledger/70 bg-paper transition-colors hover:border-ledger">
      <div className="relative aspect-[3/4] overflow-hidden bg-manila/40">
        <Image
          src={model.headshot_url}
          alt={`${model.name}, represented by Gro-Therp`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex items-start justify-between gap-3 border-t border-ledger/60 px-3 py-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[9px] leading-none text-graphite">
              {catalogNumber ?? "GT"}
            </span>
            <h3 className="truncate font-display text-lg leading-tight tracking-[-0.02em] sm:text-xl">
              {model.name}
            </h3>
          </div>
          <p className="mt-1 font-mono text-[10px] leading-4 text-graphite">
            {[model.city, model.height_cm ? `${model.height_cm} cm` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <p className="hidden shrink-0 text-right font-mono text-[9px] leading-4 text-graphite uppercase sm:block">
          {model.hair_color}
          {model.hair_color && model.eye_color ? " / " : ""}
          {model.eye_color}
        </p>
      </div>
    </article>
  );
}
