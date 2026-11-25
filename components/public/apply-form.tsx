"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import {
  ModelFormFields,
  type ModelFormValues,
} from "@/components/shared/model-form-fields";
import { HeadshotUploader } from "@/components/shared/headshot-uploader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { submitApplicationAction } from "@/lib/actions/applications";
import { isValidPhone } from "@/lib/phone";
import type { DraftHeadshot } from "@/types/app";

export function ApplyForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ModelFormValues>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      height_cm: "",
      bust_cm: "",
      waist_cm: "",
      hips_cm: "",
      shoe_size: "",
      hair_color: "",
      eye_color: "",
      bio: "",
      isHidden: false,
    },
  });

  const [headshot, setHeadshot] = useState<DraftHeadshot | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(values: ModelFormValues) {
    setServerError(null);

    if (!isValidPhone(values.phone)) {
      setError("phone", {
        message: "Enter a valid Danish or international number.",
      });
      return;
    }
    if (!headshot?.path) {
      setServerError("Please upload a headshot before applying.");
      return;
    }

    setSubmitting(true);
    const result = await submitApplicationAction({
      phone: values.phone,
      headshotPath: headshot.path,
      isHidden,
      profile: {
        name: values.name,
        email: values.email,
        city: values.city,
        height_cm: values.height_cm,
        bust_cm: values.bust_cm,
        waist_cm: values.waist_cm,
        hips_cm: values.hips_cm,
        shoe_size: values.shoe_size,
        hair_color: values.hair_color,
        eye_color: values.eye_color,
        bio: values.bio,
      },
    });
    setSubmitting(false);

    if (!result.ok) {
      setServerError(result.error);
      return;
    }

    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    return (
      <div className="border border-border bg-card px-7 py-14 text-center sm:px-12">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-[#bfd0bf] bg-[#e5ecdf] text-[#40553a]">
          <Check className="size-5" />
        </span>
        <h2 className="mt-7 font-display text-4xl tracking-[-0.03em]">
          Application received.
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
          Thank you for introducing yourself. The agency reviews new
          applications every week and will be in touch if there’s a fit.
        </p>
        <p className="micro-label mt-8 text-muted-foreground">
          {isHidden
            ? "Your profile will stay private while under review."
            : "Your profile will appear publicly once approved."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border border-border bg-card/70 p-5 sm:p-8 lg:p-10"
    >
      <div className="mb-9 flex items-start justify-between gap-6 border-b border-border pb-6">
        <div>
          <p className="micro-label text-muted-foreground">Application</p>
          <h2 className="mt-2 font-display text-3xl tracking-[-0.03em]">
            Introduce yourself
          </h2>
        </div>
        <span className="micro-label hidden items-center gap-1.5 text-muted-foreground sm:inline-flex">
          <ShieldCheck className="size-3.5" />
          Private by default
        </span>
      </div>

      <HeadshotUploader
        value={headshot}
        onChange={setHeadshot}
        purpose="application-headshot"
        required
      />

      <ModelFormFields
        register={register}
        errors={errors}
        className="mt-9 border-t border-border pt-8"
      />

      <div className="mt-8 flex items-start gap-3 border-t border-border pt-7">
        <Checkbox
          id="hidden"
          checked={isHidden}
          onCheckedChange={(checked) => setIsHidden(checked === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="hidden"
          className="flex-col items-start gap-0 text-sm leading-5 font-normal text-foreground"
        >
          Keep my profile hidden from the public archive
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
            The agency can still view and cast you. You can change this later.
          </span>
        </Label>
      </div>

      {serverError && (
        <p
          role="alert"
          className="mt-6 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {serverError}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-[11px] leading-5 text-muted-foreground">
          By applying you agree to the agency storing your details for casting
          consideration.
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="micro-label h-12 min-w-44 gap-2 rounded-none px-6"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowRight className="size-4" />
          )}
          {submitting ? "Sending" : "Send application"}
        </Button>
      </div>
    </form>
  );
}
