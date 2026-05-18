/**
 * Tutorial Modal Component
 * 
 * Multi-step tutorial explaining LuckJack game mechanics.
 * Features 5 steps with Next/Back navigation, ESC key support, and backdrop blur.
 * 
 */

import React, { useState, useEffect } from 'react';
import Button from '../components/Button';

// ============================================================================
// Types
// ============================================================================

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// Tutorial Steps Content
// ============================================================================

const TUTORIAL_STEPS = [
  {
    title: 'Betting System',
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          Place your bet using chip denominations before each round begins.
        </p>
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white border-2 border-[#C9A84C] flex items-center justify-center font-bold text-[#0a1f0a]">
              5
            </div>
            <span className="text-gray-300">White chip = 5 chips</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-600 border-2 border-[#C9A84C] flex items-center justify-center font-bold text-white">
              25
            </div>
            <span className="text-gray-300">Red chip = 25 chips</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-600 border-2 border-[#C9A84C] flex items-center justify-center font-bold text-white">
              100
            </div>
            <span className="text-gray-300">Green chip = 100 chips</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black border-2 border-[#C9A84C] flex items-center justify-center font-bold text-white">
              500
            </div>
            <span className="text-gray-300">Black chip = 500 chips</span>
          </div>
        </div>
        <p className="text-gray-300">
          Click chips to add to your bet, then click "Deal" to start the round.
        </p>
      </div>
    ),
  },
  {
    title: 'The Hidden Card Twist',
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          LuckJack adds suspense with a unique mechanic: <span className="text-[#C9A84C] font-semibold">your first card is hidden</span> until the round ends!
        </p>
        <div className="bg-[#0a1f0a]/50 border border-[#C9A84C]/30 rounded-lg p-6 my-6">
          <div className="flex items-center justify-center gap-4">
            <div className="w-20 h-28 bg-[#8B1A1A] border-2 border-[#C9A84C] rounded-lg flex items-center justify-center">
              <span className="text-4xl text-[#C9A84C]">?</span>
            </div>
            <span className="text-2xl text-gray-400">+</span>
            <div className="w-20 h-28 bg-[#FAFAFA] border-2 border-[#C9A84C] rounded-lg flex items-center justify-center">
              <span className="text-4xl text-red-600">♥</span>
            </div>
          </div>
          <p className="text-center text-gray-400 mt-4 text-sm">
            Hidden card + Visible cards
          </p>
        </div>
        <p className="text-gray-300">
          You'll only see your visible cards' total during play. The hidden card reveals at the end for a dramatic finish!
        </p>
      </div>
    ),
  },
  {
    title: 'Hit or Stand',
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          During your turn, you have two choices:
        </p>
        <div className="space-y-4 my-6">
          <div className="bg-[#0a1f0a]/50 border border-[#C9A84C]/30 rounded-lg p-4">
            <h4 className="text-[#C9A84C] font-semibold mb-2">Hit</h4>
            <p className="text-gray-300">
              Request another card to increase your hand value. You can hit multiple times, but be careful not to bust (exceed 21)!
            </p>
          </div>
          <div className="bg-[#0a1f0a]/50 border border-[#C9A84C]/30 rounded-lg p-4">
            <h4 className="text-[#C9A84C] font-semibold mb-2">Stand</h4>
            <p className="text-gray-300">
              Keep your current hand and end your turn. The dealer will then play their hand.
            </p>
          </div>
        </div>
        <p className="text-gray-300 text-sm">
          <span className="text-[#C9A84C]">Tip:</span> Remember, you can't see your hidden card's value, so play strategically based on your visible cards!
        </p>
      </div>
    ),
  },
  {
    title: 'Dealer Rules',
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          The dealer follows strict casino rules and plays automatically:
        </p>
        <div className="bg-[#0a1f0a]/50 border border-[#C9A84C]/30 rounded-lg p-6 my-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#8B1A1A] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">≤16</span>
            </div>
            <div>
              <h4 className="text-[#C9A84C] font-semibold">Must Hit</h4>
              <p className="text-gray-300 text-sm">
                Dealer must take another card when their hand is 16 or below
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">≥17</span>
            </div>
            <div>
              <h4 className="text-[#C9A84C] font-semibold">Must Stand</h4>
              <p className="text-gray-300 text-sm">
                Dealer must stop taking cards when their hand is 17 or above
              </p>
            </div>
          </div>
        </div>
        <p className="text-gray-300">
          The dealer has no choice in their actions—they always follow these rules.
        </p>
      </div>
    ),
  },
  {
    title: 'Winning Conditions',
    content: (
      <div className="space-y-4">
        <p className="text-gray-300">
          After the hidden card is revealed, here's how you can win:
        </p>
        <div className="space-y-3 my-6">
          <div className="bg-[#0a1f0a]/50 border border-[#C9A84C]/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[#C9A84C] font-semibold">Blackjack</h4>
              <span className="text-[#C9A84C] font-bold">2.5× bet</span>
            </div>
            <p className="text-gray-300 text-sm mt-1">
              Your hand equals 21 with exactly two cards
            </p>
          </div>
          <div className="bg-[#0a1f0a]/50 border border-[#C9A84C]/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[#C9A84C] font-semibold">Win</h4>
              <span className="text-[#C9A84C] font-bold">2× bet</span>
            </div>
            <p className="text-gray-300 text-sm mt-1">
              Your hand beats the dealer's without busting
            </p>
          </div>
          <div className="bg-[#0a1f0a]/50 border border-gray-400/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-gray-300 font-semibold">Push</h4>
              <span className="text-gray-300 font-bold">Return bet</span>
            </div>
            <p className="text-gray-300 text-sm mt-1">
              Your hand equals the dealer's hand (tie)
            </p>
          </div>
          <div className="bg-[#0a1f0a]/50 border border-[#8B1A1A]/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h4 className="text-[#8B1A1A] font-semibold">Lose</h4>
              <span className="text-[#8B1A1A] font-bold">Lose bet</span>
            </div>
            <p className="text-gray-300 text-sm mt-1">
              Dealer's hand beats yours, or you bust (exceed 21)
            </p>
          </div>
        </div>
        <p className="text-gray-300 text-center font-semibold">
          Good luck at the tables!
        </p>
      </div>
    ),
  },
];

// ============================================================================
// Component
// ============================================================================

const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // ========================================================================
  // ESC Key Support
  // ========================================================================

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Add event listener when modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  // ========================================================================
  // Reset Step on Close
  // ========================================================================

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // ========================================================================
  // Navigation Handlers
  // ========================================================================

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On last step, close modal
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ========================================================================
  // Render
  // ========================================================================

  if (!isOpen) {
    return null;
  }

  const currentStepData = TUTORIAL_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-title"
    >
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative bg-[#0a1f0a] border-2 border-[#C9A84C] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a1f0a] border-b border-[#C9A84C]/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h2
              id="tutorial-title"
              className="text-2xl font-bold text-[#C9A84C]"
            >
              {currentStepData.title}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            aria-label="Close tutorial"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          {currentStepData.content}
        </div>

        {/* Footer with Navigation */}
        <div className="sticky bottom-0 bg-[#0a1f0a] border-t border-[#C9A84C]/30 px-6 py-4">
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-[#C9A84C]'
                    : index < currentStep
                    ? 'bg-[#C9A84C]/50'
                    : 'bg-gray-700'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={handleBack}
              disabled={isFirstStep}
              variant="secondary"
            >
              Back
            </Button>
            <Button onClick={handleNext} variant="primary">
              {isLastStep ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
