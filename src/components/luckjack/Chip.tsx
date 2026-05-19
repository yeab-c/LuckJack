import { cn } from "@/lib/utils";

const COLORS: Record<number, { bg: string; text: string }> = {
  5:   { bg: "#FAFAFA", text: "#0a0a0a" },
  25:  { bg: "#8B1A1A", text: "#FAFAFA" },
  100: { bg: "#0d5b2a", text: "#FAFAFA" },
  500: { bg: "#0a0a0a", text: "#C9A84C" },
};

export function Chip({
  value,
  onClick,
  disabled,
  size = "md",
}: {
  value: number;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const c = COLORS[value] ?? COLORS[5];
  const sizes = {
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-sm sm:text-base",
    lg: "w-16 h-16 text-lg",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`Bet ${value} chips`}
      className={cn(
        "rounded-full border-4 border-gold font-bold",
        "flex items-center justify-center shadow-gold",
        "transition-transform duration-150 hover:scale-110 active:scale-95",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
        "animate-chip-pop",
        sizes[size],
      )}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${c.bg}, ${c.bg} 60%, rgba(0,0,0,0.4))`,
        color: c.text,
        boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.08), 0 6px 14px -4px rgba(0,0,0,0.7)",
      }}
    >
      {value}
    </button>
  );
}