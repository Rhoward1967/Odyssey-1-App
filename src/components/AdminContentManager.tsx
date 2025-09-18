import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtimeAdmin, PricingPlan, FeatureToggle, Announcement } from '@/hooks/useRealtimeAdmin';
import { supabase } from '@/lib/supabase';
import { Edit, Save, Plus, Trash2 } from 'lucide-react';

export const AdminContentManager: React.FC = () => {
  const { pricingPlans, featureToggles, announcements, refetch } = useRealtimeAdmin();
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);

  const updatePricingPlan = async (plan: PricingPlan) => {
    await supabase.from('pricing_plans').update(plan).eq('id', plan.id);
    setEditingPlan(null);
    refetch();
  };

  const toggleFeature = async (feature: FeatureToggle) => {
    await supabase.from('feature_toggles')
      .update({ is_enabled: !feature.is_enabled })
      .eq('id', feature.id);
    refetch();
  };

  const updateAnnouncement = async (announcement: Announcement) => {
    await supabase.from('announcements').update(announcement).eq('id', announcement.id);
    setEditingAnnouncement(null);
    refetch();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    refetch();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Content Management Dashboard</h1>
      
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing">Pricing Plans</TabsTrigger>
          <TabsTrigger value="features">Feature Toggles</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pricingPlans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{plan.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPlan(editingPlan === plan.id ? null : plan.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingPlan === plan.id ? (
                    <div className="space-y-3">
                      <Input
                        value={plan.name}
                        onChange={(e) => {
                          const updated = { ...plan, name: e.target.value };
                          updatePricingPlan(updated);
                        }}
                        placeholder="Plan name"
                      />
                      <Input
                        type="number"
                        value={plan.price}
                        onChange={(e) => {
                          const updated = { ...plan, price: parseFloat(e.target.value) };
                          updatePricingPlan(updated);
                        }}
                        placeholder="Price"
                      />
                      <Button onClick={() => setEditingPlan(null)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-bold">${plan.price}/{plan.billing_period}</p>
                      <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                        {plan.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-2">{plan.features.length} features</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featureToggles.map((feature) => (
              <Card key={feature.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">{feature.feature_name}</CardTitle>
                    <Switch
                      checked={feature.is_enabled}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                  <div className="flex gap-1">
                    {feature.user_types.map((type) => (
                      <Badge key={type} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{announcement.title}</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingAnnouncement(
                          editingAnnouncement === announcement.id ? null : announcement.id
                        )}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingAnnouncement === announcement.id ? (
                    <div className="space-y-3">
                      <Input
                        value={announcement.title}
                        onChange={(e) => {
                          const updated = { ...announcement, title: e.target.value };
                          updateAnnouncement(updated);
                        }}
                        placeholder="Title"
                      />
                      <Textarea
                        value={announcement.message}
                        onChange={(e) => {
                          const updated = { ...announcement, message: e.target.value };
                          updateAnnouncement(updated);
                        }}
                        placeholder="Message"
                      />
                      <Button onClick={() => setEditingAnnouncement(null)}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-2">{announcement.message}</p>
                      <div className="flex gap-2">
                        <Badge variant={announcement.type === 'success' ? 'default' : 
                                      announcement.type === 'warning' ? 'destructive' : 'secondary'}>
                          {announcement.type}
                        </Badge>
                        <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
                          {announcement.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};