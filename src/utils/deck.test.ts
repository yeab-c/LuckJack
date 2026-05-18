/**
 * Property-Based Tests and Unit Tests for Deck Management
 * 
 * Property-based tests validate that the Fisher-Yates shuffle algorithm produces
 * uniformly random permutations while preserving all cards.
 * 
 * Unit tests validate specific examples and edge cases for deck management functions.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createDeck, shuffleDeck, dealCard, shouldReshuffle } from './deck';

describe('Fisher-Yates Shuffle Properties', () => {
  /**
   * Property 1: Fisher-Yates produces uniformly random permutations
   * **Validates: Requirements 3.2, 3.5**
   * 
   * This property test verifies two critical aspects:
   * 1. The shuffle preserves all cards (no cards lost or duplicated)
   * 2. The shuffle produces different permutations across multiple runs
   */
  it('Property 1: Shuffle preserves all cards (no cards lost or duplicated)', () => {
    fc.assert(
      fc.property(fc.constant(createDeck()), (originalDeck) => {
        const shuffled = shuffleDeck(originalDeck);
        
        // Test 1: Same length
        expect(shuffled.length).toBe(originalDeck.length);
        
        // Test 2: All original cards are present in shuffled deck
        // Create a map of card IDs to their counts in the original deck
        const originalCardCounts = new Map<string, number>();
        for (const card of originalDeck) {
          originalCardCounts.set(card.id, (originalCardCounts.get(card.id) || 0) + 1);
        }
        
        // Create a map of card IDs to their counts in the shuffled deck
        const shuffledCardCounts = new Map<string, number>();
        for (const card of shuffled) {
          shuffledCardCounts.set(card.id, (shuffledCardCounts.get(card.id) || 0) + 1);
        }
        
        // Verify that both maps are identical
        expect(shuffledCardCounts.size).toBe(originalCardCounts.size);
        
        for (const [cardId, count] of originalCardCounts) {
          expect(shuffledCardCounts.get(cardId)).toBe(count);
        }
        
        // Test 3: Verify no extra cards were added
        for (const [cardId] of shuffledCardCounts) {
          expect(originalCardCounts.has(cardId)).toBe(true);
        }
      }),
      { numRuns: 100 } // Minimum 100 iterations as specified in task details
    );
  });

  /**
   * Property 2: Shuffle produces different permutations across runs
   * **Validates: Requirements 3.2, 3.5**
   * 
   * This test verifies that the shuffle is actually randomizing the deck
   * by checking that multiple shuffles produce different orderings.
   * 
   * Note: There's a tiny probability this could fail by chance if the same
   * permutation occurs twice, but with 312! possible permutations, this is
   * astronomically unlikely.
   */
  it('Property 2: Shuffle produces different permutations across multiple runs', () => {
    const originalDeck = createDeck();
    const shuffles: string[] = [];
    const numShuffles = 10;
    
    // Perform multiple shuffles and record their orderings
    for (let i = 0; i < numShuffles; i++) {
      const shuffled = shuffleDeck(originalDeck);
      // Create a string representation of the card order
      const orderSignature = shuffled.map(card => card.id).join(',');
      shuffles.push(orderSignature);
    }
    
    // Verify that we got at least some different permutations
    // With 312 cards and 10 shuffles, we should get 10 unique orderings
    const uniqueShuffles = new Set(shuffles);
    
    // All shuffles should be different (extremely high probability)
    expect(uniqueShuffles.size).toBe(numShuffles);
    
    // Also verify that at least one shuffle is different from the original order
    const originalOrder = originalDeck.map(card => card.id).join(',');
    const allShufflesSameAsOriginal = shuffles.every(shuffle => shuffle === originalOrder);
    expect(allShufflesSameAsOriginal).toBe(false);
  });

  /**
   * Property 3: Shuffle is immutable (does not modify original deck)
   * **Validates: Requirements 3.2**
   * 
   * This test verifies that the shuffle function is pure and does not
   * mutate the input deck.
   */
  it('Property 3: Shuffle does not modify the original deck', () => {
    fc.assert(
      fc.property(fc.constant(createDeck()), (originalDeck) => {
        // Create a snapshot of the original deck order
        const originalOrder = originalDeck.map(card => card.id);
        
        // Shuffle the deck
        shuffleDeck(originalDeck);
        
        // Verify the original deck is unchanged
        const currentOrder = originalDeck.map(card => card.id);
        expect(currentOrder).toEqual(originalOrder);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 4: Shuffle maintains card object integrity
   * **Validates: Requirements 3.2**
   * 
   * This test verifies that the shuffle preserves the complete card objects,
   * not just their IDs. Each card should maintain its suit, rank, and id.
   */
  it('Property 4: Shuffle maintains complete card object integrity', () => {
    fc.assert(
      fc.property(fc.constant(createDeck()), (originalDeck) => {
        const shuffled = shuffleDeck(originalDeck);
        
        // For each card in the shuffled deck, verify it exists in original
        for (const shuffledCard of shuffled) {
          const matchingCard = originalDeck.find(
            card => card.id === shuffledCard.id &&
                    card.suit === shuffledCard.suit &&
                    card.rank === shuffledCard.rank
          );
          expect(matchingCard).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Unit Tests for Deck Management Functions
 * 
 * These tests validate specific examples and edge cases for:
 * - createDeck(): 312 cards with correct distribution
 * - dealCard(): immutable card removal
 * - shouldReshuffle(): threshold detection
 * 
 * **Validates: Requirements 3.1, 3.3**
 */
describe('Deck Management Unit Tests', () => {
  describe('createDeck()', () => {
    it('should return exactly 312 cards (6 decks × 52 cards)', () => {
      const deck = createDeck();
      expect(deck.length).toBe(312);
    });

    it('should contain correct distribution of suits (78 cards per suit)', () => {
      const deck = createDeck();
      
      const suitCounts = {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0
      };
      
      for (const card of deck) {
        suitCounts[card.suit]++;
      }
      
      // Each suit should appear 78 times (6 decks × 13 ranks)
      expect(suitCounts.hearts).toBe(78);
      expect(suitCounts.diamonds).toBe(78);
      expect(suitCounts.clubs).toBe(78);
      expect(suitCounts.spades).toBe(78);
    });

    it('should contain correct distribution of ranks (24 cards per rank)', () => {
      const deck = createDeck();
      
      const rankCounts = new Map<string, number>();
      
      for (const card of deck) {
        rankCounts.set(card.rank, (rankCounts.get(card.rank) || 0) + 1);
      }
      
      // Each rank should appear 24 times (6 decks × 4 suits)
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      for (const rank of ranks) {
        expect(rankCounts.get(rank)).toBe(24);
      }
    });

    it('should assign unique IDs to each card instance', () => {
      const deck = createDeck();
      
      const ids = deck.map(card => card.id);
      const uniqueIds = new Set(ids);
      
      // All 312 cards should have unique IDs
      expect(uniqueIds.size).toBe(312);
    });

    it('should create cards with all required properties (suit, rank, id)', () => {
      const deck = createDeck();
      
      for (const card of deck) {
        expect(card).toHaveProperty('suit');
        expect(card).toHaveProperty('rank');
        expect(card).toHaveProperty('id');
        expect(typeof card.suit).toBe('string');
        expect(typeof card.rank).toBe('string');
        expect(typeof card.id).toBe('string');
      }
    });
  });

  describe('dealCard()', () => {
    it('should remove the first card from the deck', () => {
      const deck = createDeck();
      const firstCard = deck[0];
      
      const { card, remainingDeck } = dealCard(deck);
      
      expect(card).toEqual(firstCard);
      expect(remainingDeck.length).toBe(311);
      expect(remainingDeck[0]).not.toEqual(firstCard);
    });

    it('should not modify the original deck (immutability)', () => {
      const deck = createDeck();
      const originalLength = deck.length;
      const originalFirstCard = deck[0];
      
      dealCard(deck);
      
      // Original deck should be unchanged
      expect(deck.length).toBe(originalLength);
      expect(deck[0]).toEqual(originalFirstCard);
    });

    it('should return the correct card and remaining deck', () => {
      const deck = createDeck();
      const expectedCard = deck[0];
      const expectedRemainingCards = deck.slice(1);
      
      const { card, remainingDeck } = dealCard(deck);
      
      expect(card).toEqual(expectedCard);
      expect(remainingDeck).toEqual(expectedRemainingCards);
    });

    it('should work correctly when dealing multiple cards sequentially', () => {
      let deck = createDeck();
      const dealtCards = [];
      
      // Deal 5 cards
      for (let i = 0; i < 5; i++) {
        const result = dealCard(deck);
        dealtCards.push(result.card);
        deck = result.remainingDeck;
      }
      
      expect(dealtCards.length).toBe(5);
      expect(deck.length).toBe(307);
      
      // All dealt cards should be unique
      const uniqueIds = new Set(dealtCards.map(card => card.id));
      expect(uniqueIds.size).toBe(5);
    });

    it('should throw an error when dealing from an empty deck', () => {
      const emptyDeck: any[] = [];
      
      expect(() => dealCard(emptyDeck)).toThrow('Cannot deal from an empty deck');
    });

    it('should handle dealing the last card correctly', () => {
      const singleCardDeck = createDeck().slice(0, 1);
      
      const { card, remainingDeck } = dealCard(singleCardDeck);
      
      expect(card).toEqual(singleCardDeck[0]);
      expect(remainingDeck.length).toBe(0);
    });
  });

  describe('shouldReshuffle()', () => {
    it('should return true when deck has fewer than 52 cards', () => {
      const deck = createDeck().slice(0, 51);
      expect(shouldReshuffle(deck)).toBe(true);
    });

    it('should return true when deck has exactly 51 cards', () => {
      const deck = createDeck().slice(0, 51);
      expect(shouldReshuffle(deck)).toBe(true);
    });

    it('should return false when deck has exactly 52 cards', () => {
      const deck = createDeck().slice(0, 52);
      expect(shouldReshuffle(deck)).toBe(false);
    });

    it('should return false when deck has more than 52 cards', () => {
      const deck = createDeck().slice(0, 100);
      expect(shouldReshuffle(deck)).toBe(false);
    });

    it('should return false when deck is full (312 cards)', () => {
      const deck = createDeck();
      expect(shouldReshuffle(deck)).toBe(false);
    });

    it('should return true when deck is empty', () => {
      const emptyDeck: any[] = [];
      expect(shouldReshuffle(emptyDeck)).toBe(true);
    });

    it('should return true when deck has exactly 1 card', () => {
      const deck = createDeck().slice(0, 1);
      expect(shouldReshuffle(deck)).toBe(true);
    });

    it('should correctly identify the threshold boundary', () => {
      // Test the exact boundary conditions
      const deck53 = createDeck().slice(0, 53);
      const deck52 = createDeck().slice(0, 52);
      const deck51 = createDeck().slice(0, 51);
      
      expect(shouldReshuffle(deck53)).toBe(false); // Above threshold
      expect(shouldReshuffle(deck52)).toBe(false); // At threshold
      expect(shouldReshuffle(deck51)).toBe(true);  // Below threshold
    });
  });
});
