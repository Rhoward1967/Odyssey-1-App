import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { openAIService } from '../services/openai';

export default function OpenAISetupGuide() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    
    openAIService.updateConfig({ apiKey: apiKey.trim() });
    setTestResult('API key saved successfully!');
    setTimeout(() => setTestResult(''), 3000);
  };

  const testConnection = async () => {
    if (!apiKey.trim()) return;
    
    setTesting(true);
    setTestResult('');
    
    try {
      // Temporarily update the service with the new key
      openAIService.updateConfig({ apiKey: apiKey.trim() });
      
      const response = await openAIService.chat(
        'Say hello in a friendly way', 
        'You are ODYSSEY-1, a helpful AI assistant. Respond naturally and conversationally.'
      );
      
      setTestResult(`✅ Success! Response: "${response}"`);
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Connection failed'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔑 OpenAI API Setup</span>
            <Badge variant="outline">Required</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              <strong>To use ODYSSEY-1's voice features, you need an OpenAI API key.</strong>
              <br />
              Get one free at: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">platform.openai.com/api-keys</a>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
                className="flex-1"
              >
                Save API Key
              </Button>
              <Button 
                onClick={testConnection}
                disabled={!apiKey.trim() || testing}
                variant="outline"
                className="flex-1"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
            </div>

            {testResult && (
              <Alert>
                <AlertDescription>{testResult}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Quick Setup Steps:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-gray-600">
              <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600">OpenAI API Keys</a></li>
              <li>Sign up or log in to your account</li>
              <li>Click "Create new secret key"</li>
              <li>Copy the key (starts with "sk-")</li>
              <li>Paste it above and click "Save API Key"</li>
              <li>Test the connection to verify it works</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}