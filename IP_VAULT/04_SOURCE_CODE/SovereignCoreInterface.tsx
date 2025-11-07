/**
 * R.O.M.A.N. Sovereign-Core Interface
 * 
 * © 2025 Rickey A Howard. All Rights Reserved.
 * Property of Rickey A Howard
 * 
 * Part of the ODYSSEY-1 Genesis Protocol
 * User interface for the R.O.M.A.N. AI system
 */

import { LogicalHemisphere } from '@/services/LogicalHemisphere';
import { OrchestrationResult, SovereignCoreOrchestrator } from '@/services/SovereignCoreOrchestrator';
import { SynchronizationLayer } from '@/services/SynchronizationLayer';
import { AlertCircle, CheckCircle, Crown, Loader2, XCircle, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const SovereignCoreInterface: React.FC = () => {
  const [userIntent, setUserIntent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<OrchestrationResult | null>(null);

  const userId = 'temp-user-id';
  const organizationId = 1;

  const hasGemini = !!import.meta.env.VITE_GEMINI_API_KEY;
  const hasOpenAI = !!import.meta.env.VITE_OPENAI_API_KEY;
  const hasAnthropic = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

  const handleProcessCommand = async () => {
    if (!userIntent.trim()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      console.log('🌌 Genesis Protocol: Phase 1 - Creative Hemisphere');
      const command = await SynchronizationLayer.generateCommand(
        userIntent,
        userId,
        organizationId
      );
      
      console.log('✅ Generated Command:', command);

      console.log('🔍 Genesis Protocol: Phase 2 - Logical Hemisphere');
      const validation = await LogicalHemisphere.validate(command, userId);

      if (!validation.approved) {
        setResult({
          success: false,
          command,
          message: validation.reason || 'Validation failed',
          // Remove: validationErrors: validation.errors
        });
        return;
      }

      console.log('✅ Validation passed');

      setResult({
        success: true,
        command,
        validation, // ADD THIS LINE!
        message: 'Command validated successfully! Ready for execution.'
      });

    } catch (error: any) {
      console.error('❌ R.O.M.A.N. Error:', error);
      setResult({
        success: false,
        message: error.message || 'An error occurred',
        // Remove: validationErrors: [error.toString()]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add handler for executing validated command
  const handleExecuteCommand = async () => {
    if (!result?.command) return;
    
    setExecuting(true);
    try {
      console.log('⚡ Executing validated command...');
      const execution = await SovereignCoreOrchestrator.executeCommand(result.command);
      
      console.log('✅ Execution complete:', execution);
      
      setResult({
        ...result,
        execution,
        success: execution.success
      });
    } catch (error: any) {
      console.error('❌ Command execution failed:', error);
      setResult({
        ...result,
        execution: {
          success: false,
          message: `Execution error: ${error.message}`
        },
        success: false
      });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white">
          <Crown className="h-8 w-8 text-purple-400" />
          R.O.M.A.N. Sovereign-Core Interface
          <Badge className="ml-auto bg-purple-600/20 text-purple-300">
            Universal Interpreter Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Architecture Status */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-black/30 rounded-lg border border-purple-500/30">
          <div className="text-center">
            <div className="text-xs text-purple-400 mb-1">Creative Hemisphere</div>
            <div className="text-sm text-white font-mono">
              {hasGemini && 'Gemini'}
              {!hasGemini && hasOpenAI && 'GPT-4'}
              {!hasGemini && !hasOpenAI && hasAnthropic && 'Claude'}
              {!hasGemini && !hasOpenAI && !hasAnthropic && 'Not Configured'}
            </div>
            <Badge className={`mt-1 text-xs ${
              hasGemini || hasOpenAI || hasAnthropic 
                ? 'bg-blue-600/20 text-blue-300' 
                : 'bg-red-600/20 text-red-300'
            }`}>
              {hasGemini || hasOpenAI || hasAnthropic ? 'Ready' : 'Missing API Key'}
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-xs text-purple-400 mb-1">Logical Hemisphere</div>
            <div className="text-sm text-white font-mono">Validator</div>
            <Badge className="mt-1 text-xs bg-green-600/20 text-green-300">Active</Badge>
          </div>
          <div className="text-center">
            <div className="text-xs text-purple-400 mb-1">Execution Engine</div>
            <div className="text-sm text-white font-mono">ODYSSEY-1</div>
            <Badge className="mt-1 text-xs bg-yellow-600/20 text-yellow-300">Standby</Badge>
          </div>
        </div>

        {/* AI Provider Not Configured Warning */}
        {!hasGemini && !hasOpenAI && !hasAnthropic && (
          <Alert className="bg-red-900/20 border-red-500/50">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              <div className="font-semibold mb-1">AI Provider Not Configured</div>
              <div className="text-sm">
                Add one of these to your .env file:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li><code className="bg-black/30 px-1 rounded">VITE_GEMINI_API_KEY</code></li>
                  <li><code className="bg-black/30 px-1 rounded">VITE_OPENAI_API_KEY</code></li>
                  <li><code className="bg-black/30 px-1 rounded">VITE_ANTHROPIC_API_KEY</code></li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* User Input */}
        <div className="space-y-2">
          <label className="text-sm text-purple-300">Universal Intent Input</label>
          <div className="flex gap-2">
            <Input
              value={userIntent}
              onChange={(e) => setUserIntent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleProcessCommand()}
              placeholder="Speak naturally - e.g., 'Show me all employees' or 'Run payroll for March 1-15'"
              className="bg-black/30 border-purple-500/50 text-white placeholder:text-gray-500"
              disabled={isProcessing}
            />
            <Button
              onClick={handleProcessCommand}
              disabled={isProcessing || !userIntent.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            R.O.M.A.N. translates your natural language into structured commands
          </p>
        </div>

        {/* Results Display */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-900/20 border-green-500/50' 
              : 'bg-red-900/20 border-red-500/50'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold text-white mb-1">
                  {result.success ? 'Command Validated ✓' : 'Validation Failed ✗'}
                </div>
                <div className="text-sm text-gray-300">{result.message}</div>
              </div>
            </div>

            {result.command && (
              <div className="mt-3 p-3 bg-black/30 rounded border border-purple-500/30">
                <div className="text-xs text-purple-400 mb-2">Generated Command:</div>
                <pre className="text-xs text-white font-mono overflow-x-auto">
                  {JSON.stringify(result.command, null, 2)}
                </pre>
              </div>
            )}

            {/* Remove validationErrors display */}
          </div>
        )}

        {/* Validation Success - ADD THIS SECTION */}
        {result && result.validation?.approved && !result.execution && (
          <Card className="bg-green-900/20 border-green-500">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-semibold">Command Validated ✓</span>
                    </div>
                    <p className="text-gray-300">{result.validation.reason}</p>
                  </div>
                  <Button
                    onClick={handleExecuteCommand}
                    disabled={executing}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-8"
                  >
                    {executing ? (
                      <>⏳ Executing...</>
                    ) : (
                      <>⚡ Execute Command</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Execution Result - ADD THIS SECTION */}
        {result && result.execution && (
          <Card className={result.execution.success ? "bg-blue-900/20 border-blue-500" : "bg-red-900/20 border-red-500"}>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                {result.execution.success ? (
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
                <span className={result.execution.success ? "text-blue-400 font-semibold" : "text-red-400 font-semibold"}>
                  {result.execution.success ? '✅ Execution Success!' : '❌ Execution Failed'}
                </span>
              </div>
              <p className="text-gray-300 mb-4">{result.execution.message}</p>
              {result.execution.data && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Result Data:</p>
                  <pre className="text-xs overflow-auto p-4 bg-black/40 rounded text-gray-300">
                    {JSON.stringify(result.execution.data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Example Commands */}
        <div className="p-4 bg-black/20 rounded-lg border border-purple-500/20">
          <div className="text-sm font-semibold text-purple-300 mb-2">Try These Commands:</div>
          <div className="space-y-1 text-xs text-gray-400">
            <div>• "Show me all employees"</div>
            <div>• "Run payroll for March 1 to March 15"</div>
            <div>• "Delete the Deploy task"</div>
            <div>• "Create a new employee named John Doe"</div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default SovereignCoreInterface;
