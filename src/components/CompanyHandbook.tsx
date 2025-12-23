import { useAuth } from '@/components/AuthProvider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Heart,
  Search,
  Shield,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Company Handbook interfaces based on our backend schema
interface HandbookCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  required_role: string;
  created_at: string;
  updated_at: string;
}

interface HandbookSection {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  version: number;
  is_published: boolean;
  is_mandatory: boolean;
  effective_date: string;
  required_role: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface HandbookAcknowledgment {
  id: number;
  employee_id: string;
  section_id: number;
  acknowledged_at: string;
}

// User role type for access control
type UserRole = 'staff' | 'manager' | 'admin' | 'owner' | 'super-admin';

export default function CompanyHandbook() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<HandbookCategory[]>([]);
  const [sections, setSections] = useState<HandbookSection[]>([]);
  const [acknowledgments, setAcknowledgments] = useState<HandbookAcknowledgment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<HandbookSection | null>(null);

  // Demo data for bypass mode
  const demoCategories: HandbookCategory[] = [
    {
      id: 1,
      name: 'Welcome & Company Overview',
      slug: 'welcome-overview',
      description: 'Company mission, values, and organizational structure',
      icon: 'Building2',
      sort_order: 1,
      is_active: true,
      required_role: 'staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Employment Policies',
      slug: 'employment-policies',
      description: 'Hiring, termination, and general employment guidelines',
      icon: 'Users',
      sort_order: 2,
      is_active: true,
      required_role: 'staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Health & Safety',
      slug: 'health-safety',
      description: 'Safety protocols, accident reporting, and health guidelines',
      icon: 'Heart',
      sort_order: 3,
      is_active: true,
      required_role: 'staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Time & Attendance',
      slug: 'time-attendance',
      description: 'Work schedules, time tracking, and attendance policies',
      icon: 'Clock',
      sort_order: 4,
      is_active: true,
      required_role: 'staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Compensation & Benefits',
      slug: 'compensation-benefits',
      description: 'Pay structure, benefits, and performance reviews',
      icon: 'DollarSign',
      sort_order: 5,
      is_active: true,
      required_role: 'staff',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const demoSections: HandbookSection[] = [
    {
      id: 1,
      category_id: 1,
      title: 'Welcome to HJS Services',
      slug: 'welcome-message',
      content: `Welcome to HJS Services! We are delighted that you have decided to join our team. As a leading provider of commercial cleaning and janitorial services, we take pride in delivering exceptional service to our clients while maintaining the highest standards of professionalism and integrity.

Our company was founded on the principles of reliability, quality, and customer satisfaction. Every team member plays a crucial role in upholding these values and contributing to our continued success.

This handbook will serve as your guide to understanding our company policies, procedures, and expectations. Please take the time to read through all sections carefully and keep this handbook as a reference throughout your employment with us.

We look forward to working with you and helping you grow professionally within our organization.`,
      summary: 'Welcome message and company introduction',
      version: 1,
      is_published: true,
      is_mandatory: true,
      effective_date: new Date().toISOString().split('T')[0],
      required_role: 'staff',
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      category_id: 1,
      title: 'Company Mission & Values',
      slug: 'mission-values',
      content: `**Our Mission**
To provide superior commercial cleaning and janitorial services that exceed our clients' expectations while fostering a positive work environment for our employees.

**Our Core Values**

**Integrity**: We conduct business with honesty, transparency, and ethical standards in all our interactions.

**Quality**: We are committed to delivering consistent, high-quality services that meet and exceed industry standards.

**Reliability**: Our clients depend on us, and we take that responsibility seriously by being punctual, consistent, and dependable.

**Respect**: We treat all employees, clients, and partners with dignity and respect, fostering an inclusive workplace.

**Growth**: We support the professional development of our team members and continuously improve our services.

**Safety**: The safety and well-being of our employees and clients is our top priority in everything we do.`,
      summary: 'Company mission statement and core values',
      version: 1,
      is_published: true,
      is_mandatory: true,
      effective_date: new Date().toISOString().split('T')[0],
      required_role: 'staff',
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      category_id: 3,
      title: 'Safety Protocols',
      slug: 'safety-protocols',
      content: `**General Safety Rules**
- Follow all posted safety procedures and guidelines
- Wear required personal protective equipment (PPE)
- Report unsafe conditions immediately to your supervisor
- Participate in all required safety training programs

**Chemical Safety**
- Read and understand all Material Safety Data Sheets (MSDS)
- Use chemicals only as directed and with proper ventilation
- Never mix different cleaning chemicals
- Store chemicals safely and securely

**Equipment Safety**
- Inspect equipment before each use
- Report damaged or malfunctioning equipment immediately
- Use equipment only for its intended purpose
- Follow proper lifting techniques to prevent injury

**Emergency Procedures**
- Know the location of emergency exits and equipment
- Report all accidents and injuries immediately
- Follow evacuation procedures if required
- Contact emergency services when necessary`,
      summary: 'Workplace safety protocols and emergency procedures',
      version: 1,
      is_published: true,
      is_mandatory: true,
      effective_date: new Date().toISOString().split('T')[0],
      required_role: 'staff',
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      category_id: 4,
      title: 'Work Schedules',
      slug: 'work-schedules',
      content: `**Standard Operating Hours**
Most cleaning services are performed during evening and overnight hours to minimize disruption to client operations.

**Typical Shifts**
- Day Shift: 8:00 AM - 4:00 PM
- Evening Shift: 4:00 PM - 12:00 AM  
- Night Shift: 10:00 PM - 6:00 AM
- Weekend Coverage: Saturday and Sunday as needed

**Schedule Changes**
- Two weeks advance notice required for schedule changes
- Emergency coverage available with supervisor approval
- Flexibility provided when possible for employee needs

**Punctuality**
Arriving on time is essential for maintaining service commitments to our clients. Repeated tardiness may result in disciplinary action.`,
      summary: 'Work schedule information and time expectations',
      version: 1,
      is_published: true,
      is_mandatory: true,
      effective_date: new Date().toISOString().split('T')[0],
      required_role: 'staff',
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Check if user meets role requirements
  const meetsRoleRequirement = (requiredRole: string): boolean => {
    if (!userRole) return false;
    
    const roleHierarchy: { [key: string]: number } = {
      'staff': 1,
      'manager': 2,
      'admin': 3,
      'owner': 4,
      'super-admin': 5
    };
    
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  };

  // Get user role and fetch handbook data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Check if we're in bypass mode
        if (import.meta.env.VITE_AUTH_BYPASS === "true") {
          console.log('🚪 Using demo handbook data (bypass mode)');
          setUserRole('super-admin');
          setCategories(demoCategories);
          setSections(demoSections);
          setError("Demo Mode: Showing sample handbook content");
          setLoading(false);
          return;
        }

        // Fetch user role (same pattern as EmployeeManagement)
        const { data: userOrgData, error: roleError } = await supabase
          .from('user_organizations')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          setError("Could not determine user permissions");
          setLoading(false);
          return;
        }

        setUserRole(userOrgData.role as UserRole);

        // Fetch handbook categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('handbook_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch handbook sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('handbook_sections')
          .select('*')
          .eq('is_published', true)
          .order('sort_order');

        if (sectionsError) throw sectionsError;
        setSections(sectionsData || []);

        // Fetch user acknowledgments
        const { data: ackData, error: ackError } = await supabase
          .from('handbook_acknowledgments')
          .select('*')
          .eq('employee_id', user.id);

        if (ackError) throw ackError;
        setAcknowledgments(ackData || []);

      } catch (err: any) {
        console.error("Error fetching handbook data:", err);
        setError(err.message || "Failed to load handbook data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter sections based on search and category
  const filteredSections = sections.filter(section => {
    const matchesSearch = searchTerm === '' || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      categories.find(cat => cat.id === section.category_id)?.slug === selectedCategory;
    
    const hasAccess = meetsRoleRequirement(section.required_role);
    
    return matchesSearch && matchesCategory && hasAccess;
  });

  // Get category name by slug
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Building2,
      Users,
      Shield,
      Heart,
      Clock,
      DollarSign,
      BookOpen,
      FileText
    };
    
    const Icon = icons[iconName] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  // Check if section is acknowledged
  const isAcknowledged = (sectionId: number): boolean => {
    return acknowledgments.some(ack => ack.section_id === sectionId);
  };

  // Handle section acknowledgment
  const handleAcknowledgment = async (sectionId: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('handbook_acknowledgments')
        .insert({
          employee_id: user.id,
          section_id: sectionId,
          ip_address: '127.0.0.1', // In real implementation, get actual IP
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      // Update local state
      setAcknowledgments(prev => [...prev, {
        id: Date.now(),
        employee_id: user.id,
        section_id: sectionId,
        acknowledged_at: new Date().toISOString()
      }]);

    } catch (err: any) {
      console.error("Error acknowledging section:", err);
      setError("Failed to record acknowledgment");
    }
  };

  // Log access for audit trail
  const logAccess = async (sectionId: number, accessType: string) => {
    if (!user) return;

    try {
      await supabase
        .from('handbook_access_log')
        .insert({
          employee_id: user.id,
          section_id: sectionId,
          access_type: accessType,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        });
    } catch (err) {
      console.error("Error logging access:", err);
    }
  };

  if (loading) {
    return (
      <Card className="max-w-7xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading company handbook...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          HJS Services Employee Handbook
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Role: {userRole || 'Loading...'}</Badge>
            <Badge variant="outline">Sections: {filteredSections.length}</Badge>
          </div>
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

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search handbook sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {categories.map((category) => {
            const categorySections = sections.filter(s => s.category_id === category.id && meetsRoleRequirement(s.required_role));
            const acknowledgedCount = categorySections.filter(s => isAcknowledged(s.id)).length;
            
            return (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getIconComponent(category.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline">{categorySections.length} sections</Badge>
                        {acknowledgedCount > 0 && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            {acknowledgedCount} read
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Handbook Sections */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Handbook Sections</h2>
          
          {filteredSections.map((section) => (
            <Card key={section.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{section.title}</h3>
                      {section.is_mandatory && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                      {isAcknowledged(section.id) && (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{getCategoryName(section.category_id)}</p>
                    <p className="text-sm text-gray-700">{section.summary}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedSection(section);
                        logAccess(section.id, 'view');
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Read
                    </Button>
                    {section.is_mandatory && !isAcknowledged(section.id) && (
                      <Button 
                        size="sm" 
                        onClick={() => handleAcknowledgment(section.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 flex items-center gap-4">
                  <span>Version {section.version}</span>
                  <span>Effective: {new Date(section.effective_date).toLocaleDateString()}</span>
                  <span>Role: {section.required_role}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredSections.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No handbook sections found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Section Detail Modal/Panel would go here */}
        {selectedSection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedSection.title}</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedSection(null)}>
                    Close
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{getCategoryName(selectedSection.category_id)}</p>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedSection.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                  }}
                />
                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Version {selectedSection.version} • Effective {new Date(selectedSection.effective_date).toLocaleDateString()}
                  </div>
                  {selectedSection.is_mandatory && !isAcknowledged(selectedSection.id) && (
                    <Button onClick={() => {
                      handleAcknowledgment(selectedSection.id);
                      setSelectedSection(null);
                    }}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      I Have Read and Acknowledge
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}