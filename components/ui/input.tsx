import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-none border border-input bg-transparent px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:px-2 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-foreground placeholder:text-graphite focus-visible:border-ledger focus-visible:ring-2 focus-visible:ring-ledger/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
