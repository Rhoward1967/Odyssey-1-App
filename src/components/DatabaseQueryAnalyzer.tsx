import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, AlertTriangle, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface QueryAnalysis {
  query: string;
  table: string;
  executionTime: number;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  optimization: string;
}

export default function DatabaseQueryAnalyzer() {
  const [analyses] = useState<QueryAnalysis[]>([
    {
      query: 'SELECT * FROM spending_transactions WHERE user_id = ?',
      table: 'spending_transactions',
      executionTime: 245,
      frequency: 1420,
      impact: 'high',
      optimization: 'Add index on user_id column'
    },
    {
      query: 'SELECT COUNT(*) FROM bids WHERE status = "active"',
      table: 'bids',
      executionTime: 89,
      frequency: 890,
      impact: 'medium',
      optimization: 'Add composite index on status + created_at'
    },
    {
      query: 'SELECT * FROM profiles ORDER BY created_at DESC',
      table: 'profiles',
      executionTime: 156,
      frequency: 340,
      impact: 'low',
      optimization: 'Add pagination and limit results'
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('cost-optimization-engine', {
        body: { action: 'analyze_queries' }
      });

      if (error) throw error;

      toast({
        title: "Analysis Complete",
        description: "Database queries analyzed for optimization opportunities."
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze database queries.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Query Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">3</div>
            <div className="text-sm text-muted-foreground">Slow Queries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">2,650</div>
            <div className="text-sm text-muted-foreground">Total Queries/Day</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">78%</div>
            <div className="text-sm text-muted-foreground">Optimization Potential</div>
          </div>
        </div>

        <Tabs defaultValue="queries">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="queries">Query Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="queries" className="space-y-4">
            {analyses.map((analysis, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getImpactColor(analysis.impact)}>
                      {getImpactIcon(analysis.impact)}
                      {analysis.impact.toUpperCase()}
                    </Badge>
                    <span className="font-medium">{analysis.table}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysis.executionTime}ms avg
                  </div>
                </div>
                
                <div className="bg-muted p-2 rounded text-sm font-mono">
                  {analysis.query}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>{analysis.frequency} executions/day</span>
                  <Progress value={Math.min((analysis.executionTime / 300) * 100, 100)} className="w-20" />
                </div>
                
                <div className="text-sm text-blue-600">
                  💡 {analysis.optimization}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-4">
              <h4 className="font-medium">Optimization Recommendations</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 mt-0.5 text-green-600" />
                  <div>
                    <div className="font-medium">Add Database Indexes</div>
                    <div className="text-muted-foreground">Reduce query time by 60-80% for filtered searches</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 mt-0.5 text-green-600" />
                  <div>
                    <div className="font-medium">Implement Query Caching</div>
                    <div className="text-muted-foreground">Cache frequently accessed data for 85% faster responses</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 mt-0.5 text-green-600" />
                  <div>
                    <div className="font-medium">Add Pagination</div>
                    <div className="text-muted-foreground">Limit result sets to improve performance and reduce costs</div>
                  </div>
                </li>
              </ul>
              
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                {isAnalyzing ? 'Analyzing...' : 'Run Full Analysis'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}