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
  const reference = `GT / ${cast.id.slice(0, 4).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ledger">
        <div className="mx-auto flex h-[72px] w-full max-w-[1500px] items-center justify-between px-5 md:px-10">
          <Brand />
          <div className="flex items-center gap-4">
            {expiresAt && (
              <span className="micro-label hidden items-center gap-1.5 text-graphite sm:flex">
                <Clock3 className="size-3 text-ledger" />
                <Countdown expiresAt={expiresAt} prefix="Link expires in" />
              </span>
            )}
            <span className="micro-label border border-ledger bg-manila px-2.5 py-1.5 text-ink">
              Private
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] gap-10 px-5 py-12 md:px-10 md:py-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20 lg:py-24">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center justify-between gap-4">
            <p className="micro-label text-graphite">
              {targetName ? "Casting media request" : "Casting invitation"}
            </p>
            <span className="stamp text-[10px] text-graphite">{reference}</span>
          </div>
          <h1 className="mt-5 max-w-xl font-display text-5xl leading-[0.94] tracking-[-0.045em] text-ink sm:text-6xl xl:text-7xl">
            {cast.title}
          </h1>

          <div className="mt-9 max-w-md border border-ledger bg-manila/55">
            <div className="flex items-start gap-3 border-b border-ledger px-4 py-3.5">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-ledger" />
              <div>
                <p className="micro-label text-graphite">Shoot dates</p>
                <p className="mt-1 font-mono text-xs text-ink">
                  {formatShootDates(cast.shoot_start, cast.shoot_end)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-ledger px-4 py-3.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ledger" />
              <div>
                <p className="micro-label text-graphite">Location</p>
                <p className="mt-1 font-mono text-xs text-ink">
                  {cast.location || "To be confirmed"}
                </p>
              </div>
            </div>
            {expiresAt && (
              <div className="flex items-start gap-3 px-4 py-3.5 sm:hidden">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-ledger" />
                <div>
                  <p className="micro-label text-graphite">Invitation</p>
                  <p className="mt-1 font-mono text-xs text-ink">
                    <Countdown expiresAt={expiresAt} prefix="Expires in" />
                  </p>
                </div>
              </div>
            )}
          </div>

          {cast.description && (
            <p className="mt-8 max-w-sm text-sm leading-7 text-graphite">
              {cast.description}
            </p>
          )}

          {cast.client_name && (
            <p className="micro-label mt-8 text-graphite">
              Client · {cast.client_name}
            </p>
          )}

          {targetName && (
            <div className="mt-8 border border-ledger bg-paper px-4 py-4">
              <p className="micro-label text-graphite">Requested for</p>
              <p className="mt-2 font-display text-2xl text-ink">{targetName}</p>
            </div>
          )}

          <p className="mt-10 font-mono text-[10px] leading-5 text-graphite">
            Something not right? Write to{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="text-ledger underline underline-offset-4"
            >
              {BRAND.email}
            </a>
            .
          </p>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>

      <footer className="double-rule border-ledger">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-5 py-5 font-mono text-[10px] uppercase tracking-[0.04em] text-graphite sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span>
            © {new Date().getFullYear()} {BRAND.fullName}
          </span>
          <span>Private invitation · Please do not forward</span>
        </div>
      </footer>
    </div>
  );
}
