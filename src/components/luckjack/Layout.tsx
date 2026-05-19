import { Navbar } from "./Navbar";
import { useGame } from "@/context/GameContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { warning, dismissWarning } = useGame();
  return (
    <div className="min-h-screen bg-felt-deep text-card-white">
      <Navbar />
      {warning && (
        <div className="bg-crimson text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-3">
          <span>{warning}</span>
          <button onClick={dismissWarning} className="underline">Dismiss</button>
        </div>
      )}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}