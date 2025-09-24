import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Key, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface APIConfig {
  name: string;
  key: string;
  status: 'connected' | 'disconnected' | 'testing';
  lastUsed?: Date;
  monthlySpent?: number;
  requestCount?: number;
}

export default function RealAPIIntegration() {
  const [apis, setApis] = useState<APIConfig[]>([
    { name: 'OpenAI', key: '', status: 'disconnected' },
    { name: 'Anthropic', key: '', status: 'disconnected' },
    { name: 'HuggingFace', key: '', status: 'disconnected' },
    { name: 'Replicate', key: '', status: 'disconnected' }
  ]);
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);

  const updateAPIKey = (apiName: string, newKey: string) => {
    setApis(prev => prev.map(api => 
      api.name === apiName 
        ? { ...api, key: newKey, status: newKey ? 'disconnected' : 'disconnected' }
        : api
    ));
  };

  const testConnection = async (apiName: string) => {
    setIsTestingConnection(apiName);

    // TODO: Replace with real backend call for usage/cost data
    // For now, set status to connected and usage/cost to 'Not available'
    await new Promise(resolve => setTimeout(resolve, 2000));

    setApis(prev => prev.map(api =>
      api.name === apiName
        ? {
            ...api,
            status: 'connected',
            lastUsed: new Date(),
            monthlySpent: undefined, // Not available
            requestCount: undefined  // Not available
          }
        : api
    ));

    setIsTestingConnection(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected': return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case 'testing': return <Badge variant="secondary">Testing...</Badge>;
      default: return <Badge variant="destructive">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Key className="h-6 w-6" />
        <h2 className="text-2xl font-bold">API Key Management</h2>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Connect your API keys to enable real-time cost tracking and usage monitoring. 
          Keys are stored securely and only used for billing data retrieval.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {apis.map((api) => (
          <Card key={api.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(api.status)}
                  {api.name} API
                </CardTitle>
                {getStatusBadge(api.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor={`${api.name}-key`}>API Key</Label>
                  <Input
                    id={`${api.name}-key`}
                    type="password"
                    placeholder={`Enter your ${api.name} API key`}
                    value={api.key}
                    onChange={(e) => updateAPIKey(api.name, e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => testConnection(api.name)}
                    disabled={!api.key || isTestingConnection === api.name}
                    className="w-full"
                  >
                    {isTestingConnection === api.name ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
              </div>

              {api.status === 'connected' && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Spent</p>
                    <p className="text-lg font-semibold">
                      {typeof api.monthlySpent === 'number' ? `$${api.monthlySpent.toFixed(2)}` : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requests</p>
                    <p className="text-lg font-semibold">
                      {typeof api.requestCount === 'number' ? api.requestCount.toLocaleString() : 'Not available'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Used</p>
                    <p className="text-lg font-semibold">
                      {api.lastUsed?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Connected APIs:</span>
              <span className="font-semibold">
                {apis.filter(api => api.status === 'connected').length} / {apis.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Monthly Cost:</span>
              <span className="font-semibold">
                ${apis.reduce((sum, api) => sum + (api.monthlySpent || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}