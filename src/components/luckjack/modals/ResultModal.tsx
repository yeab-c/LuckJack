import { useGame } from "@/context/GameContext";
import { LJButton } from "../LJButton";

export function ResultModal() {
  const { phase, result, playAgain, balance } = useGame();
  if (phase !== "result" || !result) return null;

  const good = result.outcome === "WIN" || result.outcome === "BLACKJACK";
  const neutral = result.outcome === "PUSH";
  const color = good ? "text-gold" : neutral ? "text-card-white" : "text-crimson";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-deal-in">
      <div className="w-full max-w-md rounded-2xl border-2 border-gold bg-[#0a1f0a] p-6 sm:p-8 text-center shadow-gold">
        <div className={`font-serif-display text-4xl sm:text-5xl mb-2 ${color}`}>{result.outcome}</div>
        <div className="text-card-white mb-4">
          Your hand: <span className="font-bold text-gold">{result.finalPlayerValue}</span>
          <span className="mx-2 text-muted-foreground">vs</span>
          Dealer: <span className="font-bold">{result.dealerValue}</span>
        </div>
        <div className={`text-2xl font-bold mb-1 ${good ? "text-gold" : neutral ? "text-card-white" : "text-crimson"}`}>
          {result.delta > 0 ? `+$${result.delta}` : result.delta < 0 ? `-$${Math.abs(result.delta)}` : "Push"}
        </div>
        <div className="text-sm text-muted-foreground mb-6">Balance: ${balance}</div>
        <LJButton variant="gold" size="lg" onClick={playAgain} className="w-full">
          Play Again
        </LJButton>
      </div>
    </div>
  );
}