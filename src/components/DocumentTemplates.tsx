import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  type: 'project' | 'estimate' | 'agreement';
  description: string;
  content: string;
}

interface DocumentTemplatesProps {
  onTemplateSelect: (template: Template) => void;
}

const DocumentTemplates: React.FC<DocumentTemplatesProps> = ({ onTemplateSelect }) => {
  const templates: Template[] = [
    {
      id: 'construction-estimate',
      name: 'Construction Estimate Template',
      type: 'estimate',
      description: 'Standard construction project estimate with labor, materials, and overhead',
      content: `CONSTRUCTION PROJECT ESTIMATE

Project: [PROJECT NAME]
Client: [CLIENT NAME]
Date: [DATE]
Estimated Duration: [DURATION]

LABOR COSTS:
- General Contractors: $[AMOUNT]
- Specialized Trades: $[AMOUNT]
- Project Management: $[AMOUNT]

MATERIALS:
- Construction Materials: $[AMOUNT]
- Equipment Rental: $[AMOUNT]
- Safety Equipment: $[AMOUNT]

OVERHEAD & PROFIT:
- Overhead ([PERCENTAGE]%): $[AMOUNT]
- Profit ([PERCENTAGE]%): $[AMOUNT]

TOTAL ESTIMATE: $[TOTAL]

Terms:
- Payment Schedule: [TERMS]
- Warranty: [WARRANTY PERIOD]
- Change Orders: Additional work subject to approval`
    },
    {
      id: 'it-services-proposal',
      name: 'IT Services Proposal Template',
      type: 'project',
      description: 'Comprehensive IT services proposal for government contracts',
      content: `IT SERVICES PROPOSAL

Client: [CLIENT NAME]
Project: [PROJECT TITLE]
Proposal Date: [DATE]

EXECUTIVE SUMMARY:
[Brief overview of proposed services]

SCOPE OF WORK:
- Network Infrastructure
- Cloud Migration Services
- Security Implementation
- Training and Support

DELIVERABLES:
- [Deliverable 1]
- [Deliverable 2]
- [Deliverable 3]

TIMELINE:
Phase 1: [DURATION] - [DESCRIPTION]
Phase 2: [DURATION] - [DESCRIPTION]
Phase 3: [DURATION] - [DESCRIPTION]

PRICING:
Total Project Cost: $[AMOUNT]
Payment Terms: [TERMS]

TEAM QUALIFICATIONS:
[Team member qualifications and certifications]`
    },
    {
      id: 'service-agreement',
      name: 'Professional Services Agreement',
      type: 'agreement',
      description: 'Standard professional services agreement template',
      content: `PROFESSIONAL SERVICES AGREEMENT

Parties: [COMPANY NAME] & [CLIENT NAME]
Effective Date: [DATE]
Term: [DURATION]

SERVICES:
- [Service 1]
- [Service 2]
- [Service 3]

COMPENSATION:
- Service Fee: $[AMOUNT]
- Payment Schedule: [SCHEDULE]
- Expenses: [REIMBURSEMENT TERMS]

TERMS AND CONDITIONS:
- Confidentiality: All information confidential
- Intellectual Property: [IP TERMS]
- Termination: [TERMINATION CLAUSE]
- Governing Law: [JURISDICTION]

SIGNATURES:
Service Provider: _________________ Date: _______
Client: _________________ Date: _______`
    }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Document Templates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-slate-700/50 p-4 rounded-lg hover:bg-slate-600/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-medium">{template.name}</h4>
              <span className={`px-2 py-1 text-xs rounded capitalize ${
                template.type === 'project' ? 'bg-blue-600' :
                template.type === 'estimate' ? 'bg-green-600' :
                'bg-purple-600'
              } text-white`}>
                {template.type}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-3">{template.description}</p>
            <Button
              size="sm"
              onClick={() => onTemplateSelect(template)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Use Template
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default DocumentTemplates;