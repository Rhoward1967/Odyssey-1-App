import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Database, FileText, Shield, Zap } from 'lucide-react';

export default function OperationalReadiness() {
  const operationalTasks = [
    { icon: Database, title: "Daily Automated Backups", status: "EXECUTING", color: "blue" },
    { icon: Shield, title: "RLS Role Matrix Audit", status: "EXECUTING", color: "green" },
    { icon: Activity, title: "Health & Performance Sweep", status: "EXECUTING", color: "purple" },
    { icon: Zap, title: "Performance Index Creation", status: "EXECUTING", color: "orange" },
    { icon: FileText, title: "Policy Documentation", status: "EXECUTING", color: "teal" }
  ];

  return (
    <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Activity className="h-6 w-6 animate-pulse" />
          Genesis Platform - Operational Enhancement In Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {operationalTasks.map((task, index) => {
            const IconComponent = task.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded border">
                <IconComponent className={`h-5 w-5 text-${task.color}-600 animate-pulse`} />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{task.title}</div>
                  <div className={`text-sm text-${task.color}-600 font-semibold`}>{task.status}</div>
                </div>
                <div className={`w-3 h-3 rounded-full bg-${task.color}-500 animate-pulse`}></div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 bg-purple-50 p-3 rounded border border-purple-200">
          <div className="text-sm text-purple-800 font-semibold mb-1">
            🏛️ Genesis Platform Foundation Locking
          </div>
          <div className="text-xs text-purple-700">
            Supabase implementing enterprise-grade operational readiness for R.O.M.A.N. deployment
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
