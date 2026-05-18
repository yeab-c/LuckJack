/**
 * Landing View Component
 * 
 * The initial view displayed when the application loads.
 * Features the LuckJack logo, title, tagline, and navigation buttons.
 * 
 */

import React from 'react';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';

/**
 * Landing Component
 * 
 * Displays the landing page with:
 * - Logo image
 * - LuckJack title with serif font
 * - Tagline
 * - Play Now button (navigates to game view)
 * - How to Play button (opens tutorial modal)
 * 
 * Applies dark luxury styling with gold accents and responsive layout.
 */
const Landing: React.FC = () => {
  const { dispatch } = useGame();

  /**
   * Handles Play Now button click
   * Dispatches NAVIGATE action to transition to game view
   */
  const handlePlayNow = () => {
    dispatch({ type: 'NAVIGATE', payload: 'game' });
  };

  /**
   * Handles How to Play button click
   * Dispatches OPEN_TUTORIAL action to display tutorial modal
   */
  const handleHowToPlay = () => {
    dispatch({ type: 'OPEN_TUTORIAL' });
  };

  return (
    <div className="min-h-screen bg-[#0a1f0a] flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full flex flex-col items-center text-center space-y-8 sm:space-y-10">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="LuckJack Casino Logo"
          className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-contain"
        />

        {/* Title */}
        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-[#C9A84C] tracking-wide">
          LuckJack
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl md:text-2xl text-[#FAFAFA] font-light max-w-md">
          Where your first card is a mystery
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:space-x-4 pt-4">
          <Button
            onClick={handlePlayNow}
            variant="primary"
            aria-label="Start playing LuckJack"
          >
            Play Now
          </Button>

          <Button
            onClick={handleHowToPlay}
            variant="secondary"
            aria-label="Learn how to play LuckJack"
          >
            How to Play
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
