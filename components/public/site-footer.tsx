import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { BRAND } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="double-rule mt-auto border-ledger bg-paper">
      <div className="mx-auto grid w-full max-w-[1500px] gap-12 px-5 py-16 md:grid-cols-[1.45fr_0.55fr_0.85fr] md:gap-16 md:px-10 md:py-20">
        <div>
          <Brand compact />
          <p className="mt-6 max-w-sm font-display text-2xl leading-snug tracking-[-0.02em] text-ink">
            Distinctive faces, quiet confidence, and work with a point of view.
          </p>
          <p className="mt-6 max-w-sm text-sm leading-6 text-graphite">
            A casting and model agency representing locally and
            internationally from Copenhagen.
          </p>
        </div>
        <div>
          <p className="micro-label text-graphite">Explore</p>
          <div className="mt-5 flex flex-col gap-3 text-sm">
            <Link href="/archive" className="w-fit hover:text-ledger">
              Model archive
            </Link>
            <Link href="/apply" className="w-fit hover:text-ledger">
              Apply to the agency
            </Link>
            <Link href="/admin" className="w-fit hover:text-ledger">
              Admin access
            </Link>
          </div>
        </div>
        <div>
          <p className="micro-label text-graphite">Contact</p>
          <div className="mt-5 space-y-3 text-sm">
            <a href={`mailto:${BRAND.email}`} className="block hover:text-ledger">
              {BRAND.email}
            </a>
            <p className="font-mono text-xs text-graphite">
              {BRAND.city}, {BRAND.country}
            </p>
          </div>
          <div className="mt-8 border border-ledger bg-manila px-3 py-2">
            <p className="stamp text-[10px] text-ink">
              Copenhagen · Representing worldwide
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-ledger">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-5 py-5 font-mono text-[10px] uppercase tracking-[0.04em] text-graphite sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span>
            © {new Date().getFullYear()} {BRAND.fullName}
          </span>
          <span>Archive no. GT / MMXXVI</span>
        </div>
      </div>
    </footer>
  );
}
