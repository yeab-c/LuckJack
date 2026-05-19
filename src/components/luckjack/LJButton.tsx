import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "outline" | "crimson" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const LJButton = forwardRef<HTMLButtonElement, Props>(function LJButton(
  { variant = "gold", size = "md", className, ...rest }, ref
) {
  const variants = {
    gold: "bg-gold text-[#0a1f0a] hover:brightness-110 shadow-gold",
    outline: "border-2 border-gold text-gold hover:bg-gold hover:text-[#0a1f0a]",
    crimson: "bg-crimson text-white hover:brightness-110",
    ghost: "text-gold hover:bg-gold/10",
  } as const;
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm sm:text-base", lg: "px-8 py-3.5 text-base sm:text-lg" } as const;
  return (
    <button
      ref={ref}
      {...rest}
      className={cn(
        "rounded-md font-semibold tracking-wide transition-all duration-200",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A84C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1f0a]",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
    />
  );
});