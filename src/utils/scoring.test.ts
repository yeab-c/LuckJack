/**
 * Property-Based Tests and Unit Tests for Scoring Functions
 * 
 * Property-based tests validate universal properties of hand value calculation:
 * - Idempotency: calculating value twice yields same result
 * - Ace adjustment: Aces are valued optimally to minimize bust
 * 
 * Unit tests validate specific examples and edge cases for scoring functions.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateHandValue, isBlackjack, isBust } from './scoring';
import type { Card, CardRank, CardSuit } from '../types/game';

/**
 * Arbitrary generator for Card objects
 * Generates random valid cards for property-based testing
 */
const cardArbitrary = fc.record({
  suit: fc.constantFrom<CardSuit>('hearts', 'diamonds', 'clubs', 'spades'),
  rank: fc.constantFrom<CardRank>('A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'),
  id: fc.string()
});

/**
 * Arbitrary generator for arrays of cards (hands)
 * Generates hands with 0 to 10 cards
 */
const handArbitrary = fc.array(cardArbitrary, { minLength: 0, maxLength: 10 });

describe('Hand Value Calculation Properties', () => {
  /**
   * Property 2: Hand value calculation is idempotent
   * **Validates: Requirements 4.6**
   * 
   * Feature: luckjack-casino-game, Property 2: Hand value calculation is idempotent
   * 
   * This property test verifies that calculating the hand value multiple times
   * yields the same result. This ensures the function is pure and deterministic.
   */
  it('Property 2: Calculating hand value twice yields the same result (idempotent)', () => {
    fc.assert(
      fc.property(handArbitrary, (hand) => {
        const firstCalculation = calculateHandValue(hand);
        const secondCalculation = calculateHandValue(hand);
        
        expect(firstCalculation).toBe(secondCalculation);
      }),
      { numRuns: 100 } // Minimum 100 iterations as specified
    );
  });

  /**
   * Property 2b: Hand value calculation is idempotent (multiple calls)
   * **Validates: Requirements 4.6**
   * 
   * Extended test: verify idempotency across many calculations
   */
  it('Property 2b: Calculating hand value multiple times yields consistent results', () => {
    fc.assert(
      fc.property(handArbitrary, (hand) => {
        const results = [];
        
        // Calculate value 5 times
        for (let i = 0; i < 5; i++) {
          results.push(calculateHandValue(hand));
        }
        
        // All results should be identical
        const firstResult = results[0];
        for (const result of results) {
          expect(result).toBe(firstResult);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Ace Adjustment Properties', () => {
  /**
   * Property 3: Ace adjustment minimizes bust when possible
   * **Validates: Requirements 4.4, 4.5**
   * 
   * Feature: luckjack-casino-game, Property 3: Ace adjustment minimizes bust when possible
   * 
   * This property test verifies that Aces are valued optimally:
   * - Prefer 11 when it doesn't cause bust
   * - Adjust to 1 when necessary to avoid bust
   * - Apply adjustment iteratively for multiple Aces
   */
  it('Property 3: Aces are valued optimally to minimize bust', () => {
    fc.assert(
      fc.property(handArbitrary, (hand) => {
        const value = calculateHandValue(hand);
        
        // Count Aces in the hand
        const aceCount = hand.filter(card => card.rank === 'A').length;
        
        if (aceCount === 0) {
          // No Aces: value should be straightforward sum
          return;
        }
        
        // Calculate what the value would be if all Aces were 11
        let allAcesElevenValue = 0;
        for (const card of hand) {
          if (card.rank === 'A') {
            allAcesElevenValue += 11;
          } else if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
            allAcesElevenValue += 10;
          } else {
            allAcesElevenValue += parseInt(card.rank, 10);
          }
        }
        
        // Calculate what the value would be if all Aces were 1
        let allAcesOneValue = 0;
        for (const card of hand) {
          if (card.rank === 'A') {
            allAcesOneValue += 1;
          } else if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
            allAcesOneValue += 10;
          } else {
            allAcesOneValue += parseInt(card.rank, 10);
          }
        }
        
        // The actual value should be between these two extremes
        expect(value).toBeGreaterThanOrEqual(allAcesOneValue);
        expect(value).toBeLessThanOrEqual(allAcesElevenValue);
        
        // If the value is > 21, it should be the minimum possible (all Aces as 1)
        if (value > 21) {
          expect(value).toBe(allAcesOneValue);
        }
        
        // If we can avoid bust by adjusting Aces, we should
        if (allAcesOneValue <= 21) {
          expect(value).toBeLessThanOrEqual(21);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3b: Ace adjustment is applied iteratively
   * **Validates: Requirements 4.5**
   * 
   * This test verifies that when multiple Aces are present, the adjustment
   * is applied iteratively until the value is ≤ 21 or no Aces valued at 11 remain.
   */
  it('Property 3b: Multiple Aces are adjusted iteratively until value ≤ 21', () => {
    // Generate hands with multiple Aces
    const multipleAcesArbitrary = fc.array(cardArbitrary, { minLength: 2, maxLength: 10 })
      .filter(hand => hand.filter(card => card.rank === 'A').length >= 2);
    
    fc.assert(
      fc.property(multipleAcesArbitrary, (hand) => {
        const value = calculateHandValue(hand);
        const aceCount = hand.filter(card => card.rank === 'A').length;
        
        // Calculate the sum of non-Ace cards
        let nonAceSum = 0;
        for (const card of hand) {
          if (card.rank !== 'A') {
            if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
              nonAceSum += 10;
            } else {
              nonAceSum += parseInt(card.rank, 10);
            }
          }
        }
        
        // If we can keep at least one Ace as 11 without busting, we should
        const oneAceElevenValue = nonAceSum + 11 + (aceCount - 1);
        const allAcesOneValue = nonAceSum + aceCount;
        
        if (oneAceElevenValue <= 21) {
          // We should be able to keep one Ace as 11
          expect(value).toBe(oneAceElevenValue);
        } else {
          // All Aces should be valued as 1
          expect(value).toBe(allAcesOneValue);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3c: Ace adjustment never increases hand value above optimal
   * **Validates: Requirements 4.4, 4.5**
   * 
   * This test verifies that the Ace adjustment algorithm produces the highest
   * possible value that doesn't exceed 21 (when possible).
   */
  it('Property 3c: Ace adjustment produces highest value ≤ 21 when possible', () => {
    fc.assert(
      fc.property(handArbitrary, (hand) => {
        const value = calculateHandValue(hand);
        const aceCount = hand.filter(card => card.rank === 'A').length;
        
        if (aceCount === 0) {
          return; // No Aces to adjust
        }
        
        // Calculate all possible values by trying different Ace combinations
        const possibleValues: number[] = [];
        
        // Try all combinations of Aces as 11 or 1
        for (let acesAsEleven = 0; acesAsEleven <= aceCount; acesAsEleven++) {
          let testValue = 0;
          
          for (const card of hand) {
            if (card.rank === 'A') {
              // This is handled separately
            } else if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
              testValue += 10;
            } else {
              testValue += parseInt(card.rank, 10);
            }
          }
          
          // Add Aces: some as 11, rest as 1
          testValue += (acesAsEleven * 11) + ((aceCount - acesAsEleven) * 1);
          possibleValues.push(testValue);
        }
        
        // Find the highest value that doesn't exceed 21
        const validValues = possibleValues.filter(v => v <= 21);
        
        if (validValues.length > 0) {
          const optimalValue = Math.max(...validValues);
          expect(value).toBe(optimalValue);
        } else {
          // All values exceed 21, so we should use the minimum (all Aces as 1)
          const minValue = Math.min(...possibleValues);
          expect(value).toBe(minValue);
        }
      }),
      { numRuns: 100 }
    );
  });
});

describe('Scoring Functions Unit Tests', () => {
  describe('calculateHandValue()', () => {
    /**
     * Test specific examples: soft 17, hard 17, Blackjack, bust scenarios
     * **Validates: Requirements 4.1-4.5**
     */
    
    it('should return 0 for an empty hand', () => {
      expect(calculateHandValue([])).toBe(0);
    });

    it('should calculate numbered cards correctly (face value)', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '2', id: '1' },
        { suit: 'diamonds', rank: '5', id: '2' },
        { suit: 'clubs', rank: '8', id: '3' }
      ];
      expect(calculateHandValue(hand)).toBe(15); // 2 + 5 + 8
    });

    it('should calculate face cards as 10', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'J', id: '1' },
        { suit: 'diamonds', rank: 'Q', id: '2' },
        { suit: 'clubs', rank: 'K', id: '3' }
      ];
      expect(calculateHandValue(hand)).toBe(30); // 10 + 10 + 10
    });

    it('should calculate Ace as 11 when it does not cause bust', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: '5', id: '2' }
      ];
      expect(calculateHandValue(hand)).toBe(16); // 11 + 5 (soft 16)
    });

    it('should calculate soft 17 correctly (Ace + 6)', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: '6', id: '2' }
      ];
      expect(calculateHandValue(hand)).toBe(17); // 11 + 6 (soft 17)
    });

    it('should calculate hard 17 correctly (10 + 7)', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '7', id: '2' }
      ];
      expect(calculateHandValue(hand)).toBe(17); // 10 + 7 (hard 17)
    });

    it('should calculate Blackjack correctly (Ace + 10-value card)', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' }
      ];
      expect(calculateHandValue(hand)).toBe(21); // 11 + 10
    });

    it('should adjust Ace from 11 to 1 when total exceeds 21', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      // Initially: 11 + 9 + 5 = 25 (bust)
      // After adjustment: 1 + 9 + 5 = 15
      expect(calculateHandValue(hand)).toBe(15);
    });

    it('should handle multiple Aces correctly (all Aces as 1 except one)', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'A', id: '2' },
        { suit: 'clubs', rank: '9', id: '3' }
      ];
      // Initially: 11 + 11 + 9 = 31 (bust)
      // After first adjustment: 1 + 11 + 9 = 21
      expect(calculateHandValue(hand)).toBe(21);
    });

    it('should handle four Aces correctly', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'A', id: '2' },
        { suit: 'clubs', rank: 'A', id: '3' },
        { suit: 'spades', rank: 'A', id: '4' }
      ];
      // Initially: 11 + 11 + 11 + 11 = 44 (bust)
      // After adjustments: 11 + 1 + 1 + 1 = 14
      expect(calculateHandValue(hand)).toBe(14);
    });

    it('should handle all face cards correctly', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'K', id: '1' },
        { suit: 'diamonds', rank: 'Q', id: '2' },
        { suit: 'clubs', rank: 'J', id: '3' }
      ];
      expect(calculateHandValue(hand)).toBe(30); // 10 + 10 + 10
    });

    it('should handle bust scenario correctly', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      expect(calculateHandValue(hand)).toBe(24); // 10 + 9 + 5 (bust)
    });

    it('should handle single Ace correctly', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' }
      ];
      expect(calculateHandValue(hand)).toBe(11); // Single Ace valued at 11
    });

    it('should handle Ace with face card and additional card', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      // Initially: 11 + 10 + 5 = 26 (bust)
      // After adjustment: 1 + 10 + 5 = 16
      expect(calculateHandValue(hand)).toBe(16);
    });

    it('should handle three Aces correctly', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'A', id: '2' },
        { suit: 'clubs', rank: 'A', id: '3' }
      ];
      // Initially: 11 + 11 + 11 = 33 (bust)
      // After adjustments: 11 + 1 + 1 = 13
      expect(calculateHandValue(hand)).toBe(13);
    });

    it('should handle two Aces with high card correctly', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'A', id: '2' },
        { suit: 'clubs', rank: '10', id: '3' }
      ];
      // Initially: 11 + 11 + 10 = 32 (bust)
      // After adjustments: 1 + 1 + 10 = 12
      expect(calculateHandValue(hand)).toBe(12);
    });
  });

  describe('isBlackjack()', () => {
    it('should return true for Ace + 10', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: '10', id: '2' }
      ];
      expect(isBlackjack(hand)).toBe(true);
    });

    it('should return true for Ace + face card', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' }
      ];
      expect(isBlackjack(hand)).toBe(true);
    });

    it('should return false for 21 with more than 2 cards', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '7', id: '1' },
        { suit: 'diamonds', rank: '7', id: '2' },
        { suit: 'clubs', rank: '7', id: '3' }
      ];
      expect(isBlackjack(hand)).toBe(false);
    });

    it('should return false for 2 cards not totaling 21', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' }
      ];
      expect(isBlackjack(hand)).toBe(false);
    });

    it('should return false for empty hand', () => {
      expect(isBlackjack([])).toBe(false);
    });

    it('should return false for single card', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' }
      ];
      expect(isBlackjack(hand)).toBe(false);
    });
  });

  describe('isBust()', () => {
    it('should return true when hand value exceeds 21', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      expect(isBust(hand)).toBe(true); // 24
    });

    it('should return false when hand value is exactly 21', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' }
      ];
      expect(isBust(hand)).toBe(false); // 21
    });

    it('should return false when hand value is less than 21', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: '10', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' }
      ];
      expect(isBust(hand)).toBe(false); // 19
    });

    it('should return false for empty hand', () => {
      expect(isBust([])).toBe(false); // 0
    });

    it('should handle Ace adjustment correctly (not bust after adjustment)', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: '9', id: '2' },
        { suit: 'clubs', rank: '5', id: '3' }
      ];
      // After Ace adjustment: 1 + 9 + 5 = 15 (not bust)
      expect(isBust(hand)).toBe(false);
    });

    it('should return true when bust even after Ace adjustment', () => {
      const hand: Card[] = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'diamonds', rank: 'K', id: '2' },
        { suit: 'clubs', rank: 'Q', id: '3' },
        { suit: 'spades', rank: '5', id: '4' }
      ];
      // After Ace adjustment: 1 + 10 + 10 + 5 = 26 (still bust)
      expect(isBust(hand)).toBe(true);
    });
  });
});
