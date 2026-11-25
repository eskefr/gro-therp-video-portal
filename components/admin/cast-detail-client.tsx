"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Film,
  Link2,
  Loader2,
  Plus,
  Search,
  StickyNote,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/page-header";
import { InviteLinkDialog } from "@/components/admin/invite-link-dialog";
import { MediaGallery } from "@/components/shared/media-gallery";
import { CopyButton } from "@/components/shared/copy-button";
import { Countdown } from "@/components/shared/countdown";
import {
  InvitationStatusBadge,
  MicroBadge,
} from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addCastMemberAction,
  removeCastMemberAction,
  updateCastStatusAction,
  updateRoleNotesAction,
} from "@/lib/actions/casts";
import { formatDateTime, formatShootDates } from "@/lib/dates";
import { getEffectiveInvitationStatus } from "@/lib/invitations/status";
import type {
  Cast,
  CastMemberWithModel,
  Invitation,
  Model,
  SignedMedia,
} from "@/types/app";

type MemberView = Omit<CastMemberWithModel, "submission_media"> & {
  submission_media: SignedMedia[];
};

export function CastDetailClient({
  cast,
  members,
  invitations,
  availableModels,
}: {
  cast: Cast;
  members: MemberView[];
  invitations: Invitation[];
  availableModels: Model[];
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MemberView | null>(null);
  const [notesMember, setNotesMember] = useState<MemberView | null>(null);
  const [removeMember, setRemoveMember] = useState<MemberView | null>(null);
  const [statusPending, setStatusPending] = useState(false);

  async function toggleStatus() {
    setStatusPending(true);
    const result = await updateCastStatusAction(
      cast.id,
      cast.status === "open" ? "closed" : "open",
    );
    setStatusPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(cast.status === "open" ? "Cast closed." : "Cast reopened.");
    router.refresh();
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow={cast.client_name || "Independent cast"}
        title={cast.title}
        description={cast.description || undefined}
        backHref={{ href: "/admin/jobs", label: "All casts" }}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="micro-label h-10 gap-2 rounded-none whitespace-nowrap"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="size-3.5" />
              Add models
            </Button>
            <Button
              className="micro-label h-10 gap-2 rounded-none whitespace-nowrap"
              onClick={() => setInviteOpen(true)}
              disabled={cast.status === "closed"}
              title={cast.status === "closed" ? "Reopen the cast to generate links" : undefined}
            >
              <Link2 className="size-3.5" />
              Generate invite
            </Button>
          </div>
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3 border border-ledger bg-manila/55 px-5 py-4">
        <div className="flex items-center gap-2">
          <MicroBadge tone={cast.status}>{cast.status}</MicroBadge>
          <button
            type="button"
            onClick={() => void toggleStatus()}
            disabled={statusPending}
            className="micro-label text-graphite underline underline-offset-4 hover:text-ink"
          >
            {statusPending
              ? "Updating…"
              : cast.status === "open"
                ? "Close cast"
                : "Reopen cast"}
          </button>
        </div>
        <span className="h-4 w-px bg-border" />
        <p className="font-mono text-[10px] text-graphite">
          {formatShootDates(cast.shoot_start, cast.shoot_end)}
        </p>
        <p className="font-mono text-[10px] text-graphite">
          {cast.location || "Location TBC"}
        </p>
        <p className="stamp ml-auto text-[10px] text-graphite">
          {members.length} cast · {invitations.length} links
        </p>
      </div>

      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="micro-label text-graphite">Cast</p>
          <h2 className="mt-1 font-display text-2xl">Attached talent</h2>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="micro-label inline-flex items-center gap-1.5 text-graphite hover:text-ink"
        >
          <Plus className="size-3" />
          Add from archive
        </button>
      </div>

      {members.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <article key={member.id} className="border border-ledger bg-card">
              <div className="flex gap-4 p-4">
                <img
                  src={member.model.headshot_url}
                  alt={member.model.name}
                  className="h-32 w-24 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {member.model.status === "pending" && (
                      <MicroBadge tone="pending">Pending</MicroBadge>
                    )}
                    {member.model.is_hidden && (
                      <MicroBadge tone="hidden">Hidden</MicroBadge>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-2xl leading-tight">
                    {member.model.name}
                  </h3>
                  <p className="mt-1 font-mono text-[10px] text-graphite">
                    {member.model.city || "City TBC"}
                    {member.model.height_cm ? ` · ${member.model.height_cm} cm` : ""}
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-graphite">
                    {member.role_notes || "No role notes yet."}
                  </p>
                </div>
              </div>

              <div className="border-t border-ledger px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="micro-label inline-flex items-center gap-1.5 text-graphite">
                    <Film className="size-3" />
                    {member.submission_media.length} media
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setNotesMember(member)}
                      className="micro-label inline-flex items-center gap-1 px-1.5 py-1 text-graphite hover:text-ink"
                    >
                      <StickyNote className="size-3" />
                      Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaTarget(member)}
                      className="micro-label inline-flex items-center gap-1 px-1.5 py-1 text-graphite hover:text-ink"
                    >
                      <Link2 className="size-3" />
                      Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoveMember(member)}
                      className="flex size-7 items-center justify-center text-graphite hover:text-destructive"
                      aria-label={`Remove ${member.model.name}`}
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <MediaGallery media={member.submission_media} title={member.model.name} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No talent attached yet."
          description="Add approved models from the archive, or send a cast invite to someone new."
          action={
            <Button
              className="micro-label h-10 gap-2 rounded-none whitespace-nowrap"
              onClick={() => setAddOpen(true)}
            >
              <UserPlus className="size-3.5" />
              Add models
            </Button>
          }
        />
      )}

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="micro-label text-graphite">Links</p>
            <h2 className="mt-1 font-display text-2xl">Invitations for this cast</h2>
          </div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            disabled={cast.status === "closed"}
            className="micro-label inline-flex items-center gap-1.5 text-graphite hover:text-ink disabled:opacity-40"
          >
            <Plus className="size-3" />
            New cast invite
          </button>
        </div>

        {invitations.length ? (
          <div className="double-rule overflow-x-auto border border-ledger bg-card">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-ledger">
                  {["Recipient", "Type", "Expires", "Status", "Actions"].map(
                    (label) => (
                      <th key={label} className="micro-label px-4 py-3 text-graphite">
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invitations.map((invitation) => {
                  const status = getEffectiveInvitationStatus(invitation);
                  const target = invitation.target_model_id
                    ? members.find(
                        (member) => member.model_id === invitation.target_model_id,
                      )?.model.name
                    : null;
                  return (
                    <tr key={invitation.id}>
                      <td className="px-4 py-3 text-xs">
                        {target ||
                          (invitation.claimed_model_id
                            ? members.find(
                                (member) =>
                                  member.model_id === invitation.claimed_model_id,
                              )?.model.name || "Submitted applicant"
                            : "Any talent")}
                      </td>
                      <td className="px-4 py-3 text-xs text-graphite">
                        {invitation.target_model_id ? "Media request" : "Cast invite"}
                        {invitation.require_media_upload ? " · media required" : ""}
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px]">
                        <span className="block">{formatDateTime(invitation.expires_at)}</span>
                        <Countdown
                          expiresAt={invitation.expires_at}
                          className="mt-0.5 block text-[10px] text-graphite"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <InvitationStatusBadge
                          status={status}
                          hasTarget={Boolean(invitation.target_model_id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <CopyButton
                            value={`/invite/${invitation.token}`}
                            label="Copy"
                            variant="ghost"
                          />
                          <Link
                            href={`/invite/${invitation.token}`}
                            target="_blank"
                            className="micro-label px-2 py-1.5 text-graphite hover:text-ink"
                          >
                            Open
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border border-dashed border-ledger px-5 py-8 text-sm text-graphite">
            No invitations for this cast yet. Generate one when the brief is ready.
          </p>
        )}
      </section>

      <AddModelsDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        castId={cast.id}
        models={availableModels}
        existingModelIds={members.map((member) => member.model_id)}
      />

      <InviteLinkDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        castId={cast.id}
        castTitle={cast.title}
        kind="cast"
      />

      {mediaTarget && (
        <InviteLinkDialog
          open={Boolean(mediaTarget)}
          onOpenChange={(open) => !open && setMediaTarget(null)}
          castId={cast.id}
          castTitle={cast.title}
          targetModelId={mediaTarget.model_id}
          targetName={mediaTarget.model.name}
          kind="media"
        />
      )}

      <RoleNotesDialog
        member={notesMember}
        castId={cast.id}
        onClose={() => setNotesMember(null)}
      />

      <AlertDialog
        open={Boolean(removeMember)}
        onOpenChange={(open) => !open && setRemoveMember(null)}
      >
        <AlertDialogContent className="border-ledger bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-2xl font-normal">
              Remove {removeMember?.model.name} from this cast?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-graphite">
              Their profile will stay in the archive. Submitted media attached to
              this cast will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="micro-label rounded-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="micro-label rounded-none bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                if (!removeMember) return;
                void removeCastMemberAction(cast.id, removeMember.id).then((result) => {
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("Model removed from cast.");
                  setRemoveMember(null);
                  router.refresh();
                });
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddModelsDialog({
  open,
  onOpenChange,
  castId,
  models,
  existingModelIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  castId: string;
  models: Model[];
  existingModelIds: string[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const excluded = new Set([...existingModelIds, ...addedIds]);
    const normalized = query.trim().toLowerCase();
    return models.filter((model) => {
      if (excluded.has(model.id)) return false;
      if (!normalized) return true;
      return [model.name, model.city, model.hair_color, model.eye_color]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [addedIds, existingModelIds, models, query]);

  async function add(model: Model) {
    setPendingId(model.id);
    const result = await addCastMemberAction(castId, model.id);
    setPendingId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setAddedIds((current) => [...current, model.id]);
    toast.success(`${model.name} added to the cast.`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full border-ledger bg-popover p-0 sm:max-w-lg">
        <div className="border-b border-ledger bg-manila px-6 py-5">
          <DialogHeader>
            <p className="micro-label text-graphite">Archive</p>
            <DialogTitle className="font-display text-3xl font-normal tracking-[-0.03em]">
              Add models
            </DialogTitle>
            <DialogDescription className="text-sm text-graphite">
              Approved models only. Hidden profiles are included and marked.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 pt-5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-graphite" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, city, or look"
              className="h-10 rounded-none bg-paper pl-9"
            />
          </div>
        </div>
        <div className="max-h-[45vh] overflow-y-auto px-6 py-4">
          {filtered.length ? (
            <div className="divide-y divide-border border-y border-ledger">
              {filtered.map((model) => (
                <div key={model.id} className="flex items-center gap-3 py-2.5">
                  <img
                    src={model.headshot_url}
                    alt={model.name}
                    className="size-11 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium">{model.name}</p>
                      {model.is_hidden && <MicroBadge tone="hidden">Hidden</MicroBadge>}
                    </div>
                    <p className="text-[11px] text-graphite">
                      {model.city || "City TBC"}
                      {model.height_cm ? ` · ${model.height_cm} cm` : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="micro-label h-8 gap-1.5 rounded-none"
                    disabled={pendingId === model.id}
                    onClick={() => void add(model)}
                  >
                    {pendingId === model.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Plus className="size-3" />
                    )}
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-graphite">
              No available models match.
            </p>
          )}
        </div>
        <DialogFooter className="border-t border-ledger px-6 py-4">
          <Button
            variant="outline"
            className="micro-label h-10 rounded-none"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleNotesDialog({
  member,
  castId,
  onClose,
}: {
  member: MemberView | null;
  castId: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={Boolean(member)} onOpenChange={(open) => !open && onClose()}>
      {member && (
        <RoleNotesBody key={member.id} member={member} castId={castId} onClose={onClose} />
      )}
    </Dialog>
  );
}

function RoleNotesBody({
  member,
  castId,
  onClose,
}: {
  member: MemberView;
  castId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(member.role_notes ?? "");
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    const result = await updateRoleNotesAction({
      castId,
      memberId: member.id,
      roleNotes: notes,
    });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Role notes saved.");
    onClose();
    router.refresh();
  }

  return (
    <DialogContent className="w-full border-ledger bg-popover sm:max-w-md">
      <DialogHeader>
        <p className="micro-label text-graphite">Casting notes</p>
        <DialogTitle className="font-display text-3xl font-normal tracking-[-0.03em]">
          {member.model.name}
        </DialogTitle>
        <DialogDescription className="text-sm text-graphite">
          Private notes for this cast. Only admins can see them.
        </DialogDescription>
      </DialogHeader>
      <div className="mt-2">
        <Label htmlFor="role-notes" className="mb-2 text-xs font-medium">
          Role notes
        </Label>
        <Textarea
          id="role-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={5}
          placeholder="Lead, availability, fitting notes…"
          className="resize-none rounded-none bg-paper"
        />
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          className="micro-label h-10 rounded-none"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          className="micro-label h-10 gap-2 rounded-none"
          onClick={() => void save()}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Check className="size-3.5" />
          )}
          Save notes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
