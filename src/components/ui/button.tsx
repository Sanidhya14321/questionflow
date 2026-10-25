import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] border-[3px] border-black text-sm font-extrabold uppercase tracking-wide ring-offset-background transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:translate-x-[2px] active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-[4px_4px_0_0_#000] hover:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[4px_4px_0_0_#000] hover:brightness-95",
        outline:
          "bg-card text-card-foreground shadow-[4px_4px_0_0_#000] hover:bg-accent",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[4px_4px_0_0_#000] hover:brightness-95",
        ghost: "bg-transparent border-transparent shadow-none hover:bg-accent hover:border-black hover:shadow-[4px_4px_0_0_#000]",
        link: "border-none bg-transparent p-0 h-auto shadow-none text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
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
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
