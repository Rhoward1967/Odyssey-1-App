import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Calendar, FileText } from 'lucide-react';

interface Credential {
  id: string;
  title: string;
  issuer: string;
  dateIssued: string;
  certificateId: string;
  description: string;
  status: 'active' | 'expired' | 'pending';
}

const ProfessionalCredentials: React.FC = () => {
  const credentials: Credential[] = [
    {
      id: '1',
      title: 'Certificate of Organization',
      issuer: 'State of Georgia',
      dateIssued: 'November 17, 2008',
      certificateId: '08079598',
      description: 'Domestic Limited Liability Company duly organized under Georgia state law. Signed by Karen C. Handel, Secretary of State and Corporations Commissioner.',
      status: 'active'
    },
    {
      id: '2',
      title: 'DUNS Business Registration',
      issuer: 'Dun & Bradstreet',
      dateIssued: 'Active Registration',
      certificateId: 'DUNS: 82-902-9292',
      description: 'Data Universal Numbering System registration for HJS SERVICES LLC (DBA: HOWARD JANITORIAL SERVICES). Business phone: 800-403-8492. Address: P.O BOX 80054 ATHENS GA 30608.',
      status: 'active'
    },
    {
      id: '3',
      title: 'W-9 Tax Certification',
      issuer: 'Internal Revenue Service',
      dateIssued: 'January 1, 2025',
      certificateId: 'EIN: 26-3557211',
      description: 'Federal tax classification as LLC (S Corporation). Business operates as Howard Janitorial Services. Address: P.O BOX 80054 ATHENS GA 30608. Certified for TIN accuracy and backup withholding exemption.',
      status: 'active'
    },
    {
      id: '4',
      title: '30-hour General Industry Safety and Health Professional Development Certificate',
      issuer: 'OSHAcademy',
      dateIssued: 'March 27, 2020',
      certificateId: '521199-130-210121',
      description: 'Comprehensive training complying with OSHA standards and conforming to ANSI Z490.1 and ISO 45001 guidelines',
      status: 'active'
    },
    {
      id: '5',
      title: 'Preparing Workplaces for COVID-19',
      issuer: 'OSHAcademy',
      dateIssued: 'April 2, 2020',
      certificateId: '521199-638-200402',
      description: 'Infectious disease prevention and planning, COVID-19 workplace safety protocols, exposure control strategies, respiratory protection, and employee training strategies',
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'expired': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Professional Credentials</h2>
          <p className="text-gray-400">Rickey Howard - HJS Services LLC</p>
        </div>
      </div>

      <div className="grid gap-4">
        {credentials.map((credential) => (
          <Card key={credential.id} className="bg-gray-900/50 border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-yellow-400" />
                  <div>
                    <CardTitle className="text-white text-lg">
                      {credential.title}
                    </CardTitle>
                    <p className="text-gray-400 text-sm mt-1">
                      Issued by {credential.issuer}
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(credential.status)}>
                  {credential.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300 text-sm">
                  {credential.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      Issued: {credential.dateIssued}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-300">
                      ID: {credential.certificateId}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {credential.id === '1' ? (
                    <>
                      <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-300">
                        State Certified
                      </Badge>
                      <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                        LLC Formation
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-500/50 text-green-300">
                        Georgia Registered
                      </Badge>
                    </>
                   ) : credential.id === '2' ? (
                    <>
                      <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-300">
                        DUNS Registered
                      </Badge>
                      <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                        D&B Verified
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-500/50 text-green-300">
                        Business ID
                      </Badge>
                    </>
                  ) : credential.id === '3' ? (
                    <>
                      <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-300">
                        IRS Certified
                      </Badge>
                      <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                        S Corporation
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-500/50 text-green-300">
                        Tax Compliant
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-300">
                        OSHA Compliant
                      </Badge>
                      <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-300">
                        ANSI Z490.1
                      </Badge>
                      <Badge variant="outline" className="text-xs border-green-500/50 text-green-300">
                        ISO 45001
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalCredentials;