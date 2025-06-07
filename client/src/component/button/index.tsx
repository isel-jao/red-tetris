import React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.HTMLAttributes<HTMLElement> {
  ref?: React.RefObject<HTMLButtonElement | null>;
}

export function Button({ className, children, ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(
        "bg-foreground/10 hover:bg-foreground/20 px-4 py-2 rounded-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
