import type { Metadata } from "next";
import { ApplyForm } from "@/components/public/apply-form";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply to join the Gro-Therp casting and model agency. Share your details, measurements, and a headshot.",
};

export default function ApplyPage() {
  return (
    <div className="paper-texture">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="micro-label text-muted-foreground">
              Talent applications
            </p>
            <h1 className="mt-5 max-w-md font-display text-5xl leading-[0.96] tracking-[-0.045em] sm:text-6xl xl:text-7xl">
              A face is only
              <br />
              the beginning.
            </h1>
            <p className="mt-7 max-w-sm text-sm leading-7 text-muted-foreground">
              We work with people who bring something of themselves to the
              frame. If that sounds like you, introduce yourself. No prior
              agency experience required.
            </p>
            <div className="mt-10 max-w-sm space-y-4 border-t border-border pt-6">
              <p className="micro-label text-muted-foreground">What happens next</p>
              <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-display text-base text-foreground">01</span>
                  Your application is reviewed by the casting team.
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-base text-foreground">02</span>
                  If there’s a fit, we’ll invite you to a short conversation.
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-base text-foreground">03</span>
                  Approved profiles join the archive, unless you choose to stay
                  hidden.
                </li>
              </ol>
            </div>
            <p className="mt-10 text-xs text-muted-foreground">
              Prefer email? Write to{" "}
              <a
                href="mailto:casting@gro-therp.com"
                className="text-foreground underline underline-offset-4"
              >
                casting@gro-therp.com
              </a>
              .
            </p>
          </div>

          <ApplyForm />
        </div>
      </div>
    </div>
  );
}
