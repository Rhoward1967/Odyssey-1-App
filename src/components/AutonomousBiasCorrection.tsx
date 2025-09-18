import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Shield, Zap, Eye, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface BiasAnalysis {
  hasBias: boolean;
  biasType: string[];
  confidence: number;
  culturalContext: string;
  correction: string;
}

interface CorrectionResult {
  original: string;
  biasAnalysis: BiasAnalysis;
  corrected: string;
  metadata: any;
  improvements: string;
}

export default function AutonomousBiasCorrection() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [corrections, setCorrections] = useState<number>(0);

  // Autonomous monitoring - runs continuously when enabled
  useEffect(() => {
    if (!autoMode) return;

    const interval = setInterval(async () => {
      if (inputText.trim()) {
        await processContent('full_analysis', false);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [autoMode, inputText]);

  const processContent = async (operation: string, showLoading = true) => {
    if (!inputText.trim()) return;
    
    if (showLoading) setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('autonomous-bias-correction', {
        body: {
          content: inputText,
          operation,
          context: { timestamp: Date.now() }
        }
      });

      if (error) throw error;

      if (data.result) {
        setResult(data.result);
        if (data.result.biasAnalysis?.hasBias) {
          setCorrections(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Bias correction error:', error);
    } finally {
      if (showLoading) setIsProcessing(false);
    }
  };

  const getBiasTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'cultural_superiority': 'bg-red-100 text-red-800',
      'othering': 'bg-orange-100 text-orange-800',
      'western_centrism': 'bg-yellow-100 text-yellow-800',
      'tradition_dismissal': 'bg-purple-100 text-purple-800',
      'economic_hierarchy': 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-purple-600" />
              Autonomous Bias Correction Engine
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={autoMode ? "default" : "outline"}>
                {autoMode ? 'Auto-Monitoring' : 'Manual Mode'}
              </Badge>
              <Badge variant="secondary">
                {corrections} Corrections Applied
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              onClick={() => setAutoMode(!autoMode)}
              variant={autoMode ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {autoMode ? 'Disable Auto-Mode' : 'Enable Auto-Mode'}
            </Button>
            <Button
              onClick={() => processContent('full_analysis')}
              disabled={isProcessing || !inputText.trim()}
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Analyze Now
            </Button>
          </div>
          
          <Textarea
            placeholder="Enter content to analyze for bias... (Auto-mode will continuously monitor)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[100px] mb-4"
          />
        </CardContent>
      </Card>

      {/* Results Display */}
      {result && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bias Analysis */}
          <Card className={`border-2 ${result.biasAnalysis.hasBias ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.biasAnalysis.hasBias ? (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                Bias Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Bias Detected:</span>
                  <Badge variant={result.biasAnalysis.hasBias ? "destructive" : "default"}>
                    {result.biasAnalysis.hasBias ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                {result.biasAnalysis.hasBias && (
                  <>
                    <div>
                      <span className="font-medium">Confidence:</span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${result.biasAnalysis.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round(result.biasAnalysis.confidence * 100)}%
                      </span>
                    </div>
                    
                    <div>
                      <span className="font-medium">Bias Types:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.biasAnalysis.biasType.map((type, index) => (
                          <Badge key={index} className={getBiasTypeColor(type)}>
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Cultural Context:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        {result.biasAnalysis.culturalContext}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Corrected Content */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                Autonomous Correction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Corrected Text:</span>
                  <div className="bg-white p-3 rounded border mt-1 text-sm">
                    {result.corrected}
                  </div>
                </div>
                
                {result.improvements && (
                  <div>
                    <span className="font-medium">Applied Improvements:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.improvements}
                    </p>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Framework: {result.metadata?.framework} | 
                  Processed: {new Date(result.metadata?.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Status */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Decolonized AI Framework Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">Active</div>
              <div className="text-sm text-gray-600">Cultural Auditing</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">Running</div>
              <div className="text-sm text-gray-600">Synthesis Engine</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">Live</div>
              <div className="text-sm text-gray-600">Auto-Correction</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}