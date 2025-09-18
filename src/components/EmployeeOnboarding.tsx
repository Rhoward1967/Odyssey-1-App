import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { UserPlus, FileText, Shield, CheckCircle, Upload } from 'lucide-react';

const EmployeeOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {},
    taxInfo: {},
    i9Info: {},
    directDeposit: {}
  });

  const steps = [
    { id: 1, title: 'Personal Information', icon: UserPlus },
    { id: 2, title: 'Tax Documents (W-4)', icon: FileText },
    { id: 3, title: 'I-9 Verification', icon: Shield },
    { id: 4, title: 'Direct Deposit', icon: CheckCircle }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">First Name</Label>
          <Input className="bg-slate-700 border-slate-600 text-white" />
        </div>
        <div>
          <Label className="text-slate-300">Last Name</Label>
          <Input className="bg-slate-700 border-slate-600 text-white" />
        </div>
      </div>
      <div>
        <Label className="text-slate-300">Email Address</Label>
        <Input type="email" className="bg-slate-700 border-slate-600 text-white" />
      </div>
      <div>
        <Label className="text-slate-300">Phone Number</Label>
        <Input className="bg-slate-700 border-slate-600 text-white" />
      </div>
      <div>
        <Label className="text-slate-300">Address</Label>
        <Textarea className="bg-slate-700 border-slate-600 text-white" />
      </div>
      <div>
        <Label className="text-slate-300">Position</Label>
        <Select>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cleaner">Cleaning Specialist</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="manager">Site Manager</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderTaxInfo = () => (
    <div className="space-y-4">
      <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700">
        <h3 className="text-blue-300 font-semibold mb-2">W-4 Tax Information</h3>
        <p className="text-slate-300 text-sm">Please fill out your tax withholding information</p>
      </div>
      <div>
        <Label className="text-slate-300">Filing Status</Label>
        <Select>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Select filing status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="married-joint">Married Filing Jointly</SelectItem>
            <SelectItem value="married-separate">Married Filing Separately</SelectItem>
            <SelectItem value="head">Head of Household</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-slate-300">Number of Dependents</Label>
        <Input type="number" className="bg-slate-700 border-slate-600 text-white" />
      </div>
      <div>
        <Label className="text-slate-300">Additional Withholding Amount</Label>
        <Input type="number" placeholder="0.00" className="bg-slate-700 border-slate-600 text-white" />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="exempt" />
        <Label htmlFor="exempt" className="text-slate-300">Claim exemption from withholding</Label>
      </div>
    </div>
  );

  const renderI9Info = () => (
    <div className="space-y-4">
      <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
        <h3 className="text-green-300 font-semibold mb-2">I-9 Employment Eligibility</h3>
        <p className="text-slate-300 text-sm">Upload required identification documents</p>
      </div>
      <div>
        <Label className="text-slate-300">Document Type</Label>
        <Select>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passport">US Passport</SelectItem>
            <SelectItem value="license-ss">Driver's License + Social Security Card</SelectItem>
            <SelectItem value="id-ss">State ID + Social Security Card</SelectItem>
            <SelectItem value="green-card">Permanent Resident Card</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document Front
        </Button>
        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document Back
        </Button>
      </div>
      <div className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700">
        <p className="text-yellow-300 text-sm">
          <strong>HR Note:</strong> Physical verification of documents required within 3 business days
        </p>
      </div>
    </div>
  );

  const renderDirectDeposit = () => (
    <div className="space-y-4">
      <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700">
        <h3 className="text-purple-300 font-semibold mb-2">Direct Deposit Setup</h3>
        <p className="text-slate-300 text-sm">Enter your banking information for payroll</p>
      </div>
      <div>
        <Label className="text-slate-300">Bank Name</Label>
        <Input className="bg-slate-700 border-slate-600 text-white" />
      </div>
      <div>
        <Label className="text-slate-300">Routing Number</Label>
        <Input className="bg-slate-700 border-slate-600 text-white" />
      </div>
      <div>
        <Label className="text-slate-300">Account Number</Label>
        <Input className="bg-slate-700 border-slate-600 text-white" />
      </div>
      <div>
        <Label className="text-slate-300">Account Type</Label>
        <Select>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Checking</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="w-full bg-green-600 hover:bg-green-700">
        <Upload className="h-4 w-4 mr-2" />
        Upload Voided Check
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">Employee Onboarding</CardTitle>
            <div className="flex justify-center space-x-4 mt-4">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step.id ? 'bg-green-600' : 'bg-slate-600'
                  }`}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-slate-300 mt-1 text-center">{step.title}</span>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && renderPersonalInfo()}
            {currentStep === 2 && renderTaxInfo()}
            {currentStep === 3 && renderI9Info()}
            {currentStep === 4 && renderDirectDeposit()}

            <div className="flex justify-between pt-6">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="border-slate-600 text-slate-300"
              >
                Previous
              </Button>
              <Button 
                onClick={() => {
                  if (currentStep < 4) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    // Submit form
                    alert('Onboarding completed! HR will review and approve.');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {currentStep === 4 ? 'Complete Onboarding' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeOnboarding;