/**
 * Settings View Component
 * 
 * Allows users to configure game preferences:
 * - Sound toggle (on/off)
 * - Animation speed selector (Fast, Normal, Slow)
 * - Starting balance selector (500, 1000, 2500, 5000)
 * - Reset Session button with confirmation dialog
 * - Navigation button back to game view
 * 
 * Requirements: 1.4, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 19.3
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import type { AnimationSpeed } from '../types/game';

/**
 * Settings View Component
 * 
 * Renders game settings with responsive layout and confirmation dialogs.
 */
const Settings: React.FC = () => {
  const { state, dispatch } = useGame();
  const { settings } = state;

  // ========================================================================
  // Local State
  // ========================================================================

  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle navigation back to game view
   */
  const handleBackToGame = () => {
    dispatch({ type: 'NAVIGATE', payload: 'game' });
  };

  /**
   * Handle sound toggle
   */
  const handleSoundToggle = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { soundEnabled: !settings.soundEnabled }
    });
  };

  /**
   * Handle animation speed change
   */
  const handleAnimationSpeedChange = (speed: AnimationSpeed) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { animationSpeed: speed }
    });
  };

  /**
   * Handle starting balance change
   */
  const handleStartingBalanceChange = (balance: 500 | 1000 | 2500 | 5000) => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: { startingBalance: balance }
    });
  };

  /**
   * Handle reset session button click
   * Shows confirmation dialog
   */
  const handleResetSession = () => {
    setShowResetConfirmation(true);
  };

  /**
   * Handle confirmation of session reset
   */
  const handleConfirmReset = () => {
    dispatch({ type: 'RESET_SESSION' });
    setShowResetConfirmation(false);
  };

  /**
   * Handle cancellation of session reset
   */
  const handleCancelReset = () => {
    setShowResetConfirmation(false);
  };

  // ========================================================================
  // Render Helpers
  // ========================================================================

  /**
   * Renders the confirmation dialog for session reset
   */
  const renderResetConfirmationDialog = () => {
    if (!showResetConfirmation) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-dialog-title"
      >
        <div className="bg-[#0a1f0a] border-2 border-[#C9A84C] rounded-lg p-6 max-w-md w-full">
          <h2
            id="reset-dialog-title"
            className="text-2xl font-bold text-[#C9A84C] mb-4 font-serif"
          >
            Reset Session?
          </h2>
          <p className="text-gray-300 mb-6">
            Are you sure you want to reset your session? This will reset your balance to {settings.startingBalance} chips and clear your current session statistics. This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={handleCancelReset}
              variant="secondary"
              aria-label="Cancel session reset"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReset}
              variant="danger"
              aria-label="Confirm session reset"
            >
              Reset Session
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="settings-view min-h-screen bg-[#0a1f0a] text-white flex flex-col">
      {/* Header Section */}
      <header className="w-full px-4 py-6 sm:px-6 sm:py-8 border-b border-[#C9A84C] border-opacity-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#C9A84C] font-serif">
              Settings
            </h1>
            <Button
              onClick={handleBackToGame}
              variant="secondary"
              aria-label="Return to game"
            >
              Back to Game
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Sound Settings */}
          <section
            className="bg-black bg-opacity-30 rounded-lg p-6 border border-[#C9A84C] border-opacity-30"
            aria-labelledby="sound-heading"
          >
            <h2 id="sound-heading" className="text-2xl font-bold text-[#C9A84C] mb-4">
              Sound
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold mb-1">Sound Effects</p>
                <p className="text-sm text-gray-400">
                  Enable or disable game sound effects
                </p>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#0a1f0a] ${
                  settings.soundEnabled ? 'bg-[#C9A84C]' : 'bg-gray-600'
                }`}
                role="switch"
                aria-checked={settings.soundEnabled}
                aria-label="Toggle sound effects"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Animation Speed Settings */}
          <section
            className="bg-black bg-opacity-30 rounded-lg p-6 border border-[#C9A84C] border-opacity-30"
            aria-labelledby="animation-heading"
          >
            <h2 id="animation-heading" className="text-2xl font-bold text-[#C9A84C] mb-4">
              Animation Speed
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Choose how fast card animations play
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(['fast', 'normal', 'slow'] as AnimationSpeed[]).map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleAnimationSpeedChange(speed)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#0a1f0a] ${
                    settings.animationSpeed === speed
                      ? 'bg-[#C9A84C] text-[#0a1f0a]'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  aria-label={`Set animation speed to ${speed}`}
                  aria-pressed={settings.animationSpeed === speed}
                >
                  {speed.charAt(0).toUpperCase() + speed.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Starting Balance Settings */}
          <section
            className="bg-black bg-opacity-30 rounded-lg p-6 border border-[#C9A84C] border-opacity-30"
            aria-labelledby="balance-heading"
          >
            <h2 id="balance-heading" className="text-2xl font-bold text-[#C9A84C] mb-4">
              Starting Balance
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Choose your starting chip balance for new sessions
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([500, 1000, 2500, 5000] as const).map((balance) => (
                <button
                  key={balance}
                  onClick={() => handleStartingBalanceChange(balance)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#0a1f0a] ${
                    settings.startingBalance === balance
                      ? 'bg-[#C9A84C] text-[#0a1f0a]'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                  aria-label={`Set starting balance to ${balance} chips`}
                  aria-pressed={settings.startingBalance === balance}
                >
                  {balance}
                </button>
              ))}
            </div>
          </section>

          {/* Session Management */}
          <section
            className="bg-black bg-opacity-30 rounded-lg p-6 border border-[#C9A84C] border-opacity-30"
            aria-labelledby="session-heading"
          >
            <h2 id="session-heading" className="text-2xl font-bold text-[#C9A84C] mb-4">
              Session Management
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-white font-semibold mb-1">Current Balance</p>
                <p className="text-3xl font-bold text-[#C9A84C] mb-2">{state.balance}</p>
                <p className="text-sm text-gray-400">
                  Reset your session to start fresh with {settings.startingBalance} chips
                </p>
              </div>
              <Button
                onClick={handleResetSession}
                variant="danger"
                aria-label="Reset session and start over"
              >
                Reset Session
              </Button>
            </div>
          </section>

          {/* Information Section */}
          <section className="bg-black bg-opacity-30 rounded-lg p-6 border border-[#C9A84C] border-opacity-30">
            <h2 className="text-xl font-bold text-[#C9A84C] mb-3">
              About Settings
            </h2>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>All settings are saved automatically and persist across browser sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Animation speed affects card dealing and reveal animations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Starting balance only applies when you reset your session</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C9A84C] mt-1">•</span>
                <span>Resetting your session will clear current session statistics but preserve your leaderboard entries</span>
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-4 border-t border-[#C9A84C] border-opacity-30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            Settings are saved automatically to localStorage
          </p>
        </div>
      </footer>

      {/* Reset Confirmation Dialog */}
      {renderResetConfirmationDialog()}
    </div>
  );
};

export default Settings;
