import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserPlus, UserCheck, UserX, Activity, Shield, Mail, Phone } from 'lucide-react';

export default function UsersTab() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user'
  });

  const handleAddUser = () => {
    // Add user logic here
    console.log('Adding user:', newUser);
    setIsAddUserOpen(false);
    setNewUser({ name: '', email: '', phone: '', role: 'user' });
  };

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">2,847</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Today</p>
                <p className="text-2xl font-bold text-green-400">1,234</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New This Week</p>
                <p className="text-2xl font-bold text-purple-400">89</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="border-green-600 text-green-400 hover:bg-green-600/20"
              onClick={() => alert('Approve Users functionality')}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Approve Users
            </Button>
            <Button 
              variant="outline" 
              className="border-red-600 text-red-400 hover:bg-red-600/20"
              onClick={() => alert('Suspend Users functionality')}
            >
              <UserX className="w-4 h-4 mr-2" />
              Suspend Users
            </Button>
            
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/20">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add New User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Add New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400">Name</label>
                    <Input
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Phone</label>
                    <Input
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-700">
                      Add User
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
              onClick={() => alert('Bulk Actions functionality')}
            >
              <Users className="w-4 h-4 mr-2" />
              Bulk Actions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}