import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/luckjack/Layout";
import { useGame } from "@/context/GameContext";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  head: () => ({ meta: [{ title: "Stats — LuckJack" }, { name: "description", content: "Your LuckJack gameplay statistics." }] }),
});

function StatsPage() {
  const { stats } = useGame();
  const total = Math.max(stats.hands, 1);
  const winPct = ((stats.wins / total) * 100).toFixed(1);
  const bustPct = ((stats.busts / total) * 100).toFixed(1);
  const pushPct = ((stats.pushes / total) * 100).toFixed(1);
  const avgHand = stats.hands ? (stats.totalHandValue / stats.hands).toFixed(1) : "0.0";

  const items = [
    { l: "Hands Played", v: stats.hands },
    { l: "Wins", v: stats.wins },
    { l: "Losses", v: stats.losses },
    { l: "Pushes", v: stats.pushes },
    { l: "Busts", v: stats.busts },
    { l: "Biggest Win", v: `+$${stats.biggestWin}` },
    { l: "Biggest Loss", v: `-$${Math.abs(stats.biggestLoss)}` },
    { l: "Avg Hand Value", v: avgHand },
    { l: "Win %", v: `${winPct}%` },
    { l: "Bust %", v: `${bustPct}%` },
    { l: "Push %", v: `${pushPct}%` },
  ];

  return (
    <Layout>
      <h1 className="font-serif-display text-3xl sm:text-4xl text-gold mb-6">Statistics</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {items.map(i => (
          <div key={i.l} className="rounded-xl border border-gold/30 bg-black/30 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{i.l}</div>
            <div className="text-xl sm:text-2xl font-bold text-card-white mt-1">{i.v}</div>
          </div>
        ))}
      </div>

      <h2 className="font-serif-display text-xl text-gold mb-3">Balance History</h2>
      <BalanceChart history={stats.balanceHistory} />
    </Layout>
  );
}

function BalanceChart({ history }: { history: number[] }) {
  if (history.length < 2) {
    return <div className="rounded-xl border border-gold/30 bg-black/30 p-8 text-center text-muted-foreground">Play a few hands to see your balance history.</div>;
  }
  const w = 800, h = 220, pad = 24;
  const min = Math.min(...history), max = Math.max(...history);
  const range = Math.max(max - min, 1);
  const pts = history.map((v, i) => {
    const x = pad + (i / (history.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  return (
    <div className="rounded-xl border border-gold/30 bg-black/30 p-4">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <polyline fill="none" stroke="#C9A84C" strokeWidth="2.5" points={pts.join(" ")} />
        <polyline fill="rgba(201,168,76,0.1)" stroke="none" points={`${pad},${h - pad} ${pts.join(" ")} ${w - pad},${h - pad}`} />
      </svg>
    </div>
  );
}