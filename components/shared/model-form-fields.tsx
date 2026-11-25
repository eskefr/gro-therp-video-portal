"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ModelFormValues {
  name: string;
  age: string | number;
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

const cellInput =
  "h-8 w-full border-0 bg-transparent px-0 py-1 text-[15px] shadow-none outline-none placeholder:text-graphite focus-visible:ring-0";

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
      <p className="mt-1 font-mono text-[12px] text-destructive">
        {String(errors[field]?.message)}
      </p>
    ) : null;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="ledger-grid sm:grid-cols-2">
        <div className="ledger-section col-span-full flex items-center justify-between px-4 py-2.5">
          <span className="micro-label">The basics</span>
          <span className="stamp text-[12px]">Form 01 / Talent</span>
        </div>

        <Field label="Full name" htmlFor="name" required error={error("name")}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="First and last name"
            className={cellInput}
            {...register("name")}
          />
        </Field>
        <Field label="Age" htmlFor="age" required error={error("age")}>
          <Input
            id="age"
            type="number"
            min={18}
            max={90}
            inputMode="numeric"
            placeholder="28"
            className={cellInput}
            {...register("age")}
          />
        </Field>
        <Field label="Email" htmlFor="email" error={error("email")}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cellInput}
            {...register("email")}
          />
        </Field>
        <Field label="City" htmlFor="city" error={error("city")}>
          <Input
            id="city"
            autoComplete="address-level2"
            placeholder="Copenhagen"
            className={cellInput}
            {...register("city")}
          />
        </Field>
        <Field
          label="Phone number"
          htmlFor="phone"
          required
          error={error("phone")}
          hint="Danish numbers can be entered as 20 12 34 56."
          className="sm:col-span-2"
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="20 12 34 56"
            className={cellInput}
            {...register("phone")}
          />
        </Field>
      </div>

      <div>
        <div className="ledger-grid grid-cols-2 sm:grid-cols-4">
          <div className="ledger-section col-span-full flex items-center justify-between px-4 py-2.5">
            <span className="micro-label">Measurements</span>
            <span className="stamp text-[12px]">Centimetres</span>
          </div>
          <Field label="Height" htmlFor="height_cm">
            <Input
              id="height_cm"
              inputMode="numeric"
              placeholder="175"
              className={cellInput}
              {...register("height_cm")}
            />
          </Field>
          <Field label="Bust" htmlFor="bust_cm">
            <Input
              id="bust_cm"
              inputMode="numeric"
              placeholder="82"
              className={cellInput}
              {...register("bust_cm")}
            />
          </Field>
          <Field label="Waist" htmlFor="waist_cm">
            <Input
              id="waist_cm"
              inputMode="numeric"
              placeholder="61"
              className={cellInput}
              {...register("waist_cm")}
            />
          </Field>
          <Field label="Hips" htmlFor="hips_cm">
            <Input
              id="hips_cm"
              inputMode="numeric"
              placeholder="89"
              className={cellInput}
              {...register("hips_cm")}
            />
          </Field>
        </div>
        <p className="mt-1.5 font-mono text-[12px] leading-4 text-graphite">
          All measurements in centimetres. Leave blank if unsure.
        </p>
      </div>

      <div className="ledger-grid grid-cols-3">
        <div className="ledger-section col-span-full px-4 py-2.5">
          <span className="micro-label">Colouring & sizing</span>
        </div>
        <Field label="Shoe size" htmlFor="shoe_size">
          <Input
            id="shoe_size"
            inputMode="decimal"
            placeholder="39.5"
            className={cellInput}
            {...register("shoe_size")}
          />
        </Field>
        <Field label="Hair" htmlFor="hair_color">
          <Input
            id="hair_color"
            placeholder="Brown"
            className={cellInput}
            {...register("hair_color")}
          />
        </Field>
        <Field label="Eyes" htmlFor="eye_color">
          <Input
            id="eye_color"
            placeholder="Green"
            className={cellInput}
            {...register("eye_color")}
          />
        </Field>
      </div>

      <div className="ledger-grid">
        <div className="ledger-section flex items-center justify-between px-4 py-2.5">
          <span className="micro-label">Personal note</span>
          <span className="stamp text-[12px]">Optional</span>
        </div>
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
            className="min-h-20 resize-none border-0 bg-transparent px-0 py-1 text-[15px] shadow-none focus-visible:ring-0"
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
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: React.ReactNode;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("ledger-cell", className)}>
      <Label
        htmlFor={htmlFor}
        className="micro-label mb-1.5 flex items-center gap-1 text-graphite"
      >
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && (
        <p className="mt-1 font-mono text-[12px] leading-4 text-graphite">{hint}</p>
      )}
      {error}
    </div>
  );
}
