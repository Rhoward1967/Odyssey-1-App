import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Copy, Check, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface EnvVariable {
  key: string;
  value: string;
  required: boolean;
  description: string;
  platform: 'vercel' | 'github' | 'supabase' | 'all';
}

export default function EnvironmentVariablesSetup() {
  const [envVars, setEnvVars] = useState<EnvVariable[]>([
    { key: 'VITE_SUPABASE_URL', value: 'https://tvsxloejfsrdganemsmg.supabase.co', required: true, description: 'Supabase project URL', platform: 'all' },
    { key: 'VITE_SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', required: true, description: 'Supabase anonymous key', platform: 'all' },
    { key: 'VERCEL_TOKEN', value: '', required: true, description: 'Vercel deployment token', platform: 'github' },
    { key: 'VERCEL_ORG_ID', value: '', required: true, description: 'Vercel organization ID', platform: 'github' },
    { key: 'VERCEL_PROJECT_ID', value: '', required: true, description: 'Vercel project ID', platform: 'github' },
    { key: 'SUPABASE_ACCESS_TOKEN', value: '', required: false, description: 'Supabase CLI access token', platform: 'github' }
  ]);

  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string>('');

  const updateEnvVar = (key: string, value: string) => {
    setEnvVars(prev => prev.map(env => 
      env.key === key ? { ...env, value } : env
    ));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const toggleShowValue = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusBadge = (envVar: EnvVariable) => {
    const hasValue = envVar.value.trim() !== '';
    if (envVar.required && !hasValue) {
      return <Badge variant="destructive" className="ml-2">Required</Badge>;
    }
    if (hasValue) {
      return <Badge variant="default" className="ml-2 bg-green-600">Set</Badge>;
    }
    return <Badge variant="secondary" className="ml-2">Optional</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-black/20 backdrop-blur-sm border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            Environment Variables Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {envVars.map((envVar) => (
            <div key={envVar.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-white font-medium">
                  {envVar.key}
                  {getStatusBadge(envVar)}
                </Label>
                <Badge variant="outline" className="text-xs">
                  {envVar.platform}
                </Badge>
              </div>
              <p className="text-sm text-gray-300">{envVar.description}</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showValues[envVar.key] ? "text" : "password"}
                    value={envVar.value}
                    onChange={(e) => updateEnvVar(envVar.key, e.target.value)}
                    className="bg-black/30 border-gray-600 text-white pr-20"
                    placeholder={`Enter ${envVar.key}`}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleShowValue(envVar.key)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      {showValues[envVar.key] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(envVar.value, envVar.key)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    >
                      {copiedKey === envVar.key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-black/20 backdrop-blur-sm border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-400" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-white font-medium">1. GitHub Secrets</h4>
            <p className="text-sm text-gray-300">Go to your GitHub repo → Settings → Secrets and variables → Actions</p>
            <p className="text-sm text-gray-300">Add VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-medium">2. Vercel Environment Variables</h4>
            <p className="text-sm text-gray-300">In Vercel dashboard → Project Settings → Environment Variables</p>
            <p className="text-sm text-gray-300">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-medium">3. Local Development</h4>
            <p className="text-sm text-gray-300">Create .env file in project root with VITE_ prefixed variables</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}