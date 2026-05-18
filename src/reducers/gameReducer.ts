/**
 * Game State Reducer for LuckJack Casino Game
 * 
 * This module implements the central state reducer that handles all game actions.
 * All state updates are immutable using spread operators.
 * 
 */

import type { GameState, GameAction, LeaderboardEntry, GameStatistics } from '../types/game';
import { createDeck, shuffleDeck, dealCard, shouldReshuffle } from '../utils/deck';
import { isBust } from '../utils/scoring';
import { resolveRound, shouldDealerHit } from '../utils/resolution';

/**
 * Game state reducer function
 * 
 * Handles all GameAction types and returns new immutable state.
 * Integrates deck management, scoring, and resolution utilities.
 * 
 * @param state - Current game state
 * @param action - Action to process
 * @returns New game state (immutable)
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ========================================================================
    // Navigation Actions
    // ========================================================================
    
    case 'NAVIGATE': {
      return {
        ...state,
        currentView: action.payload
      };
    }
    
    // ========================================================================
    // Betting Phase Actions
    // ========================================================================
    
    case 'PLACE_BET': {
      const newBet = state.currentBet + action.payload;
      
      // Prevent betting more than available balance
      if (newBet > state.balance) {
        return state;
      }
      
      return {
        ...state,
        currentBet: newBet
      };
    }
    
    case 'CLEAR_BET': {
      return {
        ...state,
        currentBet: 0
      };
    }
    
    case 'DEAL': {
      // Validate bet amount
      if (state.currentBet <= 0 || state.currentBet > state.balance) {
        return state;
      }
      
      // Deduct bet from balance
      const newBalance = state.balance - state.currentBet;
      
      // Check if deck needs reshuffling
      let currentDeck = state.deck;
      if (shouldReshuffle(currentDeck)) {
        currentDeck = shuffleDeck(createDeck());
      }
      
      // Deal hidden card to player
      const { card: hiddenCard, remainingDeck: deckAfterHidden } = dealCard(currentDeck);
      
      // Deal two cards to dealer
      const { card: dealerCard1, remainingDeck: deckAfterDealer1 } = dealCard(deckAfterHidden);
      const { card: dealerCard2, remainingDeck: finalDeck } = dealCard(deckAfterDealer1);
      
      return {
        ...state,
        balance: newBalance,
        deck: finalDeck,
        phase: 'playerTurn',
        playerHand: [hiddenCard],
        dealerHand: [dealerCard1, dealerCard2],
        hiddenCard: hiddenCard
      };
    }
    
    // ========================================================================
    // Player Turn Actions
    // ========================================================================
    
    case 'HIT': {
      // Only allow hit during player turn
      if (state.phase !== 'playerTurn') {
        return state;
      }
      
      // Check if deck needs reshuffling
      let currentDeck = state.deck;
      if (shouldReshuffle(currentDeck)) {
        currentDeck = shuffleDeck(createDeck());
      }
      
      // Deal card to player
      const { card: newCard, remainingDeck } = dealCard(currentDeck);
      const newPlayerHand = [...state.playerHand, newCard];
      
      // Check if player busted (including hidden card)
      if (isBust(newPlayerHand)) {
        // Player busted - resolve immediately
        const outcome = resolveRound(newPlayerHand, state.dealerHand, state.currentBet);
        
        return {
          ...state,
          deck: remainingDeck,
          playerHand: newPlayerHand,
          phase: 'result',
          lastOutcome: outcome,
          isResultModalOpen: true,
          stats: updateStatsForOutcome(state.stats, outcome, state.balance)
        };
      }
      
      return {
        ...state,
        deck: remainingDeck,
        playerHand: newPlayerHand
      };
    }
    
    case 'STAND': {
      // Only allow stand during player turn
      if (state.phase !== 'playerTurn') {
        return state;
      }
      
      return {
        ...state,
        phase: 'dealerTurn'
      };
    }
    
    // ========================================================================
    // Dealer Turn Actions
    // ========================================================================
    
    case 'DEALER_TURN': {
      // Only execute during dealer turn
      if (state.phase !== 'dealerTurn') {
        return state;
      }
      
      let currentDeck = state.deck;
      let currentDealerHand = [...state.dealerHand];
      
      // Dealer hits on 16 or below, stands on 17 or above
      while (shouldDealerHit(currentDealerHand)) {
        // Check if deck needs reshuffling
        if (shouldReshuffle(currentDeck)) {
          currentDeck = shuffleDeck(createDeck());
        }
        
        const { card: newCard, remainingDeck } = dealCard(currentDeck);
        currentDealerHand = [...currentDealerHand, newCard];
        currentDeck = remainingDeck;
      }
      
      // Resolve the round
      const outcome = resolveRound(state.playerHand, currentDealerHand, state.currentBet);
      
      return {
        ...state,
        deck: currentDeck,
        dealerHand: currentDealerHand,
        phase: 'result',
        lastOutcome: outcome,
        isResultModalOpen: true,
        balance: state.balance + outcome.chipChange,
        stats: updateStatsForOutcome(state.stats, outcome, state.balance + outcome.chipChange)
      };
    }
    
    // ========================================================================
    // Round Resolution Actions
    // ========================================================================
    
    case 'RESOLVE_ROUND': {
      // Update balance with chip change from outcome
      const newBalance = state.balance + action.payload.chipChange;
      
      return {
        ...state,
        balance: newBalance,
        phase: 'result',
        lastOutcome: action.payload,
        isResultModalOpen: true,
        stats: updateStatsForOutcome(state.stats, action.payload, newBalance)
      };
    }
    
    case 'PLAY_AGAIN': {
      return {
        ...state,
        phase: 'betting',
        currentBet: 0,
        playerHand: [],
        dealerHand: [],
        hiddenCard: null,
        isResultModalOpen: false,
        lastOutcome: null
      };
    }
    
    // ========================================================================
    // Settings Actions
    // ========================================================================
    
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };
    }
    
    case 'RESET_SESSION': {
      // Create leaderboard entry for completed session
      const sessionEntry: LeaderboardEntry = {
        id: `session-${Date.now()}`,
        date: Date.now(),
        startingBalance: state.settings.startingBalance,
        endingBalance: state.balance,
        netGain: state.balance - state.settings.startingBalance,
        handsPlayed: state.stats.totalHands
      };
      
      // Reset to initial state with new session
      return {
        ...state,
        balance: state.settings.startingBalance,
        currentBet: 0,
        phase: 'betting',
        playerHand: [],
        dealerHand: [],
        hiddenCard: null,
        deck: shuffleDeck(createDeck()),
        stats: {
          totalHands: 0,
          wins: 0,
          losses: 0,
          pushes: 0,
          busts: 0,
          blackjacks: 0,
          biggestWin: 0,
          biggestLoss: 0,
          balanceHistory: [{ timestamp: Date.now(), balance: state.settings.startingBalance }]
        },
        leaderboard: [...state.leaderboard, sessionEntry],
        isResultModalOpen: false,
        lastOutcome: null
      };
    }
    
    // ========================================================================
    // Leaderboard Actions
    // ========================================================================
    
    case 'CLEAR_LEADERBOARD': {
      return {
        ...state,
        leaderboard: []
      };
    }
    
    // ========================================================================
    // Modal Actions
    // ========================================================================
    
    case 'OPEN_TUTORIAL': {
      return {
        ...state,
        isTutorialModalOpen: true
      };
    }
    
    case 'CLOSE_TUTORIAL': {
      return {
        ...state,
        isTutorialModalOpen: false
      };
    }
    
    // ========================================================================
    // Initialization Action
    // ========================================================================
    
    case 'INITIALIZE_FROM_STORAGE': {
      return {
        ...state,
        ...action.payload
      };
    }
    
    default:
      return state;
  }
}

/**
 * Helper function to update statistics based on round outcome
 * 
 * @param stats - Current statistics
 * @param outcome - Round outcome
 * @param newBalance - Updated balance after round
 * @returns Updated statistics object
 */
function updateStatsForOutcome(
  stats: GameStatistics,
  outcome: { result: string; chipChange: number },
  newBalance: number
): GameStatistics {
  const newStats = { ...stats };
  
  // Increment total hands
  newStats.totalHands += 1;
  
  // Update outcome counters
  switch (outcome.result) {
    case 'WIN':
      newStats.wins += 1;
      break;
    case 'LOSE':
      newStats.losses += 1;
      break;
    case 'PUSH':
      newStats.pushes += 1;
      break;
    case 'BUST':
      newStats.busts += 1;
      newStats.losses += 1; // Bust counts as a loss
      break;
    case 'BLACKJACK':
      newStats.blackjacks += 1;
      newStats.wins += 1; // Blackjack counts as a win
      break;
  }
  
  // Update biggest win/loss
  if (outcome.chipChange > 0) {
    const winAmount = outcome.chipChange;
    if (winAmount > newStats.biggestWin) {
      newStats.biggestWin = winAmount;
    }
  } else if (outcome.chipChange < 0) {
    const lossAmount = Math.abs(outcome.chipChange);
    if (lossAmount > newStats.biggestLoss) {
      newStats.biggestLoss = lossAmount;
    }
  }
  
  // Add balance snapshot to history
  newStats.balanceHistory = [
    ...stats.balanceHistory,
    { timestamp: Date.now(), balance: newBalance }
  ];
  
  return newStats;
}
