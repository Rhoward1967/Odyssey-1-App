import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  FileText, 
  Upload, 
  Scan, 
  Brain, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Eye
} from 'lucide-react';

interface ExtractedRequirement {
  id: string;
  category: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  compliance: boolean;
  value?: string;
}

interface DocumentScannerProps {
  onRequirementsExtracted: (requirements: ExtractedRequirement[]) => void;
}

const DocumentScanner: React.FC<DocumentScannerProps> = ({ onRequirementsExtracted }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedRequirement[]>([]);
  const [documentType, setDocumentType] = useState<string>('');

  const simulateDocumentScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning progress
    const intervals = [20, 40, 60, 80, 100];
    for (const progress of intervals) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanProgress(progress);
    }

    // Simulate extracted requirements
    const mockRequirements: ExtractedRequirement[] = [
      {
        id: 'req-1',
        category: 'Technical Specifications',
        description: 'Minimum 99.9% uptime requirement for all systems',
        priority: 'high',
        compliance: true,
        value: '99.9%'
      },
      {
        id: 'req-2',
        category: 'Security Clearance',
        description: 'Personnel must hold Secret clearance or higher',
        priority: 'high',
        compliance: true
      },
      {
        id: 'req-3',
        category: 'Timeline',
        description: 'Project completion within 180 days of award',
        priority: 'medium',
        compliance: true,
        value: '180 days'
      },
      {
        id: 'req-4',
        category: 'Certifications',
        description: 'ISO 27001 certification required',
        priority: 'medium',
        compliance: false
      },
      {
        id: 'req-5',
        category: 'Financial',
        description: 'Performance bond of 10% contract value',
        priority: 'high',
        compliance: true,
        value: '10%'
      }
    ];

    setExtractedData(mockRequirements);
    setDocumentType('RFP-2024-DOD-IT-SERVICES');
    onRequirementsExtracted(mockRequirements);
    setIsScanning(false);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-900/90 to-indigo-900/90 border-2 border-blue-500/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
            <Scan className="w-8 h-8 text-blue-400" />
            RFQ/RFP Document Scanner
          </CardTitle>
          <p className="text-blue-200">
            AI-powered document analysis for government procurement requirements
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={simulateDocumentScan}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 h-16"
            >
              <Upload className="w-5 h-5 mr-2" />
              {isScanning ? 'Scanning Document...' : 'Upload & Scan Document'}
            </Button>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <p className="text-blue-200 text-sm font-medium mb-2">Supported Formats</p>
              <div className="flex flex-wrap gap-2">
                {['PDF', 'DOC', 'DOCX', 'TXT'].map((format) => (
                  <Badge key={format} className="bg-blue-600/20 text-blue-300">
                    {format}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {isScanning && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
                <span className="text-white">AI analyzing document...</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
              <p className="text-slate-400 text-sm">
                Extracting requirements, specifications, and compliance criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {extractedData.length > 0 && (
        <Card className="bg-slate-800/90 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Extracted Requirements - {documentType}
            </CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-green-600/20 text-green-300">
                {extractedData.filter(r => r.compliance).length} Compliant
              </Badge>
              <Badge className="bg-red-600/20 text-red-300">
                {extractedData.filter(r => !r.compliance).length} Non-Compliant
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {extractedData.map((req) => (
                <div
                  key={req.id}
                  className="bg-black/30 p-4 rounded-lg border border-slate-600/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={
                        req.priority === 'high' ? 'bg-red-600/20 text-red-300' :
                        req.priority === 'medium' ? 'bg-yellow-600/20 text-yellow-300' :
                        'bg-green-600/20 text-green-300'
                      }>
                        {req.priority.toUpperCase()}
                      </Badge>
                      <span className="text-slate-400 text-sm">{req.category}</span>
                    </div>
                    {req.compliance ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <p className="text-white mb-2">{req.description}</p>
                  {req.value && (
                    <div className="text-blue-300 text-sm font-medium">
                      Value: {req.value}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Export Requirements
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300">
                <Eye className="w-4 h-4 mr-2" />
                Generate Compliance Matrix
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentScanner;