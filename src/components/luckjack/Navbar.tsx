import { Link } from "@tanstack/react-router";
import { useGame } from "@/context/GameContext";

const LINKS = [
  { to: "/game", label: "Game" },
  { to: "/stats", label: "Stats" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/settings", label: "Settings" },
] as const;

export function Navbar() {
  const { balance } = useGame();
  return (
    <header className="sticky top-0 z-40 border-b border-gold/30 bg-[#0a1f0a]/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="font-serif-display text-gold text-xl sm:text-2xl tracking-wider">
          Luck<span className="text-crimson">Jack</span>
        </Link>
        <nav className="hidden sm:flex gap-1">
          {LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 rounded text-sm text-card-white hover:text-gold hover:bg-gold/10 transition"
              activeProps={{ className: "text-gold bg-gold/10" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</div>
          <div className="text-gold font-bold font-mono text-base sm:text-lg leading-none">${balance}</div>
        </div>
      </div>
      <nav className="sm:hidden flex justify-around border-t border-gold/20 py-1.5">
        {LINKS.map(l => (
          <Link key={l.to} to={l.to} className="text-xs text-card-white hover:text-gold" activeProps={{ className: "text-gold" }}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}