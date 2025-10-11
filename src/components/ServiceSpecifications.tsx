import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CheckSquare, Clock, Droplets, Broom, Sparkles } from 'lucide-react';

interface ServiceSpec {
  id: string;
  name: string;
  category: string;
  frequency: string;
  description: string;
  estimatedTime: string;
  difficulty: 'Basic' | 'Standard' | 'Advanced' | 'Specialized';
}

interface ServiceSpecificationsProps {
  selectedSpecs: string[];
  onSpecToggle: (specId: string) => void;
}

const ServiceSpecifications: React.FC<ServiceSpecificationsProps> = ({ selectedSpecs, onSpecToggle }) => {
  const serviceSpecs: ServiceSpec[] = [
    // Daily Cleaning Services
    { id: 'empty-trash', name: 'Empty Trash & Replace Liners', category: 'Daily Cleaning', frequency: 'Daily', description: 'Empty all waste receptacles and replace with new liners', estimatedTime: '15 min/room', difficulty: 'Basic' },
    { id: 'vacuum-carpets', name: 'Vacuum Carpeted Areas', category: 'Daily Cleaning', frequency: 'Daily', description: 'Thorough vacuuming of all carpeted floors and rugs', estimatedTime: '5 min/100 sqft', difficulty: 'Basic' },
    { id: 'sweep-mop', name: 'Sweep & Mop Hard Floors', category: 'Daily Cleaning', frequency: 'Daily', description: 'Sweep and damp mop all hard surface floors', estimatedTime: '3 min/100 sqft', difficulty: 'Basic' },
    { id: 'dust-surfaces', name: 'Dust All Surfaces', category: 'Daily Cleaning', frequency: 'Daily', description: 'Dust desks, tables, windowsills, and accessible surfaces', estimatedTime: '2 min/surface', difficulty: 'Basic' },
    { id: 'clean-restrooms', name: 'Clean & Sanitize Restrooms', category: 'Daily Cleaning', frequency: 'Daily', description: 'Complete restroom cleaning and sanitization', estimatedTime: '20 min/restroom', difficulty: 'Standard' },
    { id: 'restock-supplies', name: 'Restock Restroom Supplies', category: 'Daily Cleaning', frequency: 'Daily', description: 'Refill paper products, soap, and sanitizers', estimatedTime: '5 min/restroom', difficulty: 'Basic' },

    // Weekly Services
    { id: 'detail-vacuum', name: 'Detail Vacuum Edges & Corners', category: 'Weekly Services', frequency: 'Weekly', description: 'Vacuum edges, corners, and under furniture', estimatedTime: '10 min/room', difficulty: 'Standard' },
    { id: 'clean-glass', name: 'Clean Interior Glass & Mirrors', category: 'Weekly Services', frequency: 'Weekly', description: 'Clean all interior glass surfaces and mirrors', estimatedTime: '2 min/pane', difficulty: 'Standard' },
    { id: 'dust-high-surfaces', name: 'Dust High Surfaces & Light Fixtures', category: 'Weekly Services', frequency: 'Weekly', description: 'Dust ceiling fans, light fixtures, and high shelving', estimatedTime: '5 min/fixture', difficulty: 'Standard' },
    { id: 'sanitize-phones', name: 'Sanitize Phones & Equipment', category: 'Weekly Services', frequency: 'Weekly', description: 'Disinfect phones, keyboards, and shared equipment', estimatedTime: '1 min/item', difficulty: 'Standard' },
    { id: 'clean-baseboards', name: 'Clean Baseboards & Door Frames', category: 'Weekly Services', frequency: 'Weekly', description: 'Wipe down baseboards and door frames', estimatedTime: '15 min/room', difficulty: 'Standard' },

    // Monthly Services  
    { id: 'deep-carpet', name: 'Deep Carpet Cleaning', category: 'Monthly Services', frequency: 'Monthly', description: 'Hot water extraction carpet cleaning', estimatedTime: '20 min/100 sqft', difficulty: 'Advanced' },
    { id: 'floor-maintenance', name: 'Hard Floor Deep Cleaning', category: 'Monthly Services', frequency: 'Monthly', description: 'Strip, clean, and refinish hard floors', estimatedTime: '45 min/100 sqft', difficulty: 'Advanced' },
    { id: 'window-cleaning', name: 'Exterior Window Cleaning', category: 'Monthly Services', frequency: 'Monthly', description: 'Clean exterior windows (ground level)', estimatedTime: '5 min/window', difficulty: 'Standard' },
    { id: 'upholstery-clean', name: 'Upholstery Cleaning', category: 'Monthly Services', frequency: 'Monthly', description: 'Professional cleaning of office furniture', estimatedTime: '30 min/piece', difficulty: 'Advanced' },

    // Specialized Services
    { id: 'biohazard-cleanup', name: 'Biohazard Cleanup', category: 'Specialized', frequency: 'As Needed', description: 'Safe cleanup of biological contaminants', estimatedTime: 'Variable', difficulty: 'Specialized' },
    { id: 'post-construction', name: 'Post-Construction Cleanup', category: 'Specialized', frequency: 'As Needed', description: 'Detailed cleanup after construction work', estimatedTime: '60 min/100 sqft', difficulty: 'Specialized' },
    { id: 'pressure-washing', name: 'Pressure Washing', category: 'Specialized', frequency: 'Quarterly', description: 'Exterior building and walkway cleaning', estimatedTime: '30 min/100 sqft', difficulty: 'Advanced' },
    { id: 'hvac-cleaning', name: 'HVAC Vent Cleaning', category: 'Specialized', frequency: 'Bi-Annual', description: 'Clean air vents and ductwork', estimatedTime: '15 min/vent', difficulty: 'Specialized' },
    { id: 'graffiti-removal', name: 'Graffiti Removal', category: 'Specialized', frequency: 'As Needed', description: 'Safe removal of graffiti and markings', estimatedTime: 'Variable', difficulty: 'Specialized' },

    // Medical/Healthcare Specific
    { id: 'medical-waste', name: 'Medical Waste Disposal', category: 'Healthcare', frequency: 'Daily', description: 'Proper disposal of medical waste', estimatedTime: '10 min/room', difficulty: 'Specialized' },
    { id: 'isolation-cleaning', name: 'Isolation Room Cleaning', category: 'Healthcare', frequency: 'After Each Use', description: 'Deep sanitization of isolation rooms', estimatedTime: '45 min/room', difficulty: 'Specialized' },
    { id: 'operating-room', name: 'Operating Room Cleaning', category: 'Healthcare', frequency: 'After Each Use', description: 'Sterile cleaning of surgical suites', estimatedTime: '60 min/room', difficulty: 'Specialized' },

    // Food Service Specific
    { id: 'kitchen-deep', name: 'Commercial Kitchen Deep Clean', category: 'Food Service', frequency: 'Weekly', description: 'Deep cleaning of kitchen equipment and surfaces', estimatedTime: '120 min/kitchen', difficulty: 'Advanced' },
    { id: 'grease-trap', name: 'Grease Trap Cleaning', category: 'Food Service', frequency: 'Monthly', description: 'Clean and maintain grease traps', estimatedTime: '30 min/trap', difficulty: 'Specialized' },
    { id: 'hood-cleaning', name: 'Exhaust Hood Cleaning', category: 'Food Service', frequency: 'Quarterly', description: 'Professional hood and duct cleaning', estimatedTime: '180 min/hood', difficulty: 'Specialized' }
  ];

  const categories = [...new Set(serviceSpecs.map(spec => spec.category))];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Basic': return 'bg-green-100 text-green-800';
      case 'Standard': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Specialized': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <CheckSquare className="w-5 h-5" />
          Service Specifications ({selectedSpecs.length} selected)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
              {category === 'Daily Cleaning' && <Broom className="w-4 h-4" />}
              {category === 'Weekly Services' && <Clock className="w-4 h-4" />}
              {category === 'Monthly Services' && <Sparkles className="w-4 h-4" />}
              {category === 'Specialized' && <Droplets className="w-4 h-4" />}
              {category}
            </h3>
            <div className="grid gap-3">
              {serviceSpecs.filter(spec => spec.category === category).map(spec => (
                <div key={spec.id} className="flex items-start space-x-3 p-3 bg-slate-800 rounded-lg">
                  <Checkbox
                    id={spec.id}
                    checked={selectedSpecs.includes(spec.id)}
                    onCheckedChange={() => onSpecToggle(spec.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={spec.id} className="text-slate-200 font-medium cursor-pointer">
                      {spec.name}
                    </Label>
                    <p className="text-sm text-slate-400 mt-1">{spec.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {spec.frequency}
                      </Badge>
                      <Badge className={`text-xs ${getDifficultyColor(spec.difficulty)}`}>
                        {spec.difficulty}
                      </Badge>
                      <span className="text-xs text-slate-500">{spec.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {category !== categories[categories.length - 1] && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ServiceSpecifications;