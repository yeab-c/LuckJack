/**
 * Card Component
 * 
 * Renders a playing card with 3D flip animations and responsive sizing.
 */

import React from 'react';
import type { CardSuit, CardRank, AnimationSpeed } from '../types/game';

interface CardProps {
  /** The suit of the card */
  suit: CardSuit;
  /** The rank of the card */
  rank: CardRank;
  /** Whether the card is hidden (face-down) */
  isHidden: boolean;
  /** Whether the card is currently revealing (flip animation) */
  isRevealing: boolean;
  /** Animation speed setting */
  animationSpeed: AnimationSpeed;
  /** Position for card dealing animation */
  position?: { x: number; y: number };
}

/**
 * Maps suit names to their Unicode symbols
 */
const SUIT_SYMBOLS: Record<CardSuit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

/**
 * Maps animation speed to CSS duration in milliseconds
 * Requirement 17.4: Fast (150ms), Normal (300ms), Slow (500ms)
 */
const ANIMATION_DURATIONS: Record<AnimationSpeed, number> = {
  fast: 150,
  normal: 300,
  slow: 500,
};

/**
 * Determines if a suit is red (hearts or diamonds)
 */
const isRedSuit = (suit: CardSuit): boolean => {
  return suit === 'hearts' || suit === 'diamonds';
};

/**
 * Card Component
 * 
 * Displays a playing card with:
 * - Responsive dimensions (60x84px mobile, 80x112px tablet, 100x140px desktop)
 * - 3D flip animation for revealing hidden cards
 * - Gold "?" symbol when hidden
 * - Suit symbols and rank display
 * - Animation duration based on speed setting
 */
export const Card: React.FC<CardProps> = ({
  suit,
  rank,
  isHidden,
  isRevealing,
  animationSpeed,
  position,
}) => {
  const suitSymbol = SUIT_SYMBOLS[suit];
  const suitColor = isRedSuit(suit) ? 'text-red-600' : 'text-gray-900';
  const animationDuration = ANIMATION_DURATIONS[animationSpeed];

  // Determine if card should show flipped state
  const isFlipped = isRevealing || !isHidden;

  return (
    <div
      className="card-container relative w-[60px] h-[84px] sm:w-20 sm:h-28 lg:w-[100px] lg:h-[140px]"
      style={{
        perspective: '1000px',
        ...(position && {
          transform: `translate(${position.x}px, ${position.y}px)`,
        }),
      }}
    >
      <div
        className="card-flip relative w-full h-full transition-transform"
        style={{
          transformStyle: 'preserve-3d',
          transitionDuration: `${animationDuration}ms`,
          transitionTimingFunction: 'ease-in-out',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          willChange: 'transform',
        }}
      >
        {/* Card Back (Hidden State) */}
        <div
          className="card-face card-back absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a1f0a] to-[#1a3f1a] border-2 border-[#C9A84C] rounded-lg shadow-lg"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <span className="text-[#C9A84C] text-4xl font-bold select-none">
            ?
          </span>
        </div>

        {/* Card Front (Visible State) */}
        <div
          className="card-face card-front absolute inset-0 bg-[#FAFAFA] border-2 border-gray-300 rounded-lg shadow-lg p-1 flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Top-left corner: Rank and Suit */}
          <div className={`flex flex-col items-center leading-none ${suitColor}`}>
            <span className="text-lg font-bold select-none">{rank}</span>
            <span className="text-xl select-none">{suitSymbol}</span>
          </div>

          {/* Center: Large Suit Symbol */}
          <div className="flex-1 flex items-center justify-center">
            <span className={`text-5xl select-none ${suitColor}`}>
              {suitSymbol}
            </span>
          </div>

          {/* Bottom-right corner: Rank and Suit (rotated) */}
          <div
            className={`flex flex-col items-center leading-none ${suitColor}`}
            style={{ transform: 'rotate(180deg)' }}
          >
            <span className="text-lg font-bold select-none">{rank}</span>
            <span className="text-xl select-none">{suitSymbol}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
