/**
 * Result Modal Component
 * 
 * Displays round outcome with dramatic hidden card reveal animation.
 * Features 3D flip rotation, color-coded outcomes, and slide-in animation.
 * 
 * Requirements: 10.1, 10.2, 10.3, 11.1, 11.2, 11.3, 11.5, 11.6, 17.2
 */

import React, { useState, useEffect } from 'react';
import type { Card } from '../types/game';
import Button from '../components/Button';

// ============================================================================
// Types
// ============================================================================

interface ResultModalProps {
  /** The outcome of the round */
  outcome: 'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK' | 'BUST';
  /** Amount of chips gained (positive) or lost (negative) */
  chipChange: number;
  /** Final player hand value including hidden card */
  finalPlayerScore: number;
  /** The player's hidden card that was revealed */
  hiddenCard: Card;
  /** Callback when player clicks "Play Again" */
  onPlayAgain: () => void;
  /** Animation speed setting */
  animationSpeed?: 'fast' | 'normal' | 'slow';
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get suit symbol for display
 */
function getSuitSymbol(suit: Card['suit']): string {
  const symbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };
  return symbols[suit];
}

/**
 * Get suit color
 */
function getSuitColor(suit: Card['suit']): string {
  return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-gray-900';
}

/**
 * Get outcome display text
 */
function getOutcomeText(outcome: ResultModalProps['outcome']): string {
  const texts = {
    WIN: 'You Win!',
    LOSE: 'You Lose',
    PUSH: 'Push',
    BLACKJACK: 'Blackjack!',
    BUST: 'Bust!'
  };
  return texts[outcome];
}

/**
 * Get outcome color classes
 */
function getOutcomeColor(outcome: ResultModalProps['outcome']): string {
  // Gold for WIN/BLACKJACK, Crimson for LOSE/BUST
  if (outcome === 'WIN' || outcome === 'BLACKJACK') {
    return 'text-[#C9A84C]';
  } else if (outcome === 'LOSE' || outcome === 'BUST') {
    return 'text-[#8B1A1A]';
  }
  // Gray for PUSH
  return 'text-gray-300';
}

/**
 * Get chip change display text with sign
 */
function getChipChangeText(chipChange: number): string {
  if (chipChange > 0) {
    return `+${chipChange}`;
  } else if (chipChange < 0) {
    return `${chipChange}`;
  }
  return '0';
}

/**
 * Get animation duration based on speed setting
 */
function getAnimationDuration(speed: 'fast' | 'normal' | 'slow'): number {
  const durations = {
    fast: 150,
    normal: 300,
    slow: 500
  };
  return durations[speed];
}

// ============================================================================
// Component
// ============================================================================

const ResultModal: React.FC<ResultModalProps> = ({
  outcome,
  chipChange,
  finalPlayerScore,
  hiddenCard,
  onPlayAgain,
  animationSpeed = 'normal'
}) => {
  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // ========================================================================
  // Animation Effects
  // ========================================================================

  useEffect(() => {
    // Trigger slide-in animation
    const slideInTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Trigger card flip animation after modal slides in
    const flipDelay = getAnimationDuration(animationSpeed) + 200;
    const flipTimer = setTimeout(() => {
      setIsCardRevealed(true);
    }, flipDelay);

    return () => {
      clearTimeout(slideInTimer);
      clearTimeout(flipTimer);
    };
  }, [animationSpeed]);

  // ========================================================================
  // Animation Duration CSS Variable
  // ========================================================================

  const animationDurationMs = getAnimationDuration(animationSpeed);
  const animationDurationStyle = {
    '--animation-duration': `${animationDurationMs}ms`
  } as React.CSSProperties;

  // ========================================================================
  // Render
  // ========================================================================

  const outcomeColor = getOutcomeColor(outcome);
  const outcomeText = getOutcomeText(outcome);
  const chipChangeText = getChipChangeText(chipChange);
  const chipChangeColor = chipChange > 0 ? 'text-[#C9A84C]' : chipChange < 0 ? 'text-[#8B1A1A]' : 'text-gray-300';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-title"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Content with slide-in animation */}
      <div
        className={`relative bg-[#0a1f0a] border-2 border-[#C9A84C] rounded-xl shadow-2xl max-w-md w-full transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
        style={animationDurationStyle}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#C9A84C]/30">
          <h2
            id="result-title"
            className={`text-4xl font-bold text-center ${outcomeColor}`}
          >
            {outcomeText}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-8 space-y-6">
          {/* Hidden Card Reveal */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-300 text-sm">Your Hidden Card:</p>
            
            {/* Card with 3D flip animation */}
            <div
              className="relative"
              style={{
                perspective: '1000px',
                width: '100px',
                height: '140px'
              }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-500 ease-in-out`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isCardRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transitionDuration: `${animationDurationMs}ms`
                }}
              >
                {/* Card Back (Hidden State) */}
                <div
                  className="absolute inset-0 bg-[#8B1A1A] border-2 border-[#C9A84C] rounded-lg flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden'
                  }}
                >
                  <span className="text-6xl text-[#C9A84C]">?</span>
                </div>

                {/* Card Face (Revealed State) */}
                <div
                  className="absolute inset-0 bg-[#FAFAFA] border-2 border-[#C9A84C] rounded-lg flex flex-col items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <span className={`text-5xl ${getSuitColor(hiddenCard.suit)}`}>
                    {getSuitSymbol(hiddenCard.suit)}
                  </span>
                  <span className={`text-3xl font-bold ${getSuitColor(hiddenCard.suit)} mt-2`}>
                    {hiddenCard.rank}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Score */}
          <div className="bg-[#0a1f0a]/50 border border-[#C9A84C]/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm text-center mb-1">Final Hand Value</p>
            <p className="text-3xl font-bold text-center text-white">
              {finalPlayerScore}
            </p>
          </div>

          {/* Chip Change */}
          <div className="bg-[#0a1f0a]/50 border border-[#C9A84C]/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm text-center mb-1">Chip Change</p>
            <p className={`text-3xl font-bold text-center ${chipChangeColor}`}>
              {chipChangeText}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#C9A84C]/30">
          <Button
            onClick={onPlayAgain}
            variant="primary"
            aria-label="Play another round"
          >
            Play Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
