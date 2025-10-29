import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Users } from 'lucide-react';

const EmployeeScheduleManager: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-400 bg-gradient-to-r from-blue-100 to-green-100">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-blue-800">
            <Calendar className="h-8 w-8 text-green-600" />
            Employee Schedule Manager
            <Users className="h-8 w-8 text-blue-600" />
          </CardTitle>
          <Badge className="mx-auto bg-blue-200 text-blue-800 text-lg px-4 py-2">
            Integrated Workforce Scheduling System
          </Badge>
        </CardHeader>
      </Card>
    </div>
  );
};

export default EmployeeScheduleManager;
