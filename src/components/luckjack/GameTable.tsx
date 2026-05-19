import { useGame } from "@/context/GameContext";
import { handValue } from "@/lib/luckjack/engine";
import { PlayingCard } from "./Card";

export function GameTable() {
  const { playerCards, dealerCards, dealerRevealed, phase, shoe } = useGame();

  const visiblePlayer = playerCards.slice(1);
  const visibleValue = handValue(visiblePlayer);

  return (
    <section className="bg-felt-deep rounded-3xl border border-gold/40 px-4 py-6 sm:px-8 sm:py-10 min-h-[420px] sm:min-h-[480px] relative overflow-hidden">
      <div className="absolute top-3 right-4 text-xs text-muted-foreground font-mono">Shoe: {shoe.length}</div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif-display text-gold text-base sm:text-lg">Dealer</h3>
          {dealerCards.length > 0 && (
            <span className="text-card-white font-mono text-sm sm:text-base">
              {dealerRevealed ? handValue(dealerCards) : "?"}
            </span>
          )}
        </div>
        <div className="flex gap-2 sm:gap-3 justify-center min-h-[84px] sm:min-h-[112px] lg:min-h-[140px]">
          {dealerCards.map((c, i) => (
            <PlayingCard key={c.id} card={c} hidden={!dealerRevealed} index={i} />
          ))}
        </div>
      </div>

      <div className="border-t border-gold/20 my-4" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif-display text-gold text-base sm:text-lg">You</h3>
          {playerCards.length > 0 && (
            <span className="text-card-white font-mono text-sm sm:text-base">
              {visibleValue} <span className="text-muted-foreground text-xs">(+ hidden)</span>
            </span>
          )}
        </div>
        <div className="flex gap-2 sm:gap-3 justify-center min-h-[84px] sm:min-h-[112px] lg:min-h-[140px]">
          {playerCards.map((c, i) => (
            <PlayingCard key={c.id} card={c} hidden={i === 0 && phase !== "result"} index={i} />
          ))}
        </div>
        {playerCards.length > 0 && phase === "playerTurn" && (
          <p className="text-center text-xs text-muted-foreground mt-3 italic">
            Your first card stays hidden until the round ends.
          </p>
        )}
      </div>
    </section>
  );
}