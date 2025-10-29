/**
 * Customer Management Page
 * © 2025 Rickey A Howard. All Rights Reserved.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function CustomerManagement() {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Customer Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Customer management functionality coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
