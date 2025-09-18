import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useRealtimeContent, SiteContent, Service, Testimonial } from '@/hooks/useRealtimeContent';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export const ContentManager = () => {
  const { content, services, testimonials, loading } = useRealtimeContent();
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const updateContent = async (id: string, updates: Partial<SiteContent>) => {
    const { error } = await supabase
      .from('site_content')
      .update(updates)
      .eq('id', id);
    
    if (error) console.error('Error updating content:', error);
    else setEditingContent(null);
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    const { error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id);
    
    if (error) console.error('Error updating service:', error);
    else setEditingService(null);
  };

  const updateTestimonial = async (id: string, updates: Partial<Testimonial>) => {
    const { error } = await supabase
      .from('testimonials')
      .update(updates)
      .eq('id', id);
    
    if (error) console.error('Error updating testimonial:', error);
    else setEditingTestimonial(null);
  };

  if (loading) {
    return <div className="p-8">Loading content manager...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Content Manager</h1>
      <p className="text-gray-600">Manage your website content in real-time. Changes appear instantly on the live site.</p>
      
      {/* Site Content Section */}
      <Card>
        <CardHeader>
          <CardTitle>Site Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {content.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                {editingContent?.id === item.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingContent.title}
                      onChange={(e) => setEditingContent({...editingContent, title: e.target.value})}
                      placeholder="Title"
                    />
                    <Textarea
                      value={editingContent.description}
                      onChange={(e) => setEditingContent({...editingContent, description: e.target.value})}
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => updateContent(item.id, editingContent)}>
                        <Save className="h-4 w-4 mr-2" />Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingContent(null)}>
                        <X className="h-4 w-4 mr-2" />Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="secondary">{item.section}</Badge>
                      <h3 className="font-semibold mt-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditingContent(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Services Section */}
      <Card>
        <CardHeader>
          <CardTitle>Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                {editingService?.id === service.id ? (
                  <div className="space-y-4">
                    <Input
                      value={editingService.name}
                      onChange={(e) => setEditingService({...editingService, name: e.target.value})}
                      placeholder="Service Name"
                    />
                    <Textarea
                      value={editingService.description}
                      onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        value={editingService.price_monthly}
                        onChange={(e) => setEditingService({...editingService, price_monthly: parseFloat(e.target.value)})}
                        placeholder="Monthly Price"
                      />
                      <Input
                        type="number"
                        value={editingService.price_yearly}
                        onChange={(e) => setEditingService({...editingService, price_yearly: parseFloat(e.target.value)})}
                        placeholder="Yearly Price"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => updateService(service.id, editingService)}>
                        <Save className="h-4 w-4 mr-2" />Save
                      </Button>
                      <Button variant="outline" onClick={() => setEditingService(null)}>
                        <X className="h-4 w-4 mr-2" />Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        {service.is_featured && <Badge>Featured</Badge>}
                      </div>
                      <p className="text-gray-600 mb-2">{service.description}</p>
                      <p className="text-lg font-bold text-blue-600">
                        ${service.price_monthly}/mo | ${service.price_yearly}/yr
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setEditingService(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};