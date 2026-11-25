"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ModelFormValues {
  name: string;
  phone: string;
  email: string;
  city: string;
  height_cm: string | number;
  bust_cm: string | number;
  waist_cm: string | number;
  hips_cm: string | number;
  shoe_size: string | number;
  hair_color: string;
  eye_color: string;
  bio: string;
  isHidden: boolean;
}

export function ModelFormFields({
  register,
  errors,
  className,
}: {
  register: UseFormRegister<ModelFormValues>;
  errors: FieldErrors<ModelFormValues>;
  className?: string;
}) {
  const error = (field: keyof ModelFormValues) =>
    errors[field]?.message ? (
      <p className="mt-1 text-[11px] text-destructive">
        {String(errors[field]?.message)}
      </p>
    ) : null;

  return (
    <div className={cn("space-y-7", className)}>
      <div className="space-y-4">
        <p className="micro-label text-muted-foreground">The basics</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="name" required error={error("name")}>
            <Input
              id="name"
              autoComplete="name"
              placeholder="First and last name"
              className="h-10 rounded-none bg-card"
              {...register("name")}
            />
          </Field>
          <Field label="Email" htmlFor="email" error={error("email")}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="h-10 rounded-none bg-card"
              {...register("email")}
            />
          </Field>
          <Field label="City" htmlFor="city" error={error("city")}>
            <Input
              id="city"
              autoComplete="address-level2"
              placeholder="Copenhagen"
              className="h-10 rounded-none bg-card"
              {...register("city")}
            />
          </Field>
          <Field
            label="Phone number"
            htmlFor="phone"
            required
            error={error("phone")}
            hint="Danish numbers can be entered as 20 12 34 56."
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="20 12 34 56"
              className="h-10 rounded-none bg-card"
              {...register("phone")}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="micro-label text-muted-foreground">Measurements</p>
          <p className="mt-1 text-xs text-muted-foreground">
            All measurements in centimetres.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Height" htmlFor="height_cm">
            <Input
              id="height_cm"
              inputMode="numeric"
              placeholder="175"
              className="h-10 rounded-none bg-card"
              {...register("height_cm")}
            />
          </Field>
          <Field label="Bust" htmlFor="bust_cm">
            <Input
              id="bust_cm"
              inputMode="numeric"
              placeholder="82"
              className="h-10 rounded-none bg-card"
              {...register("bust_cm")}
            />
          </Field>
          <Field label="Waist" htmlFor="waist_cm">
            <Input
              id="waist_cm"
              inputMode="numeric"
              placeholder="61"
              className="h-10 rounded-none bg-card"
              {...register("waist_cm")}
            />
          </Field>
          <Field label="Hips" htmlFor="hips_cm">
            <Input
              id="hips_cm"
              inputMode="numeric"
              placeholder="89"
              className="h-10 rounded-none bg-card"
              {...register("hips_cm")}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Shoe size" htmlFor="shoe_size">
            <Input
              id="shoe_size"
              inputMode="decimal"
              placeholder="39.5"
              className="h-10 rounded-none bg-card"
              {...register("shoe_size")}
            />
          </Field>
          <Field label="Hair" htmlFor="hair_color">
            <Input
              id="hair_color"
              placeholder="Brown"
              className="h-10 rounded-none bg-card"
              {...register("hair_color")}
            />
          </Field>
          <Field label="Eyes" htmlFor="eye_color">
            <Input
              id="eye_color"
              placeholder="Green"
              className="h-10 rounded-none bg-card"
              {...register("eye_color")}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <Field
          label="A little about you"
          htmlFor="bio"
          error={error("bio")}
          hint="Interests, experience, languages, availability — whatever feels relevant."
        >
          <Textarea
            id="bio"
            rows={4}
            placeholder="A short introduction…"
            className="resize-none rounded-none bg-card"
            {...register("bio")}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-2 text-xs font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">{hint}</p>
      )}
      {error}
    </div>
  );
}
