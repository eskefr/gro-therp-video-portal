"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Loader2, Pencil } from "lucide-react";
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
import { updateModelAction } from "@/lib/actions/models";
import {
  modelProfilePath,
  type ModelProfileSource,
} from "@/lib/admin-links";
import { isValidPhone } from "@/lib/phone";
import type { DraftHeadshot, Model } from "@/types/app";

export function EditModelDialog({
  model,
  from,
  castId,
  invitationId,
}: {
  model: Model;
  from?: ModelProfileSource;
  castId?: string;
  invitationId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [headshot, setHeadshot] = useState<DraftHeadshot | null>({
    url: model.headshot_url,
    name: "Current profile photo",
  });
  const [isHidden, setIsHidden] = useState(model.is_hidden);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const defaults = useMemo<ModelFormValues>(
    () => ({
      name: model.name,
      age: model.age ?? "",
      phone: model.phone,
      email: model.email ?? "",
      city: model.city ?? "",
      height_cm: model.height_cm ?? "",
      bust_cm: model.bust_cm ?? "",
      waist_cm: model.waist_cm ?? "",
      hips_cm: model.hips_cm ?? "",
      shoe_size: model.shoe_size ?? "",
      hair_color: model.hair_color ?? "",
      eye_color: model.eye_color ?? "",
      bio: model.bio ?? "",
      isHidden: model.is_hidden,
    }),
    [model],
  );
  const form = useForm<ModelFormValues>({ defaultValues: defaults });
  const {
    register,
    handleSubmit,
    reset,
    setError: setFieldError,
    formState: { errors },
  } = form;

  function handleOpenChange(next: boolean) {
    if (next) {
      reset(defaults);
      setHeadshot({
        url: model.headshot_url,
        name: "Current profile photo",
      });
      setIsHidden(model.is_hidden);
      setError(null);
    }
    setOpen(next);
  }

  async function submit(values: ModelFormValues) {
    setError(null);
    if (!isValidPhone(values.phone)) {
      setFieldError("phone", {
        message: "Enter a valid Danish or international number.",
      });
      return;
    }

    setPending(true);
    const result = await updateModelAction({
      modelId: model.id,
      phone: values.phone,
      headshotPath: headshot?.path,
      isHidden,
      profile: {
        name: values.name,
        age: values.age,
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

    toast.success("Profile updated.");
    setOpen(false);
    const nextPhone = result.data?.phone ?? values.phone;
    if (nextPhone.replace(/\D/g, "") !== model.phone.replace(/\D/g, "")) {
      router.push(
        modelProfilePath(nextPhone, {
          from,
          castId,
          invitationId,
        }),
      );
    } else {
      router.refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="micro-label h-10 gap-2 rounded-none"
        >
          <Pencil className="size-3.5" />
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] w-full overflow-y-auto border-ledger bg-popover p-0 sm:max-w-3xl">
        <div className="border-b border-ledger bg-manila px-6 py-5">
          <DialogHeader>
            <p className="micro-label text-graphite">Profile record</p>
            <DialogTitle className="font-display text-3xl font-normal tracking-[-0.03em]">
              Edit {model.name}
            </DialogTitle>
            <DialogDescription className="text-sm text-graphite">
              Changes apply to the admin record and the public archive.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-8 px-6 py-6">
          <div>
            <HeadshotUploader
              value={headshot}
              onChange={setHeadshot}
              purpose="admin-headshot"
              label="Profile photo"
              showRemove={false}
            />
            <p className="mt-2 font-mono text-[12px] leading-4 text-graphite">
              Choose a new image to replace the current photo. The previous
              photo is kept in media history.
            </p>
          </div>

          <div className="border-t border-ledger pt-7">
            <ModelFormFields register={register} errors={errors} />
          </div>

          <div className="flex items-start gap-3 border-t border-ledger pt-6">
            <Checkbox
              id="edit-hidden"
              checked={isHidden}
              onCheckedChange={(checked) => setIsHidden(checked === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="edit-hidden"
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
                <Pencil className="size-3.5" />
              )}
              {pending ? "Saving" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
