import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react'; // Import React for the ElementType

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType; // Use the generic React.ElementType for the icon
}

export default function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}