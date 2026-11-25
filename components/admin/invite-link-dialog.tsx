"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Link2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from "@/components/shared/copy-button";
import { ExpirationPicker } from "@/components/admin/expiration-picker";
import { createInvitationAction } from "@/lib/actions/casts";
import { addDays } from "@/lib/dates";

interface InviteLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  castId: string;
  castTitle: string;
  targetModelId?: string;
  targetName?: string;
  kind: "cast" | "media";
}

export function InviteLinkDialog(props: InviteLinkDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      {props.open && (
        <InviteLinkDialogBody
          key={`${props.kind}-${props.targetModelId ?? "general"}`}
          {...props}
        />
      )}
    </Dialog>
  );
}

function InviteLinkDialogBody({
  onOpenChange,
  castId,
  castTitle,
  targetModelId,
  targetName,
  kind,
}: InviteLinkDialogProps) {
  const router = useRouter();
  const [expiresAt, setExpiresAt] = useState(() => addDays(3).toISOString());
  const [requireMedia, setRequireMedia] = useState(kind === "media");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  async function create() {
    setError(null);
    setPending(true);
    const result = await createInvitationAction({
      castId,
      targetModelId: targetModelId ?? null,
      requireMedia: kind === "media" ? true : requireMedia,
      expiresAt,
    });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setGeneratedToken(result.data?.token ?? null);
    toast.success(kind === "media" ? "Media request link ready." : "Cast invite link ready.");
    router.refresh();
  }

  const link = generatedToken ? `/invite/${generatedToken}` : null;
  const isMedia = kind === "media";

  return (
    <DialogContent className="w-full border-ledger bg-popover p-0 sm:max-w-lg">
      <div className="border-b border-ledger bg-manila px-6 py-5">
        <DialogHeader>
          <p className="micro-label text-graphite">
            {isMedia ? "Direct request" : "Magic link"}
          </p>
          <DialogTitle className="font-display text-3xl font-normal tracking-[-0.03em]">
            {isMedia ? "Request casting media" : "Generate a cast invite"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-graphite">
            {isMedia
              ? `Send ${targetName ?? "this model"} a private upload link for ${castTitle}.`
              : `A single-use link for ${castTitle}. Talent can register or sign in by phone.`}
          </DialogDescription>
        </DialogHeader>
      </div>

      {link ? (
        <div className="px-6 py-7">
          <span className="flex size-10 items-center justify-center border border-ledger bg-manila text-ledger">
            <Check className="size-4" />
          </span>
          <h3 className="mt-5 font-display text-2xl">Link ready.</h3>
          <p className="mt-2 text-sm leading-6 text-graphite">
            Copy it and send it directly to the {isMedia ? "model" : "talent"}.
            Anyone with this link can submit until it expires.
          </p>
          <div className="mt-5 flex items-center gap-2 border border-ledger bg-paper px-3 py-2.5">
            <Link2 className="size-3.5 shrink-0 text-graphite" />
            <span className="min-w-0 flex-1 truncate text-xs">{link}</span>
            <CopyButton value={link} label="Copy" variant="ghost" />
          </div>
          <div className="mt-5 flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="micro-label h-10 flex-1 rounded-none"
            >
              Done
            </Button>
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="micro-label inline-flex h-10 flex-1 items-center justify-center gap-2 border border-ledger bg-manila text-ink"
            >
              Open link
              <Sparkles className="size-3.5" />
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6 px-6 py-6">
          <div>
            <Label className="mb-2 block text-xs font-medium">Link expires</Label>
            <ExpirationPicker value={expiresAt} onChange={setExpiresAt} />
          </div>

          {!isMedia && (
            <div className="flex items-start gap-3 border-t border-ledger pt-5">
              <Switch
                id="require-media"
                checked={requireMedia}
                onCheckedChange={setRequireMedia}
                className="mt-0.5"
              />
              <Label
                htmlFor="require-media"
                className="flex-col items-start gap-0 text-sm leading-5 font-normal"
              >
                Require casting video/photos during signup
                <span className="mt-1 block text-xs leading-5 text-graphite">
                  Talent must upload at least one file before they can submit.
                </span>
              </Label>
            </div>
          )}

          {error && (
            <p className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>
      )}

      {!link && (
        <DialogFooter className="border-t border-ledger px-6 py-4">
          <Button
            variant="outline"
            className="micro-label h-10 rounded-none"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="micro-label h-10 min-w-40 gap-2 rounded-none"
            onClick={() => void create()}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Link2 className="size-3.5" />
            )}
            {pending ? "Generating" : "Generate link"}
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
  );
}
