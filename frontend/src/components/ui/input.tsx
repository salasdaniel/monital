import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md border text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "h-10 border-input bg-background px-3 py-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        minimal:
          "h-8 border-gray-300 bg-transparent px-2 py-1 focus-visible:ring-1 focus-visible:ring-gray-300",
      },
      fieldSize: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2 py-1 text-sm",
        xs: "h-7 px-2 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      fieldSize: "default",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, fieldSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, fieldSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };