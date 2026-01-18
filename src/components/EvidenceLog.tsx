import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import type { EvidenceFile, Violation } from '@/services/evidenceService';
import { evidenceService } from '@/services/evidenceService';
import { romanLegalService } from '@/services/romanLegalService';
import {
    AlertTriangle,
    Bot,
    CheckCircle2,
    Download,
    FileText,
    Loader2,
    Mail,
    Package,
    Scale,
    Trash2,
    Upload,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EvidenceLogProps {
  accountId: string;
  accountName: string;
}

export default function EvidenceLog({ accountId, accountName }: EvidenceLogProps) {
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Upload form state
  const [fileType, setFileType] = useState<EvidenceFile['fileType']>('collection_letter');
  const [documentDate, setDocumentDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const loadEvidence = async () => {
    try {
      setLoading(true);
      const data = await evidenceService.getAccountEvidence(accountId);
      setEvidence(data);
    } catch (error) {
      console.error('Error loading evidence:', error);
      // If table doesn't exist yet, set empty array
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setShowUploadForm(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      await evidenceService.uploadEvidence(
        selectedFile,
        accountId,
        fileType,
        {
          documentDate: documentDate ? new Date(documentDate) : undefined,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
          notes: notes || undefined
        }
      );

      // Reset form
      setSelectedFile(null);
      setShowUploadForm(false);
      setDocumentDate('');
      setDeliveryDate('');
      setNotes('');
      
      // Reload evidence
      await loadEvidence();
      
      alert('Evidence uploaded successfully! OCR processing will complete in background.');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload evidence. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (evidenceId: string) => {
    if (!confirm('Delete this evidence? This cannot be undone.')) return;

    try {
      await evidenceService.deleteEvidence(evidenceId);
      await loadEvidence();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete evidence.');
    }
  };

  const analyzeWithRoman = async (evidence: EvidenceFile) => {
    if (!confirm('Analyze this letter with R.O.M.A.N.? This will use AI to detect violations.')) return;

    try {
      setLoading(true);
      
      // Get account info from database
      const { data: accountData } = await supabase
        .from('legal_defense_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (!accountData) throw new Error('Account not found');

      // Call R.O.M.A.N. for analysis
      const analysis = await romanLegalService.analyzeEvidence(
        evidence.fileUrl,
        {
          creditor: accountData.creditor,
          currentAmount: parseFloat(accountData.current_amount),
          accountNumber: accountData.account_number
        }
      );

      // Update evidence with R.O.M.A.N.'s findings
      await supabase
        .from('evidence_log')
        .update({
          detected_violations: analysis.violations,
          violation_count: analysis.violationCount,
          statutory_damages_total: analysis.statutoryDamagesTotal,
          ocr_text: `R.O.M.A.N. Analysis:\n\nLegal Strength: ${analysis.legalStrength}%\n\nRecommended Action: ${analysis.recommendedAction}\n\nNext Steps:\n${analysis.nextSteps.join('\n')}`
        })
        .eq('id', evidence.id);

      await loadEvidence();
      alert('R.O.M.A.N. analysis complete!');

    } catch (error) {
      console.error('R.O.M.A.N. analysis error:', error);
      alert('Failed to analyze with R.O.M.A.N. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalViolations = evidence.reduce((sum, e) => sum + e.violationCount, 0);
  const totalDamages = evidence.reduce((sum, e) => sum + e.statutoryDamagesTotal, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-green-400" />
            Evidence Log
          </h2>
          <p className="text-slate-400 text-sm mt-1">{accountName}</p>
        </div>
        <div className="relative">
          <input
            type="file"
            id="evidence-upload"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
          />
          <label htmlFor="evidence-upload">
            <Button asChild className="bg-green-600 hover:bg-green-700 cursor-pointer">
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Evidence
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && selectedFile && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Upload: {selectedFile.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fileType" className="text-white">Document Type</Label>
              <select
                id="fileType"
                value={fileType}
                onChange={(e) => setFileType(e.target.value as EvidenceFile['fileType'])}
                className="w-full bg-slate-900 border-slate-700 text-white rounded-md p-2"
              >
                <option value="usps_receipt">USPS Certified Mail Receipt</option>
                <option value="collection_letter">Collection Agency Letter</option>
                <option value="validation_response">Validation Response</option>
                <option value="court_document">Court Document</option>
                <option value="credit_report">Credit Report</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentDate" className="text-white">Document Date</Label>
                <Input
                  type="date"
                  id="documentDate"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>

              {fileType === 'usps_receipt' && (
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate" className="text-white">Delivery Date</Label>
                  <Input
                    type="date"
                    id="deliveryDate"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any relevant notes about this document..."
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload & Analyze
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                }}
                className="border-slate-600"
              >
                Cancel
              </Button>
            </div>

            {fileType === 'collection_letter' && (
              <Alert className="bg-blue-900 border-blue-700">
                <Scale className="h-4 w-4" />
                <AlertTitle className="text-white">Auto-Analysis Enabled</AlertTitle>
                <AlertDescription className="text-blue-200">
                  This letter will be scanned for FDCPA violations using OCR. Results will appear within 30-60 seconds.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {evidence.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Evidence Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{evidence.length}</div>
              <p className="text-xs text-slate-400 mt-1">Documents stored</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Violations Detected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-400">{totalViolations}</div>
              <p className="text-xs text-slate-400 mt-1">FDCPA violations found</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-300">Statutory Damages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">${totalDamages.toLocaleString()}</div>
              <p className="text-xs text-slate-400 mt-1">Potential recovery</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evidence Files */}
      {evidence.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Evidence Uploaded</h3>
            <p className="text-slate-400 mb-6">
              Upload certified mail receipts and collection letters to build your case
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {evidence.map((item) => (
            <Card key={item.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      {item.fileType === 'usps_receipt' && <Package className="w-5 h-5 text-green-400" />}
                      {item.fileType === 'collection_letter' && <Mail className="w-5 h-5 text-red-400" />}
                      {item.fileType === 'validation_response' && <FileText className="w-5 h-5 text-blue-400" />}
                      {item.fileName}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Uploaded {item.createdAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600"
                      onClick={() => window.open(item.fileUrl, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {item.fileType === 'collection_letter' && !item.violationCount && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-300 hover:bg-blue-900"
                        onClick={() => analyzeWithRoman(item)}
                      >
                        <Bot className="w-4 h-4 mr-1" />
                        R.O.M.A.N.
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-300 hover:bg-red-900"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Document Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {item.documentDate && (
                    <div>
                      <span className="text-slate-400">Date:</span>
                      <p className="text-white">{item.documentDate.toLocaleDateString()}</p>
                    </div>
                  )}
                  {item.deliveryDate && (
                    <div>
                      <span className="text-slate-400">Delivered:</span>
                      <p className="text-white">{item.deliveryDate.toLocaleDateString()}</p>
                    </div>
                  )}
                  {item.responseDeadline && (
                    <div>
                      <span className="text-slate-400">Response Due:</span>
                      <p className="text-white">{item.responseDeadline.toLocaleDateString()}</p>
                    </div>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="col-span-2 md:col-span-1">
                      <span className="text-slate-400">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="bg-slate-900 text-slate-300 border-slate-600 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {item.notes && (
                  <div className="p-3 bg-slate-900 rounded-lg">
                    <p className="text-sm text-slate-300">{item.notes}</p>
                  </div>
                )}

                {/* Violations */}
                {item.violationCount > 0 && (
                  <Alert className="bg-red-900 border-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-white">
                      {item.violationCount} Violation{item.violationCount > 1 ? 's' : ''} Detected
                    </AlertTitle>
                    <AlertDescription className="text-red-200 space-y-3 mt-3">
                      {item.detectedViolations.map((violation: Violation, idx: number) => (
                        <div key={idx} className="p-3 bg-red-950 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="bg-red-900 text-red-200 border-red-700">
                              {violation.statute}
                            </Badge>
                            <Badge variant="outline" className={
                              violation.severity === 'CRITICAL' ? 'bg-red-900 border-red-600' :
                              violation.severity === 'MODERATE' ? 'bg-yellow-900 border-yellow-600' :
                              'bg-blue-900 border-blue-600'
                            }>
                              {violation.severity}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{violation.description}</p>
                          <p className="text-xs text-red-300 bg-red-950/50 p-2 rounded">
                            Evidence: "{violation.evidence}"
                          </p>
                          <p className="text-xs mt-2 text-red-200">
                            Statutory Damages: ${violation.statutoryDamages.toLocaleString()}
                          </p>
                        </div>
                      ))}
                      <div className="mt-4 p-3 bg-green-950 rounded border border-green-700">
                        <p className="font-semibold text-green-300">
                          Total From This Letter: ${item.statutoryDamagesTotal.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-200 mt-1">
                          Plus actual damages + attorney fees if you sue
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* OCR Status */}
                {item.fileType === 'collection_letter' && !item.ocrText && (
                  <Alert className="bg-blue-900 border-blue-700">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertTitle className="text-white">Processing OCR...</AlertTitle>
                    <AlertDescription className="text-blue-200">
                      Extracting text and analyzing for violations. Refresh to see results.
                    </AlertDescription>
                  </Alert>
                )}

                {item.ocrText && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Extracted Text (Confidence: {item.detectedViolations.length > 0 ? '95%' : 'Processing...'})
                    </h4>
                    <div className="p-3 bg-slate-900 rounded-lg max-h-48 overflow-y-auto">
                      <p className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{item.ocrText}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
