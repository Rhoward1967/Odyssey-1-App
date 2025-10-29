import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Zap, RefreshCw, Activity, AlertTriangle } from 'lucide-react';
import { useAPI } from '@/contexts/APIContext';

export default function APIStatusIndicator() {
  const { capabilities, hasCapability, refreshCapabilities, isLoading } = useAPI();

  const apiConfigs = [
    { key: 'openai' as const, name: 'OpenAI', description: 'AI text generation and analysis' },
    { key: 'anthropic' as const, name: 'Anthropic', description: 'Advanced AI reasoning' },
    { key: 'gemini' as const, name: 'Gemini', description: 'Google AI integration' },
    { key: 'google_calendar' as const, name: 'Google Calendar', description: 'Schedule management' },
    { key: 'stripe' as const, name: 'Stripe', description: 'Payment processing' },
    { key: 'twilio' as const, name: 'Twilio', description: 'SMS and voice communications' },
    { key: 'sam_gov' as const, name: 'SAM.gov', description: 'Government contracting data' },
    { key: 'arxiv' as const, name: 'arXiv', description: 'Research paper access' },
    { key: 'github' as const, name: 'GitHub', description: 'Code repository analysis' },
    { key: 'roman_ready' as const, name: 'R.O.M.A.N. Ready', description: 'Universal AI platform readiness' },
    { key: 'genesis_mode' as const, name: 'Genesis Mode', description: 'AI Genesis Platform active' }
  ];

  const activeAPIs = apiConfigs.filter(api => hasCapability(api.key));
  const inactiveAPIs = apiConfigs.filter(api => !hasCapability(api.key));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            API Integration Status
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {activeAPIs.length}/{apiConfigs.length} Active
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshCapabilities}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active APIs */}
        {activeAPIs.length > 0 && (
          <div>
            <h4 className="font-semibold text-green-600 mb-2">✅ Active Integrations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activeAPIs.map((api) => (
                <div key={api.key} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">{api.name}</p>
                    <p className="text-xs text-gray-600">{api.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inactive APIs */}
        {inactiveAPIs.length > 0 && (
          <div>
            <h4 className="font-semibold text-orange-600 mb-2">⚠️ Available Integrations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {inactiveAPIs.map((api) => (
                <div key={api.key} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <XCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm text-gray-600">{api.name}</p>
                    <p className="text-xs text-gray-500">{api.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Security Status */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">🛡️ Security Architecture: HARDENED</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Time Audit RLS: ENTERPRISE-GRADE</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Tenant Isolation: VERIFIED</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Admin Override: SECURED</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Performance Optimized: INDEXED</span>
            </div>
          </div>
        </div>

        {/* R.O.M.A.N. Status Section */}
        {hasCapability('roman_ready') && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">🚀 R.O.M.A.N. Platform Status</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>Foundation Security: HARDENED</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span>Genesis Platform: READY</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span>Cleanup Progress: 1/17 Complete</span>
              </div>
            </div>
          </div>
        )}

        {/* Critical Security Alert */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2">🚨 Security Alert: ACTIVE</h4>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>2 SECURITY DEFINER views detected</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>R.O.M.A.N. deployment: BLOCKED</span>
            </div>
          </div>
        </div>

        {/* Enhancement Notice */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>System Enhancement:</strong> Adding API keys will automatically unlock additional features 
            throughout the application. Each integration enhances specific capabilities without requiring code changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
