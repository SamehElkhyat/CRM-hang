import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-[var(--hairline-strong)] bg-muted/40 px-3 py-2.5 text-base leading-relaxed transition-[background-color,border-color,box-shadow] duration-300 outline-none placeholder:text-muted-foreground/70 hover:border-foreground/25 focus-visible:border-foreground/40 focus-visible:bg-muted/70 focus-visible:ring-3 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
