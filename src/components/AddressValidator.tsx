import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ValidatedAddress {
  validated: boolean;
  standardized?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    zip4: string;
    deliveryLine: string;
    lastLine: string;
  };
  components?: any;
  metadata?: any;
  analysis?: any;
  error?: string;
}

interface AddressValidatorProps {
  onAddressValidated: (address: ValidatedAddress) => void;
  initialAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

export default function AddressValidator({ onAddressValidated, initialAddress }: AddressValidatorProps) {
  const [formData, setFormData] = useState({
    address: initialAddress?.street || '',
    city: initialAddress?.city || '',
    state: initialAddress?.state || '',
    zipCode: initialAddress?.zipCode || ''
  });
  
  const [validationResult, setValidationResult] = useState<ValidatedAddress | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateAddress = async () => {
    if (!formData.address || !formData.zipCode) {
      alert('Please enter at least an address and ZIP code');
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('smarty-address-validation', {
        body: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        }
      });

      if (error) throw error;
      
      setValidationResult(data);
      onAddressValidated(data);
    } catch (error) {
      console.error('Address validation error:', error);
      const errorResult = {
        validated: false,
        error: 'Failed to validate address'
      };
      setValidationResult(errorResult);
      onAddressValidated(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  const useValidatedAddress = () => {
    if (validationResult?.standardized) {
      setFormData({
        address: validationResult.standardized.street,
        city: validationResult.standardized.city,
        state: validationResult.standardized.state,
        zipCode: validationResult.standardized.zipCode
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Validation (SmartyStreets)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Anytown"
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              placeholder="CA"
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
              placeholder="12345"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={validateAddress}
              disabled={isValidating || !formData.address || !formData.zipCode}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Validate Address
                </>
              )}
            </Button>
          </div>
        </div>

        {validationResult && (
          <div className={`p-4 rounded-lg border ${
            validationResult.validated 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {validationResult.validated ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h4 className={`font-semibold ${
                validationResult.validated ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.validated ? 'Address Validated' : 'Validation Failed'}
              </h4>
            </div>

            {validationResult.validated && validationResult.standardized && (
              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-green-700 mb-2">Standardized Address:</h5>
                  <div className="bg-white p-3 rounded border text-sm">
                    <div>{validationResult.standardized.deliveryLine}</div>
                    <div>{validationResult.standardized.lastLine}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-green-600">ZIP+4:</span>
                    <div className="font-semibold">
                      {validationResult.standardized.zipCode}-{validationResult.standardized.zip4}
                    </div>
                  </div>
                  {validationResult.analysis && (
                    <>
                      <div>
                        <span className="text-green-600">DPV Match:</span>
                        <Badge variant={validationResult.analysis.dpvMatchCode === 'Y' ? 'default' : 'secondary'}>
                          {validationResult.analysis.dpvMatchCode === 'Y' ? 'Valid' : 'Invalid'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-green-600">Active:</span>
                        <Badge variant={validationResult.analysis.active === 'Y' ? 'default' : 'secondary'}>
                          {validationResult.analysis.active === 'Y' ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>

                <Button 
                  onClick={useValidatedAddress}
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-100"
                >
                  Use Standardized Address
                </Button>
              </div>
            )}

            {validationResult.error && (
              <div className="text-red-700 text-sm">
                Error: {validationResult.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}