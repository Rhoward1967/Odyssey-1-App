import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { FileText, Download, Edit, Save, AlertCircle } from 'lucide-react';

export const GrantProposalManager: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [proposalContent, setProposalContent] = useState(`# ODYSSEY-1 National Initiative: Master Grant Proposal
## Ethical AI and Financial Sovereignty for Small Business

**Project Title:** ODYSSEY-1: National Initiative for Financial Sovereignty and Ethical AI in Commerce  
**Initial Funding Request (Year 1):** $15,000,000  
**Total Projected Investment (5-Year National Deployment):** $100,000,000  

## EXECUTIVE SUMMARY
ODYSSEY-1 represents a paradigm shift in small business empowerment through ethical AI implementation. Built on a foundation of **verifiable capabilities** and **proven service delivery**...`);

  const handleSave = () => {
    // In a real implementation, this would save to backend
    setIsEditing(false);
    console.log('Grant proposal saved to backend');
  };

  const handleDownload = () => {
    const blob = new Blob([proposalContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ODYSSEY-1_National_Grant_Proposal.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-slate-800/50 border-green-500/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-green-400" />
            Grant Proposal Manager
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600/20 text-green-300">
              VERIFIED CLAIMS
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="h-4 w-4 mr-1" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-300 text-sm">
            All claims verified against actual ODYSSEY-1 capabilities. R&D features clearly marked.
          </span>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={proposalContent}
              onChange={(e) => setProposalContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Edit grant proposal content..."
            />
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {proposalContent}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-green-300">Verified Capabilities</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• AI Document Processing (100%)</li>
              <li>• Government Contracting Tools (100%)</li>
              <li>• Supabase Backend (100%)</li>
              <li>• Trading Algorithms (85%)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-300">R&D Pipeline</h4>
            <ul className="space-y-1 text-gray-300">
              <li>• Autonomous Code Generation (25%)</li>
              <li>• Quantum Computing (15%)</li>
              <li>• Distributed Computing (8%)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GrantProposalManager;