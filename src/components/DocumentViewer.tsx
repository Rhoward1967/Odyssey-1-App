import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import DocumentTemplates from './DocumentTemplates';
import PDFExporter from './PDFExporter';
import VideoConference from './VideoConference';
import EmailIntegration from './EmailIntegration';
import { 
  FileText, 
  Edit3, 
  Save, 
  Mail, 
  Video, 
  Volume2, 
  Bot,
  Download,
  Eye,
  Check,
  FileTemplate
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: 'project' | 'estimate' | 'agreement';
  content: string;
  status: 'draft' | 'pending' | 'approved';
  createdAt: string;
}

interface DocumentViewerProps {
  documents: Document[];
  onDocumentUpdate: (id: string, content: string) => void;
  onDocumentApprove: (id: string) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  onDocumentUpdate,
  onDocumentApprove
}) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleEdit = (doc: Document) => {
    setSelectedDoc(doc);
    setEditContent(doc.content);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedDoc) {
      onDocumentUpdate(selectedDoc.id, editContent);
      setIsEditing(false);
    }
  };

  const handleTextToSpeech = () => {
    // Text-to-speech functionality removed
    console.log('Text-to-speech has been disabled');
  };

  const handleEmailSend = () => {
    if (selectedDoc && emailRecipient) {
      const subject = `Document: ${selectedDoc.title}`;
      const body = encodeURIComponent(selectedDoc.content);
      window.open(`mailto:${emailRecipient}?subject=${subject}&body=${body}`);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Document List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedDoc?.id === doc.id 
                  ? 'bg-purple-600/50 border border-purple-500' 
                  : 'bg-slate-700/50 hover:bg-slate-600/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{doc.title}</h4>
                  <p className="text-slate-400 text-sm capitalize">{doc.type}</p>
                  <p className="text-slate-500 text-xs">{doc.createdAt}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  doc.status === 'approved' ? 'bg-green-600 text-white' :
                  doc.status === 'pending' ? 'bg-yellow-600 text-white' :
                  'bg-slate-600 text-white'
                }`}>
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Document Viewer */}
      <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">
              {selectedDoc ? selectedDoc.title : 'Select a Document'}
            </CardTitle>
            {selectedDoc && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(selectedDoc)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTextToSpeech}
                  disabled={isSpeaking}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsVideoCall(!isVideoCall)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Video className="w-4 h-4" />
                </Button>
                {selectedDoc.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => onDocumentApprove(selectedDoc.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedDoc ? (
            <div className="space-y-4">
              {/* Video Call Interface */}
              {isVideoCall && (
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-white font-medium">Video Conference</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsVideoCall(false)}
                      className="border-red-600 text-red-400"
                    >
                      End Call
                    </Button>
                  </div>
                  <div className="bg-slate-800 h-48 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-400">Video call interface would be here</p>
                      <p className="text-slate-500 text-sm">Integration with WebRTC or video service</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Content */}
              {/* Document Content */}
              <div className="space-y-4 relative">
                {isEditing ? (
                  <div className="relative z-20">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-96 bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                      placeholder="Edit document content..."
                      style={{ 
                        pointerEvents: 'auto',
                        userSelect: 'text',
                        cursor: 'text',
                        position: 'relative',
                        zIndex: 20
                      }}
                      autoComplete="off"
                      spellCheck="true"
                      tabIndex={0}
                      disabled={false}
                      readOnly={false}
                    />
                    <div className="flex space-x-2 mt-4">
                      <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="border-slate-600 text-slate-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-700/50 p-6 rounded-lg relative z-10">
                    <pre className="text-white whitespace-pre-wrap font-mono text-sm">
                      {selectedDoc.content}
                    </pre>
                  </div>
                )}
              </div>
              
              {/* Enhanced Email Integration */}
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-3">Send Document</h4>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2 flex-1">
                    <Input
                      placeholder="Quick recipient email..."
                      value={emailRecipient}
                      onChange={(e) => setEmailRecipient(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Button
                      onClick={handleEmailSend}
                      disabled={!emailRecipient}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Quick Send
                    </Button>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Mail className="w-4 w-4 mr-1" />
                      Advanced Email
                    </Button>
                  </div>
                </div>
              </div>
              {/* AI Bot Interface */}
              <div className="bg-gradient-to-r from-purple-800/30 to-blue-800/30 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <Bot className="w-5 h-5 text-purple-400 mr-2" />
                  <h4 className="text-white font-medium">ODYSSEY-1 AI Assistant</h4>
                </div>
                <p className="text-slate-300 text-sm mb-3">
                  AI analysis and suggestions for this document:
                </p>
                <div className="bg-slate-800/50 p-3 rounded text-slate-300 text-sm">
                  • Document appears complete and professional
                  • Consider adding more specific timeline details
                  • Pricing structure aligns with industry standards
                  • Ready for client review and approval
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Select a document to view and edit</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentViewer;