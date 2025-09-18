import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from './LoadingSpinner';
import { Shield, User, Lock } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}) => {
  const { user, loading, signIn, signUp, isMaster } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Master user always has access
  if (isMaster) {
    return <>{children}</>;
  }

  // Show loading spinner
  if (loading) {
    return <LoadingSpinner text="Checking authentication..." />;
  }

  // User is authenticated and meets requirements
  if (user && (!requireAdmin || user.role === 'admin')) {
    return <>{children}</>;
  }

  // User needs to authenticate or lacks permissions
  if (!user && requireAuth) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true);
      
      try {
        if (isSignUp) {
          await signUp(email, password, name);
        } else {
          await signIn(email, password);
        }
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-blue-400 mx-auto mb-2" />
            <CardTitle className="text-white">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={authLoading}
              >
                {authLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    {isSignUp ? <User className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                    {isSignUp ? 'Sign Up' : 'Sign In'}
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User lacks required permissions
  if (user && requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-2" />
            <CardTitle className="text-red-300">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300">
              You don't have permission to access this area. Admin privileges required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};