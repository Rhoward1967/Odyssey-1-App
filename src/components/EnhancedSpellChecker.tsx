import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, BookOpen, Settings, Plus, X, Lightbulb, Zap } from 'lucide-react';

interface SpellError {
  word: string;
  position: number;
  suggestions: string[];
  type: 'spelling' | 'grammar' | 'style' | 'ai-suggestion';
  confidence: number;
}

interface EnhancedSpellCheckerProps {
  text: string;
  onTextChange: (text: string) => void;
  customDictionary?: string[];
  autoCorrect?: boolean;
}

const EnhancedSpellChecker: React.FC<EnhancedSpellCheckerProps> = ({
  text,
  onTextChange,
  customDictionary = [],
  autoCorrect = false
}) => {
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [isAutoCorrectEnabled, setIsAutoCorrectEnabled] = useState(autoCorrect);
  const [dictionary, setDictionary] = useState<string[]>([
    'odyssey', 'blockchain', 'cryptocurrency', 'supabase', 'typescript', 'react',
    'ai', 'trading', 'dashboard', 'analytics', 'portfolio', 'fintech', 'defi',
    'nft', 'ethereum', 'bitcoin', 'godaddy', 'deployment', 'hosting'
  ]);

  // Enhanced common errors with confidence scores
  const commonErrors: Record<string, { suggestions: string[], confidence: number }> = {
    'teh': { suggestions: ['the'], confidence: 0.95 },
    'recieve': { suggestions: ['receive'], confidence: 0.95 },
    'seperate': { suggestions: ['separate'], confidence: 0.95 },
    'occured': { suggestions: ['occurred'], confidence: 0.95 },
    'definately': { suggestions: ['definitely'], confidence: 0.95 },
    'accomodate': { suggestions: ['accommodate'], confidence: 0.95 },
    'neccessary': { suggestions: ['necessary'], confidence: 0.95 },
    'existance': { suggestions: ['existence'], confidence: 0.95 },
    'maintainance': { suggestions: ['maintenance'], confidence: 0.95 },
    'buisness': { suggestions: ['business'], confidence: 0.95 },
    'tradeing': { suggestions: ['trading'], confidence: 0.9 },
    'analysys': { suggestions: ['analysis'], confidence: 0.9 },
    'portfollio': { suggestions: ['portfolio'], confidence: 0.9 }
  };

  // AI-powered style suggestions
  const styleRules = [
    { 
      pattern: /\bvery\s+(\w+)\b/gi, 
      suggestion: (match: string) => {
        const word = match.split(' ')[1];
        const intensifiers: Record<string, string> = {
          'good': 'excellent',
          'bad': 'terrible',
          'big': 'enormous',
          'small': 'tiny',
          'fast': 'rapid',
          'slow': 'sluggish'
        };
        return intensifiers[word.toLowerCase()] || match;
      },
      type: 'style' as const,
      confidence: 0.7
    }
  ];

  useEffect(() => {
    checkText();
  }, [text]);

  useEffect(() => {
    if (isAutoCorrectEnabled) {
      autoCorrectText();
    }
  }, [errors, isAutoCorrectEnabled]);

  const checkText = () => {
    const words = text.split(/\s+/);
    const foundErrors: SpellError[] = [];
    let position = 0;

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      
      if (cleanWord && !dictionary.includes(cleanWord) && !customDictionary.includes(cleanWord)) {
        if (commonErrors[cleanWord]) {
          foundErrors.push({
            word,
            position,
            suggestions: commonErrors[cleanWord].suggestions,
            type: 'spelling',
            confidence: commonErrors[cleanWord].confidence
          });
        } else if (cleanWord.length > 3) {
          foundErrors.push({
            word,
            position,
            suggestions: generateAISuggestions(cleanWord),
            type: 'spelling',
            confidence: 0.6
          });
        }
      }

      position += word.length + 1;
    });

    // Check style improvements
    styleRules.forEach(rule => {
      const matches = text.matchAll(rule.pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestions: [rule.suggestion(match[0])],
            type: rule.type,
            confidence: rule.confidence
          });
        }
      }
    });

    setErrors(foundErrors);
  };

  const generateAISuggestions = (word: string): string[] => {
    const suggestions: string[] = [];
    
    // Enhanced suggestion algorithm with phonetic matching
    dictionary.forEach(dictWord => {
      const distance = levenshteinDistance(word, dictWord);
      if (distance <= 2 && dictWord.length >= word.length - 1) {
        suggestions.push(dictWord);
      }
    });

    return suggestions.slice(0, 3);
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[str2.length][str1.length];
  };

  const autoCorrectText = () => {
    if (!isAutoCorrectEnabled) return;
    
    let correctedText = text;
    const highConfidenceErrors = errors.filter(error => 
      error.confidence >= 0.9 && error.suggestions.length > 0
    );

    highConfidenceErrors.forEach(error => {
      correctedText = correctedText.replace(error.word, error.suggestions[0]);
    });

    if (correctedText !== text) {
      onTextChange(correctedText);
    }
  };

  const applySuggestion = (error: SpellError, suggestion: string) => {
    const newText = text.slice(0, error.position) + 
                   suggestion + 
                   text.slice(error.position + error.word.length);
    onTextChange(newText);
  };

  const addToDictionary = (word: string) => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    setDictionary(prev => [...prev, cleanWord]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Enhanced AI Spell Check
          <Badge variant={errors.length > 0 ? "destructive" : "secondary"}>
            {errors.length} issues
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant={isAutoCorrectEnabled ? "default" : "outline"}
            onClick={() => setIsAutoCorrectEnabled(!isAutoCorrectEnabled)}
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto-Correct {isAutoCorrectEnabled ? 'ON' : 'OFF'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {errors.length === 0 ? (
          <div className="text-center py-4 text-green-600">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p>Perfect! No issues found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {errors.slice(0, 6).map((error, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-4 h-4 ${
                    error.type === 'spelling' ? 'text-red-500' : 
                    error.type === 'grammar' ? 'text-orange-500' : 
                    error.type === 'style' ? 'text-blue-500' : 'text-purple-500'
                  }`} />
                  <div>
                    <span className="font-medium text-red-600">"{error.word}"</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {error.type} ({Math.round(error.confidence * 100)}%)
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {error.suggestions.slice(0, 2).map((suggestion, i) => (
                    <Button
                      key={i}
                      size="sm"
                      variant="outline"
                      onClick={() => applySuggestion(error, suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addToDictionary(error.word)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedSpellChecker;