import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LJButton } from "@/components/luckjack/LJButton";
import { TutorialModal } from "@/components/luckjack/modals/TutorialModal";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "LuckJack — Blackjack with a Hidden Twist" },
      { name: "description", content: "Play LuckJack — premium Blackjack where your first card stays hidden until the round ends." },
    ],
  }),
});

function Landing() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-felt-deep text-card-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 20% 20%, #C9A84C 0%, transparent 40%), radial-gradient(circle at 80% 80%, #8B1A1A 0%, transparent 40%)" }} />
      <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-28 text-center">
        <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold/40 text-gold text-xs uppercase tracking-[0.2em]">
          A Blackjack Twist
        </div>
        <h1 className="font-serif-display text-5xl sm:text-7xl lg:text-8xl mb-4">
          <span className="text-gold">Luck</span><span className="text-crimson">Jack</span>
        </h1>
        <p className="text-base sm:text-xl text-card-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
          Your first card stays hidden until the round ends. Every hand is a gamble against your own luck.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/game">
            <LJButton variant="gold" size="lg" className="min-w-45">Play Now</LJButton>
          </Link>
          <LJButton variant="outline" size="lg" className="min-w-45" onClick={() => setOpen(true)}>
            How to Play
          </LJButton>
        </div>
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            { t: "Hidden Card", d: "Play blind on card one — revealed only at the end." },
            { t: "Classic Rules", d: "Dealer hits to 17. Blackjack pays 3:2." },
            { t: "Pure Tension", d: "Cinematic flips, gold accents, suspense baked in." },
          ].map(f => (
            <div key={f.t} className="rounded-xl border border-gold/30 bg-black/30 p-5">
              <div className="font-serif-display text-gold text-lg mb-1">{f.t}</div>
              <div className="text-sm text-card-white/70">{f.d}</div>
            </div>
          ))}
        </div>
      </div>
      <TutorialModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
