import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function AIResearchAssistant() {
  return (
    <Card className='border-orange-500/50 bg-orange-50/50'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-orange-700'>
          <AlertTriangle className='h-5 w-5' />
          Component Under Construction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-orange-600'>
          The AI Research Assistant is currently undergoing development and is not yet operational.
        </p>
      </CardContent>
    </Card>
  );
}
