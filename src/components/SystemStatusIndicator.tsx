import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

export default function SystemStatusIndicator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          System Cleanup Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Security Progress */}
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Security Hardening</span>
            </div>
            <span className="text-green-600 font-semibold">COMPLETE</span>
          </div>

          {/* Errors Status */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Critical Errors</span>
            </div>
            <span className="text-orange-600 font-semibold">2 INVESTIGATING</span>
          </div>

          {/* Warnings Queue */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Warnings Queue</span>
            </div>
            <span className="text-yellow-600 font-semibold">16 PENDING</span>
          </div>

          {/* R.O.M.A.N. Status */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-purple-800">R.O.M.A.N. Ready</span>
            </div>
            <span className="text-purple-600 font-semibold">WAITING</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
