import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { supabase } from '../lib/supabase';
import { Heart, Calendar, DollarSign, Users } from 'lucide-react';

interface BenefitPlan {
  id: string;
  name: string;
  type: 'health' | 'dental' | 'vision' | 'life' | '401k';
  employee_cost: number;
  company_contribution: number;
  enrolled_count: number;
  total_employees: number;
}

interface LeaveRequest {
  id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'denied';
  days_requested: number;
}

const EmployeeBenefitsManager: React.FC = () => {
  const [benefitPlans, setBenefitPlans] = useState<BenefitPlan[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenefitsData();
  }, []);

  const loadBenefitsData = async () => {
    try {
      setLoading(true);
      
      // Load benefit plans from Supabase
      const { data: benefitsData, error: benefitsError } = await supabase
        .from('benefit_plans')
        .select('*');

      if (benefitsError) throw benefitsError;
      setBenefitPlans(benefitsData || []);

      // Load leave requests from Supabase
      const { data: leaveData, error: leaveError } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (leaveError) throw leaveError;
      setLeaveRequests(leaveData || []);
    } catch (error) {
      console.error('Error loading benefits data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveAction = async (requestId: string, action: 'approve' | 'deny') => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ status: action === 'approve' ? 'approved' : 'denied' })
        .eq('id', requestId);

      if (error) throw error;

      setLeaveRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: action === 'approve' ? 'approved' : 'denied' } : req
        )
      );
    } catch (error) {
      console.error('Error updating leave request:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Benefits & Leave Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Benefit Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {benefitPlans.map((plan) => (
              <div key={plan.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <Badge variant="outline">{plan.type}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Employee Cost:</span>
                    <div className="font-medium">${plan.employee_cost}/month</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Company Pays:</span>
                    <div className="font-medium text-green-600">${plan.company_contribution}/month</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Enrollment:</span>
                    <div className="font-medium">{plan.enrolled_count}/{plan.total_employees}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Participation:</span>
                    <div className="font-medium">{Math.round((plan.enrolled_count / plan.total_employees) * 100)}%</div>
                  </div>
                </div>
                <Button className="w-full mt-3" size="sm">
                  Manage Enrollment
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {leaveRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No leave requests</p>
            ) : (
              leaveRequests.map((request) => (
                <div key={request.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{request.employee_name}</h3>
                    <Badge 
                      variant={request.status === 'approved' ? 'default' : 
                              request.status === 'denied' ? 'destructive' : 'secondary'}
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Type:</strong> {request.leave_type}</div>
                    <div><strong>Dates:</strong> {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}</div>
                    <div><strong>Days:</strong> {request.days_requested}</div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        onClick={() => handleLeaveAction(request.id, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleLeaveAction(request.id, 'deny')}
                      >
                        Deny
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeBenefitsManager;