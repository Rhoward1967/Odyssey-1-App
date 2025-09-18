import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SwipeNavigationEnhancementProps {
  children: React.ReactNode;
  enableSwipeNavigation?: boolean;
}

const SwipeNavigationEnhancement: React.FC<SwipeNavigationEnhancementProps> = ({ 
  children, 
  enableSwipeNavigation = true 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const navigationOrder = [
    '/',
    '/odyssey',
    '/control-panel',
    '/media-workstation',
    '/budget',
    '/appointments',
    '/help',
    '/subscription',
    '/profile'
  ];

  const currentIndex = navigationOrder.indexOf(location.pathname);

  const navigateToNext = () => {
    if (currentIndex < navigationOrder.length - 1) {
      navigate(navigationOrder[currentIndex + 1]);
      showSwipeAnimation('left');
    }
  };

  const navigateToPrevious = () => {
    if (currentIndex > 0) {
      navigate(navigationOrder[currentIndex - 1]);
      showSwipeAnimation('right');
    }
  };

  const showSwipeAnimation = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setShowSwipeIndicator(true);
    setTimeout(() => {
      setShowSwipeIndicator(false);
      setSwipeDirection(null);
    }, 300);
  };

  useSwipeGesture({
    onSwipeLeft: enableSwipeNavigation ? navigateToNext : undefined,
    onSwipeRight: enableSwipeNavigation ? navigateToPrevious : undefined,
    threshold: 100
  });

  // Show swipe hint on first visit
  useEffect(() => {
    const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint');
    if (!hasSeenSwipeHint) {
      setTimeout(() => {
        setShowSwipeIndicator(true);
        setTimeout(() => setShowSwipeIndicator(false), 2000);
      }, 1000);
      localStorage.setItem('hasSeenSwipeHint', 'true');
    }
  }, []);

  return (
    <div className="relative min-h-screen">
      {children}
      
      {/* Swipe Indicator */}
      {showSwipeIndicator && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className={`
            bg-black/50 backdrop-blur-sm rounded-full p-4 
            transform transition-all duration-300
            ${swipeDirection === 'left' ? 'translate-x-8' : ''}
            ${swipeDirection === 'right' ? '-translate-x-8' : ''}
          `}>
            {swipeDirection === 'left' && <ChevronLeft className="w-8 h-8 text-white" />}
            {swipeDirection === 'right' && <ChevronRight className="w-8 h-8 text-white" />}
            {!swipeDirection && (
              <div className="flex items-center space-x-2 text-white">
                <ChevronLeft className="w-6 h-6 animate-pulse" />
                <span className="text-sm">Swipe to navigate</span>
                <ChevronRight className="w-6 h-6 animate-pulse" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Dots (Mobile only) */}
      <div className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex space-x-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-2">
          {navigationOrder.map((path, index) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-purple-400 scale-125' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Navigate to page ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Edge Swipe Zones (Visual feedback) */}
      {enableSwipeNavigation && (
        <>
          {currentIndex > 0 && (
            <div 
              className="md:hidden fixed left-0 top-0 w-8 h-full z-30 opacity-0 hover:opacity-20 bg-gradient-to-r from-purple-500 to-transparent pointer-events-none"
              aria-hidden="true"
            />
          )}
          {currentIndex < navigationOrder.length - 1 && (
            <div 
              className="md:hidden fixed right-0 top-0 w-8 h-full z-30 opacity-0 hover:opacity-20 bg-gradient-to-l from-purple-500 to-transparent pointer-events-none"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </div>
  );
};

export default SwipeNavigationEnhancement;