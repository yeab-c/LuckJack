import { cn } from "@/lib/utils";
import type { CardT } from "@/lib/luckjack/types";

interface Props {
  card?: CardT;
  hidden?: boolean;
  flipping?: boolean;
  index?: number;
  className?: string;
}

export function PlayingCard({ card, hidden, flipping, index = 0, className }: Props) {
  const isRed = card && (card.suit === "♥" || card.suit === "♦");
  return (
    <div
      className={cn(
        "relative perspective-1000 animate-deal-in",
        "w-[60px] h-[84px] sm:w-[80px] sm:h-[112px] lg:w-[100px] lg:h-[140px]",
        className,
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={cn(
          "relative w-full h-full preserve-3d transition-transform duration-500",
          hidden ? "rotate-y-180" : "",
        )}
      >
        {/* Front */}
        <div className={cn(
          "absolute inset-0 backface-hidden rounded-lg bg-card-white text-card-white",
          "shadow-[0_8px_20px_-5px_rgba(0,0,0,0.6)] border border-black/10",
          "flex flex-col justify-between p-1.5",
        )}
          style={{ backgroundColor: "#FAFAFA" }}
        >
          {card && (
            <>
              <div className={cn("text-xs font-bold leading-none", isRed ? "text-crimson" : "text-black")}>
                <div>{card.rank}</div>
                <div className="text-sm">{card.suit}</div>
              </div>
              <div className={cn("text-3xl text-center leading-none", isRed ? "text-crimson" : "text-black")}>
                {card.suit}
              </div>
              <div className={cn("text-xs font-bold leading-none rotate-180 self-end", isRed ? "text-crimson" : "text-black")}>
                <div>{card.rank}</div>
                <div className="text-sm">{card.suit}</div>
              </div>
            </>
          )}
        </div>
        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 backface-hidden rotate-y-180 rounded-lg border-2 border-gold",
            "flex items-center justify-center",
            flipping ? "animate-glow-pulse" : "",
          )}
          style={{
            background:
              "repeating-linear-gradient(45deg, #1a1a1a 0 6px, #2a1a0a 6px 12px), radial-gradient(circle at center, #2a1f0a, #0a0a0a)",
          }}
        >
          <span className="text-gold font-serif-display text-2xl sm:text-3xl lg:text-4xl">?</span>
        </div>
      </div>
    </div>
  );
}