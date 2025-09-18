import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DocumentViewer from './DocumentViewer';
import AdminAuthGuard from './AdminAuthGuard';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Edit, 
  FileText, 
  User, 
  DollarSign,
  Calendar,
  AlertTriangle,
  Bot,
  RefreshCw
} from 'lucide-react';

interface BidSubmission {
  id: string;
  bidderName: string;
  bidderEmail: string;
  bidderPhone: string;
  projectTitle: string;
  estimatedValue: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  documents: Array<{
    id: string;
    title: string;
    type: 'estimate' | 'agreement' | 'project';
    content: string;
    status: 'draft' | 'pending' | 'approved';
    createdAt: string;
  }>;
  odysseyRecommendation?: string;
  adminNotes?: string;
}

const BidApprovalDashboard: React.FC = () => {
  const [bids] = useState<BidSubmission[]>([
    {
      id: 'bid-001',
      bidderName: 'John Smith',
      bidderEmail: 'john@example.com',
      bidderPhone: '(555) 123-4567',
      projectTitle: 'Office Building Deep Clean',
      estimatedValue: 15000,
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending',
      documents: [
        {
          id: 'doc-001',
          title: 'Project Estimate - Office Building',
          type: 'estimate',
          content: 'HOWARD JANITORIAL SERVICES LLC\nProject Estimate\n\nClient: John Smith\nProject: Office Building Deep Clean\n\nScope of Work:\n- Complete deep cleaning of 5-story office building\n- Window cleaning (interior/exterior)\n- Carpet cleaning and sanitization\n- Restroom deep clean and disinfection\n- Break room and kitchen cleaning\n\nEstimated Cost: $15,000\nTimeline: 3 days\nWarranty: 30 days',
          status: 'pending',
          createdAt: '2024-01-15T10:30:00Z'
        }
      ],
      odysseyRecommendation: 'Recommended for approval. Pricing aligns with market rates. Client has good payment history.',
      adminNotes: ''
    }
  ]);

  const [selectedBid, setSelectedBid] = useState<BidSubmission | null>(null);
  const [documents, setDocuments] = useState(selectedBid?.documents || []);

  const handleBidApproval = (bidId: string, action: 'approve' | 'reject' | 'revise') => {
    console.log(`${action} bid ${bidId}`);
    // In real implementation, this would update the database
  };

  const handleDocumentUpdate = (docId: string, content: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, content } : doc
    ));
  };

  const handleDocumentApprove = (docId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status: 'approved' as const } : doc
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-600';
      case 'rejected': return 'bg-red-600';
      case 'needs-revision': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  return (
    <AdminAuthGuard requiredLevel="hjs-internal" feature="HJS Bid Approval Dashboard">
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              HJS Bid Approval Dashboard
            </h1>
            <p className="text-slate-300">
              Review and approve all bid submissions with Odyssey-1 AI assistance
            </p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="pending" className="data-[state=active]:bg-blue-600">
                <Clock className="w-4 h-4 mr-2" />
                Pending ({bids.filter(b => b.status === 'pending').length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="data-[state=active]:bg-green-600">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approved ({bids.filter(b => b.status === 'approved').length})
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-slate-600">
                <FileText className="w-4 h-4 mr-2" />
                All Bids ({bids.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Bid List */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Pending Bids</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bids.filter(bid => bid.status === 'pending').map((bid) => (
                      <div
                        key={bid.id}
                        onClick={() => {
                          setSelectedBid(bid);
                          setDocuments(bid.documents);
                        }}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedBid?.id === bid.id 
                            ? 'bg-blue-600/50 border border-blue-500' 
                            : 'bg-slate-700/50 hover:bg-slate-600/50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <h4 className="text-white font-medium">{bid.bidderName}</h4>
                            <Badge className={getStatusColor(bid.status)}>
                              {bid.status}
                            </Badge>
                          </div>
                          <p className="text-slate-300 text-sm">{bid.projectTitle}</p>
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>${bid.estimatedValue.toLocaleString()}</span>
                            <span>{new Date(bid.submittedAt).toLocaleDateString()}</span>
                          </div>
                          {bid.odysseyRecommendation && (
                            <div className="flex items-center text-xs text-purple-400">
                              <Bot className="w-3 h-3 mr-1" />
                              AI Recommendation Available
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Bid Details & Document Viewer */}
                <div className="lg:col-span-2 space-y-6">
                  {selectedBid ? (
                    <>
                      {/* Bid Summary */}
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-white">
                              {selectedBid.projectTitle}
                            </CardTitle>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleBidApproval(selectedBid.id, 'approve')}
                                className="bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleBidApproval(selectedBid.id, 'revise')}
                                variant="outline"
                                className="border-yellow-600 text-yellow-400"
                                size="sm"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Request Revision
                              </Button>
                              <Button
                                onClick={() => handleBidApproval(selectedBid.id, 'reject')}
                                variant="outline"
                                className="border-red-600 text-red-400"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-slate-300">
                                <User className="w-4 h-4 mr-2" />
                                <span>{selectedBid.bidderName}</span>
                              </div>
                              <div className="flex items-center text-slate-300">
                                <DollarSign className="w-4 h-4 mr-2" />
                                <span>${selectedBid.estimatedValue.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-slate-300">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{new Date(selectedBid.submittedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {selectedBid.odysseyRecommendation && (
                            <div className="mt-4 p-3 bg-purple-900/30 border border-purple-600 rounded-lg">
                              <div className="flex items-center mb-2">
                                <Bot className="w-4 h-4 text-purple-400 mr-2" />
                                <span className="text-purple-300 font-medium">Odyssey-1 AI Recommendation</span>
                              </div>
                              <p className="text-slate-300 text-sm">{selectedBid.odysseyRecommendation}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Document Viewer */}
                      <DocumentViewer
                        documents={documents}
                        onDocumentUpdate={handleDocumentUpdate}
                        onDocumentApprove={handleDocumentApprove}
                      />
                    </>
                  ) : (
                    <Card className="bg-slate-800/50 border-slate-700">
                      <CardContent className="text-center py-12">
                        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">Select a bid to review</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="approved">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <p className="text-slate-400">Approved bids will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="all">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">All bid history will appear here</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminAuthGuard>
  );
};

export default BidApprovalDashboard;