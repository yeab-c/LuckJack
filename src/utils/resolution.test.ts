/**
 * Property-Based Tests and Unit Tests for Round Resolution
 * 
 * Property-based tests validate that round resolution produces valid outcomes
 * according to Blackjack rules.
 * 
 * Unit tests validate specific scenarios and edge cases.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resolveRound, shouldDealerHit } from './resolution';
import { calculateHandValue, isBlackjack, isBust } from './scoring';
import type { Card, CardRank, CardSuit } from '../types/game';

/**
 * Arbitrary generator for Card objects
 */
const cardArbitrary = fc.record({
  suit: fc.constantFrom<CardSuit>('hearts', 'diamonds', 'clubs', 'spades'),
  rank: fc.constantFrom<CardRank>('A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'),
  id: fc.string()
});

/**
 * Arbitrary generator for hands (2 to 10 cards)
 */
const handArbitrary = fc.array(cardArbitrary, { minLength: 2, maxLength: 10 });

/**
 * Arbitrary generator for bet amounts (positive integers)
 */
const betArbitrary = fc.integer({ min: 1, max: 10000 });

describe('Round Resolution Properties', () => {
  /**
   * Property 4: Round resolution produces valid outcomes
   * **Validates: Requirements 10.4-10.8**
   * 
   * Feature: luckjack-casino-game, Property 4: Round resolution produces valid outcomes
   * 
   * This property test verifies that all outcomes follow Blackjack rules:
   * - BUST: player hand value > 21
   * - BLACKJACK: player has 21 with 2 cards
   * - WIN: player score > dealer score (or dealer bust)
   * - LOSE: player score < dealer score
   * - PUSH: player score = dealer score
   */
  it('Property 4: Round resolution produces valid outcomes according to Blackjack rules', () => {
    fc.assert(
      fc.property(handArbitrary, handArbitrary, betArbitrary, (playerHand, dealerHand, bet) => {
        const outcome = resolveRound(playerHand, dealerHand, bet);
        
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);
        
        // Verify outcome matches game logic
        if (isBust(playerHand)) {
          expect(outcome.result).toBe('BUST');
        } else if (isBlackjack(playerHand)) {
          expect(outcome.result).toBe('BLACKJACK');
        } else if (isBust(dealerHand)) {
          expect(outcome.result).toBe('WIN');
        } else if (playerValue > dealerValue) {
          expect(outcome.result).toBe('WIN');
        } else if (playerValue < dealerValue) {
          expect(outcome.result).toBe('LOSE');
        } else {
          expect(outcome.result).toBe('PUSH');
        }
        
        // Verify scores are correct
        expect(outcome.finalPlayerScore).toBe(playerValue);
        expect(outcome.finalDealerScore).toBe(dealerValue);
        
        // Verify hidden card is the first card
        expect(outcome.hiddenCard).toEqual(playerHand[0]);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4b: Chip change calculations are correct for each outcome
   * **Validates: Requirements 10.4-10.8**
   * 
   * This property test verifies that chip changes are calculated correctly:
   * - BUST: 0 (lose bet)
   * - BLACKJACK: 2.5× bet
   * - WIN: 2× bet
   * - LOSE: 0 (lose bet)
   * - PUSH: return bet
   */
  it('Property 4b: Chip change calculations are correct for each outcome', () => {
    fc.assert(
      fc.property(handArbitrary, handArbitrary, betArbitrary, (playerHand, dealerHand, bet) => {
        const outcome = resolveRound(playerHand, dealerHand, bet);
        
        // Verify chip changes match outcome type
        switch (outcome.result) {
          case 'BUST':
            expect(outcome.chipChange).toBe(0); // Lose bet
            break;
          case 'BLACKJACK':
            expect(outcome.chipChange).toBe(Math.floor(bet * 2.5)); // Win 2.5× bet
            break;
          case 'WIN':
            expect(outcome.chipChange).toBe(bet * 2); // Win 2× bet
            break;
          case 'LOSE':
            expect(outcome.chipChange).toBe(0); // Lose bet
            break;
          case 'PUSH':
            expect(outcome.chipChange).toBe(bet); // Return bet
            break;
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4c: Chip changes are always non-negative
   * **Validates: Requirements 10.4-10.8**
   * 
   * This property verifies that chip changes are never negative
   * (losses are represented as 0, not negative values).
   */
  it('Property 4c: Chip changes are always non-negative', () => {
    fc.assert(
      fc.property(handArbitrary, handArbitrary, betArbitrary, (playerHand, dealerHand, bet) => {
        const outcome = resolveRound(playerHand, dealerHand, bet);
        expect(outcome.chipChange).toBeGreaterThanOrEqual(0);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4d: Outcome result is always one of the valid types
   * **Validates: Requirements 10.4-10.8**
   */
  it('Property 4d: Outcome result is always a valid type', () => {
    fc.assert(
      fc.property(handArbitrary, handArbitrary, betArbitrary, (playerHand, dealerHand, bet) => {
        const outcome = resolveRound(playerHand, dealerHand, bet);
        const validResults = ['BUST', 'BLACKJACK', 'WIN', 'LOSE', 'PUSH'];
        expect(validResults).toContain(outcome.result);
      }),
      { numRuns: 100 }
    );
  });
});

describe('Dealer AI Properties', () => {
  /**
   * Property 5: Dealer AI follows hit/stand rules consistently
   * **Validates: Requirements 9.2, 9.3**
   * 
   * This property verifies that the dealer AI:
   * - Hits on hand value ≤ 16
   * - Stands on hand value ≥ 17
   */
  it('Property 5: Dealer hits on ≤16 and stands on ≥17', () => {
    fc.assert(
      fc.property(handArbitrary, (dealerHand) => {
        const handValue = calculateHandValue(dealerHand);
        const shouldHit = shouldDealerHit(dealerHand);
        
        if (handValue <= 16) {
          expect(shouldHit).toBe(true);
        } else {
          expect(shouldHit).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Round Resolution Unit Tests', () => {
  /**
   * Test specific scenarios: player bust, dealer bust, push, Blackjack
   * **Validates: Requirements 9.2, 9.3, 10.4-10.8**
   */
  
  describe('resolveRound()', () => {
    it('should return BUST when player busts', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '4' },
        { suit: 'diamonds', rank: '7', id: '5' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      expect(outcome.result).toBe('BUST');
      expect(outcome.chipChange).toBe(0); // Lose bet
      expect(outcome.finalPlayerScore).toBe(24);
      expect(outcome.finalDealerScore).toBe(17);
      expect(outcome.hiddenCard).toEqual(playerHand[0]);
    });

    it('should return BLACKJACK when player has natural 21', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '3' },
        { suit: 'diamonds', rank: '9', id: '4' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      expect(outcome.result).toBe('BLACKJACK');
      expect(outcome.chipChange).toBe(250); // Win 2.5× bet
      expect(outcome.finalPlayerScore).toBe(21);
      expect(outcome.finalDealerScore).toBe(19);
    });

    it('should return WIN when dealer busts', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '3' },
        { suit: 'diamonds', rank: '9', id: '4' },
        { suit: 'clubs', rank: '5', id: '5' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      expect(outcome.result).toBe('WIN');
      expect(outcome.chipChange).toBe(200); // Win 2× bet
      expect(outcome.finalPlayerScore).toBe(19);
      expect(outcome.finalDealerScore).toBe(24);
    });

    it('should return WIN when player score > dealer score', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '3' },
        { suit: 'diamonds', rank: '7', id: '4' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      expect(outcome.result).toBe('WIN');
      expect(outcome.chipChange).toBe(200); // Win 2× bet
      expect(outcome.finalPlayerScore).toBe(19);
      expect(outcome.finalDealerScore).toBe(17);
    });

    it('should return LOSE when player score < dealer score', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '7', id: '2' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '3' },
        { suit: 'diamonds', rank: '9', id: '4' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      expect(outcome.result).toBe('LOSE');
      expect(outcome.chipChange).toBe(0); // Lose bet
      expect(outcome.finalPlayerScore).toBe(17);
      expect(outcome.finalDealerScore).toBe(19);
    });

    it('should return PUSH when player score = dealer score', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '8', id: '2' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '9', id: '3' },
        { suit: 'diamonds', rank: '9', id: '4' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      expect(outcome.result).toBe('PUSH');
      expect(outcome.chipChange).toBe(100); // Return bet
      expect(outcome.finalPlayerScore).toBe(18);
      expect(outcome.finalDealerScore).toBe(18);
    });

    it('should handle edge case: both have Blackjack (player wins)', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' }
      ];
      const dealerHand: Card[] = [
        { suit: 'clubs', rank: 'A', id: '3' },
        { suit: 'spades', rank: 'Q', id: '4' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      // Player Blackjack takes precedence
      expect(outcome.result).toBe('BLACKJACK');
      expect(outcome.chipChange).toBe(250); // Win 2.5× bet
    });

    it('should handle edge case: both bust (player loses)', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '4' },
        { suit: 'diamonds', rank: '9', id: '5' },
        { suit: 'spades', rank: '6', id: '6' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      // Player bust is checked first, so player loses
      expect(outcome.result).toBe('BUST');
      expect(outcome.chipChange).toBe(0);
    });

    it('should handle fractional Blackjack payout correctly', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '3' },
        { suit: 'diamonds', rank: '7', id: '4' }
      ];
      const bet = 101; // Odd number to test floor rounding
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      expect(outcome.result).toBe('BLACKJACK');
      expect(outcome.chipChange).toBe(252); // Math.floor(101 * 2.5) = 252
    });

    it('should correctly identify hidden card as first card', () => {
      const playerHand: Card[] = [
        { suit: 'hearts', rank: '5', id: 'hidden' },
        { suit: 'diamonds', rank: '10', id: 'visible1' },
        { suit: 'clubs', rank: '3', id: 'visible2' }
      ];
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '3' },
        { suit: 'diamonds', rank: '7', id: '4' }
      ];
      const bet = 100;
      
      const outcome = resolveRound(playerHand, dealerHand, bet);
      
      expect(outcome.hiddenCard.id).toBe('hidden');
      expect(outcome.hiddenCard.rank).toBe('5');
    });
  });

  describe('shouldDealerHit()', () => {
    it('should return true when dealer has 16', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '6', id: '2' }
      ];
      expect(shouldDealerHit(dealerHand)).toBe(true);
    });

    it('should return false when dealer has 17', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '7', id: '2' }
      ];
      expect(shouldDealerHit(dealerHand)).toBe(false);
    });

    it('should return true when dealer has less than 16', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '5', id: '2' }
      ];
      expect(shouldDealerHit(dealerHand)).toBe(true);
    });

    it('should return false when dealer has more than 17', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' }
      ];
      expect(shouldDealerHit(dealerHand)).toBe(false);
    });

    it('should return false when dealer has 21', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' }
      ];
      expect(shouldDealerHit(dealerHand)).toBe(false);
    });

    it('should return false when dealer busts', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      expect(shouldDealerHit(dealerHand)).toBe(false);
    });

    it('should handle soft 17 correctly (Ace + 6)', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: '6', id: '2' }
      ];
      // Soft 17 = 17, dealer should stand
      expect(shouldDealerHit(dealerHand)).toBe(false);
    });

    it('should handle soft 16 correctly (Ace + 5)', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: '5', id: '2' }
      ];
      // Soft 16 = 16, dealer should hit
      expect(shouldDealerHit(dealerHand)).toBe(true);
    });

    it('should return true for very low hands', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: '2', id: '1' },
        { suit: 'diamonds', rank: '3', id: '2' }
      ];
      expect(shouldDealerHit(dealerHand)).toBe(true);
    });

    it('should handle multiple Aces correctly', () => {
      const dealerHand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'A', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      // 11 + 1 + 5 = 17, dealer should stand
      expect(shouldDealerHit(dealerHand)).toBe(false);
    });
  });
});
