import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Users, Key, Lock, UserCheck, AlertTriangle, Search, Plus } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const UserAccessControl = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@company.com',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30',
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'Editor',
      status: 'active',
      lastLogin: '2024-01-15 09:15',
      permissions: ['read', 'write']
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@company.com',
      role: 'Viewer',
      status: 'inactive',
      lastLogin: '2024-01-10 14:20',
      permissions: ['read']
    }
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Admin',
      description: 'Full system access',
      permissions: ['read', 'write', 'delete', 'admin', 'user_management'],
      userCount: 3
    },
    {
      id: '2',
      name: 'Editor',
      description: 'Content management access',
      permissions: ['read', 'write', 'content_management'],
      userCount: 8
    },
    {
      id: '3',
      name: 'Viewer',
      description: 'Read-only access',
      permissions: ['read'],
      userCount: 15
    }
  ];

  const permissions = [
    'read', 'write', 'delete', 'admin', 'user_management', 
    'content_management', 'api_access', 'billing', 'analytics'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">User Access Control</h1>
          <p className="text-gray-600">Manage user permissions and access levels</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and access levels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>

              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Last login: {user.lastLogin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Define and manage user roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">System Roles</h3>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Role
                </Button>
              </div>

              <div className="grid gap-4">
                {roles.map((role) => (
                  <Card key={role.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <h4 className="font-medium">{role.name}</h4>
                          <p className="text-sm text-gray-600">{role.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map((permission) => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-sm text-gray-600">{role.userCount} users</p>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <CardDescription>Configure system permissions and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {permissions.map((permission) => (
                  <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium capitalize">{permission.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-600">
                        Allow access to {permission.replace('_', ' ')} functionality
                      </p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Security Notice</h4>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Changes to permissions will affect all users with assigned roles. Review carefully before applying.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAccessControl;