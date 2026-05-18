/**
 * Game View Component
 * 
 * Main gameplay view that displays:
 * - Current balance and remaining deck count
 * - BettingPanel during betting phase
 * - GameTable with player and dealer hands
 * - ControlPanel during playerTurn phase
 * - Navigation buttons to other views
 * 
 * Handles phase transitions automatically through the game reducer.
 * 
 */

import React from 'react';
import { useGame } from '../context/GameContext';
import BettingPanel from '../components/BettingPanel';
import GameTable from '../components/GameTable';
import ControlPanel from '../components/ControlPanel';
import Button from '../components/Button';
import { calculateHandValue } from '../utils/scoring';

/**
 * Game View Component
 * 
 * Renders the main game interface with all gameplay elements.
 * Automatically adapts UI based on current round phase.
 */
const Game: React.FC = () => {
  const { state, dispatch } = useGame();

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle placing a bet
   */
  const handleBet = (amount: number) => {
    dispatch({ type: 'PLACE_BET', payload: amount });
  };

  /**
   * Handle clearing the current bet
   */
  const handleClearBet = () => {
    dispatch({ type: 'CLEAR_BET' });
  };

  /**
   * Handle dealing cards to start the round
   */
  const handleDeal = () => {
    dispatch({ type: 'DEAL' });
  };

  /**
   * Handle player hitting (drawing another card)
   */
  const handleHit = () => {
    dispatch({ type: 'HIT' });
  };

  /**
   * Handle player standing (ending their turn)
   */
  const handleStand = () => {
    dispatch({ type: 'STAND' });
  };

  /**
   * Handle navigation to different views
   */
  const handleNavigate = (view: 'stats' | 'leaderboard' | 'settings' | 'landing') => {
    dispatch({ type: 'NAVIGATE', payload: view });
  };

  // ========================================================================
  // Computed Values
  // ========================================================================

  /**
   * Calculate player's visible score (excluding hidden card during playerTurn)
   */
  const playerVisibleScore = React.useMemo(() => {
    if (state.phase === 'playerTurn' && state.playerHand.length > 0) {
      // During player turn, exclude the first card (hidden card)
      const visibleCards = state.playerHand.slice(1);
      return calculateHandValue(visibleCards);
    } else {
      // During other phases, show full hand value
      return calculateHandValue(state.playerHand);
    }
  }, [state.playerHand, state.phase]);

  /**
   * Calculate dealer's score (only shown during dealerTurn and result phases)
   */
  const dealerScore = React.useMemo(() => {
    if (state.phase === 'dealerTurn' || state.phase === 'result') {
      return calculateHandValue(state.dealerHand);
    }
    return null;
  }, [state.dealerHand, state.phase]);

  /**
   * Remaining cards in deck
   */
  const remainingCards = state.deck.length;

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="game-view min-h-screen bg-[#0a1f0a] text-white flex flex-col">
      {/* Header Section */}
      <header className="w-full px-4 py-4 sm:px-6 sm:py-6 border-b border-[#C9A84C] border-opacity-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Balance Display */}
          <div className="flex items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-400 mb-1">Balance</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#C9A84C]" aria-live="polite">
                {state.balance}
              </p>
            </div>

            {/* Deck Count Display */}
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-400 mb-1">Cards Remaining</p>
              <p className="text-2xl sm:text-3xl font-bold text-white" aria-live="polite">
                {remainingCards}
              </p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <nav className="flex gap-2 flex-wrap justify-center" aria-label="View navigation">
            <Button
              onClick={() => handleNavigate('stats')}
              variant="secondary"
              aria-label="View statistics"
            >
              Stats
            </Button>
            <Button
              onClick={() => handleNavigate('leaderboard')}
              variant="secondary"
              aria-label="View leaderboard"
            >
              Leaderboard
            </Button>
            <Button
              onClick={() => handleNavigate('settings')}
              variant="secondary"
              aria-label="View settings"
            >
              Settings
            </Button>
            <Button
              onClick={() => handleNavigate('landing')}
              variant="secondary"
              aria-label="Return to main menu"
            >
              Menu
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8">
          {/* Game Table - Always visible during active rounds */}
          {state.phase !== 'betting' && (
            <GameTable
              playerHand={state.playerHand}
              dealerHand={state.dealerHand}
              playerVisibleScore={playerVisibleScore}
              dealerScore={dealerScore}
              phase={state.phase}
              animationSpeed={state.settings.animationSpeed}
            />
          )}

          {/* Betting Panel - Only visible during betting phase */}
          {state.phase === 'betting' && (
            <div className="w-full max-w-2xl">
              <BettingPanel
                currentBet={state.currentBet}
                balance={state.balance}
                onBet={handleBet}
                onClearBet={handleClearBet}
                onDeal={handleDeal}
                disabled={state.balance === 0}
              />
            </div>
          )}

          {/* Control Panel - Only visible during player turn */}
          {state.phase === 'playerTurn' && (
            <div className="w-full max-w-2xl flex justify-center">
              <ControlPanel
                phase={state.phase}
                onHit={handleHit}
                onStand={handleStand}
                disabled={false}
              />
            </div>
          )}

          {/* Dealer Turn Message */}
          {state.phase === 'dealerTurn' && (
            <div className="text-center">
              <p className="text-xl sm:text-2xl text-[#C9A84C] font-semibold animate-pulse">
                Dealer's Turn...
              </p>
            </div>
          )}

          {/* Broke State Message */}
          {state.balance === 0 && state.phase === 'betting' && (
            <div className="w-full max-w-2xl bg-[#8B1A1A] bg-opacity-20 border-2 border-[#8B1A1A] rounded-lg p-6 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#8B1A1A] mb-4">
                Out of Chips!
              </h2>
              <p className="text-gray-300 mb-6">
                You've run out of chips. Reset your session to continue playing.
              </p>
              <Button
                onClick={() => dispatch({ type: 'RESET_SESSION' })}
                variant="danger"
                aria-label="Reset session and start over"
              >
                Reset Session
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer - Game Instructions */}
      <footer className="w-full px-4 py-4 border-t border-[#C9A84C] border-opacity-30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            {state.phase === 'betting' && 'Place your bet and click Deal to start'}
            {state.phase === 'playerTurn' && 'Your first card is hidden. Hit (H) or Stand (S)?'}
            {state.phase === 'dealerTurn' && 'Dealer is playing...'}
            {state.phase === 'result' && 'Round complete'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Game;
