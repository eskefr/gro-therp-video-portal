import Link from "next/link";
import { Brand } from "@/components/shared/brand";
import { BRAND } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid w-full max-w-[1500px] gap-12 px-5 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-10">
        <div>
          <Brand compact />
          <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
            A casting and model agency for distinctive faces, quiet confidence,
            and work with a point of view.
          </p>
        </div>
        <div>
          <p className="micro-label text-muted-foreground">Explore</p>
          <div className="mt-4 flex flex-col gap-2.5 text-sm">
            <Link href="/archive" className="w-fit hover:underline">
              Model archive
            </Link>
            <Link href="/apply" className="w-fit hover:underline">
              Apply to the agency
            </Link>
            <Link href="/admin" className="w-fit hover:underline">
              Admin access
            </Link>
          </div>
        </div>
        <div>
          <p className="micro-label text-muted-foreground">Contact</p>
          <div className="mt-4 space-y-2.5 text-sm">
            <a href={`mailto:${BRAND.email}`} className="block hover:underline">
              {BRAND.email}
            </a>
            <p className="text-muted-foreground">
              {BRAND.city}, {BRAND.country}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-5 py-5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span>
            © {new Date().getFullYear()} {BRAND.fullName}
          </span>
          <span>Copenhagen · Representing locally and internationally</span>
        </div>
      </div>
    </footer>
  );
}
