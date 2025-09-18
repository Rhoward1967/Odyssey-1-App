import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Save, 
  Edit3, 
  RefreshCw,
  Bot,
  AlertCircle
} from 'lucide-react';

interface BidderProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  lastUpdated: string;
}

interface BidderProfileEditorProps {
  profile: BidderProfile;
  onProfileUpdate: (profile: BidderProfile) => void;
  onTriggerOdysseyUpdate: () => void;
}

const BidderProfileEditor: React.FC<BidderProfileEditorProps> = ({
  profile,
  onProfileUpdate,
  onTriggerOdysseyUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<BidderProfile>(profile);
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdatingOdyssey, setIsUpdatingOdyssey] = useState(false);

  const handleInputChange = (field: keyof BidderProfile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedProfile = {
      ...editedProfile,
      lastUpdated: new Date().toISOString()
    };
    onProfileUpdate(updatedProfile);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleOdysseyUpdate = async () => {
    setIsUpdatingOdyssey(true);
    // Simulate API call to Odyssey-1
    await new Promise(resolve => setTimeout(resolve, 2000));
    onTriggerOdysseyUpdate();
    setIsUpdatingOdyssey(false);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Bidder Profile
          </CardTitle>
          <div className="flex space-x-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={!hasChanges}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-slate-300"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium">Full Name</label>
            {isEditing ? (
              <Input
                value={editedProfile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            ) : (
              <div className="flex items-center text-white">
                <User className="w-4 h-4 mr-2 text-slate-400" />
                {profile.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium">Email</label>
            {isEditing ? (
              <Input
                type="email"
                value={editedProfile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            ) : (
              <div className="flex items-center text-white">
                <Mail className="w-4 h-4 mr-2 text-slate-400" />
                {profile.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium">Phone</label>
            {isEditing ? (
              <Input
                value={editedProfile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            ) : (
              <div className="flex items-center text-white">
                <Phone className="w-4 h-4 mr-2 text-slate-400" />
                {profile.phone}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium">Company (Optional)</label>
            {isEditing ? (
              <Input
                value={editedProfile.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
            ) : (
              <div className="flex items-center text-white">
                <Building className="w-4 h-4 mr-2 text-slate-400" />
                {profile.company || 'N/A'}
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4">
          <h4 className="text-slate-300 font-medium flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Address Information
          </h4>
          
          <div className="grid md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">Street Address</label>
              {isEditing ? (
                <Input
                  value={editedProfile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <div className="text-white">{profile.address}</div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">City</label>
              {isEditing ? (
                <Input
                  value={editedProfile.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <div className="text-white">{profile.city}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">State</label>
              {isEditing ? (
                <Input
                  value={editedProfile.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <div className="text-white">{profile.state}</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm font-medium">ZIP Code</label>
              {isEditing ? (
                <Input
                  value={editedProfile.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              ) : (
                <div className="text-white">{profile.zipCode}</div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-2">
          <label className="text-slate-300 text-sm font-medium">Notes</label>
          {isEditing ? (
            <Textarea
              value={editedProfile.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
              placeholder="Additional notes about this bidder..."
            />
          ) : (
            <div className="text-white bg-slate-700/30 p-3 rounded">
              {profile.notes || 'No notes available'}
            </div>
          )}
        </div>

        {/* Odyssey-1 Integration */}
        <div className="border-t border-slate-600 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-slate-300 font-medium flex items-center">
              <Bot className="w-4 h-4 mr-2 text-purple-400" />
              Odyssey-1 AI Integration
            </h4>
            <Badge variant="outline" className="border-purple-500 text-purple-300">
              AI Powered
            </Badge>
          </div>
          
          <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
            <p className="text-slate-300 text-sm mb-3">
              When profile information is updated, Odyssey-1 can automatically regenerate 
              estimates and agreements with the new information.
            </p>
            
            <Button
              onClick={handleOdysseyUpdate}
              disabled={isUpdatingOdyssey || isEditing}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              {isUpdatingOdyssey ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Bot className="w-4 h-4 mr-2" />
              )}
              {isUpdatingOdyssey ? 'Updating...' : 'Update Documents with Odyssey-1'}
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-slate-500 border-t border-slate-600 pt-2">
          Last updated: {new Date(profile.lastUpdated).toLocaleString()}
        </div>

        {hasChanges && isEditing && (
          <div className="flex items-center text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            You have unsaved changes
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidderProfileEditor;