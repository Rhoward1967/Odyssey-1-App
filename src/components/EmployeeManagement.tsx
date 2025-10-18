import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Employee interface matching our database schema
interface Employee {
  id: string;
  user_id: string | null;
  organization_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  position: string;
  department: string;
  hire_date: string;
  employment_type: 'full-time' | 'part-time' | 'contractor' | 'on-call';
  status: 'active' | 'inactive' | 'terminated' | 'on-leave';
  hourly_rate: number | null;
  salary: number | null;
  supervisor_id: string | null;
  profile_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// User role type based on our RLS policies
type UserRole = 'staff' | 'manager' | 'admin' | 'owner' | 'super-admin';

function EmployeeManagement() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Get user's role and organization
  const fetchUserRole = async () => {
    if (!user) return;
    
    // Check if we're in bypass mode
    if (import.meta.env.VITE_AUTH_BYPASS === "true") {
      console.log('🚪 Using demo employee data (bypass mode)');
      setUserRole('super-admin');
      setOrganizationId(1);
      setError("Demo Mode: Showing sample employee data");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_organizations')
        .select('role, organization_id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setUserRole(data.role as UserRole);
      setOrganizationId(data.organization_id);
    } catch (err: any) {
      console.error("Error fetching user role:", err);
      setError("Could not determine user permissions");
    }
  };

  // Fetch employees based on user role
  const fetchEmployees = async () => {
    if (!organizationId) return;
    
    setLoading(true);
    try {
      // Check if we're in bypass mode - use demo data
      if (import.meta.env.VITE_AUTH_BYPASS === "true") {
        const demoEmployees: Employee[] = [
          {
            id: '1',
            user_id: 'dev-user-id',
            organization_id: 1,
            first_name: 'System',
            last_name: 'Administrator',
            email: 'admin@odyssey.local',
            phone: '(555) 123-4567',
            position: 'System Administrator',
            department: 'IT',
            hire_date: '2024-01-15',
            employment_type: 'full-time',
            status: 'active',
            hourly_rate: null,
            salary: 75000,
            supervisor_id: null,
            profile_data: { certifications: ['OSHA 30', 'HIPAA', 'Bloodborne Pathogens'] },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            user_id: null,
            organization_id: 1,
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@hjsservices.com',
            phone: '(555) 234-5678',
            position: 'NE GA Area Supervisor',
            department: 'Operations',
            hire_date: '2023-06-01',
            employment_type: 'full-time',
            status: 'active',
            hourly_rate: 22.50,
            salary: null,
            supervisor_id: '1',
            profile_data: { certifications: ['OSHA 30', 'HIPAA'] },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            user_id: null,
            organization_id: 1,
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@hjsservices.com',
            phone: '(555) 345-6789',
            position: 'Facility Manager',
            department: 'Operations',
            hire_date: '2023-09-15',
            employment_type: 'part-time',
            status: 'active',
            hourly_rate: 18.00,
            salary: null,
            supervisor_id: '2',
            profile_data: { certifications: ['OSHA 10'] },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            user_id: null,
            organization_id: 1,
            first_name: 'Sarah',
            last_name: 'Williams',
            email: 'sarah.williams@hjsservices.com',
            phone: '(555) 456-7890',
            position: 'Custodian',
            department: 'Cleaning',
            hire_date: '2024-03-01',
            employment_type: 'on-call',
            status: 'active',
            hourly_rate: 15.00,
            salary: null,
            supervisor_id: '3',
            profile_data: { certifications: ['Bloodborne Pathogens'] },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setEmployees(demoEmployees);
        return;
      }

      // Live backend query - RLS policies will automatically filter based on user role
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('organization_id', organizationId)
        .order('last_name', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (err: any) {
      console.error("Error fetching employees:", err);
      setError(`Failed to load employees: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (organizationId && userRole) {
      fetchEmployees();
    }
  }, [organizationId, userRole]);

  // Filter employees based on search and department
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = ['all', ...new Set(employees.map(emp => emp.department))];

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'terminated':
        return <Badge variant="destructive">Terminated</Badge>;
      case 'on-leave':
        return <Badge variant="outline">On Leave</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Check if user can add employees (admin/owner roles only)
  const canAddEmployees = userRole === 'admin' || userRole === 'owner' || userRole === 'super-admin';

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Employee Management System
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Role: {userRole || 'Loading...'}</Badge>
            <Badge variant="outline">Total: {filteredEmployees.length}</Badge>
          </div>
          {canAddEmployees && (
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant={error.includes('Demo Mode') ? "default" : "destructive"} className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading employees...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {employee.first_name} {employee.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{employee.position}</p>
                        </div>
                        {getStatusBadge(employee.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span>{employee.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{employee.employment_type}</span>
                        </div>
                        <div className="text-gray-600">
                          <p>📧 {employee.email}</p>
                          {employee.phone && <p>📞 {employee.phone}</p>}
                        </div>
                        {(employee.hourly_rate || employee.salary) && (
                          <div className="text-sm font-medium text-green-600">
                            {employee.salary 
                              ? `$${employee.salary.toLocaleString()}/year`
                              : `$${employee.hourly_rate}/hour`
                            }
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Details
                        </Button>
                        {(userRole === 'admin' || userRole === 'owner' || userRole === 'manager' || userRole === 'super-admin') && (
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 p-3 text-left">Name</th>
                    <th className="border border-gray-200 p-3 text-left">Position</th>
                    <th className="border border-gray-200 p-3 text-left">Department</th>
                    <th className="border border-gray-200 p-3 text-left">Status</th>
                    <th className="border border-gray-200 p-3 text-left">Employment</th>
                    <th className="border border-gray-200 p-3 text-left">Compensation</th>
                    <th className="border border-gray-200 p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-3">
                        <div>
                          <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                          <div className="text-sm text-gray-600">{employee.email}</div>
                        </div>
                      </td>
                      <td className="border border-gray-200 p-3">{employee.position}</td>
                      <td className="border border-gray-200 p-3">{employee.department}</td>
                      <td className="border border-gray-200 p-3">{getStatusBadge(employee.status)}</td>
                      <td className="border border-gray-200 p-3">{employee.employment_type}</td>
                      <td className="border border-gray-200 p-3">
                        {employee.salary 
                          ? `$${employee.salary.toLocaleString()}/year`
                          : employee.hourly_rate 
                          ? `$${employee.hourly_rate}/hour`
                          : 'N/A'
                        }
                      </td>
                      <td className="border border-gray-200 p-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">View</Button>
                          {(userRole === 'admin' || userRole === 'owner' || userRole === 'manager' || userRole === 'super-admin') && (
                            <Button size="sm" variant="outline">Edit</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {filteredEmployees.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No employees found matching your criteria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EmployeeManagement;