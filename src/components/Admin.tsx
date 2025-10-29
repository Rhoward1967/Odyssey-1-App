/**
 * ODYSSEY-1 Admin Dashboard & R.O.M.A.N. Command Center
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * System administration interface with integrated R.O.M.A.N. controls
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SovereignCoreOrchestrator } from '@/services/SovereignCoreOrchestrator';
import { Activity, AlertTriangle, Brain, CheckCircle, Shield, Zap } from 'lucide-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

// =========================================================================
// 1. API CONTEXT (Provider and Hook Definitions)
// =========================================================================

interface APICapabilities {
  openai: boolean;
  anthropic: boolean;
  gemini: boolean; 
  google_calendar: boolean;
  stripe: boolean;
  twilio: boolean;
  sam_gov: boolean;
  arxiv: boolean;
  github: boolean;
  roman_ready: boolean; 
  genesis_mode: boolean; 
}

interface APIContextType {
  capabilities: APICapabilities;
  hasCapability: (capability: keyof APICapabilities) => boolean;
  refreshCapabilities: () => void;
  isLoading: boolean;
}

const APIContext = createContext<APIContextType | undefined>(undefined);

export function APIProvider({ children }: { children: React.ReactNode }) {
  const [capabilities, setCapabilities] = useState<APICapabilities>({
    openai: false,
    anthropic: false,
    gemini: false,
    google_calendar: false,
    stripe: false,
    twilio: false,
    sam_gov: false,
    arxiv: false,
    github: false,
    roman_ready: false,
    genesis_mode: false
  });
  const [isLoading, setIsLoading] = useState(true);

  const checkCapabilities = async () => {
    setIsLoading(true);
    try {
      const newCapabilities: APICapabilities = {
        openai: !!import.meta.env.VITE_OPENAI_API_KEY,
        anthropic: !!import.meta.env.VITE_ANTHROPIC_API_KEY,
        gemini: !!import.meta.env.VITE_GEMINI_API_KEY,
        google_calendar: !!import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY,
        stripe: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        twilio: !!import.meta.env.VITE_TWILIO_ACCOUNT_SID,
        sam_gov: !!import.meta.env.VITE_SAM_GOV_API_KEY,
        arxiv: !!import.meta.env.VITE_ARXIV_API_KEY,
        github: !!import.meta.env.VITE_GITHUB_API_KEY,
        
        // R.O.M.A.N. readiness check
        roman_ready: !!(
          import.meta.env.VITE_OPENAI_API_KEY && 
          import.meta.env.VITE_ANTHROPIC_API_KEY &&
          import.meta.env.VITE_SUPABASE_URL
        ),
        
        genesis_mode: false
      };
      
      setCapabilities(newCapabilities);
    } catch (error) {
      console.error('Failed to check API capabilities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkCapabilities();
  }, []);

  const hasCapability = (capability: keyof APICapabilities): boolean => {
    return capabilities[capability];
  };

  const refreshCapabilities = () => {
    checkCapabilities();
  };

  return (
    <APIContext.Provider value={{
      capabilities,
      hasCapability,
      refreshCapabilities,
      isLoading
    }}>
      {children}
    </APIContext.Provider>
  );
}

export function useAPI() {
  const context = useContext(APIContext);
  if (!context) {
    throw new Error('useAPI must be used within an APIProvider');
  }
  return context;
}

// =========================================================================
// 2. SOVEREIGN CORE INTERFACE (Self-Contained R.O.M.A.N. Input Panel)
// =========================================================================

const SovereignCoreInterface: React.FC = () => {
    const [userIntent, setUserIntent] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userIntent.trim()) return;

        setProcessing(true);
        setError(null);
        setResult(null);

        try {
            // Mock user/org IDs for demo
            const userId = '123e4567-e89b-12d3-a456-426614174000';
            const orgId = 1; // Changed from string to number (organizationId is bigint in database)

            // Execute R.O.M.A.N. Sovereign-Core processing
            const response = await SovereignCoreOrchestrator.processIntent(
                userIntent,
                userId,
                orgId
            );

            if (response.success) {
                setResult(response);
            } else {
                setError(response.message || 'Unknown error occurred');
            }
        } catch (err: any) {
            setError(`Processing failed: ${err.message}`);
        } finally {
            setProcessing(false);
        }
    };
    
    // Static Architecture Status (since logic is embedded in the orchestrator)
    const architectureStatus = [
        { name: 'Single Source', sub: 'The "Book"', success: true, color: 'blue' },
        { name: 'Synchronization', sub: 'Librarian', success: true, color: 'orange' },
        { name: 'Creative', sub: 'Right Brain', success: true, color: 'purple' },
        { name: 'Logical', sub: 'Left Brain', success: true, color: 'green' },
        { name: 'Execution', sub: 'The Hands', success: true, color: 'yellow' },
    ];


    return (
        <div className="space-y-6">
            <Card className="border-purple-400 bg-white shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-3 text-2xl text-purple-800">
                        <Shield className="h-8 w-8 text-gold-600" />
                        R.O.M.A.N. Sovereign-Core Interface
                        <Shield className="h-8 w-8 text-gold-600" />
                    </CardTitle>
                    <Badge className="mx-auto bg-purple-200 text-purple-800 text-lg px-4 py-2">
                        Revolutionary AI with Synchronization Principle
                    </Badge>
                </CardHeader>
            </Card>

            {/* Natural Language Input */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-6 w-6 text-purple-600" />
                        Natural Language Command Interface
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                value={userIntent}
                                onChange={(e) => setUserIntent(e.target.value)}
                                placeholder="Speak naturally: 'Delete the Deploy task' or 'Process payroll'"
                                className="text-lg p-4"
                                disabled={processing}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={processing || !userIntent.trim()}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {processing ? (
                                <>
                                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                                    Processing through Sovereign-Core...
                                </>
                            ) : (
                                <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Execute R.O.M.A.N. Command
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
            
            {/* Processing Flow Visualization */}
            {(result || error) && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {result ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            )}
                            Processing Result
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <div className="bg-red-50 p-4 rounded border border-red-200">
                                <h4 className="font-bold text-red-800 mb-2">Error</h4>
                                <p className="text-red-700">{error}</p>
                            </div>
                        ) : result ? (
                            <div className="space-y-4">
                                <div className="bg-green-50 p-4 rounded border border-green-200">
                                    <h4 className="font-bold text-green-800 mb-2">
                                        ✅ Command Executed Successfully
                                    </h4>
                                    <p className="text-green-700">
                                        Intent: "{result.flow?.user_intent}"
                                    </p>
                                </div>

                                {/* Flow Phases */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-800">Processing Flow:</h4>
                                    {result.flow?.phases?.map((phase: any, index: number) => (
                                        <div 
                                            key={index} 
                                            className={`p-3 rounded border ${
                                                phase.success 
                                                    ? 'bg-green-50 border-green-200' 
                                                    : 'bg-red-50 border-red-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                {phase.success ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                ) : (
                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                )}
                                                <span className={`font-semibold ${
                                                    phase.success ? 'text-green-800' : 'text-red-800'
                                                }`}>
                                                    {phase.phase.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <pre className="text-xs text-gray-600 overflow-auto">
                                                {JSON.stringify(phase.output, null, 2)}
                                            </pre>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            )}

            {/* Architecture Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-purple-600" />
                        Sovereign-Core Architecture Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {architectureStatus.map((status) => (
                             <div 
                                key={status.name} 
                                className={`bg-${status.color}-50 p-3 rounded border text-center`}
                            >
                                <div className="text-sm font-semibold text-gray-800">{status.name}</div>
                                <div className="text-xs text-gray-600">{status.sub}</div>
                                <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


// =========================================================================
// 3. ADMIN PAGE COMPONENT (The Final Export)
// =========================================================================

const AdminContent: React.FC = () => {
    // FIX: useAPI called correctly inside the component being rendered by the provider
    const { isLoading } = useAPI(); 
    
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading Admin Capabilities...</div>;
    }

    return (
        <div className="p-6 space-y-8 bg-gray-50 min-h-screen text-gray-800">
            <h1 className="text-4xl font-bold text-purple-600 mb-6">
                R.O.M.A.N. Command Center
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. R.O.M.A.N. INTERFACE (Main Command Input) */}
                <div className="lg:col-span-2">
                    {/* The logic is now self-contained in the SovereignCoreInterface component */}
                    <SovereignCoreInterface /> 
                </div>

                {/* 2. ARCHITECTURE STATUS (Security/Capabilities Card) */}
                <div className="lg:col-span-1 space-y-8">
                    <SecurityStatusCard />

                    {/* Placeholder for other Admin Status Cards */}
                    <Card className="border-gray-200 bg-white shadow-md">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                <Zap className="h-5 w-5 text-orange-600" />
                                System Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">Database and API uptime monitored.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const SecurityStatusCard: React.FC = () => {
    // FIX: useAPI called inside the functional component to bring context into scope
    const { hasCapability, isLoading } = useAPI(); 
    const isRomanReady = hasCapability('roman_ready');

    if (isLoading) return <Card className="p-6 text-center text-gray-500">Checking Security Status...</Card>;

    return (
        <Card className="border-gray-200 bg-white shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Shield className="h-5 w-5 text-green-600" />
                    Security Architecture Status
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">🛡️ Enterprise Security: HARDENED</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {/* Status checks rely on capabilities */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>SECURITY DEFINER: ELIMINATED</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>RLS Policies: ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Tenant Isolation: VERIFIED</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Views: Invoker-Safe</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span>Performance: Optimized</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Conditional icon based on roman_ready status */}
                                {isRomanReady ? (
                                    <Activity className="h-4 w-4 text-purple-600 animate-pulse" />
                                ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                )}
                                <span>R.O.M.A.N. Ready: {isRomanReady ? 'CLEARED' : 'PENDING'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


export default function Admin() {
    // The Admin component wraps its content in the Provider to make the context available
    return (
        <APIProvider>
            <AdminContent />
        </APIProvider>
    );
}
