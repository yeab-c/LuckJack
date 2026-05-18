/**
 * Deck Management Utilities for LuckJack Casino Game
 * 
 * This module provides pure functions for deck creation, shuffling, and card dealing.
 * All functions are immutable and do not modify input parameters.
 * 
 * Requirements: 3.1, 3.2, 3.3
 */

import type { Card, CardSuit, CardRank } from '../types/game';

/**
 * Creates a 6-deck shoe containing 312 cards total (6 × 52 cards).
 * Each card is assigned a unique ID for React key tracking.
 * 
 * @returns Array of 312 Card objects
 * 
 * **Validates: Requirements 3.1**
 */
export function createDeck(): Card[] {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  
  const deck: Card[] = [];
  
  // Create 6 decks (6 × 52 = 312 cards)
  for (let deckIndex = 0; deckIndex < 6; deckIndex++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({
          suit,
          rank,
          id: `${suit}-${rank}-${deckIndex}` // Unique ID for each card instance
        });
      }
    }
  }
  
  return deck;
}

/**
 * Shuffles a deck using the Fisher-Yates algorithm to produce a uniformly random permutation.
 * This function is pure and does not modify the input deck.
 * 
 * Algorithm:
 * 1. Iterate from last index to first
 * 2. For each position i, generate random index j where 0 ≤ j ≤ i
 * 3. Swap elements at positions i and j
 * 
 * @param deck - The deck to shuffle
 * @returns A new shuffled deck array (immutable)
 * 
 * **Validates: Requirements 3.2**
 */
export function shuffleDeck(deck: Card[]): Card[] {
  // Create a copy to avoid mutating the input
  const shuffled = [...deck];
  
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate random index j where 0 ≤ j ≤ i
    const j = Math.floor(Math.random() * (i + 1));
    
    // Swap elements at positions i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Deals the top card from the deck and returns both the card and the remaining deck.
 * This function is pure and does not modify the input deck.
 * 
 * @param deck - The deck to deal from
 * @returns Object containing the dealt card and the remaining deck
 * @throws Error if the deck is empty
 * 
 * **Validates: Requirements 3.2**
 */
export function dealCard(deck: Card[]): { card: Card; remainingDeck: Card[] } {
  if (deck.length === 0) {
    throw new Error('Cannot deal from an empty deck');
  }
  
  // Deal the first card (top of deck)
  const card = deck[0];
  
  // Return remaining deck without the dealt card (immutable)
  const remainingDeck = deck.slice(1);
  
  return { card, remainingDeck };
}

/**
 * Determines whether the deck should be reshuffled based on the remaining card count.
 * The threshold is set at 52 cards (one full deck).
 * 
 * @param deck - The deck to check
 * @returns true if deck has fewer than 52 cards, false otherwise
 * 
 * **Validates: Requirements 3.3**
 */
export function shouldReshuffle(deck: Card[]): boolean {
  return deck.length < 52;
}
