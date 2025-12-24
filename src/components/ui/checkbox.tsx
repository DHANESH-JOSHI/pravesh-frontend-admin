"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  checked?: boolean | "indeterminate";
}) {
  const isIndeterminate = checked === "indeterminate";
  
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      checked={isIndeterminate ? false : checked}
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        isIndeterminate && "bg-primary text-primary-foreground border-primary data-[state=unchecked]:bg-primary data-[state=unchecked]:text-primary-foreground data-[state=unchecked]:border-primary",
        className
      )}
      {...props}
    >
      {isIndeterminate ? (
        <div className="grid place-content-center text-current">
          <MinusIcon className="size-3.5" />
        </div>
      ) : (
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="grid place-content-center text-current transition-none"
        >
          <CheckIcon className="size-3.5" />
        </CheckboxPrimitive.Indicator>
      )}
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
