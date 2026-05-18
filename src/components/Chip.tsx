import React from 'react';

interface ChipProps {
  denomination: 5 | 25 | 100 | 500;
  onClick: () => void;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({ denomination, onClick, disabled = false }) => {
  // Background colors based on denomination
  const getBackgroundColor = () => {
    switch (denomination) {
      case 5:
        return 'bg-white';
      case 25:
        return 'bg-red-600';
      case 100:
        return 'bg-green-600';
      case 500:
        return 'bg-black';
      default:
        return 'bg-white';
    }
  };

  // Text color based on denomination (white text for dark backgrounds)
  const getTextColor = () => {
    switch (denomination) {
      case 5:
        return 'text-gray-900';
      case 25:
      case 100:
      case 500:
        return 'text-white';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${getBackgroundColor()}
        ${getTextColor()}
        border-2 border-[#C9A84C]
        rounded-full
        flex items-center justify-center
        font-bold
        transition-transform duration-200
        w-12 h-12
        sm:w-14 sm:h-14
        lg:w-16 lg:h-16
        ${!disabled && 'hover:scale-110 cursor-pointer'}
        ${disabled && 'opacity-50 cursor-not-allowed'}
        focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2
      `}
      aria-label={`Bet ${denomination} chips`}
    >
      {denomination}
    </button>
  );
};

export default Chip;
