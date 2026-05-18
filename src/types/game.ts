/**
 * Type definitions for LuckJack Casino Game
 * 
 * This file contains all TypeScript interfaces and types used throughout the application.
 * Requirements: 1.5, 13.2, 14.2, 15.1, 20.1-20.4
 */

// ============================================================================
// Card Types
// ============================================================================

/**
 * Card suit types
 */
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

/**
 * Card rank types
 */
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

/**
 * Represents a single playing card
 */
export interface Card {
  /** The suit of the card (hearts, diamonds, clubs, spades) */
  suit: CardSuit;
  /** The rank of the card (A, 2-10, J, Q, K) */
  rank: CardRank;
  /** Unique identifier for React keys and card tracking */
  id: string;
}

// ============================================================================
// Game Phase and View Types
// ============================================================================

/**
 * Current phase of a game round
 */
export type RoundPhase = 'betting' | 'playerTurn' | 'dealerTurn' | 'result';

/**
 * Available views in the application
 */
export type ViewType = 'landing' | 'game' | 'stats' | 'leaderboard' | 'settings';

/**
 * Animation speed settings
 */
export type AnimationSpeed = 'fast' | 'normal' | 'slow';

// ============================================================================
// Game Statistics
// ============================================================================

/**
 * Snapshot of balance at a specific point in time
 */
export interface BalanceSnapshot {
  /** Unix timestamp when the snapshot was taken */
  timestamp: number;
  /** Balance amount at this point in time */
  balance: number;
}

/**
 * Tracks gameplay statistics across the session
 * Requirement 13.2: Statistics tracking
 */
export interface GameStatistics {
  /** Total number of hands played */
  totalHands: number;
  /** Number of winning hands */
  wins: number;
  /** Number of losing hands */
  losses: number;
  /** Number of push (tie) hands */
  pushes: number;
  /** Number of hands where player busted */
  busts: number;
  /** Number of natural blackjacks achieved */
  blackjacks: number;
  /** Largest single win amount */
  biggestWin: number;
  /** Largest single loss amount */
  biggestLoss: number;
  /** Historical balance snapshots for charting */
  balanceHistory: BalanceSnapshot[];
}

// ============================================================================
// Leaderboard
// ============================================================================

/**
 * Represents a completed game session entry in the leaderboard
 * Requirement 14.2: Leaderboard entry structure
 */
export interface LeaderboardEntry {
  /** Unique identifier for the entry */
  id: string;
  /** Unix timestamp when the session ended */
  date: number;
  /** Starting balance at session start */
  startingBalance: number;
  /** Ending balance at session end */
  endingBalance: number;
  /** Net gain or loss (endingBalance - startingBalance) */
  netGain: number;
  /** Total number of hands played in this session */
  handsPlayed: number;
}

// ============================================================================
// Game Settings
// ============================================================================

/**
 * User-configurable game settings
 * Requirement 15.1: Settings management
 */
export interface GameSettings {
  /** Whether sound effects are enabled */
  soundEnabled: boolean;
  /** Animation speed preference */
  animationSpeed: AnimationSpeed;
  /** Starting balance for new sessions */
  startingBalance: 500 | 1000 | 2500 | 5000;
}

// ============================================================================
// Round Outcome
// ============================================================================

/**
 * Result of a completed round
 */
export interface RoundOutcome {
  /** The outcome type */
  result: 'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' | 'BUST';
  /** Amount of chips gained (positive) or lost (negative) */
  chipChange: number;
  /** Final player hand value including hidden card */
  finalPlayerScore: number;
  /** Final dealer hand value */
  finalDealerScore: number;
  /** The player's hidden card that was revealed */
  hiddenCard: Card;
}

// ============================================================================
// Game State
// ============================================================================

/**
 * Complete application state
 * Requirements: 1.5, 20.1-20.4
 * 
 * This represents the entire state of the application, including:
 * - Navigation state
 * - Game session data (balance, bet, deck)
 * - Current round state (phase, hands)
 * - Statistics and leaderboard
 * - User settings
 * - UI state (modals)
 */
export interface GameState {
  // Navigation
  /** Current view being displayed */
  currentView: ViewType;
  
  // Game Session
  /** Current chip balance */
  balance: number;
  /** Current bet amount for the active round */
  currentBet: number;
  /** Remaining cards in the deck */
  deck: Card[];
  
  // Current Round
  /** Current phase of the round */
  phase: RoundPhase;
  /** Player's hand of cards */
  playerHand: Card[];
  /** Dealer's hand of cards */
  dealerHand: Card[];
  /** The player's hidden first card (null if not dealt yet) */
  hiddenCard: Card | null;
  
  // Statistics
  /** Gameplay statistics for the current session */
  stats: GameStatistics;
  /** Leaderboard entries from all sessions */
  leaderboard: LeaderboardEntry[];
  
  // Settings
  /** User-configurable settings */
  settings: GameSettings;
  
  // UI State
  /** Whether the result modal is currently open */
  isResultModalOpen: boolean;
  /** Whether the tutorial modal is currently open */
  isTutorialModalOpen: boolean;
  /** The outcome of the last completed round (null if no round completed yet) */
  lastOutcome: RoundOutcome | null;
}

// ============================================================================
// Game Actions (Discriminated Union)
// ============================================================================

/**
 * All possible actions that can be dispatched to modify game state
 * 
 * This is a discriminated union type where each action has a unique 'type' field.
 * Some actions include a 'payload' field with additional data.
 */
export type GameAction =
  // Navigation actions
  | { type: 'NAVIGATE'; payload: ViewType }
  
  // Betting phase actions
  | { type: 'PLACE_BET'; payload: number }
  | { type: 'CLEAR_BET' }
  | { type: 'DEAL' }
  
  // Player turn actions
  | { type: 'HIT' }
  | { type: 'STAND' }
  
  // Dealer turn actions
  | { type: 'DEALER_TURN' }
  
  // Round resolution actions
  | { type: 'RESOLVE_ROUND'; payload: RoundOutcome }
  | { type: 'PLAY_AGAIN' }
  
  // Settings actions
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GameSettings> }
  | { type: 'RESET_SESSION' }
  
  // Leaderboard actions
  | { type: 'CLEAR_LEADERBOARD' }
  
  // Modal actions
  | { type: 'OPEN_TUTORIAL' }
  | { type: 'CLOSE_TUTORIAL' }
  
  // Initialization action
  | { type: 'INITIALIZE_FROM_STORAGE'; payload: Partial<GameState> };
