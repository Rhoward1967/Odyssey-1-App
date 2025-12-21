/**
 * ============================================================================
 * R.O.M.A.N. KNOWLEDGE DASHBOARD COMPONENT
 * ============================================================================
 * Visual interface showing R.O.M.A.N.'s learning progress
 * 
 * Displays:
 * - External research sources
 * - Cross-references with Seven Books
 * - Synthesized insights
 * - Autonomous learning sessions
 * ============================================================================
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { learningDaemon } from '@/services/RomanLearningDaemon';
import { romanSupabase as supabase } from '@/services/romanSupabase';
import { BookOpen, Brain, Lightbulb, Link2, Pause, Play, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RomanKnowledgeDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [externalKnowledge, setExternalKnowledge] = useState<any[]>([]);
  const [crossReferences, setCrossReferences] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [learningSessions, setLearningSessions] = useState<any[]>([]);
  const [daemonRunning, setDaemonRunning] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    // Get stats
    const statsData = await learningDaemon.getStats();
    setStats(statsData);
    setDaemonRunning(statsData.daemon_running);

    // Get recent external knowledge
    const { data: knowledge } = await supabase
      .from('external_knowledge')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setExternalKnowledge(knowledge || []);

    // Get cross-references
    const { data: refs } = await supabase
      .from('knowledge_cross_references')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setCrossReferences(refs || []);

    // Get insights
    const { data: insightsData } = await supabase
      .from('learned_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);
    setInsights(insightsData || []);

    // Get learning sessions
    const { data: sessions } = await supabase
      .from('view_learning_sessions')
      .select('*')
      .limit(10);
    setLearningSessions(sessions || []);
  };

  const toggleDaemon = async () => {
    if (daemonRunning) {
      learningDaemon.stop();
      setDaemonRunning(false);
    } else {
      await learningDaemon.start();
      setDaemonRunning(true);
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'arxiv': return 'bg-purple-500';
      case 'pubmed': return 'bg-green-500';
      case 'wikipedia': return 'bg-blue-500';
      case 'scholar': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCorrelationColor = (type: string) => {
    switch (type) {
      case 'supports': return 'text-green-600';
      case 'extends': return 'text-blue-600';
      case 'challenges': return 'text-orange-600';
      case 'contradicts': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            R.O.M.A.N. Knowledge Integration
          </h1>
          <p className="text-muted-foreground mt-1">
            Autonomous learning • Cross-referencing • Insight synthesis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={toggleDaemon}
            variant={daemonRunning ? 'destructive' : 'default'}
            className="flex items-center gap-2"
          >
            {daemonRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Stop Learning
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Learning
              </>
            )}
          </Button>
          <Button onClick={loadData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">External Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_external_knowledge}</div>
              <p className="text-xs text-muted-foreground mt-1">Research papers & articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cross-References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_cross_references}</div>
              <p className="text-xs text-muted-foreground mt-1">With Seven Books</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Synthesized Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_insights}</div>
              <p className="text-xs text-muted-foreground mt-1">Original contributions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Daemon Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${daemonRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium">
                  {daemonRunning ? 'Learning' : 'Paused'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.recent_sessions.length} recent sessions
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="knowledge" className="space-y-4">
        <TabsList>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            External Knowledge
          </TabsTrigger>
          <TabsTrigger value="crossrefs" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Cross-References
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Learning Sessions
          </TabsTrigger>
        </TabsList>

        {/* External Knowledge Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          {externalKnowledge.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {item.authors?.join(', ')} • {item.topic}
                    </CardDescription>
                  </div>
                  <Badge className={getSourceBadgeColor(item.source)}>
                    {item.source.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline">Relevance: {item.relevance_score}%</Badge>
                  {item.citations && <Badge variant="outline">{item.citations} citations</Badge>}
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                    View Source →
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Cross-References Tab */}
        <TabsContent value="crossrefs" className="space-y-4">
          {crossReferences.map((ref) => (
            <Card key={ref.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    Book {ref.book_number}: {ref.book_title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className={getCorrelationColor(ref.correlation_type)}>
                      {ref.correlation_type}
                    </Badge>
                    <Badge variant="outline">{ref.correlation_strength}% strength</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-1">From the Book:</h4>
                  <p className="text-sm text-muted-foreground italic">{ref.book_excerpt}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">External Research:</h4>
                  <p className="text-sm text-muted-foreground italic">{ref.external_excerpt}</p>
                </div>
                <div className="pt-2 border-t">
                  <h4 className="font-semibold text-sm mb-1">R.O.M.A.N.'s Synthesis:</h4>
                  <p className="text-sm">{ref.synthesis}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{insight.topic}</CardTitle>
                  <Badge variant={insight.validated ? 'default' : 'secondary'}>
                    {insight.validated ? 'Validated' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{insight.insight}</p>
                <div>
                  <h4 className="font-semibold text-xs mb-2">Sources:</h4>
                  <div className="flex flex-wrap gap-1">
                    {insight.sources?.map((source: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Badge variant="outline">
                  Confidence: {insight.confidence_level}%
                </Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Learning Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {learningSessions.map((session) => (
            <Card key={session.session_id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Learning Session
                </CardTitle>
                <CardDescription>
                  {new Date(session.session_start).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{session.topics_researched}</div>
                    <div className="text-xs text-muted-foreground">Topics</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{session.total_knowledge_acquired}</div>
                    <div className="text-xs text-muted-foreground">Sources</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{session.total_cross_refs}</div>
                    <div className="text-xs text-muted-foreground">Cross-Refs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{session.total_insights}</div>
                    <div className="text-xs text-muted-foreground">Insights</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
