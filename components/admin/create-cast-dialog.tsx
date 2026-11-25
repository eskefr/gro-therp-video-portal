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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCastAction } from "@/lib/actions/casts";

interface CastFormValues {
  title: string;
  client_name: string;
  description: string;
  location: string;
  shoot_start: string;
  shoot_end: string;
}

const defaults: CastFormValues = {
  title: "",
  client_name: "",
  description: "",
  location: "",
  shoot_start: "",
  shoot_end: "",
};

export function CreateCastDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm<CastFormValues>({
    defaultValues: defaults,
  });

  async function submit(values: CastFormValues) {
    setError(null);
    setPending(true);
    const result = await createCastAction(values);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Cast created.");
    setOpen(false);
    reset(defaults);
    router.refresh();
    if (result.data?.id) router.push(`/admin/jobs/${result.data.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="micro-label h-10 gap-2 rounded-none px-4">
          <Plus className="size-3.5" />
          New cast
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full border-border bg-popover p-0 sm:max-w-xl">
        <div className="border-b border-border px-6 py-5">
          <DialogHeader>
            <p className="micro-label text-muted-foreground">Production</p>
            <DialogTitle className="font-display text-3xl font-normal tracking-[-0.03em]">
              Create a cast
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Set the basics now. You can add models and generate links next.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit(submit)} className="space-y-5 px-6 py-6">
          <div>
            <Label htmlFor="title" className="mb-2 text-xs font-medium">
              Cast title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Aesop — Objects in Stillness"
              className="h-10 rounded-none bg-background"
              required
              {...register("title", { required: true, minLength: 2 })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="client_name" className="mb-2 text-xs font-medium">
                Client
              </Label>
              <Input
                id="client_name"
                placeholder="Aesop"
                className="h-10 rounded-none bg-background"
                {...register("client_name")}
              />
            </div>
            <div>
              <Label htmlFor="location" className="mb-2 text-xs font-medium">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Copenhagen"
                className="h-10 rounded-none bg-background"
                {...register("location")}
              />
            </div>
            <div>
              <Label htmlFor="shoot_start" className="mb-2 text-xs font-medium">
                Shoot start
              </Label>
              <Input
                id="shoot_start"
                type="date"
                className="h-10 rounded-none bg-background"
                {...register("shoot_start")}
              />
            </div>
            <div>
              <Label htmlFor="shoot_end" className="mb-2 text-xs font-medium">
                Shoot end
              </Label>
              <Input
                id="shoot_end"
                type="date"
                className="h-10 rounded-none bg-background"
                {...register("shoot_end")}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description" className="mb-2 text-xs font-medium">
              Brief
            </Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="What are we casting for?"
              className="resize-none rounded-none bg-background"
              {...register("description")}
            />
          </div>

          {error && (
            <p className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
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
              {pending ? "Creating" : "Create cast"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
