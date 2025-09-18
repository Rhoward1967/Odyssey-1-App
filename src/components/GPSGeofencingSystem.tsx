import React, { useState, useEffect } from 'react';
import { MapPin, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '@/lib/supabase';

interface GeofenceViolation {
  id: string;
  employeeId: string;
  location: { lat: number; lng: number };
  timestamp: string;
  type: string;
}

export default function GPSGeofencingSystem() {
  const [violations, setViolations] = useState<GeofenceViolation[]>([]);
  const [activeEmployees, setActiveEmployees] = useState(12);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadViolations();
  }, []);

  const loadViolations = async () => {
    // Mock violations data
    setViolations([
      {
        id: '1',
        employeeId: 'emp001',
        location: { lat: 40.7128, lng: -74.0060 },
        timestamp: new Date().toISOString(),
        type: 'outside_geofence'
      }
    ]);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <MapPin className="h-6 w-6" />
        GPS Geofencing System
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeEmployees}</div>
            <p className="text-sm text-gray-600">Currently on-site</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Violations Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{violations.length}</div>
            <p className="text-sm text-gray-600">Geofence violations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">94%</div>
            <p className="text-sm text-gray-600">Location compliance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No violations today</p>
          ) : (
            <div className="space-y-3">
              {violations.map((violation) => (
                <div key={violation.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Employee {violation.employeeId}</h4>
                    <p className="text-sm text-gray-600">Outside geofence at {new Date(violation.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <Button size="sm" variant="outline">Review</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}