import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, User, Building2, CreditCard, Settings } from 'lucide-react';

interface ProfileManagerProps {
  onClose?: () => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ onClose }) => {
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@company.com',
    company: 'Acme Corporation',
    title: 'Project Manager',
    phone: '+1 (555) 123-4567',
    bio: 'Experienced project manager specializing in government contracts.',
    profileImage: '',
    companyLogo: ''
  });

  const [subscription, setSubscription] = useState({
    plan: 'Professional',
    status: 'Active',
    nextBilling: '2024-02-15',
    amount: '$299/month'
  });

  const profileFileRef = useRef<HTMLInputElement>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (type: 'profile' | 'logo') => {
    if (type === 'profile') {
      profileFileRef.current?.click();
    } else {
      logoFileRef.current?.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Profile Management</h1>
        {onClose && (
          <Button variant="outline" onClick={onClose}>Close</Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-purple-600">
            <Building2 className="w-4 h-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-purple-600">
            <CreditCard className="w-4 h-4 mr-2" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profileData.profileImage} />
                  <AvatarFallback className="text-2xl">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button onClick={() => handleImageUpload('profile')} className="mb-2">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-400">JPG, PNG up to 5MB</p>
                </div>
                <input
                  ref={profileFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="title" className="text-white">Job Title</Label>
                  <Input
                    id="title"
                    value={profileData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <Button className="bg-purple-600 hover:bg-purple-700">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Company Information</CardTitle>
              <CardDescription>Manage your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-slate-700 rounded-lg flex items-center justify-center">
                  {profileData.companyLogo ? (
                    <img src={profileData.companyLogo} alt="Company Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <Building2 className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div>
                  <Button onClick={() => handleImageUpload('logo')} className="mb-2">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-sm text-gray-400">PNG, SVG preferred, up to 2MB</p>
                </div>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <Label htmlFor="company" className="text-white">Company Name</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <Button className="bg-purple-600 hover:bg-purple-700">
                Update Company Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Current Subscription</CardTitle>
                <CardDescription>Manage your ODYSSEY-1 subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{subscription.plan} Plan</h3>
                    <p className="text-gray-400">{subscription.amount}</p>
                  </div>
                  <Badge className={subscription.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}>
                    {subscription.status}
                  </Badge>
                </div>
                <p className="text-gray-400 mb-4">Next billing: {subscription.nextBilling}</p>
                <div className="flex gap-3">
                  <Button variant="outline">Change Plan</Button>
                  <Button variant="outline" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileManager;