import { useGame } from "@/context/GameContext";
import { LJButton } from "./LJButton";

export function ControlPanel() {
  const { phase, hit, stand } = useGame();
  if (phase !== "playerTurn") return null;
  return (
    <section className="flex gap-3 justify-center">
      <LJButton variant="gold" size="lg" onClick={hit} aria-label="Hit">Hit</LJButton>
      <LJButton variant="crimson" size="lg" onClick={stand} aria-label="Stand">Stand</LJButton>
    </section>
  );
}