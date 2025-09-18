import React from 'react';

interface MobileTabIndicatorProps {
  currentTab: string;
  currentIndex: number;
  totalTabs: number;
}

const MobileTabIndicator: React.FC<MobileTabIndicatorProps> = ({ 
  currentTab, 
  currentIndex, 
  totalTabs 
}) => {
  return (
    <div className="md:hidden">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-3">
        {Array.from({ length: totalTabs }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-blue-400 scale-125' 
                : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
      
      {/* Current tab name and position */}
      <div className="text-center text-sm text-blue-400 mb-3 font-medium">
        {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)} ({currentIndex + 1}/{totalTabs})
      </div>
      
      {/* Swipe hint with animation */}
      <div className="text-center text-xs text-gray-400 mb-3 flex items-center justify-center gap-2 animate-pulse">
        <span className="animate-bounce">←</span>
        <span>Swipe to navigate</span>
        <span className="animate-bounce">→</span>
      </div>
    </div>
  );
};

export default MobileTabIndicator;