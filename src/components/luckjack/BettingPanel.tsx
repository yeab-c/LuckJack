import { useGame } from "@/context/GameContext";
import { Chip } from "./Chip";
import { LJButton } from "./LJButton";

const DENOMS = [5, 25, 100, 500];

export function BettingPanel() {
  const { phase, balance, bet, addChip, clearBet, deal } = useGame();
  const disabled = phase !== "betting" || balance <= 0;

  return (
    <section className="w-full max-w-2xl mx-auto rounded-2xl border border-gold/30 bg-black/30 backdrop-blur p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif-display text-gold text-lg sm:text-xl">Place Your Bet</h2>
        <div className="text-card-white">
          <span className="text-muted-foreground text-sm">Bet: </span>
          <span className="text-gold font-bold text-lg">${bet}</span>
        </div>
      </div>
      <div className="flex justify-center gap-3 sm:gap-4 mb-5 flex-wrap">
        {DENOMS.map(d => (
          <Chip key={d} value={d} disabled={disabled || bet + d > balance} onClick={() => addChip(d)} />
        ))}
      </div>
      <div className="flex gap-3 justify-center">
        <LJButton variant="outline" size="md" onClick={clearBet} disabled={disabled || bet === 0}>
          Clear Bet
        </LJButton>
        <LJButton variant="gold" size="md" onClick={deal} disabled={disabled || bet === 0}>
          Deal
        </LJButton>
      </div>
    </section>
  );
}