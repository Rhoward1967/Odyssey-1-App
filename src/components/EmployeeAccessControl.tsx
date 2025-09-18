import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { isHJSAdmin, getHJSRole } from '@/lib/adminPrivileges';
import { useAuth } from '@/components/AuthProvider';
import { Users, Shield, Settings, Plus, Edit, Trash2 } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'supervisor' | 'manager' | 'admin';
  department: string;
  status: 'active' | 'inactive';
  permissions: string[];
  lastLogin?: string;
}

const EmployeeAccessControl: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@howardjanitorial.net',
      role: 'employee',
      department: 'Cleaning',
      status: 'active',
      permissions: ['schedule_view', 'timesheet_submit'],
      lastLogin: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@howardjanitorial.net',
      role: 'supervisor',
      department: 'Operations',
      status: 'active',
      permissions: ['schedule_manage', 'employee_view', 'reports_view'],
      lastLogin: '2024-01-16'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: 'employee' as Employee['role'],
    department: '',
    permissions: [] as string[]
  });

  const isHJSUser = user?.email ? isHJSAdmin(user.email) : false;
  const hjsRole = user?.email ? getHJSRole(user.email) : null;

  const availablePermissions = [
    'schedule_view', 'schedule_manage', 'timesheet_submit', 'timesheet_approve',
    'employee_view', 'employee_manage', 'reports_view', 'reports_generate',
    'payroll_view', 'payroll_manage', 'admin_access'
  ];

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) return;
    
    const employee: Employee = {
      id: Date.now().toString(),
      ...newEmployee,
      status: 'active'
    };
    
    setEmployees([...employees, employee]);
    setNewEmployee({
      name: '',
      email: '',
      role: 'employee',
      department: '',
      permissions: []
    });
    setShowAddForm(false);
  };

  const toggleEmployeeStatus = (id: string) => {
    setEmployees(employees.map(emp => 
      emp.id === id 
        ? { ...emp, status: emp.status === 'active' ? 'inactive' : 'active' }
        : emp
    ));
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  if (!isHJSUser) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Access denied. HJS admin privileges required.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="h-5 w-5" />
            Employee Access Control
            <Badge variant="secondary" className="bg-purple-600 text-white ml-auto">
              HJS {hjsRole}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-300">Manage employee access and permissions</p>
            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </div>

          {showAddForm && (
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white text-lg">Add New Employee</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Name</Label>
                    <Input
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Role</Label>
                    <Select value={newEmployee.role} onValueChange={(value: Employee['role']) => 
                      setNewEmployee({...newEmployee, role: value})
                    }>
                      <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Department</Label>
                    <Input
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      className="bg-slate-600 border-slate-500 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddEmployee} className="bg-green-600 hover:bg-green-700">
                    Add Employee
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline" 
                    className="border-slate-600 text-gray-300 hover:bg-slate-700">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {employees.map((employee) => (
              <Card key={employee.id} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h3 className="font-medium text-white">{employee.name}</h3>
                          <p className="text-sm text-gray-400">{employee.email}</p>
                        </div>
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                        <Badge variant="outline" className="border-slate-500 text-gray-300">
                          {employee.role}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                        <span>Dept: {employee.department}</span>
                        <span>Permissions: {employee.permissions.length}</span>
                        {employee.lastLogin && <span>Last: {employee.lastLogin}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={employee.status === 'active'}
                        onCheckedChange={() => toggleEmployeeStatus(employee.id)}
                      />
                      <Button size="sm" variant="outline" 
                        className="border-slate-600 text-gray-300 hover:bg-slate-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" 
                        onClick={() => removeEmployee(employee.id)}
                        className="border-red-600 text-red-400 hover:bg-red-600/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAccessControl;