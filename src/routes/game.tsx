import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/luckjack/Layout";
import { GameTable } from "@/components/luckjack/GameTable";
import { BettingPanel } from "@/components/luckjack/BettingPanel";
import { ControlPanel } from "@/components/luckjack/ControlPanel";
import { ResultModal } from "@/components/luckjack/modals/ResultModal";
import { useGame } from "@/context/GameContext";
import { LJButton } from "@/components/luckjack/LJButton";

export const Route = createFileRoute("/game")({
  component: GamePage,
  head: () => ({ meta: [{ title: "Play — LuckJack" }, { name: "description", content: "Play LuckJack — the suspenseful Blackjack twist." }] }),
});

function GamePage() {
  const { balance, phase, resetSession } = useGame();
  const broke = balance <= 0 && phase === "betting";

  return (
    <Layout>
      <div className="space-y-6">
        <GameTable />
        {broke ? (
          <div className="text-center py-8 space-y-3">
            <div className="font-serif-display text-3xl text-crimson">You're Broke</div>
            <p className="text-card-white/80">Out of chips. Reset the session to keep playing.</p>
            <LJButton variant="gold" size="lg" onClick={resetSession}>Reset Session</LJButton>
          </div>
        ) : phase === "betting" ? (
          <BettingPanel />
        ) : (
          <ControlPanel />
        )}
      </div>
      <ResultModal />
    </Layout>
  );
}