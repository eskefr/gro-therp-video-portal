"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  CircleUserRound,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ModelFormFields,
  type ModelFormValues,
} from "@/components/shared/model-form-fields";
import { HeadshotUploader } from "@/components/shared/headshot-uploader";
import { MediaUploader } from "@/components/shared/media-uploader";
import { DraftIndicator } from "@/components/shared/draft-indicator";
import { ExpiredState } from "@/components/invite/expired-state";
import { SuccessState } from "@/components/invite/success-state";
import { useInvitationAutosave } from "@/hooks/use-invitation-autosave";
import { isValidPhone } from "@/lib/phone";
import type {
  DraftData,
  DraftHeadshot,
  DraftLookup,
  DraftProfile,
  SignedMedia,
  SubmissionMedia,
} from "@/types/app";
import { cn } from "@/lib/utils";

type Step = "phone" | "existing" | "register" | "media";

interface InvitationFlowProps {
  token: string;
  mode: "general" | "media-request";
  requireMedia: boolean;
  initialStep: Step;
  initialDraft: DraftData;
  initialMedia: SignedMedia[];
  initialLookup: DraftLookup | null;
  castTitle: string;
  targetName?: string | null;
  targetStillCast?: boolean;
}

const NUMERIC_FIELDS = [
  "height_cm",
  "bust_cm",
  "waist_cm",
  "hips_cm",
  "shoe_size",
] as const;

function valueOrEmpty(value: number | null | undefined) {
  return value ?? "";
}

function serializeMedia(items: SignedMedia[]): SubmissionMedia[] {
  return items.map((item) => ({
    id: item.id,
    kind: item.kind,
    path: item.path,
    name: item.name,
    mime: item.mime,
    size: item.size,
  }));
}

function cleanProfile(values: ModelFormValues): DraftProfile {
  const profile: DraftProfile = {};
  if (values.name?.trim()) profile.name = values.name.trim();
  if (values.email?.trim()) profile.email = values.email.trim();
  if (values.age !== "" && values.age !== null && values.age !== undefined) {
    const parsedAge = Number(values.age);
    if (Number.isFinite(parsedAge)) profile.age = parsedAge;
  }
  if (values.city?.trim()) profile.city = values.city.trim();
  if (values.hair_color?.trim()) profile.hair_color = values.hair_color.trim();
  if (values.eye_color?.trim()) profile.eye_color = values.eye_color.trim();
  if (values.bio?.trim()) profile.bio = values.bio.trim();
  for (const field of NUMERIC_FIELDS) {
    const raw = values[field];
    if (raw !== "" && raw !== null && raw !== undefined) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) profile[field] = parsed;
    }
  }
  return profile;
}

export function InvitationFlow({
  token,
  mode,
  requireMedia,
  initialStep,
  initialDraft,
  initialMedia,
  initialLookup,
  castTitle,
  targetName,
  targetStillCast = true,
}: InvitationFlowProps) {
  const profile = initialDraft.profile ?? {};
  const form = useForm<ModelFormValues>({
    defaultValues: {
      name: profile.name ?? "",
      age: profile.age ?? "",
      phone: initialDraft.phone ?? "",
      email: profile.email ?? "",
      city: profile.city ?? "",
      height_cm: valueOrEmpty(profile.height_cm),
      bust_cm: valueOrEmpty(profile.bust_cm),
      waist_cm: valueOrEmpty(profile.waist_cm),
      hips_cm: valueOrEmpty(profile.hips_cm),
      shoe_size: valueOrEmpty(profile.shoe_size),
      hair_color: profile.hair_color ?? "",
      eye_color: profile.eye_color ?? "",
      bio: profile.bio ?? "",
      isHidden: Boolean(initialDraft.isHidden),
    },
  });
  const {
    register,
    getValues,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = form;
  const values = useWatch({ control });

  const [step, setStep] = useState<Step>(initialStep);
  const [lookup, setLookup] = useState<DraftLookup | null>(initialLookup);
  const [media, setMedia] = useState<SignedMedia[]>(initialMedia);
  const [headshot, setHeadshot] = useState<DraftHeadshot | null>(
    initialDraft.headshot ?? null,
  );
  const [isHidden, setIsHidden] = useState(Boolean(initialDraft.isHidden));
  const [lookupLoading, setLookupLoading] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const mounted = useRef(false);

  const autosave = useInvitationAutosave(token);

  const buildDraft = useCallback((): DraftData => {
    const current = getValues();
    return {
      schemaVersion: 1,
      step: mode === "media-request" ? "media" : step,
      phone: current.phone,
      profile: cleanProfile(current),
      isHidden,
      headshot,
      media: serializeMedia(media),
      lookup: lookup ?? undefined,
      clientUpdatedAt: new Date().toISOString(),
    };
  }, [getValues, headshot, isHidden, lookup, media, mode, step]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (expired || submitted || alreadySubmitted || !targetStillCast) return;
    autosave.schedule(buildDraft());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, media, headshot, isHidden, step, lookup]);

  async function checkPhone() {
    const phone = getValues("phone");
    setFormError(null);

    if (!isValidPhone(phone)) {
      setError("phone", {
        message: "Enter a valid Danish or international number.",
      });
      return;
    }

    setLookupLoading(true);
    try {
      const response = await fetch(
        `/api/invitations/${encodeURIComponent(token)}/lookup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        },
      );
      const payload = (await response.json()) as {
        found?: boolean;
        name?: string;
        alreadyOnCast?: boolean;
        error?: string;
      };

      if (response.status === 410) {
        setExpired(true);
        return;
      }
      if (response.status === 409) {
        setAlreadySubmitted(true);
        return;
      }
      if (!response.ok) {
        throw new Error(payload.error || "We couldn’t check that number.");
      }

      clearErrors("phone");
      if (payload.found) {
        setLookup({
          matched: true,
          name: payload.name,
          alreadyOnCast: payload.alreadyOnCast,
        });
        setStep("existing");
      } else {
        setLookup({ matched: false });
        setStep("register");
      }
    } catch (lookupError) {
      setFormError(
        lookupError instanceof Error
          ? lookupError.message
          : "We couldn’t check that number.",
      );
    } finally {
      setLookupLoading(false);
    }
  }

  function resetPhone() {
    setStep("phone");
    setLookup(null);
    setFormError(null);
    clearErrors("phone");
  }

  async function submit() {
    setFormError(null);
    const current = getValues();

    if (mode === "general" && step !== "existing") {
      if (!current.name.trim() || current.name.trim().length < 2) {
        setFormError("Please add your full name.");
        return;
      }
      if (!current.phone || !isValidPhone(current.phone)) {
        setFormError("Please add a valid phone number.");
        return;
      }
      if (!headshot?.path) {
        setFormError("Please upload a headshot before submitting.");
        return;
      }
    }

    if (requireMedia && media.length === 0) {
      setFormError("Please upload at least one casting photo or video.");
      return;
    }

    setSubmitting(true);
    try {
      const payload =
        mode === "media-request"
          ? { media: serializeMedia(media) }
          : step === "existing"
            ? { phone: current.phone, media: serializeMedia(media) }
            : {
                phone: current.phone,
                profile: cleanProfile(current),
                isHidden,
                headshotPath: headshot?.path,
                media: serializeMedia(media),
              };

      const response = await fetch(
        `/api/invitations/${encodeURIComponent(token)}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as {
        status?: string;
        alreadySubmitted?: boolean;
        error?: string;
      };

      if (response.status === 410) {
        setExpired(true);
        return;
      }
      if (response.status === 409) {
        setAlreadySubmitted(true);
        return;
      }
      if (!response.ok) {
        throw new Error(result.error || "Your submission could not be sent.");
      }

      setAlreadySubmitted(Boolean(result.alreadySubmitted));
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : "Your submission could not be sent.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (expired || autosave.status === "expired") {
    return <ExpiredState />;
  }

  if (submitted || alreadySubmitted || autosave.status === "submitted") {
    return (
      <SuccessState
        castTitle={castTitle}
        targetName={mode === "media-request" ? targetName : null}
        alreadySubmitted={alreadySubmitted || autosave.status === "submitted"}
      />
    );
  }

  if (!targetStillCast) {
    return (
      <div className="border border-ledger bg-card px-6 py-14 text-center sm:px-10">
        <CircleUserRound className="mx-auto size-8 text-graphite" />
        <h2 className="mt-5 font-display text-4xl tracking-[-0.03em]">
          This request is no longer available.
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-graphite">
          The model is no longer attached to this cast. Contact the casting team
          if you think this is a mistake.
        </p>
      </div>
    );
  }

  const progress =
    mode === "media-request"
      ? ["Media", "Submit"]
      : ["Phone", "Details", "Submit"];
  const activeIndex =
    mode === "media-request"
      ? 0
      : step === "phone"
        ? 0
        : step === "register"
          ? 1
          : 2;

  return (
    <div className="double-rule border border-ledger bg-card">
      <div className="flex items-center justify-between border-b border-ledger bg-manila px-5 py-3.5 sm:px-7">
        <div className="flex items-center gap-2">
          {progress.map((label, index) => {
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "micro-label flex items-center gap-1.5 text-graphite/50",
                    index === activeIndex && "text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center border border-ledger font-mono text-[12px]",
                      index < activeIndex && "bg-paper text-ledger",
                      index === activeIndex && "border-ledger bg-ledger text-paper",
                    )}
                  >
                    {index < activeIndex ? <Check className="size-2.5" /> : index + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
                {index < progress.length - 1 && (
                  <span className="h-px w-4 bg-border sm:w-8" />
                )}
              </div>
            );
          })}
        </div>
        <DraftIndicator
          status={autosave.status}
          savedAt={autosave.savedAt}
          error={autosave.error}
          onRetry={autosave.retry}
        />
      </div>

      <div className="p-5 sm:p-8">
        {mode === "media-request" ? (
          <MediaRequestStep
            media={media}
            setMedia={setMedia}
            setUploadBusy={setUploadBusy}
            token={token}
            targetName={targetName}
          />
        ) : step === "phone" ? (
          <PhoneStep
            register={register}
            error={errors.phone?.message}
            lookupLoading={lookupLoading}
            onContinue={checkPhone}
            initialPhone={getValues("phone")}
          />
        ) : step === "existing" ? (
          <ExistingStep
            name={lookup?.name ?? "Welcome back"}
            alreadyOnCast={Boolean(lookup?.alreadyOnCast)}
            requireMedia={requireMedia}
            media={media}
            setMedia={setMedia}
            setUploadBusy={setUploadBusy}
            token={token}
            onChangeNumber={resetPhone}
          />
        ) : (
          <RegisterStep
            register={register}
            errors={errors}
            headshot={headshot}
            setHeadshot={setHeadshot}
            isHidden={isHidden}
            setIsHidden={setIsHidden}
            requireMedia={requireMedia}
            media={media}
            setMedia={setMedia}
            setUploadBusy={setUploadBusy}
            token={token}
            onChangeNumber={resetPhone}
          />
        )}

        {formError && (
          <p
            role="alert"
            className="mt-6 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-4 border-t border-ledger pt-6 sm:flex-row sm:items-center sm:justify-between">
          <DraftIndicator
            status={autosave.status}
            savedAt={autosave.savedAt}
            error={autosave.error}
            onRetry={autosave.retry}
          />
          {step === "phone" ? (
            <Button
              type="button"
              size="lg"
              onClick={() => void checkPhone()}
              disabled={lookupLoading}
              className="micro-label h-11 min-w-40 rounded-none px-7"
            >
              {lookupLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={() => void submit()}
              disabled={submitting || uploadBusy}
              className="micro-label h-11 min-w-40 rounded-none px-7"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              {submitting ? "Sending" : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PhoneStep({
  register,
  error,
  lookupLoading,
  onContinue,
  initialPhone,
}: {
  register: UseFormRegister<ModelFormValues>;
  error?: string;
  lookupLoading: boolean;
  onContinue: () => void;
  initialPhone: string;
}) {
  return (
    <div>
      <span className="flex size-10 items-center justify-center border border-ledger bg-manila text-ledger">
        <Phone className="size-4" />
      </span>
      <p className="micro-label mt-6 text-graphite">First things first</p>
      <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.03em]">
        Let’s find you.
      </h2>
      <p className="mt-4 max-w-md text-sm leading-6 text-graphite">
        Enter the phone number connected to your profile. If you’ve worked with
        us before, we’ll pull up your details. If not, we’ll ask a few questions.
      </p>

      <div className="mt-7 max-w-sm">
        <Label htmlFor="phone" className="mb-2 text-xs font-medium">
          Phone number <span className="text-destructive">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="20 12 34 56"
          className="h-11 rounded-none bg-paper"
          defaultValue={initialPhone}
          {...register("phone")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onContinue();
            }
          }}
        />
        <p className="mt-2 text-[12px] leading-4 text-graphite">
          Danish numbers can be entered without +45. International numbers
          should include their country code.
        </p>
        {error && <p className="mt-2 font-mono text-[12px] text-destructive">{error}</p>}
      </div>
      {lookupLoading && (
        <p className="mt-4 flex items-center gap-2 text-xs text-graphite">
          <Loader2 className="size-3.5 animate-spin" />
          Checking our archive…
        </p>
      )}
    </div>
  );
}

function ExistingStep({
  name,
  alreadyOnCast,
  requireMedia,
  media,
  setMedia,
  setUploadBusy,
  token,
  onChangeNumber,
}: {
  name: string;
  alreadyOnCast: boolean;
  requireMedia: boolean;
  media: SignedMedia[];
  setMedia: (media: SignedMedia[]) => void;
  setUploadBusy: (busy: boolean) => void;
  token: string;
  onChangeNumber: () => void;
}) {
  return (
    <div>
      <span className="flex size-10 items-center justify-center border border-ledger bg-manila text-ledger">
        <Check className="size-4" />
      </span>
      <p className="micro-label mt-6 text-graphite">Profile found</p>
      <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.03em]">
        Welcome back, {name.split(" ")[0]}.
      </h2>
      <p className="mt-4 max-w-md text-sm leading-6 text-graphite">
        {alreadyOnCast
          ? "You’re already part of this cast. You can send fresh casting media below if the team has asked for it."
          : "We’ll attach your existing profile to this cast. There’s no need to re-enter your details."}
      </p>

      <button
        type="button"
        onClick={onChangeNumber}
        className="micro-label mt-5 inline-flex items-center gap-1.5 text-graphite underline underline-offset-4 hover:text-ink"
      >
        <ArrowLeft className="size-3" />
        Use a different number
      </button>

      {requireMedia ? (
        <div className="mt-8 border-t border-ledger pt-7">
          <MediaUploader
            token={token}
            media={media}
            onChange={setMedia}
            onBusyChange={setUploadBusy}
          />
        </div>
      ) : (
        <div className="mt-8 border border-ledger bg-manila/55 px-5 py-4 text-sm leading-6 text-graphite">
          No uploads required. Just confirm and we’ll let the casting team know
          you’re available.
        </div>
      )}
    </div>
  );
}

function RegisterStep({
  register,
  errors,
  headshot,
  setHeadshot,
  isHidden,
  setIsHidden,
  requireMedia,
  media,
  setMedia,
  setUploadBusy,
  token,
  onChangeNumber,
}: {
  register: UseFormRegister<ModelFormValues>;
  errors: FieldErrors<ModelFormValues>;
  headshot: DraftHeadshot | null;
  setHeadshot: (value: DraftHeadshot | null) => void;
  isHidden: boolean;
  setIsHidden: (value: boolean) => void;
  requireMedia: boolean;
  media: SignedMedia[];
  setMedia: (media: SignedMedia[]) => void;
  setUploadBusy: (busy: boolean) => void;
  token: string;
  onChangeNumber: () => void;
}) {
  return (
    <div>
      <span className="flex size-10 items-center justify-center border border-ledger bg-manila text-ledger">
        <CircleUserRound className="size-4" />
      </span>
      <p className="micro-label mt-6 text-graphite">New to the agency</p>
      <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.03em]">
        Tell us about you.
      </h2>
      <p className="mt-4 max-w-md text-sm leading-6 text-graphite">
        We couldn’t find a profile with that number. Fill in your details below
        and the team will review your application alongside this cast.
      </p>
      <button
        type="button"
        onClick={onChangeNumber}
        className="micro-label mt-5 inline-flex items-center gap-1.5 text-graphite underline underline-offset-4 hover:text-ink"
      >
        <ArrowLeft className="size-3" />
        Use a different number
      </button>

      <div className="mt-8 border-t border-ledger pt-7">
        <HeadshotUploader
          value={headshot}
          onChange={setHeadshot}
          purpose="invitation-headshot"
          invitationToken={token}
          required
        />
      </div>

      <ModelFormFields
        register={register}
        errors={errors}
        className="mt-8 border-t border-ledger pt-7"
      />

      {requireMedia && (
        <div className="mt-8 border-t border-ledger pt-7">
          <MediaUploader
            token={token}
            media={media}
            onChange={setMedia}
            onBusyChange={setUploadBusy}
          />
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 border border-ledger bg-manila px-4 py-4">
        <Checkbox
          id="invite-hidden"
          checked={isHidden}
          onCheckedChange={(checked) => setIsHidden(checked === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="invite-hidden"
          className="flex-col items-start gap-0 text-sm leading-5 font-normal text-ink"
        >
          Keep my profile hidden from the public archive
          <span className="mt-1 block text-xs leading-5 text-graphite">
            The agency can still consider you for this cast. Your profile will
            not be publicly listed.
          </span>
        </Label>
      </div>
    </div>
  );
}

function MediaRequestStep({
  media,
  setMedia,
  setUploadBusy,
  token,
  targetName,
}: {
  media: SignedMedia[];
  setMedia: (media: SignedMedia[]) => void;
  setUploadBusy: (busy: boolean) => void;
  token: string;
  targetName?: string | null;
}) {
  return (
    <div>
      <span className="flex size-10 items-center justify-center border border-ledger bg-manila text-ledger">
        <CircleUserRound className="size-4" />
      </span>
      <p className="micro-label mt-6 text-graphite">
        {targetName ? `For ${targetName}` : "Casting media"}
      </p>
      <h2 className="mt-3 font-display text-4xl leading-tight tracking-[-0.03em]">
        Show us where you are now.
      </h2>
      <p className="mt-4 max-w-md text-sm leading-6 text-graphite">
        The team has asked for a short, current casting clip or a few recent
        photos. Natural light and no heavy retouching, please.
      </p>

      <div className="mt-8">
        <MediaUploader
          token={token}
          media={media}
          onChange={setMedia}
          onBusyChange={setUploadBusy}
        />
      </div>

      <div className="mt-6 border border-ledger bg-paper/60 px-5 py-4 text-xs leading-5 text-graphite">
        Your uploads are saved automatically. You can close this page and come
        back before the link expires.
      </div>
    </div>
  );
}
