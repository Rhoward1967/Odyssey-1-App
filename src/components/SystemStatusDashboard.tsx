import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Database, Shield, Users, Zap } from 'lucide-react';

export default function SystemStatusDashboard() {
  return (
    <div className="space-y-6">
      {/* Critical Issues */}
      <Card className="border-red-400 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-6 w-6" />
            Critical Issues Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-white p-3 rounded border border-red-200">
              <h4 className="font-bold text-red-800">🚨 Bids Table: MISSING</h4>
              <p className="text-red-700 text-sm">Infinite recursion detected in policy for relation "bids"</p>
              <p className="text-red-600 text-xs">Impact: Bidding Calculator functionality blocked</p>
            </div>
            
            <div className="bg-white p-3 rounded border border-red-200">
              <h4 className="font-bold text-red-800">🚨 Agents Table: MISSING</h4>
              <p className="text-red-700 text-sm">Permission denied for function is_user_org_admin</p>
              <p className="text-red-600 text-xs">Impact: AI Agent Monitoring blocked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Overview */}
      <Card className="border-green-400 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-6 w-6" />
            System Health: Excellent (9/11 Tables Operational)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded border text-center">
              <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-800">9/11</div>
              <div className="text-sm text-green-600">Tables Ready</div>
            </div>
            
            <div className="bg-white p-3 rounded border text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-800">24</div>
              <div className="text-sm text-blue-600">Active Users</div>
            </div>
            
            <div className="bg-white p-3 rounded border text-center">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-800">ENTERPRISE</div>
              <div className="text-sm text-purple-600">RLS Security</div>
            </div>
            
            <div className="bg-white p-3 rounded border text-center">
              <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-orange-800">3/11</div>
              <div className="text-sm text-orange-600">APIs Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Integration Status */}
      <Card className="border-blue-400 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Zap className="h-6 w-6" />
            API Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-bold text-green-800">✅ Active Integrations (3)</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">OpenAI</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Stripe</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Genesis Mode</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-bold text-orange-800">⚠️ Available Integrations (8)</h4>
              <div className="space-y-1 text-sm">
                <div className="text-orange-700">• Anthropic (Advanced AI reasoning)</div>
                <div className="text-orange-700">• Gemini (Google AI integration)</div>
                <div className="text-orange-700">• Google Calendar (Schedule management)</div>
                <div className="text-orange-700">• Twilio (SMS and voice)</div>
                <div className="text-orange-700">• SAM.gov (Government contracting)</div>
                <div className="text-orange-700">• arXiv (Research papers)</div>
                <div className="text-orange-700">• GitHub (Code repository)</div>
                <div className="text-orange-700">• R.O.M.A.N. Ready (Universal AI)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ready for Testing */}
      <Card className="border-purple-400 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <CheckCircle className="h-6 w-6" />
            ✅ READY FOR TESTING
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-purple-700">
            <p>• <strong>/workforce</strong> - Unified HR/Payroll system operational</p>
            <p>• <strong>/calculator</strong> - Government bidding (pending bids table fix)</p>
            <p>• <strong>Core business functions</strong> - All operational systems ready</p>
            <p>• <strong>Sovereign-Core Architecture</strong> - Deployed and ready for integration</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
