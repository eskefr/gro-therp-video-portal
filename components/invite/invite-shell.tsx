import { Clock3, MapPin, CalendarDays } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { Countdown } from "@/components/shared/countdown";
import { BRAND } from "@/lib/constants";
import { formatShootDates } from "@/lib/dates";
import type { Cast } from "@/types/app";

export function InviteShell({
  cast,
  expiresAt,
  targetName,
  children,
}: {
  cast: Cast;
  expiresAt?: string;
  targetName?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-[72px] w-full max-w-[1500px] items-center justify-between px-5 md:px-10">
          <Brand />
          <div className="flex items-center gap-4">
            {expiresAt && (
              <span className="micro-label hidden items-center gap-1.5 text-muted-foreground sm:flex">
                <Clock3 className="size-3" />
                <Countdown expiresAt={expiresAt} prefix="Link expires in" />
              </span>
            )}
            <span className="micro-label border border-border px-2.5 py-1.5 text-muted-foreground">
              Private
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-5 py-12 md:px-10 md:py-16 lg:grid-cols-[0.84fr_1.16fr] lg:gap-20 lg:py-24">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <p className="micro-label text-muted-foreground">
            {targetName ? "Casting media request" : "Casting invitation"}
          </p>
          <h1 className="mt-5 max-w-xl font-display text-5xl leading-[0.94] tracking-[-0.05em] sm:text-6xl xl:text-7xl">
            {cast.title}
          </h1>

          <div className="mt-8 max-w-md space-y-5 border-t border-border pt-7">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="micro-label text-muted-foreground">Shoot dates</p>
                <p className="mt-1 text-sm">
                  {formatShootDates(cast.shoot_start, cast.shoot_end)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="micro-label text-muted-foreground">Location</p>
                <p className="mt-1 text-sm">{cast.location || "To be confirmed"}</p>
              </div>
            </div>
            {expiresAt && (
              <div className="flex items-start gap-3 sm:hidden">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="micro-label text-muted-foreground">Invitation</p>
                  <p className="mt-1 text-sm">
                    <Countdown expiresAt={expiresAt} prefix="Expires in" />
                  </p>
                </div>
              </div>
            )}
          </div>

          {cast.description && (
            <p className="mt-8 max-w-sm text-sm leading-7 text-muted-foreground">
              {cast.description}
            </p>
          )}

          {cast.client_name && (
            <p className="micro-label mt-8 text-muted-foreground">
              Client · {cast.client_name}
            </p>
          )}

          {targetName && (
            <div className="mt-8 border-t border-border pt-6">
              <p className="micro-label text-muted-foreground">Requested for</p>
              <p className="mt-2 font-display text-2xl">{targetName}</p>
            </div>
          )}

          <p className="mt-10 text-xs leading-5 text-muted-foreground">
            Something not right? Write to{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="text-foreground underline underline-offset-4"
            >
              {BRAND.email}
            </a>
            .
          </p>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-5 py-5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span>
            © {new Date().getFullYear()} {BRAND.fullName}
          </span>
          <span>Private invitation · Please do not forward</span>
        </div>
      </footer>
    </div>
  );
}
