import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--vektrus-radius-sm)] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#49B7E3] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#49B7E3] text-white hover:bg-[#3a9fd1] shadow-card hover:shadow-elevated",
        destructive:
          "bg-[#FA7E70] text-white hover:bg-[#f96555] shadow-card",
        outline:
          "border border-[rgba(73,183,227,0.18)] bg-white hover:border-[#49B7E3] hover:bg-[#F4FCFE] text-[#111111] shadow-subtle",
        secondary:
          "bg-[#B6EBF7] text-[#111111] hover:bg-[#9dd8d4]",
        ghost: "hover:bg-[#F4FCFE] text-[#7A7A7A] hover:text-[#111111]",
        link: "text-[#49B7E3] underline-offset-4 hover:underline",
        // AI Action: used exclusively for KI-triggered actions
        // (start Pulse generation, regenerate text, generate design, etc.)
        // Uses AI Violet border + text, with a subtle Pulse Gradient glow on hover.
        "ai-action":
          "border border-[#7C6CF2] bg-white text-[#7C6CF2] hover:bg-[rgba(124,108,242,0.04)] hover:shadow-[0_0_12px_rgba(124,108,242,0.22)] focus-visible:ring-[#7C6CF2]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }