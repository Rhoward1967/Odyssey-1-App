import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface TrainingModule {
  id: string;
  name: string;
  type: 'bloodborne' | 'hipaa' | 'chemical' | 'uniform' | 'supervisor';
  duration: string;
  required: boolean;
  federalReq: boolean;
  stateReq: boolean;
}

export default function ComplianceTrainingHub() {
  const [modules] = useState<TrainingModule[]>([
    { id: '1', name: 'Bloodborne Pathogen Training', type: 'bloodborne', duration: '2 hours', required: true, federalReq: true, stateReq: false },
    { id: '2', name: 'HIPAA Compliance', type: 'hipaa', duration: '1.5 hours', required: true, federalReq: true, stateReq: false },
    { id: '3', name: 'Chemical Safety Training', type: 'chemical', duration: '3 hours', required: true, federalReq: true, stateReq: true },
    { id: '4', name: 'Uniform Requirements', type: 'uniform', duration: '30 min', required: true, federalReq: false, stateReq: true },
    { id: '5', name: 'Supervisor Training', type: 'supervisor', duration: '4 hours', required: false, federalReq: false, stateReq: true }
  ]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Compliance Training Hub</h2>
      
      <Alert className="mb-6">
        <AlertDescription>
          All federal and state training requirements must be completed to avoid fines and maintain compliance.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle className="text-lg">{module.name}</CardTitle>
              <div className="flex gap-2">
                {module.required && <Badge className="bg-red-500">Required</Badge>}
                {module.federalReq && <Badge variant="outline">Federal</Badge>}
                {module.stateReq && <Badge variant="outline">State</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Duration: {module.duration}</p>
              <Button className="w-full">Start Training</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}