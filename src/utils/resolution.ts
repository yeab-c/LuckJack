/**
 * Round Resolution Utilities for LuckJack Casino Game
 * 
 * This module provides pure functions for resolving game rounds and determining
 * outcomes according to Blackjack rules.
 * 
 */

import type { Card, RoundOutcome } from '../types/game';
import { calculateHandValue, isBlackjack, isBust } from './scoring';

/**
 * Resolves a round and determines the outcome and chip changes.
 * 
 * Algorithm:
 * 1. Calculate final player and dealer scores
 * 2. Check player bust → BUST (lose bet)
 * 3. Check player Blackjack → BLACKJACK (win 2.5× bet)
 * 4. Check dealer bust → WIN (win 2× bet)
 * 5. Compare scores:
 *    - Player > Dealer → WIN (win 2× bet)
 *    - Player < Dealer → LOSE (lose bet)
 *    - Player = Dealer → PUSH (return bet)
 * 
 * @param playerHand - Array of cards in the player's hand (including hidden card)
 * @param dealerHand - Array of cards in the dealer's hand
 * @param bet - The amount wagered on this round
 * @returns RoundOutcome object with result, chip change, and scores
 * 
 * **Validates: Requirements 10.4, 10.5, 10.6, 10.7, 10.8**
 */
export function resolveRound(
  playerHand: Card[],
  dealerHand: Card[],
  bet: number
): RoundOutcome {
  const finalPlayerScore = calculateHandValue(playerHand);
  const finalDealerScore = calculateHandValue(dealerHand);
  
  // We need the hidden card for the outcome (it's the first card in player's hand)
  const hiddenCard = playerHand[0];
  
  // Check player bust (Requirement 10.4)
  if (isBust(playerHand)) {
    return {
      result: 'BUST',
      chipChange: 0, // Player loses bet (already deducted)
      finalPlayerScore,
      finalDealerScore,
      hiddenCard
    };
  }
  
  // Check player Blackjack (Requirement 10.5)
  if (isBlackjack(playerHand)) {
    return {
      result: 'BLACKJACK',
      chipChange: Math.floor(bet * 2.5), // Win 2.5× bet
      finalPlayerScore,
      finalDealerScore,
      hiddenCard
    };
  }
  
  // Check dealer bust (Requirement 9.4)
  if (isBust(dealerHand)) {
    return {
      result: 'WIN',
      chipChange: bet * 2, // Win 2× bet (original bet + winnings)
      finalPlayerScore,
      finalDealerScore,
      hiddenCard
    };
  }
  
  // Compare scores (Requirements 10.6, 10.7, 10.8)
  if (finalPlayerScore > finalDealerScore) {
    // Player wins (Requirement 10.6)
    return {
      result: 'WIN',
      chipChange: bet * 2, // Win 2× bet (original bet + winnings)
      finalPlayerScore,
      finalDealerScore,
      hiddenCard
    };
  } else if (finalPlayerScore < finalDealerScore) {
    // Player loses (Requirement 10.7)
    return {
      result: 'LOSE',
      chipChange: 0, // Player loses bet (already deducted)
      finalPlayerScore,
      finalDealerScore,
      hiddenCard
    };
  } else {
    // Push - tie (Requirement 10.8)
    return {
      result: 'PUSH',
      chipChange: bet, // Return original bet
      finalPlayerScore,
      finalDealerScore,
      hiddenCard
    };
  }
}

/**
 * Determines if the dealer should hit based on their current hand.
 * 
 * Dealer AI rules:
 * - Hit on hand value ≤ 16
 * - Stand on hand value ≥ 17
 * 
 * @param dealerHand - Array of cards in the dealer's hand
 * @returns true if dealer should hit, false if dealer should stand
 * 
 * **Validates: Requirements 9.2, 9.3**
 */
export function shouldDealerHit(dealerHand: Card[]): boolean {
  const handValue = calculateHandValue(dealerHand);
  return handValue <= 16;
}
