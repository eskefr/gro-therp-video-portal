import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-none border border-input bg-transparent px-3 py-2 text-base transition-colors outline-none placeholder:text-graphite focus-visible:border-ledger focus-visible:ring-2 focus-visible:ring-ledger/20 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
