export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface CardT {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type Phase = "betting" | "playerTurn" | "dealerTurn" | "result";
export type Outcome = "WIN" | "LOSE" | "PUSH" | "BLACKJACK" | "BUST";

export interface Stats {
  hands: number;
  wins: number;
  losses: number;
  pushes: number;
  busts: number;
  biggestWin: number;
  biggestLoss: number;
  totalHandValue: number;
  balanceHistory: number[];
}

export interface LeaderboardEntry {
  date: string;
  startBalance: number;
  endBalance: number;
  netGain: number;
  hands: number;
}

export type AnimSpeed = "Fast" | "Normal" | "Slow";

export interface Settings {
  sound: boolean;
  animSpeed: AnimSpeed;
  startingBalance: number;
}

export const DEFAULT_SETTINGS: Settings = {
  sound: true,
  animSpeed: "Normal",
  startingBalance: 1000,
};

export const DEFAULT_STATS: Stats = {
  hands: 0, wins: 0, losses: 0, pushes: 0, busts: 0,
  biggestWin: 0, biggestLoss: 0, totalHandValue: 0, balanceHistory: [],
};

export const ANIM_MS: Record<AnimSpeed, number> = { Fast: 150, Normal: 300, Slow: 500 };