/**
 * Document Review Modal Component
 * AI-powered document analysis, summarization, and annotation
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    analyzeDocument,
    assessReadingLevel,
    DocumentSummary,
    extractKeyInsights,
    generateCitations,
    GeneratedCitation,
    generateStudyQuestions,
    KeyInsight
} from '@/services/documentReviewService';
import {
    BookOpen,
    Brain,
    Copy,
    FileText,
    Lightbulb,
    Quote,
    Sparkles,
    TrendingUp,
    Upload,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DocumentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentReviewModal({ isOpen, onClose }: DocumentReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'summary' | 'insights' | 'citations' | 'study'>('upload');
  const [loading, setLoading] = useState(false);
  const [documentSummary, setDocumentSummary] = useState<DocumentSummary | null>(null);
  const [keyInsights, setKeyInsights] = useState<KeyInsight[]>([]);
  const [citations, setCitations] = useState<GeneratedCitation | null>(null);
  const [studyQuestions, setStudyQuestions] = useState<string[]>([]);
  const [readingLevel, setReadingLevel] = useState<any>(null);
  
  // Citation form state
  const [citationTitle, setCitationTitle] = useState('');
  const [citationAuthors, setCitationAuthors] = useState('');
  const [citationYear, setCitationYear] = useState('');
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'bibtex'>('apa');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setActiveTab('summary');

    try {
      // Read file content
      const text = await readFileContent(file);
      
      // Analyze document
      const summary = await analyzeDocument(text, file.name, file.type);
      
      if (summary) {
        setDocumentSummary(summary);
        
        // Extract insights in parallel
        const [insights, questions] = await Promise.all([
          extractKeyInsights(text),
          Promise.resolve(generateStudyQuestions(text))
        ]);
        
        setKeyInsights(insights);
        setStudyQuestions(questions);
        setReadingLevel(assessReadingLevel(text));
        
        toast.success(`✨ "${file.name}" analyzed successfully!`);
      } else {
        toast.error('Failed to analyze document');
      }
    } catch (error) {
      toast.error('Error processing document');
    } finally {
      setLoading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleGenerateCitations = async () => {
    if (!citationTitle || !citationAuthors || !citationYear) {
      toast.error('Please fill in title, authors, and year');
      return;
    }

    setLoading(true);
    try {
      const authors = citationAuthors.split(',').map(a => a.trim());
      const year = parseInt(citationYear);
      
      const generated = await generateCitations(citationTitle, authors, year);
      setCitations(generated);
      toast.success('📚 Citations generated!');
    } catch (error) {
      toast.error('Failed to generate citations');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCitation = (citation: string, style: string) => {
    navigator.clipboard.writeText(citation);
    toast.success(`${style.toUpperCase()} citation copied!`);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'main_idea': return '💡';
      case 'conclusion': return '🎯';
      case 'supporting_detail': return '📌';
      case 'question': return '❓';
      default: return '📝';
    }
  };

  const getInsightColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Document Review
          </DialogTitle>
          <DialogDescription>
            Upload documents for AI-powered summarization, key insights, and citation generation
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="summary" disabled={!documentSummary}>
              <Sparkles className="w-4 h-4 mr-2" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="insights" disabled={!documentSummary}>
              <Lightbulb className="w-4 h-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="citations">
              <Quote className="w-4 h-4 mr-2" />
              Citations
            </TabsTrigger>
            <TabsTrigger value="study" disabled={!documentSummary}>
              <BookOpen className="w-4 h-4 mr-2" />
              Study
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Document for Analysis</CardTitle>
                <CardDescription>
                  Supports: PDF, TXT, DOCX (Text extraction works best with TXT files in this demo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop a document here, or click to select</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    AI will analyze content, extract key points, and generate insights
                  </p>
                  <Input
                    type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <Button asChild disabled={loading}>
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {loading ? 'Analyzing...' : 'Select Document'}
                    </label>
                  </Button>
                </div>

                {documentSummary && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Currently Loaded:</span>
                      <span>{documentSummary.fileName}</span>
                      <Badge variant="outline">{documentSummary.wordCount} words</Badge>
                      <Badge variant="outline">{documentSummary.readingTime} min read</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {documentSummary && (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          AI-Generated Summary
                        </CardTitle>
                        <CardDescription>{documentSummary.fileName}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {documentSummary.wordCount} words
                        </Badge>
                        <Badge variant="outline">
                          {documentSummary.readingTime} min read
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] mb-4">
                      <p className="text-sm leading-relaxed">{documentSummary.summary}</p>
                    </ScrollArea>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(documentSummary.summary);
                        toast.success('Summary copied to clipboard!');
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Summary
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  {/* Key Points */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Key Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <ul className="space-y-2">
                          {documentSummary.keyPoints.map((point, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-primary font-bold">•</span>
                              <span className="text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Topics & Reading Level */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Document Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Main Topics</Label>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {documentSummary.topics.map((topic, i) => (
                            <Badge key={i} variant="secondary">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {readingLevel && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Reading Level</Label>
                          <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              <span className="font-medium">{readingLevel.level}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {readingLevel.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  Key Insights & Analysis
                </CardTitle>
                <CardDescription>
                  AI-identified main ideas, conclusions, and supporting details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  {keyInsights.length === 0 ? (
                    <div className="text-center py-12">
                      <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No insights extracted yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {keyInsights.map((insight, i) => (
                        <Card key={i} className={`border-2 ${getInsightColor(insight.importance)}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {insight.type.replace('_', ' ')}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {insight.importance}
                                  </Badge>
                                </div>
                                <p className="text-sm leading-relaxed">{insight.content}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Citations Tab */}
          <TabsContent value="citations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Generate Academic Citations</CardTitle>
                <CardDescription>
                  Create properly formatted citations in APA, MLA, Chicago, and BibTeX
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Document Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter document title"
                      value={citationTitle}
                      onChange={(e) => setCitationTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="2024"
                      value={citationYear}
                      onChange={(e) => setCitationYear(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authors">Authors (comma-separated) *</Label>
                  <Input
                    id="authors"
                    placeholder="Jane Smith, John Doe, Sarah Johnson"
                    value={citationAuthors}
                    onChange={(e) => setCitationAuthors(e.target.value)}
                  />
                </div>

                <Button onClick={handleGenerateCitations} disabled={loading} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Citations
                </Button>
              </CardContent>
            </Card>

            {citations && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Generated Citations</CardTitle>
                    <Select value={citationStyle} onValueChange={(v: any) => setCitationStyle(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apa">APA</SelectItem>
                        <SelectItem value="mla">MLA</SelectItem>
                        <SelectItem value="chicago">Chicago</SelectItem>
                        <SelectItem value="bibtex">BibTeX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* APA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">APA (7th Edition)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCitation(citations.apa, 'APA')}
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm leading-relaxed">
                      {citations.apa}
                    </div>
                  </div>

                  {/* MLA */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">MLA (9th Edition)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCitation(citations.mla, 'MLA')}
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm leading-relaxed">
                      {citations.mla}
                    </div>
                  </div>

                  {/* Chicago */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Chicago (17th Edition)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCitation(citations.chicago, 'Chicago')}
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm leading-relaxed">
                      {citations.chicago}
                    </div>
                  </div>

                  {/* BibTeX */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">BibTeX</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyCitation(citations.bibtex, 'BibTeX')}
                      >
                        <Copy className="w-3 h-3 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-md font-mono text-xs leading-relaxed">
                      <pre>{citations.bibtex}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Study Tab */}
          <TabsContent value="study" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Study Questions
                </CardTitle>
                <CardDescription>
                  AI-generated questions to test your understanding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[450px]">
                  {studyQuestions.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No study questions generated yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {studyQuestions.map((question, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium mb-2">{question}</p>
                                <Textarea
                                  placeholder="Type your answer here..."
                                  rows={3}
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
