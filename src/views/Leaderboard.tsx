/**
 * Leaderboard View Component
 * 
 * Displays top 10 leaderboard entries sorted by net gain descending.
 * Shows rank, date, starting balance, ending balance, net gain, and hands played.
 * Applies color coding: gold for positive gains, crimson for negative losses.
 * Includes "Clear Leaderboard" button with confirmation.
 * 
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';

/**
 * Leaderboard View Component
 * 
 * Renders leaderboard entries with responsive table layout.
 */
const Leaderboard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { leaderboard } = state;

  // ========================================================================
  // Local State
  // ========================================================================

  const [showConfirmation, setShowConfirmation] = useState(false);

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
   * Handle clear leaderboard button click
   * Shows confirmation dialog
   */
  const handleClearLeaderboard = () => {
    setShowConfirmation(true);
  };

  /**
   * Handle confirmation of leaderboard clearing
   */
  const handleConfirmClear = () => {
    dispatch({ type: 'CLEAR_LEADERBOARD' });
    setShowConfirmation(false);
  };

  /**
   * Handle cancellation of leaderboard clearing
   */
  const handleCancelClear = () => {
    setShowConfirmation(false);
  };

  // ========================================================================
  // Data Processing
  // ========================================================================

  /**
   * Sort leaderboard entries by net gain descending and take top 10
   */
  const topEntries = [...leaderboard]
    .sort((a, b) => b.netGain - a.netGain)
    .slice(0, 10);

  /**
   * Format date from Unix timestamp
   * 
   * @param timestamp - Unix timestamp in milliseconds
   * @returns Formatted date string
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get color class for net gain value
   * Gold for positive, crimson for negative, gray for zero
   * 
   * @param netGain - Net gain value
   * @returns Tailwind color class
   */
  const getNetGainColor = (netGain: number): string => {
    if (netGain > 0) return 'text-[#C9A84C]'; // Gold
    if (netGain < 0) return 'text-[#8B1A1A]'; // Crimson
    return 'text-gray-300'; // Neutral
  };

  /**
   * Format net gain with sign
   * 
   * @param netGain - Net gain value
   * @returns Formatted string with + or - sign
   */
  const formatNetGain = (netGain: number): string => {
    if (netGain > 0) return `+${netGain}`;
    return netGain.toString();
  };

  // ========================================================================
  // Render Helpers
  // ========================================================================

  /**
   * Renders the leaderboard table
   */
  const renderLeaderboardTable = () => {
    if (topEntries.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400 mb-4">
            No leaderboard entries yet. Complete a session to appear on the leaderboard!
          </p>
          <Button
            onClick={handleBackToGame}
            variant="primary"
            aria-label="Start playing"
          >
            Start Playing
          </Button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        {/* Desktop Table View */}
        <table className="hidden md:table w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-[#C9A84C]">
              <th className="text-left py-3 px-4 text-[#C9A84C] font-bold">Rank</th>
              <th className="text-left py-3 px-4 text-[#C9A84C] font-bold">Date</th>
              <th className="text-right py-3 px-4 text-[#C9A84C] font-bold">Starting</th>
              <th className="text-right py-3 px-4 text-[#C9A84C] font-bold">Ending</th>
              <th className="text-right py-3 px-4 text-[#C9A84C] font-bold">Net Gain</th>
              <th className="text-right py-3 px-4 text-[#C9A84C] font-bold">Hands</th>
            </tr>
          </thead>
          <tbody>
            {topEntries.map((entry, index) => (
              <tr
                key={entry.id}
                className="border-b border-[#C9A84C] border-opacity-20 hover:bg-black hover:bg-opacity-20 transition-colors"
              >
                <td className="py-3 px-4 font-bold text-white">#{index + 1}</td>
                <td className="py-3 px-4 text-gray-300">{formatDate(entry.date)}</td>
                <td className="py-3 px-4 text-right text-gray-300">{entry.startingBalance}</td>
                <td className="py-3 px-4 text-right text-gray-300">{entry.endingBalance}</td>
                <td className={`py-3 px-4 text-right font-bold ${getNetGainColor(entry.netGain)}`}>
                  {formatNetGain(entry.netGain)}
                </td>
                <td className="py-3 px-4 text-right text-gray-300">{entry.handsPlayed}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {topEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30"
            >
              {/* Rank and Date */}
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-[#C9A84C] border-opacity-20">
                <span className="text-2xl font-bold text-[#C9A84C]">#{index + 1}</span>
                <span className="text-sm text-gray-400">{formatDate(entry.date)}</span>
              </div>

              {/* Balance Information */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Starting</p>
                  <p className="text-lg font-semibold text-white">{entry.startingBalance}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Ending</p>
                  <p className="text-lg font-semibold text-white">{entry.endingBalance}</p>
                </div>
              </div>

              {/* Net Gain and Hands */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Net Gain</p>
                  <p className={`text-xl font-bold ${getNetGainColor(entry.netGain)}`}>
                    {formatNetGain(entry.netGain)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Hands Played</p>
                  <p className="text-lg font-semibold text-white">{entry.handsPlayed}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * Renders the confirmation dialog
   */
  const renderConfirmationDialog = () => {
    if (!showConfirmation) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="bg-[#0a1f0a] border-2 border-[#C9A84C] rounded-lg p-6 max-w-md w-full">
          <h2
            id="confirm-dialog-title"
            className="text-2xl font-bold text-[#C9A84C] mb-4 font-serif"
          >
            Clear Leaderboard?
          </h2>
          <p className="text-gray-300 mb-6">
            Are you sure you want to clear all leaderboard entries? This action cannot be undone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              onClick={handleCancelClear}
              variant="secondary"
              aria-label="Cancel clearing leaderboard"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmClear}
              variant="danger"
              aria-label="Confirm clearing leaderboard"
            >
              Clear Leaderboard
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
    <div className="leaderboard-view min-h-screen bg-[#0a1f0a] text-white flex flex-col">
      {/* Header Section */}
      <header className="w-full px-4 py-6 sm:px-6 sm:py-8 border-b border-[#C9A84C] border-opacity-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#C9A84C] font-serif">
              Leaderboard
            </h1>
            <div className="flex flex-col sm:flex-row gap-3">
              {leaderboard.length > 0 && (
                <Button
                  onClick={handleClearLeaderboard}
                  variant="danger"
                  aria-label="Clear all leaderboard entries"
                >
                  Clear Leaderboard
                </Button>
              )}
              <Button
                onClick={handleBackToGame}
                variant="secondary"
                aria-label="Return to game"
              >
                Back to Game
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Leaderboard Description */}
          <section className="mb-6">
            <p className="text-gray-300 text-center sm:text-left">
              Top 10 sessions ranked by net gain. Complete a session to earn your place on the leaderboard!
            </p>
          </section>

          {/* Leaderboard Table */}
          <section
            className="bg-black bg-opacity-30 rounded-lg p-4 sm:p-6 border border-[#C9A84C] border-opacity-30"
            aria-labelledby="leaderboard-heading"
          >
            <h2 id="leaderboard-heading" className="sr-only">
              Leaderboard Entries
            </h2>
            {renderLeaderboardTable()}
          </section>

          {/* Legend */}
          {topEntries.length > 0 && (
            <section className="mt-6" aria-labelledby="legend-heading">
              <h2 id="legend-heading" className="sr-only">
                Color Legend
              </h2>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#C9A84C] rounded"></div>
                  <span className="text-gray-300">Positive Gain</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#8B1A1A] rounded"></div>
                  <span className="text-gray-300">Negative Loss</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                  <span className="text-gray-300">Break Even</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-4 border-t border-[#C9A84C] border-opacity-30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            Leaderboard entries are saved automatically and persist across sessions
          </p>
        </div>
      </footer>

      {/* Confirmation Dialog */}
      {renderConfirmationDialog()}
    </div>
  );
};

export default Leaderboard;
