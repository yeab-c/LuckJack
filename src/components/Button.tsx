import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Support Enter and Space keys for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!disabled) {
        onClick();
      }
    }
  };

  // Base styles for all buttons
  const baseStyles = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a1f0a] disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant-specific styles
  const variantStyles = {
    primary: 'bg-[#C9A84C] text-[#0a1f0a] hover:bg-[#d4b55e] active:bg-[#b89940] focus:ring-[#C9A84C] disabled:hover:bg-[#C9A84C]',
    secondary: 'bg-white text-[#0a1f0a] hover:bg-gray-100 active:bg-gray-200 focus:ring-white disabled:hover:bg-white',
    danger: 'bg-[#8B1A1A] text-white hover:bg-[#a02020] active:bg-[#761616] focus:ring-[#8B1A1A] disabled:hover:bg-[#8B1A1A]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]}`}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
