import * as React from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps {
  content: string
  children: React.ReactNode
  className?: string
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, className }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex", className)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
        {isVisible && (
          <div
            className={cn(
              "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
              "px-2 py-1 text-xs font-medium",
              "bg-popover text-popover-foreground",
              "border rounded-md shadow-md",
              "whitespace-nowrap z-50",
              "animate-fade-in"
            )}
          >
            {content}
            <div
              className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 -mt-1",
                "border-4 border-transparent border-t-popover"
              )}
            />
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

export { Tooltip }
