import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900",
          "placeholder:text-gray-500",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0.1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:placeholder:text-gray-400",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
