import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Save, AlertTriangle, CheckCircle } from 'lucide-react';

interface EmployeeProfile {
  id: string;
  photo?: string;
  firstName: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  age: number;
  sex: 'Male' | 'Female';
  title: string;
  hireDate: string;
  address: string;
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
  i9Status: 'Pending' | 'Completed' | 'Expired';
  eVerifyStatus: 'Pending' | 'Verified' | 'Failed';
  workAuthorization: boolean;
}

export default function EmployeeProfileSystem() {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [profile, setProfile] = useState<Partial<EmployeeProfile>>({});
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const employees: EmployeeProfile[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      ssn: '***-**-1234',
      dateOfBirth: '1990-05-15',
      age: 33,
      sex: 'Male',
      title: 'Janitor Level II',
      hireDate: '2023-01-15',
      address: '123 Main St, City, State 12345',
      phone: '(555) 123-4567',
      email: 'john.smith@email.com',
      emergencyContact: 'Jane Smith',
      emergencyPhone: '(555) 987-6543',
      i9Status: 'Completed',
      eVerifyStatus: 'Verified',
      workAuthorization: true
    }
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
        setProfile({ ...profile, photo: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employee Profile System</h2>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEmployee === emp.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEmployee(emp.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-sm text-gray-600">{emp.title}</p>
                    </div>
                    <div className="flex gap-1">
                      <Badge variant={emp.i9Status === 'Completed' ? 'default' : 'destructive'}>
                        I-9
                      </Badge>
                      <Badge variant={emp.eVerifyStatus === 'Verified' ? 'default' : 'destructive'}>
                        E-Verify
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Employee Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Photo Section */}
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Employee" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </span>
                  </Button>
                </Label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <p className="text-sm text-gray-600 mt-2">Required for identification</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={profile.firstName || ''}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={profile.lastName || ''}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ssn">Social Security Number *</Label>
                <Input
                  id="ssn"
                  type="password"
                  placeholder="XXX-XX-XXXX"
                  value={profile.ssn || ''}
                  onChange={(e) => setProfile({ ...profile, ssn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profile.dateOfBirth || ''}
                  onChange={(e) => {
                    const age = calculateAge(e.target.value);
                    setProfile({ ...profile, dateOfBirth: e.target.value, age });
                  }}
                />
              </div>
              <div>
                <Label htmlFor="sex">Sex *</Label>
                <Select value={profile.sex} onValueChange={(value) => setProfile({ ...profile, sex: value as 'Male' | 'Female' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Select value={profile.title} onValueChange={(value) => setProfile({ ...profile, title: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Janitor Level I">Janitor Level I</SelectItem>
                    <SelectItem value="Janitor Level II">Janitor Level II</SelectItem>
                    <SelectItem value="Team Lead">Team Lead</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={profile.address || ''}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContact"
                    value={profile.emergencyContact || ''}
                    onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Phone *</Label>
                  <Input
                    id="emergencyPhone"
                    value={profile.emergencyPhone || ''}
                    onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Federal Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {profile.i9Status === 'Completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span>Form I-9: {profile.i9Status || 'Pending'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {profile.eVerifyStatus === 'Verified' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span>E-Verify: {profile.eVerifyStatus || 'Pending'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {profile.workAuthorization ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <span>Work Authorization</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}