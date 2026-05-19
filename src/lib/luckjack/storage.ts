import { DEFAULT_SETTINGS, DEFAULT_STATS, type LeaderboardEntry, type Settings, type Stats } from "./types";

const isBrowser = typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser) return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export const storage = {
  getBalance(fallback: number): number {
    if (!isBrowser) return fallback;
    try {
      const v = localStorage.getItem("luckjack_balance");
      return v ? Number(v) : fallback;
    } catch { return fallback; }
  },
  setBalance(v: number) {
    if (!isBrowser) return;
    try { localStorage.setItem("luckjack_balance", String(v)); } catch {}
  },
  getStats(): Stats { return read("luckjack_stats", DEFAULT_STATS); },
  setStats(s: Stats) { write("luckjack_stats", s); },
  getSettings(): Settings { return read("luckjack_settings", DEFAULT_SETTINGS); },
  setSettings(s: Settings) { write("luckjack_settings", s); },
  getLeaderboard(): LeaderboardEntry[] {
    if (!isBrowser) return [];
    try { return JSON.parse(localStorage.getItem("luckjack_leaderboard") || "[]"); } catch { return []; }
  },
  setLeaderboard(e: LeaderboardEntry[]) { write("luckjack_leaderboard", e); },
};