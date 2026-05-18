/**
 * Stats View Component
 * 
 * Displays comprehensive gameplay statistics including:
 * - Total hands played, wins, losses, pushes, busts
 * - Win percentage, bust percentage, push percentage
 * - Biggest win and biggest loss amounts
 * - Balance history line chart using SVG
 * - Navigation button back to game view
 * 
 */

import React from 'react';
import { useGame } from '../context/GameContext';
import Button from '../components/Button';
import {
  calculateWinPercentage,
  calculateBustPercentage,
  calculatePushPercentage
} from '../utils/statistics';

/**
 * Stats View Component
 * 
 * Renders gameplay statistics with responsive grid layout and SVG balance chart.
 */
const Stats: React.FC = () => {
  const { state, dispatch } = useGame();
  const { stats } = state;

  // ========================================================================
  // Event Handlers
  // ========================================================================

  /**
   * Handle navigation back to game view
   */
  const handleBackToGame = () => {
    dispatch({ type: 'NAVIGATE', payload: 'game' });
  };

  // ========================================================================
  // Computed Values
  // ========================================================================

  const winPercentage = calculateWinPercentage(stats);
  const bustPercentage = calculateBustPercentage(stats);
  const pushPercentage = calculatePushPercentage(stats);

  // Calculate loss percentage (derived from other stats)
  const lossPercentage = stats.totalHands > 0
    ? (stats.losses / stats.totalHands) * 100
    : 0;

  // ========================================================================
  // Balance History Chart
  // ========================================================================

  /**
   * Renders an SVG line chart of balance history
   */
  const renderBalanceChart = () => {
    const history = stats.balanceHistory;

    // If no history or only one point, show placeholder
    if (history.length < 2) {
      return (
        <div className="w-full h-64 flex items-center justify-center bg-black bg-opacity-30 rounded-lg border border-[#C9A84C] border-opacity-30">
          <p className="text-gray-400 text-center px-4">
            Play more hands to see your balance history
          </p>
        </div>
      );
    }

    // Chart dimensions
    const width = 800;
    const height = 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Find min and max balance for scaling
    const balances = history.map(snapshot => snapshot.balance);
    const minBalance = Math.min(...balances);
    const maxBalance = Math.max(...balances);
    const balanceRange = maxBalance - minBalance || 1; // Avoid division by zero

    // Scale functions
    const scaleX = (index: number) => {
      return padding + (index / (history.length - 1)) * chartWidth;
    };

    const scaleY = (balance: number) => {
      return padding + chartHeight - ((balance - minBalance) / balanceRange) * chartHeight;
    };

    // Generate path data
    const pathData = history
      .map((snapshot, index) => {
        const x = scaleX(index);
        const y = scaleY(snapshot.balance);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');

    // Generate grid lines (5 horizontal lines)
    const gridLines = Array.from({ length: 5 }, (_, i) => {
      const y = padding + (chartHeight / 4) * i;
      const balance = maxBalance - (balanceRange / 4) * i;
      return { y, balance };
    });

    return (
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          role="img"
          aria-label="Balance history chart"
        >
          {/* Grid lines */}
          {gridLines.map((line, index) => (
            <g key={index}>
              <line
                x1={padding}
                y1={line.y}
                x2={width - padding}
                y2={line.y}
                stroke="#C9A84C"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={line.y + 5}
                fill="#C9A84C"
                fontSize="12"
                textAnchor="end"
              >
                {Math.round(line.balance)}
              </text>
            </g>
          ))}

          {/* X-axis */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#C9A84C"
            strokeWidth="2"
          />

          {/* Y-axis */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#C9A84C"
            strokeWidth="2"
          />

          {/* Balance line */}
          <path
            d={pathData}
            fill="none"
            stroke="#C9A84C"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {history.map((snapshot, index) => (
            <circle
              key={index}
              cx={scaleX(index)}
              cy={scaleY(snapshot.balance)}
              r="4"
              fill="#C9A84C"
            >
              <title>{`Balance: ${snapshot.balance}`}</title>
            </circle>
          ))}

          {/* Axis labels */}
          <text
            x={width / 2}
            y={height - 5}
            fill="#C9A84C"
            fontSize="14"
            textAnchor="middle"
            fontWeight="bold"
          >
            Hands Played
          </text>
          <text
            x={15}
            y={height / 2}
            fill="#C9A84C"
            fontSize="14"
            textAnchor="middle"
            fontWeight="bold"
            transform={`rotate(-90, 15, ${height / 2})`}
          >
            Balance
          </text>
        </svg>
      </div>
    );
  };

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div className="stats-view min-h-screen bg-[#0a1f0a] text-white flex flex-col">
      {/* Header Section */}
      <header className="w-full px-4 py-6 sm:px-6 sm:py-8 border-b border-[#C9A84C] border-opacity-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#C9A84C] font-serif">
              Statistics
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
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Overview Statistics Grid */}
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="text-2xl font-bold text-[#C9A84C] mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Total Hands */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Total Hands</p>
                <p className="text-3xl font-bold text-white">{stats.totalHands}</p>
              </div>

              {/* Wins */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Wins</p>
                <p className="text-3xl font-bold text-[#C9A84C]">{stats.wins}</p>
              </div>

              {/* Losses */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Losses</p>
                <p className="text-3xl font-bold text-[#8B1A1A]">{stats.losses}</p>
              </div>

              {/* Pushes */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Pushes</p>
                <p className="text-3xl font-bold text-gray-300">{stats.pushes}</p>
              </div>

              {/* Busts */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Busts</p>
                <p className="text-3xl font-bold text-[#8B1A1A]">{stats.busts}</p>
              </div>
            </div>
          </section>

          {/* Percentage Statistics Grid */}
          <section aria-labelledby="percentages-heading">
            <h2 id="percentages-heading" className="text-2xl font-bold text-[#C9A84C] mb-4">
              Percentages
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Win Percentage */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Win Rate</p>
                <p className="text-3xl font-bold text-[#C9A84C]">
                  {winPercentage.toFixed(1)}%
                </p>
              </div>

              {/* Loss Percentage */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Loss Rate</p>
                <p className="text-3xl font-bold text-[#8B1A1A]">
                  {lossPercentage.toFixed(1)}%
                </p>
              </div>

              {/* Push Percentage */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Push Rate</p>
                <p className="text-3xl font-bold text-gray-300">
                  {pushPercentage.toFixed(1)}%
                </p>
              </div>

              {/* Bust Percentage */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Bust Rate</p>
                <p className="text-3xl font-bold text-[#8B1A1A]">
                  {bustPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Special Achievements */}
          <section aria-labelledby="achievements-heading">
            <h2 id="achievements-heading" className="text-2xl font-bold text-[#C9A84C] mb-4">
              Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Blackjacks */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Blackjacks</p>
                <p className="text-3xl font-bold text-[#C9A84C]">{stats.blackjacks}</p>
              </div>

              {/* Biggest Win */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Biggest Win</p>
                <p className="text-3xl font-bold text-[#C9A84C]">
                  {stats.biggestWin > 0 ? `+${stats.biggestWin}` : stats.biggestWin}
                </p>
              </div>

              {/* Biggest Loss */}
              <div className="bg-black bg-opacity-30 rounded-lg p-4 border border-[#C9A84C] border-opacity-30">
                <p className="text-sm text-gray-400 mb-2">Biggest Loss</p>
                <p className="text-3xl font-bold text-[#8B1A1A]">
                  {stats.biggestLoss < 0 ? stats.biggestLoss : `-${stats.biggestLoss}`}
                </p>
              </div>
            </div>
          </section>

          {/* Balance History Chart */}
          <section aria-labelledby="chart-heading">
            <h2 id="chart-heading" className="text-2xl font-bold text-[#C9A84C] mb-4">
              Balance History
            </h2>
            <div className="bg-black bg-opacity-30 rounded-lg p-4 sm:p-6 border border-[#C9A84C] border-opacity-30">
              {renderBalanceChart()}
            </div>
          </section>

          {/* Empty State Message */}
          {stats.totalHands === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400 mb-4">
                No statistics yet. Start playing to see your stats!
              </p>
              <Button
                onClick={handleBackToGame}
                variant="primary"
                aria-label="Start playing"
              >
                Start Playing
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-4 border-t border-[#C9A84C] border-opacity-30">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            Statistics are saved automatically and persist across sessions
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Stats;
