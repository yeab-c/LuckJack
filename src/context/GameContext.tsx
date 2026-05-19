import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { buildShoe, handValue, isBlackjack } from "@/lib/luckjack/engine";
import { storage } from "@/lib/luckjack/storage";
import {
  ANIM_MS,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  type CardT,
  type LeaderboardEntry,
  type Outcome,
  type Phase,
  type Settings,
  type Stats,
} from "@/lib/luckjack/types";

interface ResultData {
  outcome: Outcome;
  delta: number;
  finalPlayerValue: number;
  dealerValue: number;
}

interface GameCtx {
  balance: number;
  bet: number;
  phase: Phase;
  shoe: CardT[];
  playerCards: CardT[]; // first card hidden
  dealerCards: CardT[];
  dealerRevealed: boolean;
  result: ResultData | null;
  stats: Stats;
  settings: Settings;
  sessionStart: number;
  leaderboard: LeaderboardEntry[];
  addChip: (v: number) => void;
  clearBet: () => void;
  deal: () => void;
  hit: () => void;
  stand: () => void;
  playAgain: () => void;
  setSettings: (s: Settings) => void;
  resetSession: () => void;
  clearLeaderboard: () => void;
  saveSession: () => void;
  warning: string | null;
  dismissWarning: () => void;
}

const Ctx = createContext<GameCtx | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [balance, setBalance] = useState<number>(DEFAULT_SETTINGS.startingBalance);
  const [bet, setBet] = useState(0);
  const [phase, setPhase] = useState<Phase>("betting");
  const [shoe, setShoe] = useState<CardT[]>(() => buildShoe());
  const [playerCards, setPlayerCards] = useState<CardT[]>([]);
  const [dealerCards, setDealerCards] = useState<CardT[]>([]);
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sessionStart, setSessionStart] = useState<number>(DEFAULT_SETTINGS.startingBalance);
  const [warning, setWarning] = useState<string | null>(null);

  const shoeRef = useRef(shoe);
  shoeRef.current = shoe;

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const s = storage.getSettings();
      const b = storage.getBalance(s.startingBalance);
      setSettingsState(s);
      setBalance(b);
      setStats(storage.getStats());
      setLeaderboard(storage.getLeaderboard());
      setSessionStart(b);
    } catch {
      setWarning("Storage unavailable — playing in-memory only.");
    }
  }, []);

  useEffect(() => { storage.setBalance(balance); }, [balance]);
  useEffect(() => { storage.setStats(stats); }, [stats]);
  useEffect(() => { storage.setSettings(settings); }, [settings]);
  useEffect(() => { storage.setLeaderboard(leaderboard); }, [leaderboard]);

  const ensureShoe = useCallback(() => {
    if (shoeRef.current.length < 52) {
      const ns = buildShoe();
      shoeRef.current = ns;
      setShoe(ns);
      return ns;
    }
    return shoeRef.current;
  }, []);

  const draw = useCallback((): CardT => {
    const current = ensureShoe();
    const [c, ...rest] = current;
    shoeRef.current = rest;
    setShoe(rest);
    return c;
  }, [ensureShoe]);

  const addChip = (v: number) => {
    if (phase !== "betting") return;
    if (bet + v > balance) {
      setWarning("Cannot bet more than your balance.");
      return;
    }
    setBet(bet + v);
  };
  const clearBet = () => setBet(0);

  const deal = () => {
    if (phase !== "betting") return;
    if (bet <= 0) { setWarning("Place a bet first."); return; }
    setBalance(b => b - bet);
    const p1 = draw();
    const d1 = draw();
    const d2 = draw();
    setPlayerCards([p1]);
    setDealerCards([d1, d2]);
    setDealerRevealed(false);
    setResult(null);
    setPhase("playerTurn");
  };

  const finishRound = useCallback((finalPlayer: CardT[], finalDealer: CardT[]) => {
    const pv = handValue(finalPlayer);
    const dv = handValue(finalDealer);
    let outcome: Outcome;
    let delta = 0;
    if (pv > 21) { outcome = "BUST"; delta = -bet; }
    else if (isBlackjack(finalPlayer) && !isBlackjack(finalDealer)) { outcome = "BLACKJACK"; delta = Math.floor(bet * 1.5); setBalance(b => b + bet + delta); }
    else if (dv > 21 || pv > dv) { outcome = "WIN"; delta = bet; setBalance(b => b + bet * 2); }
    else if (pv === dv) { outcome = "PUSH"; delta = 0; setBalance(b => b + bet); }
    else { outcome = "LOSE"; delta = -bet; }

    setResult({ outcome, delta, finalPlayerValue: pv, dealerValue: dv });
    setStats(s => {
      const ns: Stats = {
        ...s,
        hands: s.hands + 1,
        wins: s.wins + (outcome === "WIN" || outcome === "BLACKJACK" ? 1 : 0),
        losses: s.losses + (outcome === "LOSE" ? 1 : 0),
        pushes: s.pushes + (outcome === "PUSH" ? 1 : 0),
        busts: s.busts + (outcome === "BUST" ? 1 : 0),
        biggestWin: Math.max(s.biggestWin, delta),
        biggestLoss: Math.min(s.biggestLoss, delta),
        totalHandValue: s.totalHandValue + pv,
        balanceHistory: [...s.balanceHistory, balance + (delta > 0 ? bet + delta : delta < 0 ? 0 : bet)].slice(-100),
      };
      return ns;
    });
    setPhase("result");
  }, [bet, balance]);

  const hit = () => {
    if (phase !== "playerTurn") return;
    const c = draw();
    const next = [...playerCards, c];
    setPlayerCards(next);
    // visible cards = next[1..], plus hidden minimum = 1
    const visibleValue = handValue(next.slice(1));
    if (visibleValue + 1 > 21) {
      // auto-bust
      setDealerRevealed(true);
      setTimeout(() => finishRound(next, dealerCards), ANIM_MS[settings.animSpeed]);
    }
  };

  const stand = () => {
    if (phase !== "playerTurn") return;
    setPhase("dealerTurn");
    setDealerRevealed(true);
    // Dealer draws
    const work = [...dealerCards];
    const step = () => {
      if (handValue(work) < 17) {
        const c = draw();
        work.push(c);
        setDealerCards([...work]);
        setTimeout(step, ANIM_MS[settings.animSpeed]);
      } else {
        finishRound(playerCards, work);
      }
    };
    setTimeout(step, ANIM_MS[settings.animSpeed]);
  };

  const playAgain = () => {
    setBet(0);
    setPlayerCards([]);
    setDealerCards([]);
    setDealerRevealed(false);
    setResult(null);
    setPhase("betting");
  };

  const setSettings = (s: Settings) => setSettingsState(s);

  const saveSession = useCallback(() => {
    if (stats.hands === 0) return;
    const entry: LeaderboardEntry = {
      date: new Date().toISOString(),
      startBalance: sessionStart,
      endBalance: balance,
      netGain: balance - sessionStart,
      hands: stats.hands,
    };
    setLeaderboard(prev => [...prev, entry].sort((a, b) => b.netGain - a.netGain).slice(0, 50));
  }, [stats.hands, sessionStart, balance]);

  const resetSession = () => {
    saveSession();
    setBalance(settings.startingBalance);
    setSessionStart(settings.startingBalance);
    setStats(DEFAULT_STATS);
    setBet(0);
    setPlayerCards([]);
    setDealerCards([]);
    setResult(null);
    setPhase("betting");
  };

  const clearLeaderboard = () => setLeaderboard([]);
  const dismissWarning = () => setWarning(null);

  const value: GameCtx = useMemo(() => ({
    balance, bet, phase, shoe, playerCards, dealerCards, dealerRevealed, result,
    stats, settings, sessionStart, leaderboard,
    addChip, clearBet, deal, hit, stand, playAgain, setSettings, resetSession,
    clearLeaderboard, saveSession, warning, dismissWarning,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [balance, bet, phase, shoe, playerCards, dealerCards, dealerRevealed, result, stats, settings, leaderboard, warning, sessionStart]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGame() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGame must be used within GameProvider");
  return v;
}