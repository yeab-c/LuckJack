/**
 * Game Context Provider for LuckJack Casino Game
 * 
 * Provides centralized state management using useReducer and Context API.
 * Handles localStorage persistence with debounced writes for performance.
 * 
 */

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { GameState, GameAction } from '../types/game';
import { gameReducer } from '../reducers/gameReducer';
import { createDeck, shuffleDeck } from '../utils/deck';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';

// ============================================================================
// Context Definition
// ============================================================================

/**
 * Context value interface
 */
interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

/**
 * Game Context
 * Provides game state and dispatch function to all child components
 */
const GameContext = createContext<GameContextValue | undefined>(undefined);

// ============================================================================
// localStorage Keys
// ============================================================================

const STORAGE_KEYS = {
  BALANCE: 'luckjack_balance',
  STATS: 'luckjack_stats',
  LEADERBOARD: 'luckjack_leaderboard',
  SETTINGS: 'luckjack_settings'
} as const;

// ============================================================================
// Initial State Factory
// ============================================================================

/**
 * Creates the initial game state
 * Loads persisted data from localStorage if available
 * 
 * @returns Initial GameState
 */
function createInitialState(): GameState {
  // Load settings first to get starting balance
  const defaultSettings = {
    soundEnabled: true,
    animationSpeed: 'normal' as const,
    startingBalance: 1000 as const
  };
  
  const settings = loadFromLocalStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
  
  // Load balance (use starting balance from settings as default)
  const balance = loadFromLocalStorage(STORAGE_KEYS.BALANCE, settings.startingBalance);
  
  // Load statistics
  const defaultStats = {
    totalHands: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    busts: 0,
    blackjacks: 0,
    biggestWin: 0,
    biggestLoss: 0,
    balanceHistory: [{ timestamp: Date.now(), balance }]
  };
  
  const stats = loadFromLocalStorage(STORAGE_KEYS.STATS, defaultStats);
  
  // Load leaderboard
  const leaderboard = loadFromLocalStorage(STORAGE_KEYS.LEADERBOARD, []);
  
  // Create initial state
  return {
    // Navigation
    currentView: 'landing',
    
    // Game Session
    balance,
    currentBet: 0,
    deck: shuffleDeck(createDeck()),
    
    // Current Round
    phase: 'betting',
    playerHand: [],
    dealerHand: [],
    hiddenCard: null,
    
    // Statistics
    stats,
    leaderboard,
    
    // Settings
    settings,
    
    // UI State
    isResultModalOpen: false,
    isTutorialModalOpen: false,
    lastOutcome: null
  };
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * GameProvider Props
 */
interface GameProviderProps {
  children: React.ReactNode;
}

/**
 * GameProvider Component
 * 
 * Wraps the application and provides game state and dispatch function.
 * Handles localStorage persistence with debounced writes.
 * 
 * @param props - Component props
 */
export function GameProvider({ children }: GameProviderProps): React.ReactElement {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  
  // ========================================================================
  // Debounced localStorage Persistence
  // ========================================================================
  
  // Refs to store timeout IDs for debouncing
  const balanceTimeoutRef = useRef<number | null>(null);
  const statsTimeoutRef = useRef<number | null>(null);
  const leaderboardTimeoutRef = useRef<number | null>(null);
  const settingsTimeoutRef = useRef<number | null>(null);
  
  /**
   * Debounce helper function
   * 
   * @param callback - Function to debounce
   * @param timeoutRef - Ref to store timeout ID
   * @param delay - Delay in milliseconds
   */
  const debounce = (
    callback: () => void,
    timeoutRef: React.MutableRefObject<number | null>,
    delay: number
  ) => {
    // Clear existing timeout
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = window.setTimeout(() => {
      callback();
      timeoutRef.current = null;
    }, delay);
  };
  
  // Save balance to localStorage (debounced 300ms)
  useEffect(() => {
    debounce(
      () => saveToLocalStorage(STORAGE_KEYS.BALANCE, state.balance),
      balanceTimeoutRef,
      300
    );
  }, [state.balance]);
  
  // Save statistics to localStorage (debounced 300ms)
  useEffect(() => {
    debounce(
      () => saveToLocalStorage(STORAGE_KEYS.STATS, state.stats),
      statsTimeoutRef,
      300
    );
  }, [state.stats]);
  
  // Save leaderboard to localStorage (debounced 300ms)
  useEffect(() => {
    debounce(
      () => saveToLocalStorage(STORAGE_KEYS.LEADERBOARD, state.leaderboard),
      leaderboardTimeoutRef,
      300
    );
  }, [state.leaderboard]);
  
  // Save settings to localStorage (debounced 300ms)
  useEffect(() => {
    debounce(
      () => saveToLocalStorage(STORAGE_KEYS.SETTINGS, state.settings),
      settingsTimeoutRef,
      300
    );
  }, [state.settings]);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (balanceTimeoutRef.current !== null) {
        window.clearTimeout(balanceTimeoutRef.current);
      }
      if (statsTimeoutRef.current !== null) {
        window.clearTimeout(statsTimeoutRef.current);
      }
      if (leaderboardTimeoutRef.current !== null) {
        window.clearTimeout(leaderboardTimeoutRef.current);
      }
      if (settingsTimeoutRef.current !== null) {
        window.clearTimeout(settingsTimeoutRef.current);
      }
    };
  }, []);
  
  // ========================================================================
  // Context Value
  // ========================================================================
  
  const contextValue: GameContextValue = {
    state,
    dispatch
  };
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * useGame Hook
 * 
 * Custom hook for consuming the GameContext.
 * Throws an error if used outside of GameProvider.
 * 
 * @returns GameContextValue with state and dispatch
 * @throws Error if used outside GameProvider
 */
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}
