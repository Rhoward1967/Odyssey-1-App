import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Shield, Users, Settings, Plus, Edit, Trash2, Crown, Key, Eye } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'trial' | 'basic' | 'pro' | 'enterprise' | 'admin' | 'super-admin' | 'hjs-internal';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  level: number;
  permissions: string[];
  description: string;
  userCount: number;
}

export default function UserRoleManager() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      email: 'admin@hjsservices.com',
      name: 'HJS Admin',
      role: 'hjs-internal',
      status: 'active',
      lastLogin: '2025-09-16T10:00:00Z',
      permissions: ['all']
    },
    {
      id: '2',
      email: 'user@example.com',
      name: 'Trial User',
      role: 'trial',
      status: 'active',
      lastLogin: '2025-09-16T09:30:00Z',
      permissions: ['basic_access']
    }
  ]);

  const [roles, setRoles] = useState<Role[]>([
    { id: 'trial', name: 'Trial User', level: 1, permissions: ['basic_access'], description: 'Limited access for trial period', userCount: 45 },
    { id: 'basic', name: 'Basic User', level: 2, permissions: ['basic_access', 'email_tools'], description: 'Standard user access', userCount: 128 },
    { id: 'pro', name: 'Pro User', level: 3, permissions: ['basic_access', 'email_tools', 'ai_features'], description: 'Advanced features access', userCount: 67 },
    { id: 'enterprise', name: 'Enterprise', level: 4, permissions: ['basic_access', 'email_tools', 'ai_features', 'analytics'], description: 'Full feature access', userCount: 23 },
    { id: 'admin', name: 'Administrator', level: 5, permissions: ['basic_access', 'email_tools', 'ai_features', 'analytics', 'user_management'], description: 'Administrative access', userCount: 5 },
    { id: 'super-admin', name: 'Super Admin', level: 6, permissions: ['all'], description: 'Full system access', userCount: 2 },
    { id: 'hjs-internal', name: 'HJS Internal', level: 7, permissions: ['all'], description: 'HJS Services internal access', userCount: 3 }
  ]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getRoleColor = (role: string) => {
    const colors = {
      'trial': 'bg-gray-100 text-gray-800',
      'basic': 'bg-blue-100 text-blue-800',
      'pro': 'bg-purple-100 text-purple-800',
      'enterprise': 'bg-green-100 text-green-800',
      'admin': 'bg-orange-100 text-orange-800',
      'super-admin': 'bg-red-100 text-red-800',
      'hjs-internal': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const updateUserRole = (userId: string, newRole: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole as User['role'], permissions: roles.find(r => r.id === newRole)?.permissions || [] }
        : user
    ));
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Role Management</h2>
          <p className="text-muted-foreground">Manage user roles, permissions, and access levels</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Management
                </CardTitle>
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Last login: {new Date(user.lastLogin).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status}
                      </Badge>
                      <Select value={user.role} onValueChange={(value) => updateUserRole(user.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {role.level >= 6 ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      {role.name}
                    </span>
                    <Badge variant="secondary">{role.userCount} users</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Permission</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center p-2 text-xs">{role.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['basic_access', 'email_tools', 'ai_features', 'analytics', 'user_management', 'all'].map((permission) => (
                      <tr key={permission} className="border-b">
                        <td className="p-2 font-medium">{permission}</td>
                        {roles.map((role) => (
                          <td key={role.id} className="text-center p-2">
                            {role.permissions.includes(permission) || role.permissions.includes('all') ? (
                              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto"></div>
                            ) : (
                              <div className="w-4 h-4 bg-gray-300 rounded-full mx-auto"></div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}