"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLoginAction } from "@/lib/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await adminLoginAction({ passcode, next });
    if (!result.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push(result.data?.redirectTo ?? "/admin");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm border border-border bg-card p-7 shadow-[0_20px_60px_rgba(50,40,25,0.06)] sm:p-9"
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
        <LockKeyhole className="size-4" />
      </span>
      <p className="micro-label mt-6 text-muted-foreground">Agency workspace</p>
      <h1 className="mt-3 font-display text-4xl tracking-[-0.03em]">
        Welcome back.
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Enter the demo passcode to view and manage the agency.
      </p>

      <div className="mt-7">
        <Label htmlFor="passcode" className="mb-2 text-xs font-medium">
          Passcode
        </Label>
        <Input
          id="passcode"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          className="h-11 rounded-none bg-background"
          placeholder="••••••••"
        />
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={pending || !passcode}
        className="micro-label mt-6 h-11 w-full rounded-none gap-2"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowRight className="size-4" />
        )}
        {pending ? "Checking" : "Enter workspace"}
      </Button>

      <p className="mt-5 text-[11px] leading-5 text-muted-foreground">
        Demo authentication only. Replace the passcode gate with proper auth
        before using this with real talent data.
      </p>
    </form>
  );
}
