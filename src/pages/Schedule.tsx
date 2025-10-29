/**
 * Schedule/Calendar Page
 * © 2025 Rickey A Howard. All Rights Reserved.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function Schedule() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Schedule & Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Calendar and scheduling functionality coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}