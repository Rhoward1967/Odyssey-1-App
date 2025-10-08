import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calculator,
  MapPin,
  Camera,
  FileText,
  Building,
  CheckCircle,
} from 'lucide-react';
import CleaningServicesDropdown from './CleaningServicesDropdown';
import RoomScanner from './RoomScanner';
import AgreementGenerator from './AgreementGenerator';
import CameraMeasurementAI from './CameraMeasurementAI';
import AddressValidator from './AddressValidator';
import { supabase } from '@/lib/supabase';

interface BidData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  propertyAddress: string;
  zipCode: string;
  squareFootage: number;
  selectedServices: any[];
  totalEstimate: number;
  estimatedHours: number;
}

export default function BiddingCalculatorForm() {
  const [activeTab, setActiveTab] = useState('calculator');
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    propertyAddress: '',
    zipCode: '',
    manualSquareFootage: '',
    propertyType: '',
    serviceFrequency: '',
    cleaningType: '',
    buildingAge: '',
    selectedServices: [] as any[],
    specialRequirements: [] as string[],
  });

  const [publicRecordsData, setPublicRecordsData] = useState<any>(null);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [cameraData, setCameraData] = useState<any[]>([]);
  const [bidResults, setBidResults] = useState<BidData | null>(null);
  const [validatedAddress, setValidatedAddress] = useState<any>(null);

  const handleAddressValidated = (addressData: any) => {
    setValidatedAddress(addressData);
    if (addressData.validated && addressData.standardized) {
      setFormData(prev => ({
        ...prev,
        propertyAddress: addressData.standardized.street,
        zipCode: addressData.standardized.zipCode,
      }));
    }
  };

  const fetchPublicRecords = async () => {
    if (!formData.propertyAddress || !formData.zipCode) return;

    setIsLoadingRecords(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'public-records-api',
        {
          body: {
            address: formData.propertyAddress,
            zipCode: formData.zipCode,
          },
        }
      );

      if (error) throw error;
      setPublicRecordsData(data.data);
    } catch (error) {
      console.error('Error fetching public records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  };
  const calculateBid = () => {
    const totalSquareFootage =
      publicRecordsData?.squareFootage ||
      parseInt(formData.manualSquareFootage) ||
      cameraData.reduce((sum, room) => sum + (room?.area || 0), 0) ||
      0;

    const totalServices = (formData.selectedServices || []).length || 0;
    const baseRate = 0.15; // $0.15 per sq ft base rate
    const serviceMultiplier = 1 + totalServices * 0.1;

    const estimate = (totalSquareFootage || 0) * baseRate * serviceMultiplier;
    const hours = Math.ceil((totalSquareFootage || 0) / 500) + totalServices;

    const bidData: BidData = {
      clientName: formData.clientName || '',
      clientEmail: formData.clientEmail || '',
      clientPhone: formData.clientPhone || '',
      propertyAddress: formData.propertyAddress || '',
      zipCode: formData.zipCode || '',
      squareFootage: totalSquareFootage || 0,
      selectedServices: formData.selectedServices || [],
      totalEstimate: Math.round(estimate || 0),
      estimatedHours: hours || 0,
    };

    setBidResults(bidData);
  };

  const TabButton = ({
    id,
    label,
    icon,
  }: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className='w-full max-w-6xl mx-auto space-y-6'>
      <div className='flex flex-wrap gap-2 justify-center'>
        <TabButton
          id='calculator'
          label='Calculator'
          icon={<Calculator className='h-4 w-4' />}
        />
        <TabButton
          id='address'
          label='Address Validation'
          icon={<CheckCircle className='h-4 w-4' />}
        />
        <TabButton
          id='camera'
          label='Camera Scan'
          icon={<Camera className='h-4 w-4' />}
        />
        <TabButton
          id='records'
          label='Property Data'
          icon={<Building className='h-4 w-4' />}
        />
        <TabButton
          id='agreement'
          label='Agreement'
          icon={<FileText className='h-4 w-4' />}
        />
      </div>

      {activeTab === 'calculator' && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calculator className='h-5 w-5' />
              Bidding Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='clientName'>Client Name</Label>
                <Input
                  id='clientName'
                  value={formData.clientName}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      clientName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='clientEmail'>Client Email</Label>
                <Input
                  id='clientEmail'
                  type='email'
                  value={formData.clientEmail}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      clientEmail: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='clientPhone'>Client Phone</Label>
                <Input
                  id='clientPhone'
                  value={formData.clientPhone}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      clientPhone: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor='manualSquareFootage'>
                  Manual Square Footage (optional)
                </Label>
                <Input
                  id='manualSquareFootage'
                  type='number'
                  value={formData.manualSquareFootage}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      manualSquareFootage: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='propertyAddress'>Property Address</Label>
                <Input
                  id='propertyAddress'
                  value={formData.propertyAddress}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      propertyAddress: e.target.value,
                    }))
                  }
                  placeholder='Street address for public records lookup'
                />
              </div>
              <div className='flex gap-2'>
                <div className='flex-1'>
                  <Label htmlFor='zipCode'>ZIP Code</Label>
                  <Input
                    id='zipCode'
                    value={formData.zipCode}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        zipCode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className='flex items-end'>
                  <Button
                    onClick={fetchPublicRecords}
                    disabled={
                      isLoadingRecords ||
                      !formData.propertyAddress ||
                      !formData.zipCode
                    }
                    className='flex items-center gap-2'
                  >
                    <MapPin className='h-4 w-4' />
                    {isLoadingRecords ? 'Loading...' : 'Lookup'}
                  </Button>
                </div>
              </div>
            </div>

            {publicRecordsData && (
              <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
                <h4 className='font-semibold text-green-800 mb-2'>
                  Property Data Found
                </h4>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                  <div>
                    <span className='text-green-600'>Square Footage:</span>
                    <div className='font-semibold'>
                      {publicRecordsData.squareFootage} sq ft
                    </div>
                  </div>
                  <div>
                    <span className='text-green-600'>Property Type:</span>
                    <div className='font-semibold'>
                      {publicRecordsData.propertyType}
                    </div>
                  </div>
                  <div>
                    <span className='text-green-600'>Year Built:</span>
                    <div className='font-semibold'>
                      {publicRecordsData.yearBuilt}
                    </div>
                  </div>
                  <div>
                    <span className='text-green-600'>Cleaning Complexity:</span>
                    <Badge className='text-xs'>
                      {publicRecordsData.cleaningComplexity}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Dropdown Selection Section */}
            <div className='p-4 bg-gray-50 border border-gray-200 rounded-lg'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div>
                  <Label>Property Type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, propertyType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select property type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='office'>Office Building</SelectItem>
                      <SelectItem value='retail'>Retail Space</SelectItem>
                      <SelectItem value='warehouse'>Warehouse</SelectItem>
                      <SelectItem value='medical'>Medical Facility</SelectItem>
                      <SelectItem value='restaurant'>Restaurant</SelectItem>
                      <SelectItem value='school'>School/Educational</SelectItem>
                      <SelectItem value='residential'>Residential</SelectItem>
                      <SelectItem value='industrial'>Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Service Frequency</Label>
                  <Select
                    value={formData.serviceFrequency}
                    onValueChange={value =>
                      setFormData(prev => ({
                        ...prev,
                        serviceFrequency: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select frequency' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='daily'>Daily</SelectItem>
                      <SelectItem value='weekly'>Weekly</SelectItem>
                      <SelectItem value='bi-weekly'>Bi-Weekly</SelectItem>
                      <SelectItem value='monthly'>Monthly</SelectItem>
                      <SelectItem value='one-time'>One-Time</SelectItem>
                      <SelectItem value='as-needed'>As Needed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Cleaning Type</Label>
                  <Select
                    value={formData.cleaningType}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, cleaningType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select cleaning type' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='standard'>
                        Standard Cleaning
                      </SelectItem>
                      <SelectItem value='deep'>Deep Cleaning</SelectItem>
                      <SelectItem value='post-construction'>
                        Post-Construction
                      </SelectItem>
                      <SelectItem value='move-out'>
                        Move-Out Cleaning
                      </SelectItem>
                      <SelectItem value='carpet'>Carpet Cleaning</SelectItem>
                      <SelectItem value='window'>Window Cleaning</SelectItem>
                      <SelectItem value='pressure-wash'>
                        Pressure Washing
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Building Age</Label>
                  <Select
                    value={formData.buildingAge}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, buildingAge: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select building age' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='new'>0-5 Years</SelectItem>
                      <SelectItem value='recent'>6-15 Years</SelectItem>
                      <SelectItem value='established'>16-30 Years</SelectItem>
                      <SelectItem value='older'>31-50 Years</SelectItem>
                      <SelectItem value='historic'>50+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className='space-y-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Select Cleaning Services
              </label>
              <CleaningServicesDropdown
                selectedServices={formData.selectedServices}
                onServicesChange={services =>
                  setFormData(prev => ({ ...prev, selectedServices: services }))
                }
              />
            </div>

            <div className='flex gap-4'>
              <Button onClick={calculateBid} className='flex-1'>
                Calculate Bid
              </Button>
              <Button onClick={() => setActiveTab('camera')} variant='outline'>
                Use Camera Scan
              </Button>
            </div>

            {bidResults && (
              <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <h4 className='font-semibold text-blue-800 mb-2'>
                  Bid Results
                </h4>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  <div>
                    <span className='text-blue-600'>Total Area:</span>
                    <div className='font-semibold'>
                      {bidResults.squareFootage} sq ft
                    </div>
                  </div>
                  <div>
                    <span className='text-blue-600'>Services:</span>
                    <div className='font-semibold'>
                      {bidResults.selectedServices.length}
                    </div>
                  </div>
                  <div>
                    <span className='text-blue-600'>Est. Hours:</span>
                    <div className='font-semibold'>
                      {bidResults.estimatedHours} hrs
                    </div>
                  </div>
                  <div>
                    <span className='text-blue-600'>Total Estimate:</span>
                    <div className='font-semibold text-lg'>
                      ${bidResults.totalEstimate}
                    </div>
                    <div className='font-semibold text-lg'>
                      $
                      {(typeof bidResults.totalEstimate === 'number' &&
                      !isNaN(bidResults.totalEstimate)
                        ? bidResults.totalEstimate
                        : 0
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'address' && (
        <AddressValidator
          onAddressValidated={handleAddressValidated}
          initialAddress={{
            street: formData.propertyAddress,
            zipCode: formData.zipCode,
          }}
        />
      )}

      {activeTab === 'camera' && (
        <CameraMeasurementAI onMeasurementComplete={setCameraData} />
      )}
      {activeTab === 'records' && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building className='h-5 w-5' />
              Public Records Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            {publicRecordsData ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  <div className='p-4 border rounded-lg'>
                    <h4 className='font-semibold mb-2'>Property Details</h4>
                    <div className='space-y-2 text-sm'>
                      <div>
                        Square Footage: {publicRecordsData.squareFootage} sq ft
                      </div>
                      <div>Property Type: {publicRecordsData.propertyType}</div>
                      <div>Year Built: {publicRecordsData.yearBuilt}</div>
                      <div>Lot Size: {publicRecordsData.lotSize} sq ft</div>
                    </div>
                  </div>
                  <div className='p-4 border rounded-lg'>
                    <h4 className='font-semibold mb-2'>Cleaning Assessment</h4>
                    <div className='space-y-2 text-sm'>
                      <div>
                        Complexity:{' '}
                        <Badge>{publicRecordsData.cleaningComplexity}</Badge>
                      </div>
                      <div>
                        Est. Time: {publicRecordsData.estimatedCleaningTime}{' '}
                        hours
                      </div>
                      <div>
                        Total Rooms: {publicRecordsData.floorPlan?.totalRooms}
                      </div>
                    </div>
                  </div>
                  <div className='p-4 border rounded-lg'>
                    <h4 className='font-semibold mb-2'>Special Requirements</h4>
                    <div className='space-y-1 text-sm'>
                      {publicRecordsData.specialRequirements?.map(
                        (req: string, i: number) => (
                          <div key={i}>• {req}</div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                Enter property address and ZIP code in the calculator tab to
                fetch public records data
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'agreement' && (
        <AgreementGenerator
          agreementData={
            bidResults
              ? {
                  clientName: bidResults.clientName,
                  clientEmail: bidResults.clientEmail,
                  clientPhone: bidResults.clientPhone,
                  propertyAddress: bidResults.propertyAddress,
                  squareFootage: bidResults.squareFootage,
                  services: bidResults.selectedServices.map(service => ({
                    name: service,
                    frequency: 'Weekly',
                    rate: Math.round(
                      bidResults.totalEstimate /
                        bidResults.selectedServices.length
                    ),
                    difficulty: 'Medium',
                  })),
                  totalMonthlyRate: bidResults.totalEstimate,
                  startDate: '',
                  contractLength: '12 months',
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
