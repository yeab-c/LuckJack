import { useState } from "react";
import { LJButton } from "../LJButton";

const STEPS = [
  { title: "Place Your Bet", body: "Pick chip denominations (5, 25, 100, 500) to build your wager, then hit Deal." },
  { title: "The Hidden Card", body: "Your FIRST card stays face-down until the round ends. You play without knowing it — that's the LuckJack twist." },
  { title: "Hit or Stand", body: "Hit to draw another card. Stand to lock in. Bust if your visible hand + a guaranteed Ace-as-1 still goes over 21." },
  { title: "Dealer Rules", body: "After you stand, the dealer reveals and draws until reaching 17 or higher. Dealer busts over 21." },
  { title: "Winning", body: "Blackjack pays 3:2. Beat the dealer for 1:1. Tie is a push. Then your hidden card flips — and the truth is revealed." },
];

export function TutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const s = STEPS[step];
  const next = () => {
    if (step >= STEPS.length - 1) { setStep(0); onClose(); }
    else setStep(step + 1);
  };
  const back = () => setStep(Math.max(0, step - 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border-2 border-gold bg-[#0a1f0a] p-6 sm:p-8 shadow-gold">
        <div className="text-xs text-muted-foreground mb-2">Step {step + 1} of {STEPS.length}</div>
        <h3 className="font-serif-display text-gold text-2xl mb-3">{s.title}</h3>
        <p className="text-card-white mb-6 leading-relaxed">{s.body}</p>
        <div className="flex gap-2 justify-between">
          <LJButton variant="ghost" onClick={back} disabled={step === 0}>Back</LJButton>
          <div className="flex gap-2">
            <LJButton variant="outline" onClick={onClose}>Skip</LJButton>
            <LJButton variant="gold" onClick={next}>{step === STEPS.length - 1 ? "Done" : "Next"}</LJButton>
          </div>
        </div>
      </div>
    </div>
  );
}