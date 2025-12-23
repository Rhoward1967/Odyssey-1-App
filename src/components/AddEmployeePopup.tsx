import { Building, User, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface AddEmployeePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmployeeData) => void;
}

interface EmployeeData {
  name: string;
  position: string;
  department: string;
}

export default function AddEmployeePopup({ isOpen, onClose, onSave }: AddEmployeePopupProps) {
  const [formData, setFormData] = useState<EmployeeData>({
    name: '',
    position: '',
    department: ''
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (formData.name && formData.position && formData.department) {
      onSave(formData);
      setFormData({ name: '', position: '', department: '' });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="bg-black/80 backdrop-blur-sm border-white/20 w-96">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Add Employee
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="employee-name" className="text-white text-sm mb-1 block">Name</label>
            <Input
              id="employee-name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Employee name..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="employee-position" className="text-white text-sm mb-1 block">Position</label>
            <Input
              id="employee-position"
              name="position"
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              placeholder="Job position..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="employee-department" className="text-white text-sm mb-1 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Department
            </label>
            <Input
              id="employee-department"
              name="department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              placeholder="Department..."
              className="bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Add Employee
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}