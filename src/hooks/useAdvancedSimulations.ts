import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface SimulationRequest {
  simulationType: 'monte_carlo' | 'market_dynamics' | 'digital_twin_sync' | 'ai_forecast' | 'scenario_planning';
  parameters: Record<string, any>;
}

interface SimulationResult {
  success: boolean;
  simulationType: string;
  results: any;
  timestamp: string;
  error?: string;
}

export const useAdvancedSimulations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SimulationResult[]>([]);

  const runSimulation = useCallback(async (request: SimulationRequest): Promise<SimulationResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('advanced-simulation-processor', {
        body: request
      });

      if (error) throw error;

      const result = data as SimulationResult;
      setResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      
      return result;
    } catch (error) {
      const errorResult: SimulationResult = {
        success: false,
        simulationType: request.simulationType,
        results: null,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setResults(prev => [errorResult, ...prev.slice(0, 9)]);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runMonteCarloSimulation = useCallback(async (iterations: number = 10000) => {
    return runSimulation({
      simulationType: 'monte_carlo',
      parameters: { iterations }
    });
  }, [runSimulation]);

  const analyzeMarketDynamics = useCallback(async (marketData: any = {}) => {
    return runSimulation({
      simulationType: 'market_dynamics',
      parameters: marketData
    });
  }, [runSimulation]);

  const syncDigitalTwin = useCallback(async (twinId: string) => {
    return runSimulation({
      simulationType: 'digital_twin_sync',
      parameters: { twinId }
    });
  }, [runSimulation]);

  const generateAIForecast = useCallback(async (forecastParams: any = {}) => {
    return runSimulation({
      simulationType: 'ai_forecast',
      parameters: forecastParams
    });
  }, [runSimulation]);

  const runScenarioPlanning = useCallback(async (scenarios: any = {}) => {
    return runSimulation({
      simulationType: 'scenario_planning',
      parameters: scenarios
    });
  }, [runSimulation]);

  return {
    isLoading,
    results,
    runSimulation,
    runMonteCarloSimulation,
    analyzeMarketDynamics,
    syncDigitalTwin,
    generateAIForecast,
    runScenarioPlanning
  };
};