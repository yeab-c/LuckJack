import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LJButton } from "@/components/luckjack/LJButton";
import { TutorialModal } from "@/components/luckjack/modals/TutorialModal";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "LuckJack - Blackjack with a Hidden Twist" },
      { name: "description", content: "Play LuckJack, a Blackjack game where your first card stays hidden until the round ends." },
    ],
  }),
});

function Landing() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-felt-deep text-card-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 20% 20%, #C9A84C 0%, transparent 40%), radial-gradient(circle at 80% 80%, #8B1A1A 0%, transparent 40%)" }} />
      <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block px-3 py-1 mb-6 rounded-full border border-gold/40 text-gold text-xs uppercase tracking-[0.2em]">
            A Blackjack Twist
          </div>
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="LuckJack Logo" className="h-24 sm:h-32 w-auto" />
          </div>
          <h1 className="font-serif-display text-5xl sm:text-7xl lg:text-8xl mb-6">
            <span className="text-gold">Luck</span><span className="text-crimson">Jack</span>
          </h1>
          <p className="text-lg sm:text-2xl text-card-white/90 max-w-2xl mx-auto mb-4 leading-relaxed">
            Play Blackjack with a twist: your first card stays hidden until the round ends.
          </p>
          <p className="text-base sm:text-lg text-card-white/70 max-w-xl mx-auto mb-10">
            Every hand is a gamble. Can you win without knowing your full hand?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/game">
              <LJButton variant="gold" size="lg" className="min-w-45">Play Now</LJButton>
            </Link>
            <LJButton variant="outline" size="lg" className="min-w-45" onClick={() => setOpen(true)}>
              How to Play
            </LJButton>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="font-serif-display text-3xl sm:text-4xl text-gold text-center mb-10">
            Game Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { t: "Hidden First Card", d: "Your first card stays face down. You play blind until the round ends and the card is revealed." },
              { t: "Classic Blackjack", d: "Standard rules apply. Dealer hits until 17. Blackjack pays 3 to 2. Beat the dealer to win." },
              { t: "Track Your Stats", d: "View your win rate, biggest wins, and session history. Compete on the leaderboard." },
            ].map(f => (
              <div key={f.t} className="rounded-xl border border-gold/30 bg-black/30 p-6 hover:border-gold/50 transition">
                <div className="font-serif-display text-gold text-xl mb-3">{f.t}</div>
                <div className="text-sm text-card-white/70 leading-relaxed">{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-20">
          <h2 className="font-serif-display text-3xl sm:text-4xl text-gold text-center mb-10">
            How It Works
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              { step: "1", title: "Place Your Bet", desc: "Choose your chip amount and place your bet on the table." },
              { step: "2", title: "Cards Are Dealt", desc: "You get two cards, but your first card stays hidden. The dealer gets two cards with one hidden." },
              { step: "3", title: "Hit or Stand", desc: "Decide to hit for another card or stand with your current hand. Remember, you cannot see your first card." },
              { step: "4", title: "Dealer Plays", desc: "After you stand, the dealer reveals their cards and plays by the rules." },
              { step: "5", title: "Winner Revealed", desc: "Your hidden card flips over and the winner is determined. Get paid if you win!" },
            ].map(item => (
              <div key={item.step} className="flex gap-4 items-start rounded-xl border border-gold/20 bg-black/20 p-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/20 border border-gold flex items-center justify-center font-serif-display text-gold text-lg">
                  {item.step}
                </div>
                <div>
                  <div className="font-serif-display text-card-white text-lg mb-1">{item.title}</div>
                  <div className="text-sm text-card-white/70">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center rounded-2xl border border-gold/40 bg-black/40 p-10">
          <h2 className="font-serif-display text-3xl sm:text-4xl text-gold mb-4">
            Ready to Test Your Luck?
          </h2>
          <p className="text-card-white/70 mb-8 max-w-xl mx-auto">
            Start playing now and see if you can beat the dealer without knowing your full hand.
          </p>
          <Link to="/game">
            <LJButton variant="gold" size="lg">Start Playing</LJButton>
          </Link>
        </div>
      </div>
      <TutorialModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
