import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/luckjack/Layout";
import { useGame } from "@/context/GameContext";
import { LJButton } from "@/components/luckjack/LJButton";
import type { AnimSpeed } from "@/lib/luckjack/types";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings - LuckJack" }, { name: "description", content: "Customize LuckJack: animation speed and starting balance." }] }),
});

const SPEEDS: AnimSpeed[] = ["Fast", "Normal", "Slow"];
const BALANCES = [500, 1000, 2500, 5000];

function SettingsPage() {
  const { settings, setSettings, resetSession } = useGame();
  const [confirm, setConfirm] = useState(false);

  return (
    <Layout>
      <h1 className="font-serif-display text-3xl sm:text-4xl text-gold mb-6">Settings</h1>
      <div className="max-w-xl space-y-6">
        <Row label="Animation Speed">
          <div className="flex gap-2">
            {SPEEDS.map(s => (
              <button key={s} onClick={() => setSettings({ ...settings, animSpeed: s })}
                className={`px-4 py-2 rounded-md border-2 transition ${settings.animSpeed === s ? "bg-gold text-[#0a1f0a] border-gold" : "border-gold/40 text-card-white hover:border-gold"}`}>
                {s}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Starting Balance">
          <div className="flex gap-2 flex-wrap">
            {BALANCES.map(b => (
              <button key={b} onClick={() => setSettings({ ...settings, startingBalance: b })}
                className={`px-4 py-2 rounded-md border-2 transition ${settings.startingBalance === b ? "bg-gold text-[#0a1f0a] border-gold" : "border-gold/40 text-card-white hover:border-gold"}`}>
                ${b}
              </button>
            ))}
          </div>
        </Row>
        <div className="pt-4 border-t border-gold/20">
          <LJButton variant="crimson" onClick={() => setConfirm(true)}>Reset Session</LJButton>
          <p className="text-xs text-muted-foreground mt-2">Saves the current session to the leaderboard, then resets balance and stats.</p>
        </div>
      </div>
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="rounded-xl border-2 border-gold bg-[#0a1f0a] p-6 max-w-sm w-full text-center">
            <p className="text-card-white mb-5">Reset balance and clear current session stats?</p>
            <div className="flex gap-2 justify-center">
              <LJButton variant="outline" onClick={() => setConfirm(false)}>Cancel</LJButton>
              <LJButton variant="crimson" onClick={() => { resetSession(); setConfirm(false); }}>Reset</LJButton>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gold/30 bg-black/30 p-4">
      <div className="text-card-white font-medium">{label}</div>
      <div>{children}</div>
    </div>
  );
}