import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Lock, AlertTriangle, Eye, EyeOff, Crown } from 'lucide-react';
import { useArchitect } from './ArchitectRecognitionSystem';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  requiredLevel: 'admin' | 'super-admin' | 'hjs-internal';
  feature: string;
}
export default function AdminAuthGuard({ children, requiredLevel, feature }: AdminAuthGuardProps) {
  const { isArchitect, bypassAllRestrictions, setArchitectStatus } = useArchitect();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ARCHITECT BYPASS - System architect is never restricted
  useEffect(() => {
    if (isArchitect || bypassAllRestrictions) {
      setIsAuthenticated(true);
      console.log('🏗️ ARCHITECT DETECTED - Bypassing all authentication for:', feature);
      return;
    }
  }, [isArchitect, bypassAllRestrictions, feature]);

  // HJS Internal passwords (in production, these would be environment variables)
  const passwords = {
    'admin': 'odyssey-admin-2024',
    'super-admin': 'hjs-super-admin-secure',
    'hjs-internal': 'hjs-internal-operations-2024'
  };

  // Architect master override - never gets locked out
  const architectMasterKey = 'architect-master-override-hjs-2024';
  const isArchitectOverride = password === architectMasterKey;

  // Check for stored architect authentication on mount
  useEffect(() => {
    const storedArchitectAuth = localStorage.getItem('hjs-architect-auth');
    if (storedArchitectAuth === 'authenticated') {
      setIsAuthenticated(true);
      setArchitectStatus(true); // Ensure architect status is set
    }
  }, [setArchitectStatus]);
  const handleAuth = () => {
    // Architect override bypasses all restrictions and sets architect status
    if (isArchitectOverride) {
      setIsAuthenticated(true);
      setAttempts(0);
      setIsLocked(false);
      setArchitectStatus(true); // Set architect status globally
      
      // Store architect authentication permanently
      localStorage.setItem('hjs-architect-auth', 'authenticated');
      localStorage.setItem('hjs-architect-permanent-token', 'hjs-architect-permanent-access-2024');
      sessionStorage.setItem('hjs-architect-session', 'architect-session-active');
      
      console.log('🏗️ ARCHITECT MASTER KEY USED - Permanent Access Granted');
      return;
    }

    if (isLocked && !isArchitectOverride && !isArchitect) return;

    // Check both regular password and architect override
    if (password === passwords[requiredLevel] || password === architectMasterKey) {
      setIsAuthenticated(true);
      setAttempts(0);
      
      // Store architect authentication if using master key
      if (password === architectMasterKey) {
        setArchitectStatus(true);
        localStorage.setItem('hjs-architect-auth', 'authenticated');
        localStorage.setItem('hjs-architect-permanent-token', 'hjs-architect-permanent-access-2024');
      }
    } else {
      setAttempts(prev => prev + 1);
      setPassword('');
      
      // Architect can never be locked out
      if (attempts >= 2 && !isArchitect) {
        setIsLocked(true);
        setTimeout(() => setIsLocked(false), 300000); // 5 minute lockout
      }
    }
  };

  // ARCHITECT BYPASS - Show architect status if recognized
  if (isAuthenticated) {
    return (
      <>
        {isArchitect && (
          <div className="fixed top-4 right-4 z-50">
            <Badge className="bg-yellow-600 text-black font-bold animate-pulse">
              <Crown className="h-4 w-4 mr-1" />
              🏗️ ARCHITECT MODE
            </Badge>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900/90 border-red-600 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-red-600/20 rounded-full">
              <Shield className="h-12 w-12 text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            RESTRICTED ACCESS
          </CardTitle>
          <Badge variant="destructive" className="mx-auto mt-2">
            {requiredLevel.toUpperCase()} ONLY
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              {feature}
            </h3>
            <p className="text-gray-400 text-sm">
              This feature contains sensitive HJS Services LLC and Odyssey-1 internal operations data
            </p>
          </div>

          {isLocked ? (
            <div className="text-center p-4 bg-red-900/30 border border-red-600 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300 font-semibold">Account Locked</p>
              <p className="text-gray-400 text-sm">Too many failed attempts. Try again in 5 minutes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                   placeholder={isArchitectOverride ? "🏗️ ARCHITECT ACCESS DETECTED" : "Enter admin password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
                  className="bg-gray-800 border-gray-600 text-white pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              {/* Remember Me checkbox - show for architect override or regular users */}
              {(isArchitectOverride || password === passwords[requiredLevel]) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-auth"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-600 data-[state=checked]:bg-red-600"
                  />
                  <label
                    htmlFor="remember-auth"
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    {isArchitectOverride ? '🏗️ Remember Architect Access' : 'Remember Authentication'}
                  </label>
                </div>
              )}

              <Button 
                onClick={handleAuth}
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={!password.trim()}
              >
                <Lock className="h-4 w-4 mr-2" />
                Authenticate
              </Button>

              {attempts > 0 && (
                <p className="text-red-400 text-sm text-center">
                  Invalid password. Attempts: {attempts}/3
                </p>
              )}
            </div>
          )}

          <div className="text-center text-xs text-gray-500 border-t border-gray-700 pt-4">
            <p>⚠️ AUTHORIZED PERSONNEL ONLY</p>
            <p>HJS SERVICES LLC & ODYSSEY-1 INTERNAL</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}