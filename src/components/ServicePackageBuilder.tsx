import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Package, Save } from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  basePrice: number;
  frequency: string;
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: ServiceItem[];
  totalPrice: number;
  frequency: string;
}

export default function ServicePackageBuilder() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [currentPackage, setCurrentPackage] = useState<ServicePackage>({
    id: '',
    name: '',
    description: '',
    services: [],
    totalPrice: 0,
    frequency: 'weekly'
  });
  const [isBuilding, setIsBuilding] = useState(false);

  const availableServices = [
    { id: '1', name: 'Office Cleaning', basePrice: 150, frequency: 'weekly' },
    { id: '2', name: 'Restroom Sanitization', basePrice: 75, frequency: 'daily' },
    { id: '3', name: 'Floor Mopping', basePrice: 50, frequency: 'daily' },
    { id: '4', name: 'Carpet Cleaning', basePrice: 200, frequency: 'monthly' },
    { id: '5', name: 'Window Cleaning', basePrice: 100, frequency: 'bi-weekly' },
    { id: '6', name: 'Trash Removal', basePrice: 40, frequency: 'daily' },
    { id: '7', name: 'Disinfection Service', basePrice: 120, frequency: 'weekly' },
    { id: '8', name: 'Kitchen Deep Clean', basePrice: 180, frequency: 'weekly' }
  ];

  const addServiceToPackage = (serviceId: string) => {
    const service = availableServices.find(s => s.id === serviceId);
    if (service && !currentPackage.services.find(s => s.id === serviceId)) {
      setCurrentPackage(prev => ({
        ...prev,
        services: [...prev.services, service],
        totalPrice: prev.totalPrice + service.basePrice
      }));
    }
  };

  const removeServiceFromPackage = (serviceId: string) => {
    const service = currentPackage.services.find(s => s.id === serviceId);
    if (service) {
      setCurrentPackage(prev => ({
        ...prev,
        services: prev.services.filter(s => s.id !== serviceId),
        totalPrice: prev.totalPrice - service.basePrice
      }));
    }
  };

  const savePackage = () => {
    if (currentPackage.name && currentPackage.services.length > 0) {
      const newPackage = {
        ...currentPackage,
        id: Date.now().toString()
      };
      setPackages(prev => [...prev, newPackage]);
      setCurrentPackage({
        id: '',
        name: '',
        description: '',
        services: [],
        totalPrice: 0,
        frequency: 'weekly'
      });
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Service Package Builder</h2>
        <Button onClick={() => setIsBuilding(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {isBuilding && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Build New Package
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packageName">Package Name</Label>
                <Input
                  id="packageName"
                  value={currentPackage.name}
                  onChange={(e) => setCurrentPackage(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Office Package"
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={currentPackage.frequency} onValueChange={(value) => setCurrentPackage(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentPackage.description}
                onChange={(e) => setCurrentPackage(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this service package..."
              />
            </div>

            <div>
              <Label>Add Services</Label>
              <Select onValueChange={addServiceToPackage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select services to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableServices.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.basePrice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentPackage.services.length > 0 && (
              <div>
                <Label>Selected Services</Label>
                <div className="space-y-2 mt-2">
                  {currentPackage.services.map(service => (
                    <div key={service.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{service.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">${service.basePrice}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeServiceFromPackage(service.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Package Price:</span>
                    <span className="text-xl font-bold text-blue-600">${currentPackage.totalPrice}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button onClick={savePackage} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Package
              </Button>
              <Button variant="outline" onClick={() => setIsBuilding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(pkg => (
          <Card key={pkg.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {pkg.name}
                <Badge>{pkg.frequency}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-3">{pkg.description}</p>
              <div className="space-y-1 mb-3">
                {pkg.services.map(service => (
                  <div key={service.id} className="text-sm text-gray-500">
                    • {service.name}
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-lg font-bold text-green-600">${pkg.totalPrice}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}