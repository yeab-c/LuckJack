/**
 * Unit tests for Game State Reducer
 * 
 * Tests all action types and state transitions for the game reducer.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { gameReducer } from './gameReducer';
import type { GameState } from '../types/game';
import { createDeck, shuffleDeck } from '../utils/deck';

describe('gameReducer', () => {
  let initialState: GameState;
  
  beforeEach(() => {
    initialState = {
      currentView: 'landing',
      balance: 1000,
      currentBet: 0,
      deck: shuffleDeck(createDeck()),
      phase: 'betting',
      playerHand: [],
      dealerHand: [],
      hiddenCard: null,
      stats: {
        totalHands: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        busts: 0,
        blackjacks: 0,
        biggestWin: 0,
        biggestLoss: 0,
        balanceHistory: []
      },
      leaderboard: [],
      settings: {
        soundEnabled: true,
        animationSpeed: 'normal',
        startingBalance: 1000
      },
      isResultModalOpen: false,
      isTutorialModalOpen: false,
      lastOutcome: null
    };
  });
  
  // ========================================================================
  // Navigation Actions
  // ========================================================================
  
  describe('NAVIGATE', () => {
    it('should update currentView', () => {
      const newState = gameReducer(initialState, { type: 'NAVIGATE', payload: 'game' });
      expect(newState.currentView).toBe('game');
    });
    
    it('should not mutate original state', () => {
      const originalView = initialState.currentView;
      gameReducer(initialState, { type: 'NAVIGATE', payload: 'stats' });
      expect(initialState.currentView).toBe(originalView);
    });
  });
  
  // ========================================================================
  // Betting Phase Actions
  // ========================================================================
  
  describe('PLACE_BET', () => {
    it('should add chip denomination to current bet', () => {
      const newState = gameReducer(initialState, { type: 'PLACE_BET', payload: 25 });
      expect(newState.currentBet).toBe(25);
    });
    
    it('should accumulate multiple bets', () => {
      let state = gameReducer(initialState, { type: 'PLACE_BET', payload: 25 });
      state = gameReducer(state, { type: 'PLACE_BET', payload: 100 });
      expect(state.currentBet).toBe(125);
    });
    
    it('should prevent betting more than balance', () => {
      const state = { ...initialState, balance: 100, currentBet: 50 };
      const newState = gameReducer(state, { type: 'PLACE_BET', payload: 100 });
      expect(newState.currentBet).toBe(50); // Should not change
    });
  });
  
  describe('CLEAR_BET', () => {
    it('should reset bet to zero', () => {
      const state = { ...initialState, currentBet: 150 };
      const newState = gameReducer(state, { type: 'CLEAR_BET' });
      expect(newState.currentBet).toBe(0);
    });
  });
  
  describe('DEAL', () => {
    it('should deduct bet from balance', () => {
      const state = { ...initialState, currentBet: 100 };
      const newState = gameReducer(state, { type: 'DEAL' });
      expect(newState.balance).toBe(900);
    });
    
    it('should deal one hidden card to player', () => {
      const state = { ...initialState, currentBet: 100 };
      const newState = gameReducer(state, { type: 'DEAL' });
      expect(newState.playerHand).toHaveLength(1);
      expect(newState.hiddenCard).not.toBeNull();
    });
    
    it('should deal two cards to dealer', () => {
      const state = { ...initialState, currentBet: 100 };
      const newState = gameReducer(state, { type: 'DEAL' });
      expect(newState.dealerHand).toHaveLength(2);
    });
    
    it('should transition to playerTurn phase', () => {
      const state = { ...initialState, currentBet: 100 };
      const newState = gameReducer(state, { type: 'DEAL' });
      expect(newState.phase).toBe('playerTurn');
    });
    
    it('should not deal if bet is zero', () => {
      const newState = gameReducer(initialState, { type: 'DEAL' });
      expect(newState.phase).toBe('betting');
      expect(newState.playerHand).toHaveLength(0);
    });
    
    it('should not deal if bet exceeds balance', () => {
      const state = { ...initialState, currentBet: 1500 };
      const newState = gameReducer(state, { type: 'DEAL' });
      expect(newState.phase).toBe('betting');
    });
  });
  
  // ========================================================================
  // Player Turn Actions
  // ========================================================================
  
  describe('HIT', () => {
    it('should add a card to player hand', () => {
      const state = {
        ...initialState,
        phase: 'playerTurn' as const,
        playerHand: [{ suit: 'hearts' as const, rank: '5' as const, id: 'h-5-0' }]
      };
      const newState = gameReducer(state, { type: 'HIT' });
      expect(newState.playerHand.length).toBeGreaterThan(state.playerHand.length);
    });
    
    it('should not allow hit during betting phase', () => {
      const newState = gameReducer(initialState, { type: 'HIT' });
      expect(newState.playerHand).toHaveLength(0);
    });
  });
  
  describe('STAND', () => {
    it('should transition to dealerTurn phase', () => {
      const state = { ...initialState, phase: 'playerTurn' as const };
      const newState = gameReducer(state, { type: 'STAND' });
      expect(newState.phase).toBe('dealerTurn');
    });
    
    it('should not transition if not in playerTurn', () => {
      const newState = gameReducer(initialState, { type: 'STAND' });
      expect(newState.phase).toBe('betting');
    });
  });
  
  // ========================================================================
  // Dealer Turn Actions
  // ========================================================================
  
  describe('DEALER_TURN', () => {
    it('should transition to result phase', () => {
      const state = {
        ...initialState,
        phase: 'dealerTurn' as const,
        currentBet: 100,
        playerHand: [
          { suit: 'hearts' as const, rank: '10' as const, id: 'h-10-0' },
          { suit: 'diamonds' as const, rank: '9' as const, id: 'd-9-0' }
        ],
        dealerHand: [
          { suit: 'clubs' as const, rank: '10' as const, id: 'c-10-0' },
          { suit: 'spades' as const, rank: '7' as const, id: 's-7-0' }
        ]
      };
      const newState = gameReducer(state, { type: 'DEALER_TURN' });
      expect(newState.phase).toBe('result');
    });
    
    it('should open result modal', () => {
      const state = {
        ...initialState,
        phase: 'dealerTurn' as const,
        currentBet: 100,
        playerHand: [{ suit: 'hearts' as const, rank: '10' as const, id: 'h-10-0' }],
        dealerHand: [{ suit: 'clubs' as const, rank: '10' as const, id: 'c-10-0' }]
      };
      const newState = gameReducer(state, { type: 'DEALER_TURN' });
      expect(newState.isResultModalOpen).toBe(true);
    });
  });
  
  // ========================================================================
  // Round Resolution Actions
  // ========================================================================
  
  describe('PLAY_AGAIN', () => {
    it('should reset to betting phase', () => {
      const state = {
        ...initialState,
        phase: 'result' as const,
        currentBet: 100,
        playerHand: [{ suit: 'hearts' as const, rank: '10' as const, id: 'h-10-0' }],
        dealerHand: [{ suit: 'clubs' as const, rank: '10' as const, id: 'c-10-0' }],
        isResultModalOpen: true
      };
      const newState = gameReducer(state, { type: 'PLAY_AGAIN' });
      expect(newState.phase).toBe('betting');
      expect(newState.currentBet).toBe(0);
      expect(newState.playerHand).toHaveLength(0);
      expect(newState.dealerHand).toHaveLength(0);
      expect(newState.isResultModalOpen).toBe(false);
    });
  });
  
  // ========================================================================
  // Settings Actions
  // ========================================================================
  
  describe('UPDATE_SETTINGS', () => {
    it('should update sound setting', () => {
      const newState = gameReducer(initialState, {
        type: 'UPDATE_SETTINGS',
        payload: { soundEnabled: false }
      });
      expect(newState.settings.soundEnabled).toBe(false);
    });
    
    it('should update animation speed', () => {
      const newState = gameReducer(initialState, {
        type: 'UPDATE_SETTINGS',
        payload: { animationSpeed: 'fast' }
      });
      expect(newState.settings.animationSpeed).toBe('fast');
    });
    
    it('should update starting balance', () => {
      const newState = gameReducer(initialState, {
        type: 'UPDATE_SETTINGS',
        payload: { startingBalance: 2500 }
      });
      expect(newState.settings.startingBalance).toBe(2500);
    });
    
    it('should preserve other settings when updating one', () => {
      const newState = gameReducer(initialState, {
        type: 'UPDATE_SETTINGS',
        payload: { soundEnabled: false }
      });
      expect(newState.settings.animationSpeed).toBe('normal');
      expect(newState.settings.startingBalance).toBe(1000);
    });
  });
  
  describe('RESET_SESSION', () => {
    it('should reset balance to starting balance', () => {
      const state = { ...initialState, balance: 500 };
      const newState = gameReducer(state, { type: 'RESET_SESSION' });
      expect(newState.balance).toBe(1000);
    });
    
    it('should reset statistics', () => {
      const state = {
        ...initialState,
        stats: {
          ...initialState.stats,
          totalHands: 50,
          wins: 25,
          losses: 20,
          pushes: 5,
          busts: 10,
          blackjacks: 3,
          biggestWin: 500,
          biggestLoss: 200,
          balanceHistory: []
        }
      };
      const newState = gameReducer(state, { type: 'RESET_SESSION' });
      expect(newState.stats.totalHands).toBe(0);
      expect(newState.stats.wins).toBe(0);
      expect(newState.stats.losses).toBe(0);
    });
    
    it('should add entry to leaderboard', () => {
      const state = {
        ...initialState,
        balance: 1500,
        stats: { ...initialState.stats, totalHands: 25 }
      };
      const newState = gameReducer(state, { type: 'RESET_SESSION' });
      expect(newState.leaderboard).toHaveLength(1);
      expect(newState.leaderboard[0].endingBalance).toBe(1500);
      expect(newState.leaderboard[0].netGain).toBe(500);
    });
  });
  
  // ========================================================================
  // Leaderboard Actions
  // ========================================================================
  
  describe('CLEAR_LEADERBOARD', () => {
    it('should clear all leaderboard entries', () => {
      const state = {
        ...initialState,
        leaderboard: [
          {
            id: 'entry-1',
            date: Date.now(),
            startingBalance: 1000,
            endingBalance: 1500,
            netGain: 500,
            handsPlayed: 25
          }
        ]
      };
      const newState = gameReducer(state, { type: 'CLEAR_LEADERBOARD' });
      expect(newState.leaderboard).toHaveLength(0);
    });
  });
  
  // ========================================================================
  // Modal Actions
  // ========================================================================
  
  describe('OPEN_TUTORIAL', () => {
    it('should open tutorial modal', () => {
      const newState = gameReducer(initialState, { type: 'OPEN_TUTORIAL' });
      expect(newState.isTutorialModalOpen).toBe(true);
    });
  });
  
  describe('CLOSE_TUTORIAL', () => {
    it('should close tutorial modal', () => {
      const state = { ...initialState, isTutorialModalOpen: true };
      const newState = gameReducer(state, { type: 'CLOSE_TUTORIAL' });
      expect(newState.isTutorialModalOpen).toBe(false);
    });
  });
  
  // ========================================================================
  // Initialization Action
  // ========================================================================
  
  describe('INITIALIZE_FROM_STORAGE', () => {
    it('should merge stored state with current state', () => {
      const storedState = {
        balance: 2000,
        currentView: 'stats' as const
      };
      const newState = gameReducer(initialState, {
        type: 'INITIALIZE_FROM_STORAGE',
        payload: storedState
      });
      expect(newState.balance).toBe(2000);
      expect(newState.currentView).toBe('stats');
    });
    
    it('should preserve unspecified state properties', () => {
      const storedState = { balance: 2000 };
      const newState = gameReducer(initialState, {
        type: 'INITIALIZE_FROM_STORAGE',
        payload: storedState
      });
      expect(newState.settings).toEqual(initialState.settings);
      expect(newState.stats).toEqual(initialState.stats);
    });
  });
  
  // ========================================================================
  // Immutability Tests
  // ========================================================================
  
  describe('Immutability', () => {
    it('should not mutate state when placing bet', () => {
      const originalBet = initialState.currentBet;
      gameReducer(initialState, { type: 'PLACE_BET', payload: 50 });
      expect(initialState.currentBet).toBe(originalBet);
    });
    
    it('should not mutate state when updating settings', () => {
      const originalSound = initialState.settings.soundEnabled;
      gameReducer(initialState, {
        type: 'UPDATE_SETTINGS',
        payload: { soundEnabled: false }
      });
      expect(initialState.settings.soundEnabled).toBe(originalSound);
    });
    
    it('should not mutate leaderboard array', () => {
      const originalLength = initialState.leaderboard.length;
      gameReducer(initialState, { type: 'RESET_SESSION' });
      expect(initialState.leaderboard.length).toBe(originalLength);
    });
  });
});
