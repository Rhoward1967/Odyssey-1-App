import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Briefcase, Clock, Edit2, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Service {
  id: number;
  name: string;
  description?: string;
  rate_cents: number;
  rate_type: string;
  time_estimate_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ServiceCatalog() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rate_dollars: '',
    rate_type: 'flat_rate',
    time_estimate_minutes: '',
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching services:', error);
      alert(`Failed to load services: ${error.message}`);
    } else {
      setServices(data || []);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert('Service name is required');
      return;
    }
    if (!formData.rate_dollars || parseFloat(formData.rate_dollars) < 0) {
      alert('Please enter a valid rate');
      return;
    }

    setIsLoading(true);

    // Convert dollars to cents (CRITICAL for backend compatibility)
    const rate_cents = Math.round(parseFloat(formData.rate_dollars) * 100);
    
    const serviceData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      rate_cents,
      rate_type: formData.rate_type,
      time_estimate_minutes: formData.time_estimate_minutes 
        ? parseInt(formData.time_estimate_minutes) 
        : null,
      is_active: true,
    };

    try {
      if (editingId) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingId);
        
        if (error) throw error;
        alert('✅ Service updated successfully!');
      } else {
        // Insert new service (user_id set automatically by trigger)
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);
        
        if (error) throw error;
        alert('✅ Service added to catalog!');
      }

      // Reset form
      resetForm();
      fetchServices();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      description: service.description || '',
      rate_dollars: (service.rate_cents / 100).toFixed(2),
      rate_type: service.rate_type,
      time_estimate_minutes: service.time_estimate_minutes?.toString() || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deactivate "${name}" from catalog?`)) return;
    
    setIsLoading(true);
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('Service deactivated');
      fetchServices();
    }
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rate_dollars: '',
      rate_type: 'flat_rate',
      time_estimate_minutes: '',
    });
    setEditingId(null);
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRateTypeLabel = (rateType: string) => {
    switch (rateType) {
      case 'hourly': return '/hour';
      case 'per_sqft': return '/sq ft';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">Service Catalog</h2>
        </div>
        <div className="text-sm text-gray-600">
          {services.length} service{services.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? 'Edit Service' : 'Add New Service'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1">
                Service Name <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Vacuum All Carpeted Areas"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Rate <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  value={formData.rate_dollars}
                  onChange={(e) => setFormData({ ...formData, rate_dollars: e.target.value })}
                  placeholder="25.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rate Type</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.rate_type}
                onChange={(e) => setFormData({ ...formData, rate_type: e.target.value })}
              >
                <option value="flat_rate">Flat Rate</option>
                <option value="hourly">Per Hour</option>
                <option value="per_sqft">Per Square Foot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Time Estimate (minutes)
              </label>
              <Input
                type="number"
                min="0"
                value={formData.time_estimate_minutes}
                onChange={(e) => setFormData({ ...formData, time_estimate_minutes: e.target.value })}
                placeholder="30"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Thorough vacuuming of all carpeted floors, including high-traffic areas..."
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : editingId ? 'Update Service' : 'Add to Catalog'}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Available Services</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'No services match your search' : 'No services in catalog yet. Add one above!'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{service.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium text-purple-600">
                        ${(service.rate_cents / 100).toFixed(2)}
                      </span>
                      <span className="text-gray-400">
                        {getRateTypeLabel(service.rate_type)}
                      </span>
                      {service.time_estimate_minutes && (
                        <>
                          <span className="mx-2">•</span>
                          <Clock className="h-3 w-3 inline mr-1" />
                          <span>~{service.time_estimate_minutes} min</span>
                        </>
                      )}
                    </div>
                    {service.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {service.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit Rate
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(service.id, service.name)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
