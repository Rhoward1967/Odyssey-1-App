import React from 'react';
import VerticalNavigation from '../components/VerticalNavigation';
import ProfileManager from '../components/ProfileManager';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      <VerticalNavigation />
      <div className="md:ml-64 flex-1 container mx-auto px-4 py-8">
        <ProfileManager />
      </div>
    </div>
  );
};

export default Profile;