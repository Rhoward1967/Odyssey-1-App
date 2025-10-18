import DashboardHeader from '@/components/DashboardHeader';
import StatCard from '@/components/StatCard';
import RecentActivityTable from '@/components/RecentActivityTable';
import { Users, Activity, Shield, AlertTriangle } from 'lucide-react';

export default function Index() {
  return (
    <div>
      <DashboardHeader />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Users" value="14" icon={Users} />
        <StatCard title="System Status" value="Operational" icon={Shield} />
        <StatCard title="Server Load" value="12%" icon={Activity} />
        <StatCard title="Pending Alerts" value="3" icon={AlertTriangle} />
      </div>

      {/* The placeholder div has been replaced with our new dynamic table */}
      <RecentActivityTable />
    </div>
  );
}
