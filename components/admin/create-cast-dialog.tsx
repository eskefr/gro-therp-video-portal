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
      <DialogContent className="double-rule w-full border border-ledger bg-popover p-0 sm:max-w-xl">
        <div className="border-b border-ledger bg-manila px-6 py-5">
          <DialogHeader>
            <p className="micro-label text-graphite">Production</p>
            <DialogTitle className="font-display text-3xl font-normal tracking-[-0.03em]">
              Create a cast
            </DialogTitle>
            <DialogDescription className="text-sm text-graphite">
              Set the basics now. You can add models and generate links next.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={handleSubmit(submit)} className="px-6 py-6">
          <div className="ledger-grid sm:grid-cols-2">
            <div className="ledger-section col-span-full flex items-center justify-between px-4 py-2.5">
              <span className="micro-label">Cast details</span>
              <span className="stamp text-[10px]">New record</span>
            </div>
            <div className="ledger-cell sm:col-span-2">
              <Label htmlFor="title" className="micro-label mb-1.5 text-graphite">
                Cast title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Aesop — Objects in Stillness"
                className="h-8 border-0 bg-transparent px-0 py-1 text-[15px] shadow-none focus-visible:ring-0"
                required
                {...register("title", { required: true, minLength: 2 })}
              />
            </div>
            <div className="ledger-cell">
              <Label htmlFor="client_name" className="micro-label mb-1.5 text-graphite">
                Client
              </Label>
              <Input
                id="client_name"
                placeholder="Aesop"
                className="h-8 border-0 bg-transparent px-0 py-1 text-[15px] shadow-none focus-visible:ring-0"
                {...register("client_name")}
              />
            </div>
            <div className="ledger-cell">
              <Label htmlFor="location" className="micro-label mb-1.5 text-graphite">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Copenhagen"
                className="h-8 border-0 bg-transparent px-0 py-1 text-[15px] shadow-none focus-visible:ring-0"
                {...register("location")}
              />
            </div>
            <div className="ledger-cell">
              <Label htmlFor="shoot_start" className="micro-label mb-1.5 text-graphite">
                Shoot start
              </Label>
              <Input
                id="shoot_start"
                type="date"
                className="h-8 border-0 bg-transparent px-0 py-1 font-mono text-xs shadow-none focus-visible:ring-0"
                {...register("shoot_start")}
              />
            </div>
            <div className="ledger-cell">
              <Label htmlFor="shoot_end" className="micro-label mb-1.5 text-graphite">
                Shoot end
              </Label>
              <Input
                id="shoot_end"
                type="date"
                className="h-8 border-0 bg-transparent px-0 py-1 font-mono text-xs shadow-none focus-visible:ring-0"
                {...register("shoot_end")}
              />
            </div>
            <div className="ledger-cell col-span-full">
              <Label htmlFor="description" className="micro-label mb-1.5 text-graphite">
                Brief
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="What are we casting for?"
                className="min-h-20 resize-none border-0 bg-transparent px-0 py-1 text-[15px] shadow-none focus-visible:ring-0"
                {...register("description")}
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-ledger pt-5 sm:flex-row sm:justify-end">
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
