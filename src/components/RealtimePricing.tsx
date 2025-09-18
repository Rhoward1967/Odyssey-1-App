import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { DollarSign, TrendingUp, Clock, MapPin, Zap } from 'lucide-react';

interface PricingRequest {
  services: Array<{ type: string; name: string }>;
  location: string;
  frequency: string;
  squareFootage: number;
  serviceType: string;
  urgency: string;
}

interface PricingResponse {
  totalPrice: number;
  breakdown: Array<{
    service: string;
    baseRate: number;
    squareFootage: number;
    locationMultiplier: number;
    frequencyDiscount: number;
    urgencyMultiplier: number;
    subtotal: number;
  }>;
  marketCondition: number;
  timestamp: string;
  validUntil: string;
}

export default function RealtimePricing() {
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [request, setRequest] = useState<PricingRequest>({
    services: [{ type: 'office-cleaning', name: 'Office Cleaning' }],
    location: 'urban',
    frequency: 'weekly',
    squareFootage: 5000,
    serviceType: 'commercial',
    urgency: 'standard'
  });

  const serviceOptions = [
    { type: 'office-cleaning', name: 'Office Cleaning' },
    { type: 'medical-cleaning', name: 'Medical Facility Cleaning' },
    { type: 'retail-cleaning', name: 'Retail Space Cleaning' },
    { type: 'industrial-cleaning', name: 'Industrial Cleaning' },
    { type: 'restaurant-cleaning', name: 'Restaurant Cleaning' },
    { type: 'school-cleaning', name: 'Educational Facility' },
    { type: 'warehouse-cleaning', name: 'Warehouse Cleaning' },
    { type: 'carpet-cleaning', name: 'Carpet Cleaning' },
    { type: 'window-cleaning', name: 'Window Cleaning' },
    { type: 'deep-cleaning', name: 'Deep Cleaning' }
  ];

  const locationOptions = [
    { value: 'urban', label: 'Urban Area' },
    { value: 'suburban', label: 'Suburban Area' },
    { value: 'rural', label: 'Rural Area' },
    { value: 'metro', label: 'Metropolitan' },
    { value: 'downtown', label: 'Downtown' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'one-time', label: 'One-Time' }
  ];

  const urgencyOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'priority', label: 'Priority' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'same-day', label: 'Same Day' }
  ];

  const calculatePricing = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('realtime-pricing-api', {
        body: request
      });

      if (error) throw error;
      setPricing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate pricing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculatePricing();
  }, []);

  const getMarketConditionColor = (condition: number) => {
    if (condition > 1.05) return 'text-red-600';
    if (condition < 0.95) return 'text-green-600';
    return 'text-gray-600';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': case 'same-day': return 'bg-red-100 text-red-800';
      case 'priority': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Real-Time Pricing Calculator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Service Type</label>
              <select 
                value={request.services[0]?.type || ''}
                onChange={(e) => {
                  const selected = serviceOptions.find(s => s.type === e.target.value);
                  if (selected) {
                    setRequest({
                      ...request,
                      services: [selected]
                    });
                  }
                }}
                className="w-full p-2 border rounded-md"
              >
                {serviceOptions.map(option => (
                  <option key={option.type} value={option.type}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location Type</label>
              <select 
                value={request.location}
                onChange={(e) => setRequest({ ...request, location: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {locationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Frequency</label>
              <select 
                value={request.frequency}
                onChange={(e) => setRequest({ ...request, frequency: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {frequencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Square Footage</label>
              <input
                type="number"
                value={request.squareFootage}
                onChange={(e) => setRequest({ ...request, squareFootage: parseInt(e.target.value) || 0 })}
                className="w-full p-2 border rounded-md"
                min="100"
                step="100"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Urgency Level</label>
              <select 
                value={request.urgency}
                onChange={(e) => setRequest({ ...request, urgency: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {urgencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={calculatePricing}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Calculating...' : 'Update Pricing'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {pricing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pricing Breakdown</span>
                <Badge className={getUrgencyColor(request.urgency)}>
                  {request.urgency}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pricing.breakdown.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{item.service}</h4>
                      <span className="font-bold">${item.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Base Rate: ${item.baseRate}/sq ft</div>
                      <div>Square Footage: {item.squareFootage}</div>
                      <div>Location Multiplier: {item.locationMultiplier}x</div>
                      <div>Frequency Discount: {item.frequencyDiscount}x</div>
                      <div>Urgency Multiplier: {item.urgencyMultiplier}x</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>Total Quote</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  ${pricing.totalPrice.toFixed(2)}
                </div>
                <p className="text-sm text-gray-500">
                  Per {request.frequency === 'one-time' ? 'service' : request.frequency}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>Market Condition</span>
                  </span>
                  <span className={getMarketConditionColor(pricing.marketCondition)}>
                    {((pricing.marketCondition - 1) * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Valid Until</span>
                  </span>
                  <span>{new Date(pricing.validUntil).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Location</span>
                  </span>
                  <span className="capitalize">{request.location}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <Button className="w-full">
                  Accept Quote
                </Button>
                <Button variant="outline" className="w-full">
                  Request Modification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}