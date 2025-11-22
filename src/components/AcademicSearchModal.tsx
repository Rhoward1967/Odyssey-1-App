/**
 * Academic Search Modal Component
 * Search across multiple academic databases
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
import {
    AcademicPaper,
    formatCitation,
    getRecommendedPapers,
    searchAllSources,
    searchArXiv,
    searchGoogleScholar,
    searchIEEE,
    searchJSTOR,
    searchPubMed
} from '@/services/academicSearchService';
import {
    BookOpen,
    Copy,
    Database,
    Download,
    ExternalLink,
    FileText,
    Search,
    Star,
    TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AcademicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  portalType: 'k12' | 'legal' | 'medical' | 'college';
}

export default function AcademicSearchModal({ isOpen, onClose, portalType }: AcademicSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AcademicPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<'all' | 'google-scholar' | 'pubmed' | 'arxiv' | 'jstor' | 'ieee'>('all');
  const [selectedPaper, setSelectedPaper] = useState<AcademicPaper | null>(null);
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago'>('apa');
  const [activeTab, setActiveTab] = useState<'search' | 'recommendations'>('search');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setLoading(true);
    setSelectedPaper(null);

    try {
      let results: AcademicPaper[] = [];

      switch (selectedSource) {
        case 'google-scholar':
          results = await searchGoogleScholar(searchQuery);
          break;
        case 'pubmed':
          results = await searchPubMed(searchQuery);
          break;
        case 'arxiv':
          results = await searchArXiv(searchQuery);
          break;
        case 'jstor':
          results = await searchJSTOR(searchQuery);
          break;
        case 'ieee':
          results = await searchIEEE(searchQuery);
          break;
        default:
          results = await searchAllSources(searchQuery, portalType);
      }

      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info('No results found. Try different keywords.');
      } else {
        toast.success(`Found ${results.length} papers!`);
      }
    } catch (error) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const topic = getRecommendedTopic(portalType);
      const papers = await getRecommendedPapers(topic, portalType);
      setSearchResults(papers);
      toast.success(`Loaded ${papers.length} recommended papers`);
    } catch (error) {
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedTopic = (type: string): string => {
    const topics = {
      'k12': 'science education',
      'legal': 'constitutional law',
      'medical': 'evidence-based medicine',
      'college': 'research methodology'
    };
    return topics[type] || 'academic research';
  };

  const handleCopyCitation = (paper: AcademicPaper) => {
    const citation = formatCitation(paper, citationStyle);
    navigator.clipboard.writeText(citation);
    toast.success(`${citationStyle.toUpperCase()} citation copied!`);
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      'google-scholar': '🎓',
      'pubmed': '⚕️',
      'arxiv': '📄',
      'jstor': '📚',
      'ieee': '⚡'
    };
    return icons[source] || '📖';
  };

  const getSourceColor = (source: string) => {
    const colors = {
      'google-scholar': 'bg-blue-100 text-blue-800',
      'pubmed': 'bg-green-100 text-green-800',
      'arxiv': 'bg-purple-100 text-purple-800',
      'jstor': 'bg-amber-100 text-amber-800',
      'ieee': 'bg-cyan-100 text-cyan-800'
    };
    return colors[source] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Academic Research Database
          </DialogTitle>
          <DialogDescription>
            Search across Google Scholar, PubMed, arXiv, JSTOR, and IEEE Xplore
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Search Papers
            </TabsTrigger>
            <TabsTrigger value="recommendations" onClick={() => activeTab === 'recommendations' && loadRecommendations()}>
              <Star className="w-4 h-4 mr-2" />
              Recommended
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            {/* Search Controls */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <Input
                  placeholder="Search for papers, topics, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="col-span-3">
                <Select value={selectedSource} onValueChange={(v: any) => setSelectedSource(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌐 All Sources</SelectItem>
                    <SelectItem value="google-scholar">🎓 Google Scholar</SelectItem>
                    {portalType === 'medical' && <SelectItem value="pubmed">⚕️ PubMed</SelectItem>}
                    <SelectItem value="arxiv">📄 arXiv</SelectItem>
                    <SelectItem value="jstor">📚 JSTOR</SelectItem>
                    <SelectItem value="ieee">⚡ IEEE Xplore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Button onClick={handleSearch} disabled={loading} className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {/* Results Layout */}
            <div className="grid grid-cols-3 gap-4">
              {/* Results List */}
              <ScrollArea className="col-span-2 h-[550px] pr-4">
                {loading ? (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
                    <p className="text-muted-foreground">Searching databases...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-2">No papers yet</p>
                    <p className="text-sm text-muted-foreground">
                      Try searching for topics like "{getRecommendedTopic(portalType)}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((paper) => (
                      <Card
                        key={paper.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedPaper?.id === paper.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedPaper(paper)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base leading-snug mb-2">
                                {paper.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getSourceColor(paper.source)}>
                                  {getSourceIcon(paper.source)} {paper.source}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {paper.year}
                                </span>
                                {paper.citationCount && (
                                  <>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <TrendingUp className="w-3 h-3" />
                                      {paper.citationCount} citations
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-2">
                            {paper.authors.slice(0, 3).join(', ')}
                            {paper.authors.length > 3 && ` +${paper.authors.length - 3} more`}
                          </p>
                          <p className="text-sm line-clamp-2">{paper.abstract}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Paper Details */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">Paper Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPaper ? (
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <Label className="text-xs text-muted-foreground">Title</Label>
                          <p className="font-medium mt-1">{selectedPaper.title}</p>
                        </div>

                        {/* Authors */}
                        <div>
                          <Label className="text-xs text-muted-foreground">Authors</Label>
                          <div className="mt-1 space-y-1">
                            {selectedPaper.authors.map((author, i) => (
                              <p key={i} className="text-sm">{author}</p>
                            ))}
                          </div>
                        </div>

                        {/* Abstract */}
                        <div>
                          <Label className="text-xs text-muted-foreground">Abstract</Label>
                          <p className="text-sm mt-1 leading-relaxed">{selectedPaper.abstract}</p>
                        </div>

                        {/* Metadata */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Year</Label>
                            <p className="text-sm font-medium mt-1">{selectedPaper.year}</p>
                          </div>
                          {selectedPaper.citationCount && (
                            <div>
                              <Label className="text-xs text-muted-foreground">Citations</Label>
                              <p className="text-sm font-medium mt-1">{selectedPaper.citationCount}</p>
                            </div>
                          )}
                        </div>

                        {selectedPaper.publicationVenue && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Published In</Label>
                            <p className="text-sm mt-1">{selectedPaper.publicationVenue}</p>
                          </div>
                        )}

                        {selectedPaper.keywords && selectedPaper.keywords.length > 0 && (
                          <div>
                            <Label className="text-xs text-muted-foreground">Keywords</Label>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {selectedPaper.keywords.map((keyword, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Citation */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-muted-foreground">Citation</Label>
                            <Select value={citationStyle} onValueChange={(v: any) => setCitationStyle(v)}>
                              <SelectTrigger className="w-24 h-7 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="apa">APA</SelectItem>
                                <SelectItem value="mla">MLA</SelectItem>
                                <SelectItem value="chicago">Chicago</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="bg-muted p-3 rounded-md text-xs leading-relaxed">
                            {formatCitation(selectedPaper, citationStyle)}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => handleCopyCitation(selectedPaper)}
                          >
                            <Copy className="w-3 h-3 mr-2" />
                            Copy Citation
                          </Button>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2">
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={() => window.open(selectedPaper.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on {selectedPaper.source}
                          </Button>
                          {selectedPaper.pdfUrl && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => window.open(selectedPaper.pdfUrl, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Select a paper to view details
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recommended for {portalType === 'k12' ? 'K-12' : portalType.toUpperCase()} Students</CardTitle>
                <CardDescription>
                  Curated papers relevant to your field of study
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[550px]">
                  {loading ? (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 mx-auto mb-4 animate-pulse text-muted-foreground" />
                      <p className="text-muted-foreground">Loading recommendations...</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">No recommendations loaded</p>
                      <Button onClick={loadRecommendations}>
                        Load Recommendations
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((paper) => (
                        <Card key={paper.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="text-base leading-snug mb-2">
                                  {paper.title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {paper.authors.join(', ')}
                                </p>
                              </div>
                              <Badge className={getSourceColor(paper.source)}>
                                {getSourceIcon(paper.source)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm line-clamp-3 mb-3">{paper.abstract}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => window.open(paper.url, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-2" />
                              View Paper
                            </Button>
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
