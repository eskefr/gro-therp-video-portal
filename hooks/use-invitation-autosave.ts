"use client";

import { useEffect, useRef, useState } from "react";
import type { DraftData } from "@/types/app";

type AutosaveStatus =
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "error"
  | "expired"
  | "submitted";

export function useInvitationAutosave(token: string) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingDraft = useRef<DraftData | null>(null);
  const inFlight = useRef(false);
  const timer = useRef<number | null>(null);
  const terminal = useRef(false);

  async function flush() {
    if (terminal.current || inFlight.current) return;
    const draft = pendingDraft.current;
    if (!draft) return;

    pendingDraft.current = null;
    inFlight.current = true;
    setStatus("saving");
    setError(null);

    try {
      const response = await fetch(
        `/api/invitations/${encodeURIComponent(token)}/draft`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draft }),
          cache: "no-store",
        },
      );

      if (response.status === 410) {
        terminal.current = true;
        setStatus("expired");
        return;
      }
      if (response.status === 409) {
        terminal.current = true;
        setStatus("submitted");
        return;
      }

      const payload = (await response.json()) as {
        savedAt?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Draft could not be saved.");
      }

      setSavedAt(payload.savedAt ?? new Date().toISOString());
      setStatus("saved");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Draft could not be saved.",
      );
      setStatus("error");
    } finally {
      inFlight.current = false;
      if (pendingDraft.current && !terminal.current) {
        void flush();
      }
    }
  }

  function schedule(draft: DraftData) {
    if (terminal.current) return;
    pendingDraft.current = draft;
    setStatus("pending");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void flush();
    }, 800);
  }

  function retry() {
    if (pendingDraft.current) {
      void flush();
    }
  }

  useEffect(() => {
    const onPageHide = () => {
      if (!pendingDraft.current || terminal.current) return;
      const payload = JSON.stringify({ draft: pendingDraft.current });
      void fetch(`/api/invitations/${encodeURIComponent(token)}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
      pendingDraft.current = null;
    };

    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [token]);

  return {
    status,
    savedAt,
    error,
    schedule,
    retry,
    flush,
  };
}
