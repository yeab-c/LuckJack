/**
 * Scoring Utilities for LuckJack Casino Game
 * 
 * This module provides pure functions for calculating hand values and determining
 * game outcomes according to Blackjack rules.
 * 
 */

import type { Card } from '../types/game';

/**
 * Calculates the total value of a hand according to Blackjack rules.
 * 
 * Algorithm:
 * 1. Sum base values: 2-10 (face value), J/Q/K (10), A (11)
 * 2. Count number of Aces
 * 3. While total > 21 and Aces remain valued at 11:
 *    - Subtract 10 (converts one Ace from 11 to 1)
 *    - Decrement Ace count
 * 4. Return final total
 * 
 * @param cards - Array of cards in the hand
 * @returns The total value of the hand (0-31 range, typically 0-21)
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
 */
export function calculateHandValue(cards: Card[]): number {
  // Handle empty hand edge case
  if (cards.length === 0) {
    return 0;
  }
  
  let total = 0;
  let aceCount = 0;
  
  // Step 1: Sum base values and count Aces
  for (const card of cards) {
    if (card.rank === 'A') {
      total += 11; // Aces initially valued at 11
      aceCount++;
    } else if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
      total += 10; // Face cards valued at 10
    } else {
      total += parseInt(card.rank, 10); // Numbered cards have face value
    }
  }
  
  // Step 2: Adjust Aces from 11 to 1 if total exceeds 21
  // While total > 21 and we have Aces valued at 11, convert one Ace to 1
  while (total > 21 && aceCount > 0) {
    total -= 10; // Convert one Ace from 11 to 1 (subtract 10)
    aceCount--;
  }
  
  return total;
}

/**
 * Checks if a hand is a natural Blackjack (21 with exactly 2 cards).
 * 
 * @param cards - Array of cards in the hand
 * @returns true if the hand is a Blackjack, false otherwise
 * 
 * **Validates: Requirements 10.5**
 */
export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && calculateHandValue(cards) === 21;
}

/**
 * Checks if a hand is bust (value exceeds 21).
 * 
 * @param cards - Array of cards in the hand
 * @returns true if the hand value exceeds 21, false otherwise
 * 
 * **Validates: Requirements 10.4**
 */
export function isBust(cards: Card[]): boolean {
  return calculateHandValue(cards) > 21;
}
