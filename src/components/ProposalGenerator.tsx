import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Send, Building, DollarSign, Calendar } from 'lucide-react';

export default function ProposalGenerator() {
  const [proposalData, setProposalData] = useState({
    clientName: '',
    clientType: '',
    facilitySize: '',
    services: [] as string[],
    frequency: '',
    duration: '',
    specialRequirements: '',
    pricing: ''
  });

  const serviceOptions = [
    { id: 'commercial', name: 'Commercial Cleaning', basePrice: 0.08 },
    { id: 'terminal', name: 'Terminal Cleaning (Healthcare)', basePrice: 0.15 },
    { id: 'decontamination', name: 'CBRN/Hazmat Decontamination', basePrice: 0.25 },
    { id: 'floor-care', name: 'Floor & Carpet Care', basePrice: 0.05 },
    { id: 'post-construction', name: 'Post-Construction Cleanup', basePrice: 0.12 },
    { id: 'emergency', name: 'Emergency Response Services', basePrice: 0.20 }
  ];

  const clientTypes = [
    'Government Agency',
    'Healthcare Facility',
    'Educational Institution',
    'Commercial Business',
    'Industrial Facility'
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily', multiplier: 1.0 },
    { value: 'weekly', label: 'Weekly', multiplier: 0.3 },
    { value: 'bi-weekly', label: 'Bi-Weekly', multiplier: 0.2 },
    { value: 'monthly', label: 'Monthly', multiplier: 0.1 }
  ];

  const handleServiceToggle = (serviceId: string) => {
    setProposalData(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const calculatePricing = () => {
    const size = parseInt(proposalData.facilitySize) || 0;
    const frequency = frequencies.find(f => f.value === proposalData.frequency);
    const selectedServices = serviceOptions.filter(s => proposalData.services.includes(s.id));
    
    if (!size || !frequency || selectedServices.length === 0) return 0;
    
    const basePrice = selectedServices.reduce((total, service) => total + service.basePrice, 0);
    return Math.round(size * basePrice * frequency.multiplier);
  };

  const generateProposal = () => {
    const pricing = calculatePricing();
    const selectedServiceNames = serviceOptions
      .filter(s => proposalData.services.includes(s.id))
      .map(s => s.name);

    return `
PROFESSIONAL JANITORIAL SERVICES PROPOSAL

HJS Services LLC dba Howard Janitorial Services
P.O. Box 80054, Athens, GA 30608
Phone: 800-403-8492
Email: christla@howardjanitorial.net
Website: www.howardjanitorial.net

Date: ${new Date().toLocaleDateString()}
Prepared for: ${proposalData.clientName}
Client Type: ${proposalData.clientType}

COMPANY OVERVIEW
HJS Services LLC is a professional and certified woman-owned small business specializing in comprehensive janitorial, environmental, and facility maintenance services. Since 1990, we have provided exceptional cleaning solutions to government agencies, healthcare facilities, educational institutions, and commercial businesses.

CERTIFICATIONS & CREDENTIALS
• DUNS Number: 829029292
• CAGE Code: 97K10
• NAICS Code: 561720
• Woman-Owned Small Business (WOSB)
• SAM.gov Registered and Active
• BBB A+ Rating (15+ years)

PROPOSED SERVICES
${selectedServiceNames.map(service => `• ${service}`).join('\n')}

FACILITY SPECIFICATIONS
• Square Footage: ${proposalData.facilitySize} sq ft
• Service Frequency: ${frequencies.find(f => f.value === proposalData.frequency)?.label}
• Contract Duration: ${proposalData.duration}

SPECIAL REQUIREMENTS
${proposalData.specialRequirements || 'Standard commercial cleaning protocols'}

KEY PERSONNEL
• Christla Howard, CEO/President: 35+ years Environmental Services experience
• Amahd Barnett, VP Operations: 14 years Army leadership, CBRN certified
• Robert Hale, Senior Compliance Inspector: OSHA/MSHA certified, 40 years experience

PRICING
Monthly Service Fee: $${pricing.toLocaleString()}

REFERENCES
• GNS Surgery Center - April Brown: 706-543-9222
• Athens-Clarke County - Beth Smith: 706-613-3567
• Advantage Behavioral Health - Christopher Sullens: 706-338-5519

This proposal is valid for 30 days. We look forward to serving your facility maintenance needs.

Sincerely,
Christla Howard, CEO/President
Howard Janitorial Services
    `;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Proposal Generator</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" />
            Send Proposal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Client Name</label>
              <Input
                placeholder="Enter client name"
                value={proposalData.clientName}
                onChange={(e) => setProposalData({...proposalData, clientName: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Client Type</label>
              <Select onValueChange={(value) => setProposalData({...proposalData, clientType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  {clientTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Facility Size (sq ft)</label>
              <Input
                type="number"
                placeholder="Enter square footage"
                value={proposalData.facilitySize}
                onChange={(e) => setProposalData({...proposalData, facilitySize: e.target.value})}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Service Frequency</label>
              <Select onValueChange={(value) => setProposalData({...proposalData, frequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Contract Duration</label>
              <Input
                placeholder="e.g., 12 months"
                value={proposalData.duration}
                onChange={(e) => setProposalData({...proposalData, duration: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Select Services</label>
              <div className="space-y-3">
                {serviceOptions.map(service => (
                  <div key={service.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={proposalData.services.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <label className="text-sm flex-1">{service.name}</label>
                    <Badge variant="outline">${service.basePrice}/sq ft</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Special Requirements</label>
              <Textarea
                placeholder="Any special cleaning requirements or notes..."
                value={proposalData.specialRequirements}
                onChange={(e) => setProposalData({...proposalData, specialRequirements: e.target.value})}
                rows={3}
              />
            </div>

            {proposalData.facilitySize && proposalData.frequency && proposalData.services.length > 0 && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Estimated Monthly Cost:</span>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-2xl font-bold text-green-600">
                        {calculatePricing().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Proposal Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {generateProposal()}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}