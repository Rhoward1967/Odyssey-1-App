import React, { createContext, useContext, useState, useEffect } from 'react';

interface ArchitectContextType {
  isArchitect: boolean;
  userLevel: 'architect' | 'subscriber-admin' | 'team-member' | 'subscriber' | 'guest';
  setArchitectStatus: (status: boolean) => void;
  bypassAllRestrictions: boolean;
}

const ArchitectContext = createContext<ArchitectContextType>({
  isArchitect: false,
  userLevel: 'guest',
  setArchitectStatus: () => {},
  bypassAllRestrictions: false,
});

export const useArchitect = () => useContext(ArchitectContext);

interface ArchitectProviderProps {
  children: React.ReactNode;
}

export function ArchitectProvider({ children }: ArchitectProviderProps) {
  const [isArchitect, setIsArchitect] = useState(false);
  const [userLevel, setUserLevel] = useState<ArchitectContextType['userLevel']>('guest');

  // System architect identifiers - multiple ways to recognize the architect
  const architectIdentifiers = {
    // Browser fingerprinting (simplified for demo)
    userAgent: navigator.userAgent,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    
    // Stored architect tokens
    architectToken: localStorage.getItem('hjs-architect-permanent-token'),
    sessionToken: sessionStorage.getItem('hjs-architect-session'),
    
    // System level indicators
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname.includes('dev'),
    isOwnerDomain: window.location.hostname.includes('hjsservices') || window.location.hostname.includes('odyssey'),
  };

  useEffect(() => {
    // Check for architect recognition on mount
    recognizeArchitect();
  }, []);

  const recognizeArchitect = () => {
    let recognizedAsArchitect = false;
    let detectedUserLevel: ArchitectContextType['userLevel'] = 'guest';

    // 1. Check for permanent architect token
    if (architectIdentifiers.architectToken === 'hjs-architect-permanent-access-2024') {
      recognizedAsArchitect = true;
      detectedUserLevel = 'architect';
    }

    // 2. Check for development environment (architect likely working)
    else if (architectIdentifiers.isDevelopment) {
      recognizedAsArchitect = true;
      detectedUserLevel = 'architect';
      // Auto-set permanent token in dev
      localStorage.setItem('hjs-architect-permanent-token', 'hjs-architect-permanent-access-2024');
    }

    // 3. Check for owner domain access
    else if (architectIdentifiers.isOwnerDomain) {
      recognizedAsArchitect = true;
      detectedUserLevel = 'architect';
    }

    // 4. Check session token
    else if (architectIdentifiers.sessionToken === 'architect-session-active') {
      recognizedAsArchitect = true;
      detectedUserLevel = 'architect';
    }

    // 5. Fallback: Check for stored authentication
    else if (localStorage.getItem('hjs-architect-auth') === 'authenticated') {
      recognizedAsArchitect = true;
      detectedUserLevel = 'architect';
    }

    setIsArchitect(recognizedAsArchitect);
    setUserLevel(detectedUserLevel);

    // Log architect recognition for debugging
    if (recognizedAsArchitect) {
      console.log('🏗️ ARCHITECT RECOGNIZED - Full System Access Granted');
      console.log('User Level:', detectedUserLevel);
    }
  };

  const setArchitectStatus = (status: boolean) => {
    setIsArchitect(status);
    if (status) {
      setUserLevel('architect');
      localStorage.setItem('hjs-architect-permanent-token', 'hjs-architect-permanent-access-2024');
      sessionStorage.setItem('hjs-architect-session', 'architect-session-active');
      console.log('🏗️ ARCHITECT STATUS MANUALLY SET - Full Access Enabled');
    } else {
      setUserLevel('guest');
    }
  };

  return (
    <ArchitectContext.Provider
      value={{
        isArchitect,
        userLevel,
        setArchitectStatus,
        bypassAllRestrictions: isArchitect,
      }}
    >
      {children}
    </ArchitectContext.Provider>
  );
}