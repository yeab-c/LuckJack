/**
 * Statistics calculation utilities for LuckJack Casino Game
 * 
 * This module provides functions for calculating gameplay statistics percentages.
 * All functions handle division by zero gracefully by returning 0 when no hands have been played.
 * 
 * Requirements: 13.2, 13.3
 */

import type { GameStatistics } from '../types/game';

/**
 * Calculates the win percentage from game statistics
 * 
 * @param stats - The game statistics object
 * @returns Win percentage (0-100), or 0 if no hands have been played
 * 
 * @example
 * calculateWinPercentage({ totalHands: 100, wins: 45, ... }) // Returns 45
 * calculateWinPercentage({ totalHands: 0, wins: 0, ... }) // Returns 0
 */
export function calculateWinPercentage(stats: GameStatistics): number {
  if (stats.totalHands === 0) {
    return 0;
  }
  return (stats.wins / stats.totalHands) * 100;
}

/**
 * Calculates the bust percentage from game statistics
 * 
 * @param stats - The game statistics object
 * @returns Bust percentage (0-100), or 0 if no hands have been played
 * 
 * @example
 * calculateBustPercentage({ totalHands: 100, busts: 20, ... }) // Returns 20
 * calculateBustPercentage({ totalHands: 0, busts: 0, ... }) // Returns 0
 */
export function calculateBustPercentage(stats: GameStatistics): number {
  if (stats.totalHands === 0) {
    return 0;
  }
  return (stats.busts / stats.totalHands) * 100;
}

/**
 * Calculates the push (tie) percentage from game statistics
 * 
 * @param stats - The game statistics object
 * @returns Push percentage (0-100), or 0 if no hands have been played
 * 
 * @example
 * calculatePushPercentage({ totalHands: 100, pushes: 10, ... }) // Returns 10
 * calculatePushPercentage({ totalHands: 0, pushes: 0, ... }) // Returns 0
 */
export function calculatePushPercentage(stats: GameStatistics): number {
  if (stats.totalHands === 0) {
    return 0;
  }
  return (stats.pushes / stats.totalHands) * 100;
}
