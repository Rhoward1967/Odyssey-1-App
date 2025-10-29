import React from 'react';
import { TimeClockInterface } from '../components/TimeClockInterface';

export const HRDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">HR Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Time Clock Section */}
          <div className="lg:col-span-1">
            <TimeClockInterface />
          </div>
          
          {/* Quick Stats Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Hours Worked:</span>
                  <span className="font-semibold">0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Break Time:</span>
                  <span className="font-semibold">0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime:</span>
                  <span className="font-semibold">0.00</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Request Time Off
                </button>
                <button className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700">
                  View Pay Stubs
                </button>
                <button className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700">
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};