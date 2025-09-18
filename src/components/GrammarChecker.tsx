import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';

interface GrammarIssue {
  text: string;
  position: number;
  length: number;
  type: 'grammar' | 'style' | 'clarity' | 'tone';
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
  explanation: string;
}

interface GrammarCheckerProps {
  text: string;
  onTextChange: (text: string) => void;
}

const GrammarChecker: React.FC<GrammarCheckerProps> = ({ text, onTextChange }) => {
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [readabilityScore, setReadabilityScore] = useState(0);

  const grammarRules = [
    {
      pattern: /\bits\s+a\s+good\s+idea\s+to\b/gi,
      type: 'style' as const,
      severity: 'low' as const,
      suggestion: 'consider',
      explanation: 'More concise phrasing'
    },
    {
      pattern: /\bin\s+order\s+to\b/gi,
      type: 'style' as const,
      severity: 'medium' as const,
      suggestion: 'to',
      explanation: 'Remove unnecessary words'
    },
    {
      pattern: /\bvery\s+unique\b/gi,
      type: 'grammar' as const,
      severity: 'high' as const,
      suggestion: 'unique',
      explanation: 'Unique cannot be modified by "very"'
    },
    {
      pattern: /\bcould\s+of\b/gi,
      type: 'grammar' as const,
      severity: 'high' as const,
      suggestion: 'could have',
      explanation: 'Common grammatical error'
    },
    {
      pattern: /\beffect\s+change\b/gi,
      type: 'grammar' as const,
      severity: 'medium' as const,
      suggestion: 'affect change',
      explanation: 'Use "affect" as a verb, "effect" as a noun'
    }
  ];

  useEffect(() => {
    analyzeText();
  }, [text]);

  const analyzeText = () => {
    const foundIssues: GrammarIssue[] = [];

    grammarRules.forEach(rule => {
      const matches = text.matchAll(rule.pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          foundIssues.push({
            text: match[0],
            position: match.index,
            length: match[0].length,
            type: rule.type,
            severity: rule.severity,
            suggestion: rule.suggestion,
            explanation: rule.explanation
          });
        }
      }
    });

    // Check for passive voice
    const passivePattern = /\b(was|were|is|are|been|being)\s+\w+ed\b/gi;
    const passiveMatches = text.matchAll(passivePattern);
    for (const match of passiveMatches) {
      if (match.index !== undefined) {
        foundIssues.push({
          text: match[0],
          position: match.index,
          length: match[0].length,
          type: 'style',
          severity: 'low',
          suggestion: 'Use active voice',
          explanation: 'Active voice is more direct and engaging'
        });
      }
    }

    setIssues(foundIssues);
    calculateReadability();
  };

  const calculateReadability = () => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => {
      return count + countSyllables(word);
    }, 0);

    if (sentences.length === 0 || words.length === 0) {
      setReadabilityScore(0);
      return;
    }

    // Flesch Reading Ease Score
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
    
    setReadabilityScore(Math.max(0, Math.min(100, Math.round(score))));
  };

  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const applyFix = (issue: GrammarIssue) => {
    const newText = text.slice(0, issue.position) + 
                   issue.suggestion + 
                   text.slice(issue.position + issue.length);
    onTextChange(newText);
  };

  const getReadabilityLevel = (score: number) => {
    if (score >= 90) return { level: 'Very Easy', color: 'text-green-600' };
    if (score >= 80) return { level: 'Easy', color: 'text-green-500' };
    if (score >= 70) return { level: 'Fairly Easy', color: 'text-blue-500' };
    if (score >= 60) return { level: 'Standard', color: 'text-yellow-500' };
    if (score >= 50) return { level: 'Fairly Difficult', color: 'text-orange-500' };
    if (score >= 30) return { level: 'Difficult', color: 'text-red-500' };
    return { level: 'Very Difficult', color: 'text-red-600' };
  };

  const readability = getReadabilityLevel(readabilityScore);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Readability</span>
            </div>
            <div className="text-2xl font-bold">{readabilityScore}</div>
            <div className={`text-sm ${readability.color}`}>{readability.level}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Issues Found</span>
            </div>
            <div className="text-2xl font-bold">{issues.length}</div>
            <div className="text-sm text-gray-500">
              {issues.filter(i => i.severity === 'high').length} critical
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Word Count</span>
            </div>
            <div className="text-2xl font-bold">
              {text.split(/\s+/).filter(w => w.length > 0).length}
            </div>
            <div className="text-sm text-gray-500">words</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Grammar & Style Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="text-center py-6 text-green-600">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
              <p>Great! No grammar or style issues found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={issue.severity === 'high' ? 'destructive' : 
                               issue.severity === 'medium' ? 'default' : 'secondary'}
                      >
                        {issue.type}
                      </Badge>
                      <span className="text-sm text-gray-500 capitalize">
                        {issue.severity} priority
                      </span>
                    </div>
                    <Button size="sm" onClick={() => applyFix(issue)}>
                      Fix
                    </Button>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-red-600">"{issue.text}"</span>
                    <span className="mx-2">→</span>
                    <span className="font-medium text-green-600">"{issue.suggestion}"</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lightbulb className="w-4 h-4" />
                    {issue.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GrammarChecker;