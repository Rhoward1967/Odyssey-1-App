import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Wrench, FileText } from 'lucide-react';

export interface BidderInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface ServiceSpecs {
  services: string[];
  frequency: string;
  contractType: 'one-time' | 'monthly';
  squareFootage: string;
  specialRequirements: string[];
}

interface SimpleBidderFormProps {
  onSubmit: (bidderInfo: BidderInfo, serviceSpecs: ServiceSpecs) => void;
}

const SimpleBidderForm: React.FC<SimpleBidderFormProps> = ({ onSubmit }) => {
  const [bidderInfo, setBidderInfo] = useState<BidderInfo>({
    name: '',
    address: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    zipcode: '',
  });

  const [serviceSpecs, setServiceSpecs] = useState<ServiceSpecs>({
    services: [],
    frequency: '',
    contractType: 'monthly',
    squareFootage: '',
    specialRequirements: [],
  });

  const availableServices = [
    'Standard Office Cleaning',
    'Premium Office Cleaning',
    'Executive Office Suite',
    'Medical Facility Cleaning',
    'Dental Office Cleaning',
    'Hospital Cleaning',
    'School Cleaning',
    'University Cleaning',
    'Daycare Center Cleaning',
    'Retail Store Cleaning',
    'Restaurant Cleaning',
    'Hotel Cleaning',
    'Warehouse Cleaning',
    'Manufacturing Facility',
    'Government Building',
    'Post-Construction Cleanup',
    'Deep Cleaning Service',
    'Carpet Cleaning',
    'Floor Stripping & Waxing',
    'Window Cleaning',
    'Pressure Washing',
  ];

  const specialRequirements = [
    'Green/Eco-friendly products only',
    'After-hours cleaning required',
    'Security clearance needed',
    'Special equipment required',
    'High-traffic area focus',
    'Medical-grade sanitization',
    'Food service area cleaning',
    'Computer/electronics cleaning',
    'Biohazard handling capability',
    'OSHA compliance required',
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'one-time', label: 'One-time Service' },
  ];

  const handleServiceToggle = (service: string) => {
    setServiceSpecs(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleRequirementToggle = (requirement: string) => {
    setServiceSpecs(prev => ({
      ...prev,
      specialRequirements: prev.specialRequirements.includes(requirement)
        ? prev.specialRequirements.filter(r => r !== requirement)
        : [...prev.specialRequirements, requirement],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(bidderInfo, serviceSpecs);
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <Card className='bg-slate-800/50 border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center'>
            <User className='w-5 h-5 mr-2' />
            Bidder Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='name' className='text-slate-300'>
                Full Name
              </Label>
              <Input
                id='name'
                required
                value={bidderInfo.name}
                onChange={e =>
                  setBidderInfo({ ...bidderInfo, name: e.target.value })
                }
                className='bg-slate-700 border-slate-600 text-white'
                placeholder='John Doe'
              />
            </div>
            <div>
              <Label htmlFor='email' className='text-slate-300'>
                Email
              </Label>
              <Input
                id='email'
                type='email'
                required
                value={bidderInfo.email}
                onChange={e =>
                  setBidderInfo({ ...bidderInfo, email: e.target.value })
                }
                className='bg-slate-700 border-slate-600 text-white'
                placeholder='john@example.com'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='address' className='text-slate-300'>
              Address
            </Label>
            <Input
              id='address'
              required
              value={bidderInfo.address}
              onChange={e =>
                setBidderInfo({ ...bidderInfo, address: e.target.value })
              }
              className='bg-slate-700 border-slate-600 text-white'
              placeholder='123 Main Street'
            />
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <Label htmlFor='city' className='text-slate-300'>
                City
              </Label>
              <Input
                id='city'
                required
                value={bidderInfo.city}
                onChange={e =>
                  setBidderInfo({ ...bidderInfo, city: e.target.value })
                }
                className='bg-slate-700 border-slate-600 text-white'
                placeholder='New York'
              />
            </div>
            <div>
              <Label htmlFor='state' className='text-slate-300'>
                State
              </Label>
              <Input
                id='state'
                required
                value={bidderInfo.state}
                onChange={e =>
                  setBidderInfo({ ...bidderInfo, state: e.target.value })
                }
                className='bg-slate-700 border-slate-600 text-white'
                placeholder='NY'
              />
            </div>
            <div>
              <Label htmlFor='zipcode' className='text-slate-300'>
                Zip Code
              </Label>
              <Input
                id='zipcode'
                required
                value={bidderInfo.zipcode}
                onChange={e =>
                  setBidderInfo({ ...bidderInfo, zipcode: e.target.value })
                }
                className='bg-slate-700 border-slate-600 text-white'
                placeholder='10001'
              />
            </div>
          </div>

          <div>
            <Label htmlFor='phone' className='text-slate-300'>
              Phone
            </Label>
            <Input
              id='phone'
              required
              value={bidderInfo.phone}
              onChange={e =>
                setBidderInfo({ ...bidderInfo, phone: e.target.value })
              }
              className='bg-slate-700 border-slate-600 text-white'
              placeholder='(555) 123-4567'
            />
          </div>
        </CardContent>
      </Card>

      <Card className='bg-slate-800/50 border-slate-700'>
        <CardHeader>
          <CardTitle className='text-white flex items-center'>
            <Wrench className='w-5 h-5 mr-2' />
            Service Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div>
            <Label className='text-slate-300 mb-3 block'>
              Services Required (Select all that apply)
            </Label>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-60 overflow-y-auto'>
              {availableServices.map(service => (
                <div key={service} className='flex items-center space-x-2'>
                  <Checkbox
                    id={service}
                    checked={serviceSpecs.services.includes(service)}
                    onCheckedChange={() => handleServiceToggle(service)}
                  />
                  <Label htmlFor={service} className='text-sm text-slate-300'>
                    {service}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <div>
              <Label className='text-slate-300'>Square Footage</Label>
              <Input
                placeholder='Total square footage'
                value={serviceSpecs.squareFootage}
                onChange={e =>
                  setServiceSpecs({
                    ...serviceSpecs,
                    squareFootage: e.target.value,
                  })
                }
                className='bg-slate-700 border-slate-600 text-white'
              />
            </div>

            <div>
              <Label className='text-slate-300'>Service Frequency</Label>
              <Select
                value={serviceSpecs.frequency}
                onValueChange={value =>
                  setServiceSpecs({ ...serviceSpecs, frequency: value })
                }
              >
                <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                  <SelectValue placeholder='Select frequency' />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className='text-slate-300'>Contract Type</Label>
              <Select
                value={serviceSpecs.contractType}
                onValueChange={(value: 'one-time' | 'monthly') =>
                  setServiceSpecs({ ...serviceSpecs, contractType: value })
                }
              >
                <SelectTrigger className='bg-slate-700 border-slate-600 text-white'>
                  <SelectValue placeholder='Select contract type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='one-time'>One-time Service</SelectItem>
                  <SelectItem value='monthly'>Monthly Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className='text-slate-300 mb-3 block'>
              Special Requirements (Select all that apply)
            </Label>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
              {specialRequirements.map(requirement => (
                <div key={requirement} className='flex items-center space-x-2'>
                  <Checkbox
                    id={requirement}
                    checked={serviceSpecs.specialRequirements.includes(
                      requirement
                    )}
                    onCheckedChange={() => handleRequirementToggle(requirement)}
                  />
                  <Label
                    htmlFor={requirement}
                    className='text-sm text-slate-300'
                  >
                    {requirement}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700'
            disabled={
              !bidderInfo.name ||
              !bidderInfo.email ||
              serviceSpecs.services.length === 0
            }
          >
            <FileText className='w-4 h-4 mr-2' />
            Submit to Odyssey-1 for Processing
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default SimpleBidderForm;
