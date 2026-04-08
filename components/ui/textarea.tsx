import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-border/40 bg-background px-3.5 py-2.5 text-sm leading-relaxed transition-colors duration-200 outline-none placeholder:text-muted-foreground/60 focus-visible:ring-[1.5px] focus-visible:ring-primary/30 focus-visible:border-primary/50 dark:focus-visible:ring-primary/40 dark:focus-visible:border-primary/60 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
