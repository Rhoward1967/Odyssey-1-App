import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, disabled = false, className = '' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-1 sm:px-2 md:px-4 py-2 text-xs sm:text-sm font-bold transition-all duration-200 border-b-2 whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-shrink max-w-[80px] sm:max-w-[120px] md:max-w-none ${
        active
          ? 'text-white border-blue-500 bg-blue-500/10'
          : 'text-gray-400 border-transparent hover:text-white hover:border-gray-600 hover:bg-gray-700/20'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </button>
  );
};

export default TabButton;