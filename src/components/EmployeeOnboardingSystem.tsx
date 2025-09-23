import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { User, FileText, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import EmployeeProfileSystem from './EmployeeProfileSystem';
import I9ComplianceSystem from './I9ComplianceSystem';
import ComplianceTrainingHub from './ComplianceTrainingHub';

interface Employee {
  id: string;
  name: string;
  position: string;
  hireDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'non-compliant';
  documents: Document[];
  trainings: Training[];
}

interface Document {
  id: string;
  type: string;
  name: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  uploadDate?: string;
  expiryDate?: string;
  required: boolean;
}

interface Training {
  id: string;
  name: string;
  type: 'bloodborne' | 'hipaa' | 'chemical' | 'uniform' | 'supervisor' | 'safety';
  status: 'not-started' | 'in-progress' | 'completed' | 'expired';
  completedDate?: string;
  expiryDate?: string;
  required: boolean;
}

export default function EmployeeOnboardingSystem() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Smith',
      position: 'Janitorial Technician',
      hireDate: '2024-01-15',
      status: 'in-progress' as const,
      documents: [
        { id: '1', type: 'application', name: 'Employment Application', status: 'approved', required: true },
        { id: '2', type: 'drug-screen', name: 'Drug Screen Results', status: 'pending', required: true },
        { id: '3', type: 'background', name: 'Background Check', status: 'submitted', required: true }
      ],
      trainings: [
        { id: '1', name: 'Bloodborne Pathogen Training', type: 'bloodborne', status: 'completed', completedDate: '2024-01-20', expiryDate: '2025-01-20', required: true },
        { id: '2', name: 'HIPAA Compliance Training', type: 'hipaa', status: 'in-progress', required: true },
        { id: '3', name: 'Chemical Safety Training', type: 'chemical', status: 'not-started', required: true }
      ]
    }
  ]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Handler for uploading documents
  const handleUploadDocument = async () => {
    if (!selectedEmployee) return;
    
    setUploading(true);
    try {
      // Simulate document upload process
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf,.doc,.docx,.jpg,.png';
      fileInput.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // Simulate upload delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Create new document entry
          const newDocument: Document = {
            id: Date.now().toString(),
            type: 'uploaded',
            name: file.name,
            status: 'submitted',
            uploadDate: new Date().toISOString().split('T')[0],
            required: false
          };

          // Update employee documents
          setEmployees(prev => prev.map(emp => 
            emp.id === selectedEmployee.id 
              ? { ...emp, documents: [...emp.documents, newDocument] }
              : emp
          ));

          // Update selected employee
          setSelectedEmployee(prev => prev ? 
            { ...prev, documents: [...prev.documents, newDocument] } 
            : null
          );
          
          alert(`Document "${file.name}" uploaded successfully!`);
        }
        setUploading(false);
      };
      fileInput.click();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  // Handler for assigning training
  const handleAssignTraining = async () => {
    if (!selectedEmployee) return;
    
    setAssigning(true);
    try {
      // Simulate training assignment
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const trainingOptions = [
        'Emergency Response Training',
        'Customer Service Excellence',
        'Data Privacy Training',
        'Safety Protocol Update',
        'Equipment Handling Course'
      ];
      
      const randomTraining = trainingOptions[Math.floor(Math.random() * trainingOptions.length)];
      
      const newTraining: Training = {
        id: Date.now().toString(),
        name: randomTraining,
        type: 'safety',
        status: 'not-started',
        required: false
      };

      // Update employee trainings
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, trainings: [...emp.trainings, newTraining] }
          : emp
      ));

      // Update selected employee
      setSelectedEmployee(prev => prev ? 
        { ...prev, trainings: [...prev.trainings, newTraining] } 
        : null
      );
      
      alert(`Training "${randomTraining}" assigned successfully!`);
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Training assignment failed. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  // Handler for generating compliance report
  const handleGenerateReport = async () => {
    if (!selectedEmployee) return;
    
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const completedDocs = selectedEmployee.documents.filter(doc => doc.status === 'approved').length;
      const totalDocs = selectedEmployee.documents.filter(doc => doc.required).length;
      const completedTrainings = selectedEmployee.trainings.filter(training => training.status === 'completed').length;
      const totalTrainings = selectedEmployee.trainings.filter(training => training.required).length;
      
      const complianceScore = Math.round(((completedDocs + completedTrainings) / (totalDocs + totalTrainings)) * 100);
      
      // Create downloadable report content
      const reportContent = `
COMPLIANCE REPORT
Generated: ${new Date().toLocaleDateString()}
Employee: ${selectedEmployee.name}
Position: ${selectedEmployee.position}
Hire Date: ${selectedEmployee.hireDate}

DOCUMENT COMPLIANCE: ${completedDocs}/${totalDocs} (${Math.round((completedDocs/totalDocs)*100)}%)
TRAINING COMPLIANCE: ${completedTrainings}/${totalTrainings} (${Math.round((completedTrainings/totalTrainings)*100)}%)
OVERALL COMPLIANCE SCORE: ${complianceScore}%

STATUS: ${complianceScore >= 90 ? 'COMPLIANT' : complianceScore >= 70 ? 'PARTIALLY COMPLIANT' : 'NON-COMPLIANT'}
      `;
      
      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${selectedEmployee.name.replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`Compliance report generated! Score: ${complianceScore}%`);
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Report generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'approved': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'submitted': return 'bg-blue-500';
      case 'pending': return 'bg-orange-500';
      case 'rejected': return 'bg-red-500';
      case 'non-compliant': return 'bg-red-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const requiredDocuments = [
    'Employment Application',
    'Drug Screen Results',
    'Background Check',
    'I-9 Form',
    'W-4 Form',
    'Emergency Contact Form',
    'Direct Deposit Authorization'
  ];

  const requiredTrainings = [
    'Bloodborne Pathogen Training',
    'HIPAA Compliance Training',
    'Chemical Safety Training',
    'Uniform Requirements Training',
    'Emergency Procedures Training',
    'Equipment Safety Training'
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Onboarding System</h1>
        <p className="text-gray-600">Manage employee onboarding, compliance training, and documentation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Employees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedEmployee?.id === employee.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedEmployee(employee)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{employee.name}</h3>
                  <Badge className={`${getStatusColor(employee.status)} text-white`}>
                    {employee.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{employee.position}</p>
                <p className="text-sm text-gray-500">Hired: {employee.hireDate}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Employee Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedEmployee ? `${selectedEmployee.name} - Onboarding Details` : 'Select an Employee'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEmployee ? (
              <Tabs defaultValue="documents" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="training">Training</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="documents" className="space-y-4">
                  <div className="space-y-3">
                    {selectedEmployee.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-gray-600">Type: {doc.type}</p>
                          {doc.expiryDate && (
                            <p className="text-sm text-gray-500">Expires: {doc.expiryDate}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(doc.status)} text-white`}>
                            {doc.status}
                          </Badge>
                          {doc.required && (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleUploadDocument}
                    disabled={uploading || !selectedEmployee}
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </TabsContent>

                <TabsContent value="training" className="space-y-4">
                  <div className="space-y-3">
                    {selectedEmployee.trainings.map((training) => (
                      <div key={training.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{training.name}</h4>
                          <p className="text-sm text-gray-600">Type: {training.type}</p>
                          {training.completedDate && (
                            <p className="text-sm text-gray-500">Completed: {training.completedDate}</p>
                          )}
                          {training.expiryDate && (
                            <p className="text-sm text-gray-500">Expires: {training.expiryDate}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getStatusColor(training.status)} text-white`}>
                            {training.status}
                          </Badge>
                          {training.required && (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full"
                    onClick={handleAssignTraining}
                    disabled={assigning || !selectedEmployee}
                  >
                    {assigning ? 'Assigning...' : 'Assign Training'}
                  </Button>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 font-medium">Federal and state compliance requirements must be met to avoid fines.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Federal Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• I-9 Employment Eligibility Verification</li>
                          <li>• OSHA Safety Training</li>
                          <li>• Bloodborne Pathogen Training</li>
                          <li>• Hazard Communication Training</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">State Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li>• State Tax Forms</li>
                          <li>• Workers' Compensation</li>
                          <li>• Background Check</li>
                          <li>• Drug Testing</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={handleGenerateReport}
                    disabled={generating || !selectedEmployee}
                  >
                    {generating ? 'Generating Report...' : 'Generate Compliance Report'}
                  </Button>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Select an employee to view their onboarding details
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}