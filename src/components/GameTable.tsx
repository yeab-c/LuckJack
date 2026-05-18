/**
 * GameTable Component
 * 
 * Displays the game table with player and dealer hands, including:
 * - Dealer hand at top with cards face-down until dealerTurn phase
 * - Player hand at bottom with first card hidden during playerTurn
 * - Score displays based on current phase
 * - Card spacing with 20px overlap for stacking effect
 * - Responsive flexbox layout
 * 
 */

import React from 'react';
import { Card } from './Card';
import type { Card as CardType, RoundPhase, AnimationSpeed } from '../types/game';

interface GameTableProps {
  /** Player's hand of cards */
  playerHand: CardType[];
  /** Dealer's hand of cards */
  dealerHand: CardType[];
  /** Player's visible score (excluding hidden card) */
  playerVisibleScore: number;
  /** Dealer's score (null until dealerTurn or result phase) */
  dealerScore: number | null;
  /** Current phase of the round */
  phase: RoundPhase;
  /** Animation speed setting */
  animationSpeed: AnimationSpeed;
}

/**
 * GameTable Component
 * 
 * Renders the game table with dealer and player hands.
 * 
 * Behavior by phase:
 * - betting: No cards displayed
 * - playerTurn: Player's first card hidden, dealer cards face-down
 * - dealerTurn: All cards revealed, dealer playing
 * - result: All cards revealed, final scores shown
 */
export const GameTable: React.FC<GameTableProps> = ({
  playerHand,
  dealerHand,
  playerVisibleScore,
  dealerScore,
  phase,
  animationSpeed,
}) => {
  // Determine if dealer cards should be revealed
  const isDealerRevealed = phase === 'dealerTurn' || phase === 'result';

  // Determine if player's first card should be hidden
  const isPlayerFirstCardHidden = phase === 'playerTurn';

  return (
    <div className="game-table flex flex-col items-center justify-between min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] w-full max-w-4xl mx-auto px-4 py-8">
      {/* Dealer Section */}
      <div className="dealer-section flex flex-col items-center gap-4 w-full">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#C9A84C] mb-2">
            Dealer
          </h2>
          {dealerScore !== null && (
            <div className="text-lg sm:text-xl text-white font-medium">
              Score: {dealerScore}
            </div>
          )}
        </div>

        {/* Dealer Hand */}
        {dealerHand.length > 0 && (
          <div className="dealer-hand flex items-center justify-center">
            <div className="flex" style={{ marginLeft: '-20px' }}>
              {dealerHand.map((card, index) => (
                <div
                  key={card.id}
                  className="card-wrapper"
                  style={{
                    marginLeft: index === 0 ? '20px' : '0',
                    marginRight: index < dealerHand.length - 1 ? '-20px' : '0',
                    zIndex: index,
                  }}
                >
                  <Card
                    suit={card.suit}
                    rank={card.rank}
                    isHidden={!isDealerRevealed}
                    isRevealing={isDealerRevealed}
                    animationSpeed={animationSpeed}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table Center - Visual Separator */}
      <div className="table-center flex items-center justify-center py-4">
        <div className="w-32 h-1 bg-[#C9A84C] opacity-30 rounded-full" />
      </div>

      {/* Player Section */}
      <div className="player-section flex flex-col items-center gap-4 w-full">
        {/* Player Hand */}
        {playerHand.length > 0 && (
          <div className="player-hand flex items-center justify-center">
            <div className="flex" style={{ marginLeft: '-20px' }}>
              {playerHand.map((card, index) => {
                // First card is hidden during playerTurn phase
                const isHidden = index === 0 && isPlayerFirstCardHidden;
                
                return (
                  <div
                    key={card.id}
                    className="card-wrapper"
                    style={{
                      marginLeft: index === 0 ? '20px' : '0',
                      marginRight: index < playerHand.length - 1 ? '-20px' : '0',
                      zIndex: index,
                    }}
                  >
                    <Card
                      suit={card.suit}
                      rank={card.rank}
                      isHidden={isHidden}
                      isRevealing={!isHidden}
                      animationSpeed={animationSpeed}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-[#C9A84C] mb-2">
            Player
          </h2>
          {phase === 'playerTurn' && playerHand.length > 0 && (
            <div className="flex flex-col items-center gap-1">
              <div className="text-lg sm:text-xl text-white font-medium">
                Visible Score: {playerVisibleScore}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 italic">
                (First card hidden)
              </div>
            </div>
          )}
          {(phase === 'dealerTurn' || phase === 'result') && playerHand.length > 0 && (
            <div className="text-lg sm:text-xl text-white font-medium">
              Score: {playerVisibleScore}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameTable;
