import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { onboardNewEmployee, type OnboardingData } from '@/lib/supabase/employee-integration';
import { Clock, Heart, UserPlus } from 'lucide-react';
import { useState } from 'react';

export default function EmployeeOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department: 'Facilities',
    hourly_rate: 15.00,
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
    time_tracking_enabled: true,
    benefits_eligible: true,
    system_access_level: 'employee',
    organization_id: 1 // Will be dynamic per company
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const result = await onboardNewEmployee(formData as OnboardingData);
      
      if (result.success) {
        alert(`Employee onboarded successfully! All systems updated automatically.`);
        // Reset form or redirect
      } else {
        alert(result.error || 'Onboarding failed');
      }
    } catch (error) {
      alert('Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-6 w-6" />
          Employee Onboarding System
        </CardTitle>
        <p className="text-gray-600">
          Complete employee setup - automatically integrates with all HR, Payroll, and Time systems
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={currentStep.toString()} onValueChange={(value) => setCurrentStep(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1">Basic Info</TabsTrigger>
            <TabsTrigger value="2">Job Details</TabsTrigger>
            <TabsTrigger value="3">System Access</TabsTrigger>
            <TabsTrigger value="4">Review</TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-4">
            <h3 className="font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="2" className="space-y-4">
            <h3 className="font-semibold">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="e.g. Custodian, Supervisor"
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={formData.department} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="hire_date">Hire Date *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, hire_date: e.target.value }))}
                  required
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="3" className="space-y-6">
            <h3 className="font-semibold">System Access & Permissions</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="time_tracking"
                  checked={formData.time_tracking_enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, time_tracking_enabled: !!checked }))
                  }
                />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Label htmlFor="time_tracking">Enable Time Tracking</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="benefits_eligible"
                  checked={formData.benefits_eligible}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, benefits_eligible: !!checked }))
                  }
                />
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <Label htmlFor="benefits_eligible">Benefits Eligible</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="access_level">System Access Level</Label>
                <Select 
                  value={formData.system_access_level} 
                  onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, system_access_level: value as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee (Basic Access)</SelectItem>
                    <SelectItem value="supervisor">Supervisor (Team Management)</SelectItem>
                    <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="4" className="space-y-4">
            <h3 className="font-semibold">Review & Confirm</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p><strong>Name:</strong> {formData.first_name} {formData.last_name}</p>
              <p><strong>Position:</strong> {formData.position} - {formData.department}</p>
              <p><strong>Rate:</strong> ${formData.hourly_rate}/hour</p>
              <p><strong>Start Date:</strong> {formData.hire_date}</p>
              <p><strong>Access Level:</strong> {formData.system_access_level}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Systems Integration</h4>
              <ul className="text-sm space-y-1">
                <li>✅ Employee record created in HR system</li>
                <li>✅ Time tracking permissions configured</li>
                <li>✅ Payroll system setup with hourly rate</li>
                <li>✅ Benefits eligibility established</li>
                <li>✅ System access level assigned</li>
              </ul>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Onboarding Employee...' : 'Complete Onboarding'}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button 
            onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
            disabled={currentStep === 4}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}