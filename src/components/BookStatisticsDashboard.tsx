/**
 * Book Statistics Dashboard
 * Visualizes real-time growth of The Seven Books' academic validation
 * Dynamic Metadata Layer: Core text immutable, statistics updated in real-time
 * 
 * Features:
 * - Truth Density tracking (% proven/supported)
 * - Academic Weight Score (citation-weighted support)
 * - Support vs. Challenge ratio visualization
 * - Version history timeline
 * - Chapter-level correlation strength
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { romanSupabase } from '@/services/romanSupabase';
import { AlertCircle, BarChart3, BookOpen, CheckCircle, HelpCircle, History, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BookStatistics {
  id: string;
  book_number: number;
  book_title: string;
  version: string;
  support_counter: number;
  challenge_counter: number;
  neutral_counter: number;
  chapters_proven: number;
  chapters_supported: number;
  chapters_challenged: number;
  chapters_total: number;
  truth_density_score: number;
  total_citations: number;
  academic_weight_score: number;
  last_update: string;
  version_created_at: string;
}

interface ChapterStatistics {
  id: string;
  chapter_number: number;
  chapter_title: string;
  support_counter: number;
  challenge_counter: number;
  neutral_counter: number;
  status: 'proven' | 'supported' | 'challenged' | 'unverified';
  correlation_strength_avg: number;
  last_update: string;
}

export const BookStatisticsDashboard: React.FC = () => {
  const [bookStats, setBookStats] = useState<BookStatistics[]>([]);
  const [selectedBook, setSelectedBook] = useState<number>(1);
  const [chapterStats, setChapterStats] = useState<ChapterStatistics[]>([]);
  const [versionHistory, setVersionHistory] = useState<BookStatistics[]>([]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadBookStatistics();
    loadChapterStatistics(selectedBook);
    loadVersionHistory(selectedBook);

    // Real-time subscription to book statistics updates
    const subscription = romanSupabase
      .channel('book_statistics_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_statistics'
        },
        () => {
          loadBookStatistics();
          loadChapterStatistics(selectedBook);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedBook]);

  const loadBookStatistics = async () => {
    try {
      setLoading(true);
      const { data, error } = await romanSupabase
        .from('book_statistics')
        .select('*')
        .eq('version', '1.0')
        .order('book_number', { ascending: true });

      if (error) throw error;
      setBookStats(data || []);
    } catch (error) {
      console.error('Failed to load book statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChapterStatistics = async (bookNumber: number) => {
    try {
      // Get book statistics ID
      const { data: bookData } = await romanSupabase
        .from('book_statistics')
        .select('id')
        .eq('book_number', bookNumber)
        .eq('version', '1.0')
        .single();

      if (!bookData) return;

      const { data, error } = await romanSupabase
        .from('chapter_statistics')
        .select('*')
        .eq('book_statistics_id', bookData.id)
        .order('chapter_number', { ascending: true });

      if (error) throw error;
      setChapterStats(data || []);
    } catch (error) {
      console.error('Failed to load chapter statistics:', error);
    }
  };

  const loadVersionHistory = async (bookNumber: number) => {
    try {
      const { data, error } = await romanSupabase
        .from('book_statistics')
        .select('*')
        .eq('book_number', bookNumber)
        .order('version_created_at', { ascending: false });

      if (error) throw error;
      setVersionHistory(data || []);
    } catch (error) {
      console.error('Failed to load version history:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'proven': return 'bg-green-500';
      case 'supported': return 'bg-blue-500';
      case 'challenged': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'proven': return <CheckCircle className="w-4 h-4" />;
      case 'supported': return <TrendingUp className="w-4 h-4" />;
      case 'challenged': return <AlertCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const calculateTotalSupport = () => {
    return bookStats.reduce((sum, book) => sum + book.support_counter, 0);
  };

  const calculateTotalChallenge = () => {
    return bookStats.reduce((sum, book) => sum + book.challenge_counter, 0);
  };

  const calculateAverageTruthDensity = () => {
    if (bookStats.length === 0) return 0;
    const sum = bookStats.reduce((sum, book) => sum + book.truth_density_score, 0);
    return (sum / bookStats.length).toFixed(2);
  };

  const calculateTotalAcademicWeight = () => {
    return bookStats.reduce((sum, book) => sum + book.academic_weight_score, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Book Statistics Dashboard
        </h2>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <BookOpen className="w-8 h-8" />
          Book Statistics Dashboard
        </h2>
        <p className="text-muted-foreground">
          Real-time tracking of The Seven Books' academic validation and truth density
        </p>
      </div>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm">
            <strong>Dynamic Metadata Layer:</strong> Core book text remains immutable (Divine Intent preserved). 
            Statistics are updated in real-time as R.O.M.A.N. discovers supporting or challenging research.
          </p>
        </CardContent>
      </Card>

      {/* Global Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{calculateTotalSupport()}</div>
            <p className="text-xs text-muted-foreground mt-1">Research papers supporting The Books</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{calculateTotalChallenge()}</div>
            <p className="text-xs text-muted-foreground mt-1">Research papers challenging claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Truth Density</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{calculateAverageTruthDensity()}%</div>
            <p className="text-xs text-muted-foreground mt-1">Percentage of proven/supported content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Academic Weight</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{calculateTotalAcademicWeight()}</div>
            <p className="text-xs text-muted-foreground mt-1">Citation-weighted support score</p>
          </CardContent>
        </Card>
      </div>

      {/* Book Selection Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Select Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {bookStats.map((book) => (
              <Button
                key={book.book_number}
                variant={selectedBook === book.book_number ? 'default' : 'outline'}
                onClick={() => setSelectedBook(book.book_number)}
                className="flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Book {book.book_number}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="chapters" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Chapter Details
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Version History
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {bookStats
            .filter((book) => book.book_number === selectedBook)
            .map((book) => (
              <div key={book.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{book.book_title}</CardTitle>
                    <CardDescription>
                      Version {book.version} • Last updated: {new Date(book.last_update).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Correlation Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Supporting</span>
                          <span className="text-green-600 font-semibold">{book.support_counter}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${(book.support_counter / (book.support_counter + book.challenge_counter + book.neutral_counter)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Challenging</span>
                          <span className="text-yellow-600 font-semibold">{book.challenge_counter}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{
                              width: `${(book.challenge_counter / (book.support_counter + book.challenge_counter + book.neutral_counter)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Neutral</span>
                          <span className="text-blue-600 font-semibold">{book.neutral_counter}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(book.neutral_counter / (book.support_counter + book.challenge_counter + book.neutral_counter)) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Truth Density Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center space-y-4">
                        <div className="text-5xl font-bold text-blue-600">
                          {book.truth_density_score.toFixed(2)}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Percentage of proven/supported content
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Academic Weight:</span>
                            <strong>{book.academic_weight_score.toFixed(2)}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Citations:</span>
                            <strong>{book.total_citations}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Chapters:</span>
                            <strong>
                              {book.chapters_proven} Proven, {book.chapters_supported} Supported, {book.chapters_challenged} Challenged
                            </strong>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
        </TabsContent>

        {/* Chapters Tab */}
        <TabsContent value="chapters">
          <Card>
            <CardHeader>
              <CardTitle>Chapter-Level Correlation Strength</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Chapter</th>
                      <th className="text-left p-2">Title</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-right p-2">Support</th>
                      <th className="text-right p-2">Challenge</th>
                      <th className="text-right p-2">Avg Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapterStats.map((chapter) => (
                      <tr key={chapter.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="p-2">{chapter.chapter_number}</td>
                        <td className="p-2">{chapter.chapter_title}</td>
                        <td className="p-2">
                          <Badge className={`${getStatusColor(chapter.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(chapter.status)}
                            {chapter.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="text-right p-2">{chapter.support_counter}</td>
                        <td className="text-right p-2">{chapter.challenge_counter}</td>
                        <td className="text-right p-2">{chapter.correlation_strength_avg.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Version History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Autonomous Versioning Timeline</CardTitle>
              <CardDescription>
                New version created every 1,000 correlations to track knowledge evolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Version</th>
                      <th className="text-left p-2">Created</th>
                      <th className="text-right p-2">Truth Density</th>
                      <th className="text-right p-2">Academic Weight</th>
                      <th className="text-right p-2">Total Correlations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {versionHistory.map((version) => (
                      <tr key={version.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900">
                        <td className="p-2">
                          <Badge variant="outline">v{version.version}</Badge>
                        </td>
                        <td className="p-2">{new Date(version.version_created_at).toLocaleString()}</td>
                        <td className="text-right p-2">{version.truth_density_score.toFixed(2)}%</td>
                        <td className="text-right p-2">{version.academic_weight_score.toFixed(2)}</td>
                        <td className="text-right p-2">
                          {version.support_counter + version.challenge_counter + version.neutral_counter}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
