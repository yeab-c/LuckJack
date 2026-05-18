import React, { useEffect } from 'react';
import Button from './Button';
import type { RoundPhase } from '../types/game';

interface ControlPanelProps {
  phase: RoundPhase;
  onHit: () => void;
  onStand: () => void;
  disabled?: boolean;
}

/**
 * ControlPanel Component
 * 
 * Displays Hit and Stand buttons during the player's turn.
 * Includes keyboard shortcuts (H for Hit, S for Stand) for enhanced accessibility.
 * 
 */
const ControlPanel: React.FC<ControlPanelProps> = ({
  phase,
  onHit,
  onStand,
  disabled = false,
}) => {
  useEffect(() => {
    // Only add keyboard listeners during playerTurn phase and when not disabled
    if (phase !== 'playerTurn' || disabled) {
      return;
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      // Prevent keyboard shortcuts if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'h') {
        event.preventDefault();
        onHit();
      } else if (key === 's') {
        event.preventDefault();
        onStand();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Cleanup listener on unmount or when dependencies change
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [phase, onHit, onStand, disabled]);

  // Only render buttons during playerTurn phase
  if (phase !== 'playerTurn') {
    return null;
  }

  return (
    <div className="flex gap-4 justify-center items-center">
      <Button
        onClick={onHit}
        disabled={disabled}
        variant="primary"
        aria-label="Hit - Draw another card (Keyboard shortcut: H)"
      >
        Hit
      </Button>
      <Button
        onClick={onStand}
        disabled={disabled}
        variant="secondary"
        aria-label="Stand - Keep current hand (Keyboard shortcut: S)"
      >
        Stand
      </Button>
    </div>
  );
};

export default ControlPanel;
