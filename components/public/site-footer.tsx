import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { BRAND } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="double-rule mt-auto border-ledger bg-paper">
      <div className="mx-auto grid w-full max-w-[1500px] gap-12 px-5 py-16 md:grid-cols-[1.4fr_0.5fr_1.15fr] md:gap-16 md:px-10 md:py-20">
        <div>
          <Brand compact className="h-5" />
          <p className="mt-6 max-w-sm font-display text-2xl leading-snug tracking-[-0.02em] text-ink">
            Distinctive faces, quiet confidence, and work with a point of view.
          </p>
          <p className="mt-6 max-w-sm text-sm leading-6 text-graphite">
            Peoples Archive is the casting practice of Gro Therp Casting,
            working locally and internationally from Copenhagen.
          </p>
        </div>
        <div>
          <p className="micro-label text-graphite">Explore</p>
          <div className="mt-5 flex flex-col gap-3 text-sm">
            <Link href="/archive" className="w-fit hover:text-ledger">
              Archive
            </Link>
            <Link href="/apply" className="w-fit hover:text-ledger">
              Apply
            </Link>
            <a href={`mailto:${BRAND.email}`} className="w-fit hover:text-ledger">
              Contact
            </a>
            <Link href="/admin" className="w-fit hover:text-ledger">
              Admin access
            </Link>
          </div>
        </div>
        <div>
          <p className="micro-label text-graphite">Contact</p>
          <div className="mt-5 border border-ledger bg-manila px-4 py-3">
            <p className="micro-label text-graphite">Address</p>
            <address className="mt-1.5 font-mono text-[11px] leading-5 text-ink not-italic">
              {BRAND.address}
              <br />
              {BRAND.postalCode} {BRAND.city}
            </address>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="micro-label text-graphite">
                Casting director · {BRAND.directorName}
              </p>
              <a
                href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
                className="mt-1 block font-mono text-[11px] text-ink hover:text-ledger"
              >
                {BRAND.phone}
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="block font-mono text-[11px] text-ink hover:text-ledger"
              >
                {BRAND.email}
              </a>
            </div>
            <div>
              <p className="micro-label text-graphite">
                Casting assistant · {BRAND.assistantName}
              </p>
              <a
                href={`tel:${BRAND.assistantPhone.replace(/\s/g, "")}`}
                className="mt-1 block font-mono text-[11px] text-ink hover:text-ledger"
              >
                {BRAND.assistantPhone}
              </a>
              <a
                href={`mailto:${BRAND.assistantEmail}`}
                className="block font-mono text-[11px] text-ink hover:text-ledger"
              >
                {BRAND.assistantEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-ledger">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-5 py-5 font-mono text-[10px] uppercase tracking-[0.04em] text-graphite sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span>
            © {new Date().getFullYear()} {BRAND.fullName}
          </span>
          <span>Peoples Archive · PA / MMXXVI</span>
        </div>
      </div>
    </footer>
  );
}
