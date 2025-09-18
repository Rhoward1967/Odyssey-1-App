import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';

export const CleaningQuoteForm: React.FC = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    squareFootage: '',
    frequency: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    preferredDate: '',
    preferredTime: '',
    specialRequests: ''
  });

  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const serviceTypes = [
    { value: 'apartment', label: 'Apartment Cleaning', baseRate: 0.15 },
    { value: 'carpet', label: 'Carpet Cleaning', baseRate: 0.25 },
    { value: 'hotel-room', label: 'Hotel Room', baseRate: 0.20 },
    { value: 'small-office', label: 'Small Office', baseRate: 0.12 },
    { value: 'retail-space', label: 'Retail Space', baseRate: 0.18 }
  ];

  const frequencies = [
    { value: 'one-time', label: 'One-Time Service', multiplier: 1.0 },
    { value: 'weekly', label: 'Weekly', multiplier: 0.85 },
    { value: 'bi-weekly', label: 'Bi-Weekly', multiplier: 0.90 },
    { value: 'monthly', label: 'Monthly', multiplier: 0.95 }
  ];

  const calculateEstimate = () => {
    const service = serviceTypes.find(s => s.value === formData.serviceType);
    const frequency = frequencies.find(f => f.value === formData.frequency);
    const sqft = parseInt(formData.squareFootage);
    
    if (service && frequency && sqft) {
      const basePrice = sqft * service.baseRate * frequency.multiplier;
      const finalPrice = Math.max(basePrice, 75); // Minimum $75
      setEstimatedPrice(Math.round(finalPrice));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateEstimate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-green-600/20 text-green-300 border-green-500/50 text-lg px-6 py-2">
            Instant Quote Calculator
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get Your <span className="text-green-400">Cleaning Quote</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Professional cleaning services for small to medium spaces. 
            Get an instant estimate and schedule your service today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-slate-800/50 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-green-400" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-gray-300">Service Type</Label>
                  <Select value={formData.serviceType} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, serviceType: value }))
                  }>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(service => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-300">Square Footage (500-1000 sq ft)</Label>
                  <Input
                    type="number"
                    min="500"
                    max="1000"
                    value={formData.squareFootage}
                    onChange={(e) => setFormData(prev => ({ ...prev, squareFootage: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="750"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, frequency: value }))
                  }>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="How often?" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map(freq => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!formData.serviceType || !formData.squareFootage || !formData.frequency}
                >
                  Calculate Estimate
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-green-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-green-400" />
                Contact & Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {estimatedPrice && (
                  <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-green-300 font-semibold">Estimated Price:</span>
                      <span className="text-2xl font-bold text-green-400">${estimatedPrice}</span>
                    </div>
                    <p className="text-green-200 text-sm mt-2">
                      Includes supplies, labor, and travel within 15 miles
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Full Name</Label>
                    <Input
                      value={formData.contactName}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Service Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Street address, city, state, zip"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Preferred Date</Label>
                    <Input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Preferred Time</Label>
                    <Select value={formData.preferredTime} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, preferredTime: value }))
                    }>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8-12 PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12-5 PM)</SelectItem>
                        <SelectItem value="evening">Evening (5-8 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Special Requests</Label>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Any specific cleaning needs or instructions..."
                    rows={3}
                  />
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!estimatedPrice || !formData.contactName || !formData.email || !formData.phone}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Request Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/30 border-green-500/20 text-center">
            <CardContent className="p-6">
              <MapPin className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Service Area</h3>
              <p className="text-gray-300 text-sm">Within 15 miles of downtown. Additional travel fees may apply beyond service area.</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-green-500/20 text-center">
            <CardContent className="p-6">
              <Clock className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Quick Response</h3>
              <p className="text-gray-300 text-sm">Same-day quotes. Most services can be scheduled within 24-48 hours.</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/30 border-green-500/20 text-center">
            <CardContent className="p-6">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-semibold mb-2">Satisfaction Guaranteed</h3>
              <p className="text-gray-300 text-sm">100% satisfaction guarantee. Insured and bonded for your peace of mind.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};