import React from 'react';
import Chip from './Chip';
import Button from './Button';

interface BettingPanelProps {
  currentBet: number;
  balance: number;
  onBet: (amount: number) => void;
  onClearBet: () => void;
  onDeal: () => void;
  disabled?: boolean;
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  currentBet,
  balance,
  onBet,
  onClearBet,
  onDeal,
  disabled = false,
}) => {
  const chipDenominations: Array<5 | 25 | 100 | 500> = [5, 25, 100, 500];

  // Check if a chip denomination can be bet
  const canBetChip = (denomination: number): boolean => {
    return currentBet + denomination <= balance;
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-[#0a1f0a] rounded-lg border-2 border-[#C9A84C]">
      {/* Current Bet Display */}
      <div className="text-center">
        <p className="text-sm text-gray-400 mb-1">Current Bet</p>
        <p className="text-3xl font-bold text-[#C9A84C]" aria-live="polite">
          {currentBet}
        </p>
      </div>

      {/* Chip Denomination Buttons */}
      <div className="flex gap-4 flex-wrap justify-center" role="group" aria-label="Chip denominations">
        {chipDenominations.map((denomination) => (
          <Chip
            key={denomination}
            denomination={denomination}
            onClick={() => onBet(denomination)}
            disabled={disabled || !canBetChip(denomination)}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap justify-center w-full">
        <Button
          onClick={onClearBet}
          disabled={disabled || currentBet === 0}
          variant="secondary"
          aria-label="Clear current bet"
        >
          Clear Bet
        </Button>
        <Button
          onClick={onDeal}
          disabled={disabled || currentBet === 0}
          variant="primary"
          aria-label="Deal cards and start round"
        >
          Deal
        </Button>
      </div>
    </div>
  );
};

export default BettingPanel;
