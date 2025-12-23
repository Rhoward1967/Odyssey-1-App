import React, { useState, useEffect } from 'react';
import { CalendarView } from './CalendarView';
import { AppointmentScheduler } from './AppointmentScheduler';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface AppointmentStats {
  total: number;
  today: number;
  thisWeek: number;
  upcoming: number;
}

export function CalendarDashboard() {
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    upcoming: 0
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStats();
  }, [refreshKey]);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Total appointments
      const { count: total } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      // Today's appointments
      const { count: todayCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());

      // This week's appointments
      const { count: weekCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', weekStart.toISOString())
        .lt('start_time', weekEnd.toISOString());

      // Upcoming appointments (future)
      const { count: upcomingCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', now.toISOString())
        .eq('status', 'scheduled');

      setStats({
        total: total || 0,
        today: todayCount || 0,
        thisWeek: weekCount || 0,
        upcoming: upcomingCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAppointmentCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Calendar & Appointments</h1>
          <p className="text-gray-300 mt-1">Manage your schedule and appointments</p>
        </div>
        <AppointmentScheduler onAppointmentCreated={handleAppointmentCreated} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Appointments</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Today</p>
                <p className="text-2xl font-bold text-white">{stats.today}</p>
              </div>
              <Clock className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">This Week</p>
                <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/20 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Upcoming</p>
                <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl p-6">
        <CalendarView 
          onNewAppointment={() => {
            // This could trigger the appointment scheduler
            const event = new CustomEvent('openAppointmentScheduler');
            window.dispatchEvent(event);
          }} 
        />
      </div>
    </div>
  );
}