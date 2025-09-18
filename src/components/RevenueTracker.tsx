import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Target, TrendingUp, Calendar, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Milestone {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
  reward: string;
}

interface RevenueMetrics {
  monthlyRecurring: number;
  oneTime: number;
  projected: number;
  growth: number;
}

export default function RevenueTracker() {
  const [metrics] = useState<RevenueMetrics>({
    monthlyRecurring: 12450,
    oneTime: 8900,
    projected: 28500,
    growth: 23.5
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      title: 'First $10K MRR',
      target: 10000,
      current: 12450,
      deadline: '2024-12-31',
      status: 'completed',
      reward: 'Team bonus + celebration'
    },
    {
      id: '2',
      title: '$25K Monthly Revenue',
      target: 25000,
      current: 21350,
      deadline: '2025-03-31',
      status: 'in-progress',
      reward: 'Product expansion budget'
    },
    {
      id: '3',
      title: '100 Enterprise Clients',
      target: 100,
      current: 67,
      deadline: '2025-06-30',
      status: 'in-progress',
      reward: 'Dedicated enterprise team'
    },
    {
      id: '4',
      title: '$100K ARR',
      target: 100000,
      current: 149400,
      deadline: '2025-12-31',
      status: 'completed',
      reward: 'Series A funding round'
    }
  ]);

  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateMilestone = async (milestoneId: string) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('cost-optimization-engine', {
        body: { 
          action: 'update_milestone',
          milestoneId
        }
      });

      if (error) throw error;

      toast({
        title: "Milestone Updated",
        description: "Revenue milestone progress has been updated."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update milestone.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in-progress': return 'secondary';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${metrics.monthlyRecurring.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Monthly Recurring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">${metrics.oneTime.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">One-time Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${metrics.projected.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Projected (Next Month)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">+{metrics.growth}%</div>
              <div className="text-sm text-muted-foreground">Growth Rate</div>
            </div>
          </div>

          <Tabs defaultValue="milestones">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="milestones">Revenue Milestones</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="milestones" className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge variant={getStatusColor(milestone.status)}>
                        {milestone.status === 'completed' && <Award className="h-3 w-3 mr-1" />}
                        {milestone.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {milestone.deadline}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>${milestone.current.toLocaleString()} / ${milestone.target.toLocaleString()}</span>
                      <span>{getProgressPercentage(milestone.current, milestone.target).toFixed(1)}%</span>
                    </div>
                    <Progress value={getProgressPercentage(milestone.current, milestone.target)} />
                  </div>
                  
                  <div className="text-sm text-blue-600">
                    🎁 Reward: {milestone.reward}
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-medium">Revenue Insights</h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 mt-0.5 text-green-600" />
                    <div>
                      <div className="font-medium">Strong MRR Growth</div>
                      <div className="text-muted-foreground">Monthly recurring revenue up 23.5% from last month</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="h-4 w-4 mt-0.5 text-blue-600" />
                    <div>
                      <div className="font-medium">Milestone Achievement</div>
                      <div className="text-muted-foreground">2 of 4 major milestones completed ahead of schedule</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 mt-0.5 text-green-600" />
                    <div>
                      <div className="font-medium">Revenue Diversification</div>
                      <div className="text-muted-foreground">58% recurring, 42% one-time - healthy balance</div>
                    </div>
                  </li>
                </ul>
                
                <Button onClick={() => handleUpdateMilestone('all')} disabled={isUpdating} className="w-full">
                  {isUpdating ? 'Updating...' : 'Refresh Revenue Data'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}