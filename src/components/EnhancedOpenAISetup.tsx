import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { CheckCircle, AlertCircle, Key, DollarSign, Zap, ExternalLink } from 'lucide-react';
import { openAIService } from '@/services/openai';

export default function EnhancedOpenAISetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [setupProgress, setSetupProgress] = useState(0);
  const [usageStats, setUsageStats] = useState<any>(null);

  const steps = [
    { id: 1, title: 'Get API Key', description: 'Obtain your OpenAI API key' },
    { id: 2, title: 'Configure Settings', description: 'Set up usage limits and preferences' },
    { id: 3, title: 'Test Connection', description: 'Verify your setup works correctly' },
    { id: 4, title: 'Ready to Use', description: 'Start using AI research features' }
  ];

  useEffect(() => {
    const config = openAIService.getConfig();
    if (config.apiKey) {
      setApiKey(config.apiKey);
      setCurrentStep(4);
      setSetupProgress(100);
    }
    setUsageStats(openAIService.getUsage());
  }, []);

  const validateApiKey = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    setValidationResult(null);
    
    try {
      openAIService.updateConfig({ apiKey: apiKey.trim() });
      await openAIService.chat('Test connection');
      setValidationResult('✅ API key is valid and working!');
      setCurrentStep(4);
      setSetupProgress(100);
    } catch (error: any) {
      setValidationResult(`❌ ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-6 h-6" />
            OpenAI API Setup Wizard
          </CardTitle>
          <div className="space-y-2">
            <Progress value={setupProgress} className="bg-white/20" />
            <p className="text-blue-100">Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}</p>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={`step${currentStep}`} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {steps.map((step) => (
            <TabsTrigger 
              key={step.id} 
              value={`step${step.id}`}
              className="flex items-center gap-2"
              disabled={step.id > currentStep && currentStep < 4}
            >
              {currentStep > step.id ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-gray-300 text-xs flex items-center justify-center">
                  {step.id}
                </span>
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="step1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Your OpenAI API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Step-by-step instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Visit the OpenAI Platform website</li>
                  <li>Create an account or sign in</li>
                  <li>Navigate to API Keys section</li>
                  <li>Click "Create new secret key"</li>
                  <li>Copy the key (starts with "sk-")</li>
                </ol>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open OpenAI Platform
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  I have my API key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configure Your API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">OpenAI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="font-mono"
                />
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Important Security Note</h4>
                    <p className="text-sm text-yellow-700">
                      Your API key is stored locally in your browser and never sent to our servers.
                      Keep it secure and don't share it with others.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setCurrentStep(3)} 
                disabled={!apiKey.trim()}
                className="w-full"
              >
                Continue to Testing
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Your Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={validateApiKey}
                disabled={isValidating || !apiKey.trim()}
                className="w-full"
              >
                {isValidating ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Test API Connection
                  </>
                )}
              </Button>
              
              {validationResult && (
                <div className={`p-3 rounded-lg ${
                  validationResult.includes('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {validationResult}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step4" className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Setup Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-700">
                🎉 Your OpenAI API is configured and ready to use. You can now access all AI research features.
              </p>
              
              {usageStats && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">Daily Spending</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${usageStats.dailySpent.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span className="font-semibold">Requests Today</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {usageStats.requestsToday}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold">What you can do now:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Ask complex research questions</li>
                  <li>Generate research summaries</li>
                  <li>Analyze documents and data</li>
                  <li>Collaborate with team members</li>
                  <li>Export research findings</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}