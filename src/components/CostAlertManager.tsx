import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AlertSettings {
  dailyLimit: number;
  monthlyLimit: number;
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushAlerts: boolean;
  alertThreshold: number;
}

export default function CostAlertManager() {
  const [settings, setSettings] = useState<AlertSettings>({
    dailyLimit: 10,
    monthlyLimit: 100,
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    alertThreshold: 80
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('cost-optimization-engine', {
        body: { 
          action: 'set_budget_alert',
          settings
        }
      });

      if (error) throw error;

      toast({
        title: "Alert Settings Saved",
        description: "Your cost monitoring alerts have been updated."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save alert settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Cost Alert Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dailyLimit">Daily Spending Limit ($)</Label>
            <Input
              id="dailyLimit"
              type="number"
              value={settings.dailyLimit}
              onChange={(e) => setSettings({...settings, dailyLimit: Number(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Budget Limit ($)</Label>
            <Input
              id="monthlyLimit"
              type="number"
              value={settings.monthlyLimit}
              onChange={(e) => setSettings({...settings, monthlyLimit: Number(e.target.value)})}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="threshold">Alert Threshold (%)</Label>
          <Select value={settings.alertThreshold.toString()} onValueChange={(value) => setSettings({...settings, alertThreshold: Number(value)})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50% of budget</SelectItem>
              <SelectItem value="70">70% of budget</SelectItem>
              <SelectItem value="80">80% of budget</SelectItem>
              <SelectItem value="90">90% of budget</SelectItem>
              <SelectItem value="95">95% of budget</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Notification Methods</h4>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <Label>Email Alerts</Label>
            </div>
            <Switch
              checked={settings.emailAlerts}
              onCheckedChange={(checked) => setSettings({...settings, emailAlerts: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <Label>SMS Alerts</Label>
            </div>
            <Switch
              checked={settings.smsAlerts}
              onCheckedChange={(checked) => setSettings({...settings, smsAlerts: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Label>Push Notifications</Label>
            </div>
            <Switch
              checked={settings.pushAlerts}
              onCheckedChange={(checked) => setSettings({...settings, pushAlerts: checked})}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? 'Saving...' : 'Save Alert Settings'}
        </Button>
      </CardContent>
    </Card>
  );
}