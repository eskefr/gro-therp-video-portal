import Image from "next/image";
import type { PublicModel } from "@/types/app";

export function ModelCard({
  model,
  priority,
  index,
}: {
  model: PublicModel;
  priority?: boolean;
  index: number;
}) {
  const indexLabel = String(index).padStart(2, "0");
  const year = new Date(model.created_at).getFullYear() || 2026;

  return (
    <article className="group flex flex-col border-r border-b border-ledger/60 bg-paper p-2 sm:p-2.5">
      <div className="relative aspect-[4/5] bg-[#fbf9f4] p-1.5">
        <div className="relative size-full overflow-hidden bg-manila/25">
          <Image
            src={model.headshot_url}
            alt={`${model.name}, represented by Gro-Therp`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 96vw, (max-width: 1024px) 46vw, 23vw"
            className="archive-photo object-cover"
          />
        </div>
      </div>

      <div className="min-h-11 px-0.5 pt-2 pb-1">
        <p className="font-display text-sm leading-[1.35] tracking-[-0.01em] text-ink">
          <span className="font-mono text-[9px] tracking-[0.02em] text-graphite">
            {indexLabel}.
          </span>{" "}
          {model.name}{" "}
          <span className="font-mono text-[9px] tracking-[0.02em] text-graphite">
            — {model.city || "Location TBC"} / {year}
          </span>
        </p>
      </div>
    </article>
  );
}
