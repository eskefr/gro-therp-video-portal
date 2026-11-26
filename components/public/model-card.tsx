import Image from "next/image";
import type { PublicModel } from "@/types/app";

export function ModelCard({
  model,
  priority,
}: {
  model: PublicModel;
  priority?: boolean;
}) {
  return (
    <article>
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        <Image
          src={model.headshot_url}
          alt={`Archival portrait ${model.initials}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 44vw, (max-width: 1280px) 29vw, 21vw"
          className="object-cover"
        />
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        <span className="font-medium text-neutral-950">{model.initials}</span>
        {model.age != null ? `, ${model.age}` : ""}
      </p>
    </article>
  );
}
