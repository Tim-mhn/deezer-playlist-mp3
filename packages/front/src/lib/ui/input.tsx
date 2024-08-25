import * as React from "react"

import { cn } from "@/lib/utils"

 
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
  }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full ring-offset-background rounded-md border border-input bg-background px-3 py-2 text-sm 0 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2  focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error ? ' focus-visible:ring-red-600' : 'focus-visible:ring-ring',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
