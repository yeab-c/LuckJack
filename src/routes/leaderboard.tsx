import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/luckjack/Layout";
import { useGame } from "@/context/GameContext";
import { LJButton } from "@/components/luckjack/LJButton";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
  head: () => ({ meta: [{ title: "Leaderboard — LuckJack" }, { name: "description", content: "Top LuckJack sessions ranked by net gain." }] }),
});

function LeaderboardPage() {
  const { leaderboard, clearLeaderboard, saveSession } = useGame();
  const [confirm, setConfirm] = useState(false);
  const top = leaderboard.slice(0, 10);

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif-display text-3xl sm:text-4xl text-gold">Leaderboard</h1>
        <div className="flex gap-2">
          <LJButton variant="outline" size="sm" onClick={saveSession}>Save Current Session</LJButton>
          <LJButton variant="crimson" size="sm" onClick={() => setConfirm(true)} disabled={leaderboard.length === 0}>Clear</LJButton>
        </div>
      </div>
      {top.length === 0 ? (
        <div className="rounded-xl border border-gold/30 bg-black/30 p-10 text-center text-muted-foreground">
          No sessions yet. Play and save a session to populate the leaderboard.
        </div>
      ) : (
        <div className="rounded-xl border border-gold/30 bg-black/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-black/40 text-gold">
              <tr>
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Date</th>
                <th className="text-right p-3">Start</th>
                <th className="text-right p-3">End</th>
                <th className="text-right p-3">Net</th>
                <th className="text-right p-3">Hands</th>
              </tr>
            </thead>
            <tbody>
              {top.map((e, i) => (
                <tr key={e.date} className="border-t border-gold/10">
                  <td className="p-3 font-bold text-gold">{i + 1}</td>
                  <td className="p-3">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="p-3 text-right">${e.startBalance}</td>
                  <td className="p-3 text-right">${e.endBalance}</td>
                  <td className={`p-3 text-right font-bold ${e.netGain >= 0 ? "text-gold" : "text-crimson"}`}>
                    {e.netGain >= 0 ? "+" : ""}${e.netGain}
                  </td>
                  <td className="p-3 text-right">{e.hands}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="rounded-xl border-2 border-gold bg-[#0a1f0a] p-6 max-w-sm w-full text-center">
            <p className="text-card-white mb-5">Clear the entire leaderboard?</p>
            <div className="flex gap-2 justify-center">
              <LJButton variant="outline" onClick={() => setConfirm(false)}>Cancel</LJButton>
              <LJButton variant="crimson" onClick={() => { clearLeaderboard(); setConfirm(false); }}>Clear</LJButton>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}