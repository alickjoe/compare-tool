import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToggleProps {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  label?: string
  className?: string
  disabled?: boolean
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ pressed, onPressedChange, label, className, disabled }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        disabled={disabled}
        onClick={() => onPressedChange(!pressed)}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium",
          "ring-offset-background transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "border border-input",
          pressed
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background hover:bg-accent hover:text-accent-foreground",
          "h-10 px-3",
          className
        )}
      >
        {label}
      </button>
    )
  }
)
Toggle.displayName = "Toggle"

export { Toggle }
