import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Settings, Key, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { openAIService } from '@/services/openai';

export default function OpenAISettings() {
  const [apiKey, setApiKey] = useState('');
  const [dailyLimit, setDailyLimit] = useState(10);
  const [requestLimit, setRequestLimit] = useState(100);
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [usageStats, setUsageStats] = useState<any>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestLoading, setIsTestLoading] = useState(false);

  useEffect(() => {
    // Load current config
    const config = openAIService.getConfig();
    setApiKey(config.apiKey || '');
    setDailyLimit(config.dailyLimit);
    setRequestLimit(config.requestLimit);
    setModel(config.model);
    
    // Load usage stats
    setUsageStats(openAIService.getUsage());
  }, []);

  const handleSave = () => {
    openAIService.updateConfig({
      apiKey,
      dailyLimit,
      requestLimit,
      model
    });
    
    // Update usage stats
    setUsageStats(openAIService.getUsage());
    alert('Settings saved successfully!');
  };

  const handleTest = async () => {
    setIsTestLoading(true);
    setTestResult(null);
    
    try {
      const response = await openAIService.chat('Hello, this is a test message. Please respond briefly.');
      setTestResult('✅ API connection successful!');
    } catch (error: any) {
      setTestResult(`❌ API test failed: ${error.message}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          OpenAI API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usage Stats */}
        {usageStats && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-xs text-gray-600">Daily Spending</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span className="font-mono">${usageStats.dailySpent.toFixed(4)}</span>
                <span className="text-gray-500">/ ${dailyLimit}</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-600">Requests Today</Label>
              <div className="flex items-center gap-2">
                <span className="font-mono">{usageStats.requestsToday}</span>
                <span className="text-gray-500">/ {requestLimit}</span>
              </div>
            </div>
          </div>
        )}

        {/* API Key */}
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            OpenAI API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="font-mono"
          />
          <p className="text-xs text-gray-500">
            Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI Platform</a>
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label>AI Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, Cheaper)</SelectItem>
              <SelectItem value="gpt-4">GPT-4 (Smarter, More Expensive)</SelectItem>
              <SelectItem value="gpt-4-turbo-preview">GPT-4 Turbo (Latest)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rate Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dailyLimit">Daily Spending Limit ($)</Label>
            <Input
              id="dailyLimit"
              type="number"
              step="0.01"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseFloat(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestLimit">Daily Request Limit</Label>
            <Input
              id="requestLimit"
              type="number"
              value={requestLimit}
              onChange={(e) => setRequestLimit(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Test Connection */}
        <div className="space-y-2">
          <Button 
            onClick={handleTest} 
            disabled={!apiKey || isTestLoading}
            variant="outline"
            className="w-full"
          >
            {isTestLoading ? 'Testing...' : 'Test API Connection'}
          </Button>
          {testResult && (
            <div className={`text-sm p-2 rounded ${testResult.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult}
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} className="w-full">
          Save Configuration
        </Button>

        {/* Cost Warning */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Cost Warning:</strong> OpenAI API usage incurs charges. Monitor your usage and set appropriate limits to avoid unexpected costs.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}