import { Check } from "lucide-react";

export function SuccessState({
  castTitle,
  targetName,
  alreadySubmitted,
}: {
  castTitle: string;
  targetName?: string | null;
  alreadySubmitted?: boolean;
}) {
  return (
    <div className="border border-border bg-card px-6 py-14 text-center sm:px-10 md:py-20">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-[#bfd0bf] bg-[#e5ecdf] text-[#40553a]">
        <Check className="size-5" />
      </span>
      <p className="micro-label mt-6 text-muted-foreground">
        {alreadySubmitted ? "Already submitted" : "Submission received"}
      </p>
      <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
        {targetName ? "Your casting media" : "You’re all set"}
        <br />
        {targetName ? "is with the team." : "for now."}
      </h2>
      <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-muted-foreground">
        {targetName
          ? `The casting team can now review your submission for ${castTitle}. No further action is needed.`
          : `Your details are attached to ${castTitle}. The agency will review your profile and be in touch if there’s a next step.`}
      </p>
      <p className="micro-label mt-8 text-muted-foreground">
        You can close this window.
      </p>
    </div>
  );
}
