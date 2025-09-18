import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Camera, Mail, MapPin, Wifi, WifiOff, Upload, Sync } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { supabase } from '@/lib/supabase';

export default function MobileBidderApp() {
  // Existing state
  const [activeTab, setActiveTab] = useState('calculator');
  const [bidData, setBidData] = useState({
    serviceType: '',
    frequency: '',
    area: '',
    rate: '',
    total: 0
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced features
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation();
  const { isOnline, pendingSync, saveOfflineData, syncOfflineData, clearSyncedData } = useOfflineStorage();
  const [syncing, setSyncing] = useState(false);
  const [jobSites, setJobSites] = useState<any[]>([]);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && pendingSync > 0) {
      handleSync();
    }
  }, [isOnline, pendingSync]);

  const calculateTotal = () => {
    const area = parseFloat(bidData.area) || 0;
    const rate = parseFloat(bidData.rate) || 0;
    const frequency = bidData.frequency === 'weekly' ? 52 : 
                     bidData.frequency === 'monthly' ? 12 : 1;
    const total = area * rate * frequency;
    setBidData(prev => ({ ...prev, total }));
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setPhotos(prev => [...prev, result]);
          
          // Save photo offline
          saveOfflineData('photos', {
            id: Date.now(),
            data: result,
            location: location,
            timestamp: Date.now()
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleLocationCapture = async () => {
    await getCurrentLocation();
    if (location) {
      const jobSite = {
        id: Date.now(),
        ...location,
        bidData: bidData,
        photos: photos.length
      };
      
      setJobSites(prev => [...prev, jobSite]);
      await saveOfflineData('locations', jobSite);
    }
  };

  const handleSaveBid = async () => {
    const bid = {
      id: Date.now(),
      ...bidData,
      location,
      photos: photos.length,
      timestamp: Date.now()
    };

    if (isOnline) {
      try {
        const { error } = await supabase
          .from('bids')
          .insert([{
            service_type: bid.serviceType,
            frequency: bid.frequency,
            area: parseFloat(bid.area),
            rate: parseFloat(bid.rate),
            total: bid.total,
            location: bid.location,
            photo_count: bid.photos,
            created_at: new Date().toISOString()
          }]);
        
        if (error) throw error;
        alert('Bid saved successfully!');
      } catch (error) {
        console.error('Error saving bid:', error);
        await saveOfflineData('bids', bid);
        alert('Saved offline - will sync when online');
      }
    } else {
      await saveOfflineData('bids', bid);
      alert('Saved offline - will sync when online');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    const success = await syncOfflineData();
    setSyncing(false);
    
    if (success) {
      alert('Data synced successfully!');
      clearSyncedData();
    }
  };

  const handleEmailBid = () => {
    const subject = `Bid for ${bidData.serviceType}`;
    const body = `Service: ${bidData.serviceType}\nFrequency: ${bidData.frequency}\nArea: ${bidData.area} sq ft\nRate: $${bidData.rate}\nTotal: $${bidData.total}\n\nLocation: ${location?.address || 'Not captured'}\nPhotos: ${photos.length} attached`;
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm font-medium">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          
          {pendingSync > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              {pendingSync} pending
            </Badge>
          )}
          
          {isOnline && pendingSync > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1"
            >
              <Sync className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-10 p-0.5">
            <TabsTrigger value="calculator" className="flex flex-col items-center gap-0.5 text-xs px-1 py-1">
              <Calculator className="h-3 w-3" />
              <span className="text-[10px]">Calc</span>
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex flex-col items-center gap-0.5 text-xs px-1 py-1">
              <Camera className="h-3 w-3" />
              <span className="text-[10px]">Photo</span>
            </TabsTrigger>
            <TabsTrigger value="location" className="flex flex-col items-center gap-0.5 text-xs px-1 py-1">
              <MapPin className="h-3 w-3" />
              <span className="text-[10px]">Sites</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex flex-col items-center gap-0.5 text-xs px-1 py-1">
              <Mail className="h-3 w-3" />
              <span className="text-[10px]">Send</span>
            </TabsTrigger>
          </TabsList>
          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Bid Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="serviceType">Service Type</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={bidData.serviceType}
                      onChange={(e) => setBidData(prev => ({ ...prev, serviceType: e.target.value }))}
                    >
                      <option value="">Select Service</option>
                      <option value="office">Office Cleaning</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <select
                      className="w-full p-2 border rounded-md"
                      value={bidData.frequency}
                      onChange={(e) => setBidData(prev => ({ ...prev, frequency: e.target.value }))}
                    >
                      <option value="">Select Frequency</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Area (sq ft)</Label>
                    <Input
                      type="number"
                      value={bidData.area}
                      onChange={(e) => setBidData(prev => ({ ...prev, area: e.target.value }))}
                      placeholder="1000"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rate">Rate ($/sq ft)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bidData.rate}
                      onChange={(e) => setBidData(prev => ({ ...prev, rate: e.target.value }))}
                      placeholder="0.15"
                    />
                  </div>
                </div>

                <Button onClick={calculateTotal} className="w-full bg-blue-600 hover:bg-blue-700">
                  Calculate Total
                </Button>

                {bidData.total > 0 && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-700">
                        ${(bidData.total || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-green-600">
                        {bidData.frequency === 'weekly' ? 'Annual Total' : 
                         bidData.frequency === 'monthly' ? 'Annual Total' : 'One-time Total'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={handleSaveBid} className="flex-1" variant="outline">
                    Save Bid
                  </Button>
                  <Button onClick={handleLocationCapture} disabled={locationLoading} className="flex-1">
                    {locationLoading ? 'Getting Location...' : 'Add Location'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Camera Tab - Mobile Optimized */}
          <TabsContent value="camera">
            <Card className="bg-white shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Job Site Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Button */}
                <Button 
                  onClick={handleCameraCapture} 
                  className="w-full bg-blue-600 hover:bg-blue-700 py-3"
                  size="lg"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Photos Display */}
                {photos.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        Photos ({photos.length})
                      </h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {photos.length} captured
                      </Badge>
                    </div>
                    
                    {/* Mobile-Optimized Photo Grid */}
                    <div className="space-y-3">
                      {photos.map((photo, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {idx + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              Photo {idx + 1}
                            </span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                          
                          <div className="relative bg-white rounded-lg overflow-hidden border">
                            <img 
                              src={photo} 
                              alt={`Job site photo ${idx + 1}`} 
                              className="w-full h-48 object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              Tap to view full size
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                              onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {photos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Camera className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No photos captured yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tap "Take Photo" to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Job Sites
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {location && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800">Current Location</div>
                    <div className="text-xs text-blue-600">
                      {location.address || `${(location.latitude || 0).toFixed(4)}, ${(location.longitude || 0).toFixed(4)}`}
                    </div>
                    <div className="text-xs text-blue-500">
                      Accuracy: {(location.accuracy || 0).toFixed(0)}m
                  </div>
                )}

                {locationError && (
                  <Alert>
                    <AlertDescription className="text-red-600">
                      {locationError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={getCurrentLocation} 
                  disabled={locationLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {locationLoading ? 'Getting Location...' : 'Get Current Location'}
                </Button>

                {jobSites.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Saved Job Sites</h3>
                    {jobSites.map((site, idx) => (
                      <div key={site.id} className="bg-gray-50 p-3 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">Site {idx + 1}</div>
                            <div className="text-sm text-gray-600">
                              {site.address || `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              Photos: {site.photos} • {site.bidData.serviceType}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            ${site.bidData.total}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Send Bid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Client Email</Label>
                  <Input
                    type="email"
                    placeholder="client@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {bidData.total > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Bid Summary</h4>
                    <div className="text-sm space-y-1">
                      <div>Service: {bidData.serviceType}</div>
                      <div>Frequency: {bidData.frequency}</div>
                      <div>Area: {bidData.area} sq ft</div>
                      <div>Rate: ${bidData.rate}/sq ft</div>
                      <div className="font-bold">Total: ${bidData.total}</div>
                      <div>Photos: {photos.length}</div>
                      <div>Location: {location?.address || 'Not captured'}</div>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleEmailBid}
                  disabled={!email || bidData.total === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm px-2 py-3"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Send Estimate
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};