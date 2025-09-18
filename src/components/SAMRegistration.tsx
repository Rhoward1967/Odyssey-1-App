import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

export function SAMRegistration() {
  return (
    <Card className="bg-gradient-to-br from-emerald-800/90 to-green-800/90 border-2 border-green-500/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <span>🏛️</span>
          SAM.gov Registration Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg border border-green-500/30">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-white font-bold text-lg">HJS SERVICES LLC</h3>
                <p className="text-green-300">Registration ACTIVE</p>
              </div>
              <Badge className="bg-green-600/20 text-green-300">
                VERIFIED
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">UEI Number</p>
                <p className="text-white font-mono">YXEYCV2T1DM5</p>
              </div>
              <div>
                <p className="text-gray-400">CAGE Code</p>
                <p className="text-white font-mono">97K10</p>
              </div>
              <div>
                <p className="text-gray-400">Entity Owner</p>
                <p className="text-white">RICKEY HOWARD</p>
              </div>
              <div>
                <p className="text-gray-400">Registration Date</p>
                <p className="text-white">August 18, 2024</p>
              </div>
              <div>
                <p className="text-gray-400">Renewal Due</p>
                <p className="text-amber-300">August 12, 2026</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className="text-green-400">Active & Compliant</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/20 p-3 rounded">
              <h4 className="text-white font-semibold mb-2">Capabilities</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• IT Services & Solutions</li>
                <li>• Cybersecurity Consulting</li>
                <li>• System Integration</li>
                <li>• Technical Support</li>
              </ul>
            </div>
            
            <div className="bg-black/20 p-3 rounded">
              <h4 className="text-white font-semibold mb-2">Certifications</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Small Business</li>
                <li>• 8(a) Certified</li>
                <li>• WOSB Eligible</li>
                <li>• HUBZone Qualified</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button className="bg-green-600 hover:bg-green-700">
              View Full Profile
            </Button>
            <Button variant="outline" className="border-green-500/50 text-green-300">
              Update Registration
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}