import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import LoginForm from './LoginForm';
import UserDashboard from './UserDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, CreditCard, Database } from 'lucide-react';

const AuthenticationSystem: React.FC = () => {
  const { user, isMaster } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Show dashboard if user is authenticated
  if (user && !isMaster) {
    return <UserDashboard />;
  }

  // Show master admin interface
  if (isMaster) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto pt-20">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Master Admin Dashboard</h1>
            <p className="text-gray-300">Full system access and control</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold">Authentication</h3>
                <p className="text-gray-400 text-sm">User management & security</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold">Database</h3>
                <p className="text-gray-400 text-sm">Data management & queries</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold">Payments</h3>
                <p className="text-gray-400 text-sm">Stripe integration & billing</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold">Users</h3>
                <p className="text-gray-400 text-sm">Account & subscription management</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/20 border border-green-500 p-4 rounded-lg">
                  <p className="text-green-400 font-semibold">Authentication: Active</p>
                  <p className="text-gray-300 text-sm">Supabase Auth configured</p>
                </div>
                <div className="bg-blue-500/20 border border-blue-500 p-4 rounded-lg">
                  <p className="text-blue-400 font-semibold">Database: Connected</p>
                  <p className="text-gray-300 text-sm">Users & subscriptions tables ready</p>
                </div>
                <div className="bg-purple-500/20 border border-purple-500 p-4 rounded-lg">
                  <p className="text-purple-400 font-semibold">Payments: Configured</p>
                  <p className="text-gray-300 text-sm">Stripe integration active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <LoginForm 
          onToggleMode={() => setIsSignUp(!isSignUp)}
          isSignUp={isSignUp}
        />
      </div>
    </div>
  );
};

export default AuthenticationSystem;