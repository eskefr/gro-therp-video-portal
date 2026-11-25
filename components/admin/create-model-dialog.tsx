"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  ModelFormFields,
  type ModelFormValues,
} from "@/components/shared/model-form-fields";
import { HeadshotUploader } from "@/components/shared/headshot-uploader";
import { createApprovedModelAction } from "@/lib/actions/models";
import { isValidPhone } from "@/lib/phone";
import type { DraftHeadshot } from "@/types/app";

const defaults: ModelFormValues = {
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
};

export function CreateModelDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [headshot, setHeadshot] = useState<DraftHeadshot | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ModelFormValues>({ defaultValues: defaults });
  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors },
  } = form;

  async function submit(values: ModelFormValues) {
    setError(null);
    if (!isValidPhone(values.phone)) {
      setFieldError("phone", {
        message: "Enter a valid Danish or international number.",
      });
      return;
    }
    if (!headshot?.path) {
      setError("Upload a headshot before creating the profile.");
      return;
    }

    setPending(true);
    const result = await createApprovedModelAction({
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
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success("Model added to the archive.");
    setOpen(false);
    reset(defaults);
    setHeadshot(null);
    setIsHidden(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="micro-label h-10 gap-2 rounded-none px-4">
          <Plus className="size-3.5" />
          Create model
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-full overflow-y-auto border-ledger bg-popover p-0 sm:max-w-3xl">
        <div className="border-b border-ledger bg-manila px-6 py-5">
          <DialogHeader>
            <p className="micro-label text-graphite">Direct entry</p>
            <DialogTitle className="font-display text-3xl font-normal tracking-[-0.03em]">
              Create a model
            </DialogTitle>
            <DialogDescription className="text-sm text-graphite">
              New profiles created here go straight into the approved archive.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-8 px-6 py-6">
          <HeadshotUploader
            value={headshot}
            onChange={setHeadshot}
            purpose="admin-headshot"
            required
          />

          <div className="border-t border-ledger pt-7">
            <ModelFormFields register={register} errors={errors} />
          </div>

          <div className="flex items-start gap-3 border-t border-ledger pt-6">
            <Checkbox
              id="admin-hidden"
              checked={isHidden}
              onCheckedChange={(checked) => setIsHidden(checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="admin-hidden"
              className="flex-col items-start gap-0 text-sm leading-5 font-normal"
            >
              Hide from the public archive
              <span className="mt-1 block text-xs text-graphite">
                The model remains approved and castable, but won’t be listed
                publicly.
              </span>
            </Label>
          </div>

          {error && (
            <p className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-ledger pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="micro-label h-10 rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="micro-label h-10 min-w-40 gap-2 rounded-none"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              {pending ? "Creating" : "Create approved model"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
