/**
 * R.O.M.A.N. Contract Analyzer - AI-Powered Legal Document Analysis
 * 
 * Upload creditor contracts → AI finds exploitable flaws → Generate legal documents
 * "Laws are written in imperfect language - every word is an exploit vector."
 * 
 * Created: January 17, 2026
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, AlertTriangle, Shield, Gavel, Target, Download } from 'lucide-react';
import { ContractAnalysisEngine } from '@/services/contractAnalysisEngine';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

export function ContractAnalyzer() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setError(null);
    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('legal-documents')
        .getPublicUrl(fileName);

      console.log('File uploaded:', publicUrl);
      setUploading(false);
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  // Analyze contract with AI
  const analyzeContract = async () => {
    if (!uploadedFile) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Extract text from file (simplified - in production, use OCR for images/PDFs)
      const text = await uploadedFile.text();

      // Run AI analysis
      const engine = new ContractAnalysisEngine();
      const result = await engine.analyzeContract(
        'temp-id',
        text,
        10000, // Default debt amount - should come from form
        'consumer' // Default type - should come from form
      );

      setAnalysisResult(result);
      setAnalyzing(false);
    } catch (err: any) {
      setError(err.message);
      setAnalyzing(false);
    }
  };

  // Get color for exploitability level
  const getExploitabilityColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MODERATE': return 'bg-yellow-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Get color for defense strength
  const getDefenseColor = (strength: string) => {
    switch (strength) {
      case 'CRITICAL': return 'text-red-400 border-red-400';
      case 'HIGH': return 'text-orange-400 border-orange-400';
      case 'MODERATE': return 'text-yellow-400 border-yellow-400';
      default: return 'text-blue-400 border-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            R.O.M.A.N. Contract Analyzer
          </CardTitle>
          <CardDescription className="text-slate-400">
            Upload creditor contracts → AI finds exploitable flaws → Generate legal documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="contract-upload"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,image/*"
              onChange={handleFileUpload}
            />
            <label htmlFor="contract-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-white font-semibold mb-2">
                {uploadedFile ? uploadedFile.name : 'Upload Contract or Demand Letter'}
              </p>
              <p className="text-slate-400 text-sm">
                PDF, Word, Image, or Text file
              </p>
            </label>
          </div>

          {/* Analyze Button */}
          {uploadedFile && !analysisResult && (
            <Button
              onClick={analyzeContract}
              disabled={analyzing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing Contract with Claude Sonnet 4.5...
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4 mr-2" />
                  Analyze for Legal Flaws
                </>
              )}
            </Button>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="bg-red-900/20 border-red-500">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Exploitability Score */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-red-400" />
                  Exploitability Analysis
                </span>
                <Badge className={`${getExploitabilityColor(analysisResult.exploitability_level)} text-white text-lg px-4 py-2`}>
                  {analysisResult.exploitability_level} - {analysisResult.exploitability_score}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={analysisResult.exploitability_score} className="h-4 mb-4" />
              <p className="text-slate-300 mb-4">{analysisResult.strategy_reasoning}</p>
              <div className="flex items-center gap-4">
                <Badge className="bg-green-600 text-white">
                  Strategy: {analysisResult.recommended_strategy}
                </Badge>
                <Badge className="bg-blue-600 text-white">
                  Success Probability: {analysisResult.estimated_success_probability}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="flaws" className="w-full">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="flaws">Contract Flaws</TabsTrigger>
              <TabsTrigger value="standing">Standing Issues</TabsTrigger>
              <TabsTrigger value="defenses">Affirmative Defenses</TabsTrigger>
              <TabsTrigger value="counterclaim">Counterclaims</TabsTrigger>
              <TabsTrigger value="documents">Legal Documents</TabsTrigger>
            </TabsList>

            {/* Contract Flaws Tab */}
            <TabsContent value="flaws" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Contract Flaws Detected</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.flaws_detected.missing_signatures && (
                    <Alert className="bg-red-900/20 border-red-500">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        <strong>Missing Signatures:</strong> Contract not properly executed
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {analysisResult.flaws_detected.ambiguous_terms.length > 0 && (
                    <Alert className="bg-yellow-900/20 border-yellow-500">
                      <AlertDescription className="text-yellow-300">
                        <strong>Ambiguous Terms:</strong> {analysisResult.flaws_detected.ambiguous_terms.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysisResult.flaws_detected.statute_of_frauds_violation && (
                    <Alert className="bg-orange-900/20 border-orange-500">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <AlertDescription className="text-orange-300">
                        <strong>Statute of Frauds Violation:</strong> Contract over $500 must be in writing (UCC §2-201)
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysisResult.flaws_detected.void_for_vagueness && (
                    <Alert className="bg-red-900/20 border-red-500">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        <strong>Void for Vagueness:</strong> Terms too unclear to enforce
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysisResult.flaws_detected.missing_essential_terms.length > 0 && (
                    <Alert className="bg-orange-900/20 border-orange-500">
                      <AlertDescription className="text-orange-300">
                        <strong>Missing Essential Terms:</strong> {analysisResult.flaws_detected.missing_essential_terms.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysisResult.flaws_detected.unconscionable_terms.length > 0 && (
                    <Alert className="bg-yellow-900/20 border-yellow-500">
                      <AlertDescription className="text-yellow-300">
                        <strong>Unconscionable Terms:</strong> {analysisResult.flaws_detected.unconscionable_terms.join(', ')}
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysisResult.flaws_detected.robo_signed && (
                    <Alert className="bg-red-900/20 border-red-500 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        <strong>ROBO-SIGNING DETECTED:</strong> Affidavit signed without personal knowledge - FRAUD ON COURT
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Standing Issues Tab */}
            <TabsContent value="standing" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Standing Defects (Can They Even Sue?)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.standing_defects.missing_chain_of_title && (
                    <Alert className="bg-red-900/20 border-red-500 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        <strong>Missing Chain of Title:</strong> Plaintiff cannot prove they own the debt
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysisResult.standing_defects.no_original_creditor_assignment && (
                    <Alert className="bg-red-900/20 border-red-500">
                      <AlertDescription className="text-red-300">
                        <strong>No Assignment Agreement:</strong> No proof debt was transferred to plaintiff
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysisResult.standing_defects.robo_signed_affidavit && (
                    <Alert className="bg-red-900/20 border-red-500">
                      <AlertDescription className="text-red-300">
                        <strong>Robo-Signed Affidavit:</strong> Fraud on the court
                      </AlertDescription>
                    </Alert>
                  )}

                  {analysisResult.standing_defects.insufficient_documentation && (
                    <Alert className="bg-orange-900/20 border-orange-500">
                      <AlertDescription className="text-orange-300">
                        <strong>Insufficient Documentation:</strong> Plaintiff lacks proof to proceed
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Affirmative Defenses Tab */}
            <TabsContent value="defenses" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Available Affirmative Defenses</CardTitle>
                  <CardDescription className="text-slate-400">
                    {analysisResult.affirmative_defenses.length} defenses identified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.affirmative_defenses.map((defense: any, index: number) => (
                    <Card key={index} className={`bg-slate-800 border-2 ${getDefenseColor(defense.strength)}`}>
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>{defense.defense}</span>
                          <Badge className={`${getDefenseColor(defense.strength)}`}>
                            {defense.strength}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-slate-300">{defense.basis}</p>
                        {defense.statute && (
                          <p className="text-blue-400 text-sm">
                            <strong>Statute:</strong> {defense.statute}
                          </p>
                        )}
                        {defense.case_law && (
                          <p className="text-green-400 text-sm">
                            <strong>Case Law:</strong> {defense.case_law}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Counterclaims Tab */}
            <TabsContent value="counterclaim" className="space-y-4">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Counterclaim Opportunities (SUE THEM)</CardTitle>
                  <CardDescription className="text-slate-400">
                    {analysisResult.counterclaim_potential.length} counterclaims available
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisResult.counterclaim_potential.length === 0 ? (
                    <p className="text-slate-400">No counterclaim opportunities identified.</p>
                  ) : (
                    analysisResult.counterclaim_potential.map((claim: any, index: number) => (
                      <Card key={index} className="bg-slate-800 border-green-500">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center justify-between">
                            <span>{claim.claim}</span>
                            <Badge className="bg-green-600 text-white">
                              ${claim.estimated_damages.toLocaleString()} Damages
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-slate-300">{claim.basis}</p>
                          <p className="text-blue-400 text-sm">
                            <strong>Legal Authority:</strong> {claim.statute}
                          </p>
                          <div className="flex items-center gap-2">
                            <Progress value={claim.success_probability} className="flex-1 h-2" />
                            <span className="text-green-400 text-sm">{claim.success_probability}% success rate</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Legal Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              {/* Motion to Dismiss */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      Motion to Dismiss
                    </span>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-800 p-4 rounded-lg text-slate-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-96">
                    {analysisResult.motion_to_dismiss_draft}
                  </pre>
                </CardContent>
              </Card>

              {/* Answer with Defenses */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-400" />
                      Answer with Affirmative Defenses
                    </span>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-800 p-4 rounded-lg text-slate-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-96">
                    {analysisResult.answer_with_defenses_draft}
                  </pre>
                </CardContent>
              </Card>

              {/* Counterclaim */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-red-400" />
                      Counterclaim
                    </span>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-800 p-4 rounded-lg text-slate-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-96">
                    {analysisResult.counterclaim_draft}
                  </pre>
                </CardContent>
              </Card>

              {/* Discovery Requests */}
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-yellow-400" />
                      Discovery Requests
                    </span>
                    <Button className="bg-yellow-600 hover:bg-yellow-700">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-slate-800 p-4 rounded-lg text-slate-300 text-sm whitespace-pre-wrap overflow-x-auto max-h-96">
                    {analysisResult.discovery_requests_draft}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
