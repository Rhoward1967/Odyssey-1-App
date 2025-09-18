import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface CleaningService {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

interface CleaningServicesDropdownProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
}

const CleaningServicesDropdown: React.FC<CleaningServicesDropdownProps> = ({
  selectedServices,
  onServicesChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDescriptions, setShowDescriptions] = useState(false);

  const services: CleaningService[] = [
    // Basic Daily Cleaning
    { id: 'vacuum-carpet', name: 'Vacuum All Carpeted Areas', category: 'Basic Daily', price: 25, description: 'Thorough vacuuming of all carpeted floors, including high-traffic areas and under furniture where accessible.' },
    { id: 'mop-floors', name: 'Mop Hard Surface Floors', category: 'Basic Daily', price: 20, description: 'Sweep and mop all hard surface floors including tile, hardwood, laminate, and vinyl using appropriate cleaning solutions.' },
    { id: 'dust-surfaces', name: 'Dust All Horizontal Surfaces', category: 'Basic Daily', price: 15, description: 'Dust desks, tables, windowsills, baseboards, and all accessible horizontal surfaces using microfiber cloths.' },
    { id: 'empty-trash', name: 'Empty Waste Receptacles', category: 'Basic Daily', price: 10, description: 'Empty all trash bins, replace liners, and transport waste to designated disposal areas.' },
    { id: 'clean-mirrors', name: 'Clean Mirrors and Glass', category: 'Basic Daily', price: 12, description: 'Clean all mirrors, glass surfaces, and picture frames using streak-free glass cleaner.' },
    { id: 'wipe-surfaces', name: 'Disinfect High-Touch Surfaces', category: 'Basic Daily', price: 18, description: 'Sanitize door handles, light switches, phones, keyboards, and other frequently touched surfaces.' },
    
    // Restroom Services
    { id: 'toilet-clean', name: 'Clean and Sanitize Toilets', category: 'Restroom', price: 30, description: 'Complete toilet cleaning including bowl, seat, exterior, and surrounding floor area with disinfectant.' },
    { id: 'shower-clean', name: 'Clean Showers and Tubs', category: 'Restroom', price: 35, description: 'Scrub and disinfect shower walls, tubs, fixtures, and remove soap scum and mineral deposits.' },
    { id: 'sink-clean', name: 'Clean Sinks and Faucets', category: 'Restroom', price: 15, description: 'Clean and polish sinks, faucets, and countertops with appropriate disinfectants.' },
    { id: 'restock-supplies', name: 'Restock Paper Products', category: 'Restroom', price: 8, description: 'Refill toilet paper, paper towels, soap dispensers, and other restroom supplies as needed.' },
    { id: 'floor-sanitize', name: 'Sanitize Restroom Floors', category: 'Restroom', price: 22, description: 'Mop and disinfect restroom floors with hospital-grade sanitizers, including behind toilets.' },
    
    // Kitchen and Break Room
    { id: 'appliance-clean', name: 'Clean Kitchen Appliances', category: 'Kitchen', price: 45, description: 'Clean interior and exterior of microwaves, refrigerators, coffee makers, and other appliances.' },
    { id: 'counter-clean', name: 'Sanitize Countertops', category: 'Kitchen', price: 20, description: 'Clean and sanitize all countertops, backsplashes, and food preparation areas.' },
    { id: 'cabinet-clean', name: 'Wipe Cabinet Fronts', category: 'Kitchen', price: 25, description: 'Clean exterior surfaces of cabinets, drawers, and handles removing fingerprints and spills.' },
    { id: 'sink-kitchen', name: 'Clean Kitchen Sinks', category: 'Kitchen', price: 15, description: 'Scrub and sanitize sinks, faucets, and surrounding areas including soap dispensers.' },
    { id: 'dishwasher-clean', name: 'Load/Unload Dishwasher', category: 'Kitchen', price: 28, description: 'Load dirty dishes, run dishwasher cycle, and put away clean dishes and utensils.' },
    
    // Deep Cleaning Services
    { id: 'carpet-shampoo', name: 'Deep Carpet Cleaning', category: 'Deep Clean', price: 75, description: 'Professional carpet shampooing and extraction to remove deep stains and embedded dirt.' },
    { id: 'window-clean', name: 'Interior Window Cleaning', category: 'Deep Clean', price: 40, description: 'Clean interior windows, sills, and tracks for crystal clear visibility.' },
    { id: 'baseboard-clean', name: 'Detailed Baseboard Cleaning', category: 'Deep Clean', price: 30, description: 'Wipe down all baseboards, crown molding, and trim work throughout the facility.' },
    { id: 'light-fixture', name: 'Clean Light Fixtures', category: 'Deep Clean', price: 25, description: 'Dust and clean all light fixtures, ceiling fans, and lampshades.' },
    { id: 'upholstery-clean', name: 'Upholstery Cleaning', category: 'Deep Clean', price: 60, description: 'Professional cleaning of office chairs, sofas, and fabric furniture using appropriate methods.' },
    
    // Specialized Services
    { id: 'pressure-wash', name: 'Exterior Pressure Washing', category: 'Specialized', price: 100, description: 'High-pressure cleaning of building exteriors, walkways, and parking areas.' },
    { id: 'graffiti-removal', name: 'Graffiti Removal Service', category: 'Specialized', price: 80, description: 'Safe removal of graffiti from various surfaces without damage to underlying materials.' },
    { id: 'biohazard', name: 'Biohazard Cleanup', category: 'Specialized', price: 200, description: 'Certified biohazard remediation following OSHA standards for blood, bodily fluids, and contaminated materials.' },
    { id: 'post-construction', name: 'Post-Construction Cleanup', category: 'Specialized', price: 150, description: 'Complete cleanup after construction or renovation including dust removal and debris disposal.' },
    { id: 'floor-stripping', name: 'Floor Stripping and Waxing', category: 'Specialized', price: 120, description: 'Strip old wax, deep clean, and apply new protective wax coating to hard floors.' },
    { id: 'hvac-vent', name: 'HVAC Vent Cleaning', category: 'Specialized', price: 90, description: 'Clean air vents, registers, and accessible ductwork to improve air quality.' }
  ];

  const categories = [...new Set(services.map(s => s.category))];

  const handleServiceToggle = (serviceId: string) => {
    const updated = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    onServicesChange(updated);
  };

  const getSelectedDescriptions = () => {
    return services
      .filter(service => selectedServices.includes(service.id))
      .map(service => `${service.name}: ${service.description}`)
      .join('\n\n');
  };

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        {selectedServices.length > 0 
          ? `${selectedServices.length} services selected`
          : 'Select cleaning services'
        }
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b flex justify-between items-center">
            <span className="text-sm font-medium">Select Services</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDescriptions(!showDescriptions)}
              className="text-xs"
            >
              <Info className="h-3 w-3 mr-1" />
              {showDescriptions ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          <ScrollArea className="h-96">
            <div className="p-2">
              {categories.map(category => (
                <div key={category} className="mb-4">
                  <h4 className="font-semibold text-sm text-blue-700 mb-2 px-2 border-b pb-1">
                    {category} Services
                  </h4>
                  {services.filter(s => s.category === category).map(service => (
                    <div key={service.id} className="mb-2">
                      <div className="flex items-center space-x-2 p-2 hover:bg-blue-50 rounded">
                        <Checkbox
                          id={service.id}
                          checked={selectedServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <label htmlFor={service.id} className="flex-1 text-sm cursor-pointer font-medium">
                          {service.name}
                        </label>
                        <span className="text-xs text-green-600 font-semibold">${service.price}</span>
                      </div>
                      {showDescriptions && (
                        <div className="ml-6 mr-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {service.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {selectedServices.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <div className="text-sm font-medium mb-1">
                Total: ${services.filter(s => selectedServices.includes(s.id)).reduce((sum, s) => sum + s.price, 0)}
              </div>
              <div className="text-xs text-gray-600">
                {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
              </div>
            </div>
          )}
        </div>
      )}
      
      {selectedServices.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-sm text-blue-800 mb-2">Service Scope Summary:</h4>
          <textarea
            className="w-full h-32 text-xs p-2 border rounded resize-none"
            value={getSelectedDescriptions()}
            readOnly
            placeholder="Selected service descriptions will appear here..."
          />
        </div>
      )}
    </div>
  );
};

export default CleaningServicesDropdown;