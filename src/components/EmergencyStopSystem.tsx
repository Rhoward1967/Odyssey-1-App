import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { AlertTriangle, Square } from 'lucide-react';

interface EmergencyStopSystemProps {
  onEmergencyStop: () => void;
  isActive: boolean;
}

export default function EmergencyStopSystem({ onEmergencyStop, isActive }: EmergencyStopSystemProps) {
  const emergencyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keyPressCountRef = useRef(0);
  const lastKeyPressRef = useRef(0);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Emergency stop on Escape key
      if (event.key === 'Escape') {
        event.preventDefault();
        onEmergencyStop();
        return;
      }

      // Emergency stop on rapid spacebar presses (3 times in 2 seconds)
      if (event.key === ' ' || event.code === 'Space') {
        const now = Date.now();
        
        if (now - lastKeyPressRef.current < 2000) {
          keyPressCountRef.current++;
        } else {
          keyPressCountRef.current = 1;
        }
        
        lastKeyPressRef.current = now;
        
        if (keyPressCountRef.current >= 3) {
          event.preventDefault();
          onEmergencyStop();
          keyPressCountRef.current = 0;
        }
      }
    };

    // Add global key listener
    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (emergencyTimeoutRef.current) {
        clearTimeout(emergencyTimeoutRef.current);
      }
    };
  }, [onEmergencyStop]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={onEmergencyStop}
        variant="destructive"
        size="lg"
        className="bg-red-600 hover:bg-red-700 shadow-lg animate-pulse"
      >
        <Square className="w-5 h-5 mr-2" />
        EMERGENCY STOP
      </Button>
      
      {isActive && (
        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Press ESC or Space 3x to stop
          </div>
        </div>
      )}
    </div>
  );
}