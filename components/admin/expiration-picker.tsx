"use client";

import { useState } from "react";
import { addDays, addHours, formatDateTime, toDateTimeLocalValue } from "@/lib/dates";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Preset = "24h" | "3d" | "7d" | "custom";

export function ExpirationPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [preset, setPreset] = useState<Preset>("3d");
  const customValue = toDateTimeLocalValue(new Date(value));

  function choose(next: Preset) {
    setPreset(next);
    if (next === "24h") onChange(addHours(24).toISOString());
    if (next === "3d") onChange(addDays(3).toISOString());
    if (next === "7d") onChange(addDays(7).toISOString());
  }

  return (
    <div>
      <div className="grid grid-cols-4 border border-ledger bg-paper p-1">
        {(
          [
            ["24h", "24 hours"],
            ["3d", "3 days"],
            ["7d", "7 days"],
            ["custom", "Custom"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => choose(key)}
            className={cn(
              "micro-label px-2 py-2 text-graphite transition",
              preset === key && "bg-ledger text-paper",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {preset === "custom" && (
        <div className="mt-3">
          <Input
            type="datetime-local"
            value={customValue}
            onChange={(event) => {
              const next = new Date(event.target.value);
              if (!Number.isNaN(next.getTime())) {
                onChange(next.toISOString());
              }
            }}
            className="h-10 rounded-none bg-paper"
          />
        </div>
      )}

      <p className="mt-2 font-mono text-[10px] text-graphite">
        Closes {formatDateTime(value)} · local time
      </p>
    </div>
  );
}
