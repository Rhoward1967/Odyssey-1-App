import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import { 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Settings,
  Zap,
  Users
} from 'lucide-react';

interface RateLimitStatus {
  tier: 'default' | 'premium' | 'admin';
  limit: number;
  remaining: number;
  resetTime: number;
  isLimited: boolean;
}

interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: string;
  enabled: boolean;
}

export const RateLimitManager: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [configs, setConfigs] = useState<RateLimitConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEndpoint, setTestEndpoint] = useState('');

  useEffect(() => {
    loadRateLimitStatus();
    loadConfigurations();
  }, [user]);

  const loadRateLimitStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('api-rate-limiter', {
        body: {
          endpoint: 'status-check',
          userRole: user?.role,
          userId: user?.id
        }
      });

      if (error) throw error;

      setStatus({
        tier: data.tier,
        limit: data.limit,
        remaining: data.remaining,
        resetTime: data.resetTime,
        isLimited: !data.success
      });
    } catch (error) {
      console.error('Error loading rate limit status:', error);
    }
  };

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      // Fetch live rate limit configs from Supabase table 'api_rate_limits'
      const { data, error } = await supabase
        .from('api_rate_limits')
        .select('*');
      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading rate limit configs:', error);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const testRateLimit = async () => {
    if (!testEndpoint) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('api-rate-limiter', {
        body: {
          endpoint: testEndpoint,
          userRole: user?.role,
          userId: user?.id
        }
      });

      if (error) throw error;
      
      setStatus({
        tier: data.tier,
        limit: data.limit,
        remaining: data.remaining,
        resetTime: data.resetTime,
        isLimited: !data.success
      });
    } catch (error) {
      console.error('Error testing rate limit:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-gold-100 text-gold-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'premium': return <Zap className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          API Rate Limiting
        </h2>
        <Button onClick={loadRateLimitStatus} variant="outline" size="sm">
          Refresh Status
        </Button>
      </div>

      {/* Current Status */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Current Rate Limit Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge className={getTierColor(status.tier)}>
                  {getTierIcon(status.tier)}
                  {status.tier.toUpperCase()} Tier
                </Badge>
                <span className="text-sm text-gray-600">
                  {status.remaining} / {status.limit} requests remaining
                </span>
              </div>
              <div className="flex items-center gap-2">
                {status.isLimited ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className={status.isLimited ? 'text-red-600' : 'text-green-600'}>
                  {status.isLimited ? 'Rate Limited' : 'Active'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Usage</span>
                <span>{Math.round(((status.limit - status.remaining) / status.limit) * 100)}%</span>
              </div>
              <Progress 
                value={((status.limit - status.remaining) / status.limit) * 100} 
                className="h-2"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                Resets: {new Date(status.resetTime * 1000).toLocaleTimeString()}
              </span>
            </div>

            {status.isLimited && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Rate limit exceeded. Please wait until reset time or upgrade your tier.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rate Limit Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Test Rate Limit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter endpoint to test (e.g., /api/ai-chat)"
              value={testEndpoint}
              onChange={(e) => setTestEndpoint(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={testRateLimit} disabled={!testEndpoint}>
              Test Endpoint
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Rate Limit Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configs.map((config, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {config.endpoint}
                    </code>
                    <Badge variant={config.enabled ? 'default' : 'secondary'}>
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {config.limit} requests per {config.window}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button 
                    variant={config.enabled ? 'destructive' : 'default'} 
                    size="sm"
                  >
                    {config.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tier Information */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Default</h3>
              </div>
              <p className="text-2xl font-bold mb-1">100</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h3 className="font-medium">Premium</h3>
              </div>
              <p className="text-2xl font-bold mb-1">1,000</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <h3 className="font-medium">Admin</h3>
              </div>
              <p className="text-2xl font-bold mb-1">10,000</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};