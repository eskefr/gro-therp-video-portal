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
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <Image
          src={model.headshot_url}
          alt={`${model.name}, represented by Gro-Therp`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      </div>
      <div className="flex items-start justify-between gap-4 pt-3.5">
        <div>
          <h3 className="font-display text-lg leading-tight tracking-[-0.02em] sm:text-xl">
            {model.name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {[model.city, model.height_cm ? `${model.height_cm} cm` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <p className="micro-label hidden pt-1 text-right text-[10px] text-muted-foreground sm:block">
          {model.hair_color}
          {model.hair_color && model.eye_color ? " / " : ""}
          {model.eye_color}
        </p>
      </div>
    </article>
  );
}
