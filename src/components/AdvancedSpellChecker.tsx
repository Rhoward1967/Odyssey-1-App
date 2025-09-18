import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertCircle, 
  BookOpen, 
  Settings, 
  Plus,
  X,
  Lightbulb
} from 'lucide-react';

interface SpellError {
  word: string;
  position: number;
  suggestions: string[];
  type: 'spelling' | 'grammar' | 'style';
}

interface AdvancedSpellCheckerProps {
  text: string;
  onTextChange: (text: string) => void;
  customDictionary?: string[];
}

const AdvancedSpellChecker: React.FC<AdvancedSpellCheckerProps> = ({
  text,
  onTextChange,
  customDictionary = []
}) => {
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [selectedError, setSelectedError] = useState<SpellError | null>(null);
  const [dictionary, setDictionary] = useState<string[]>([
    'odyssey', 'blockchain', 'cryptocurrency', 'supabase', 'typescript', 'react'
  ]);

  // Common spelling errors and corrections
  const commonErrors: Record<string, string[]> = {
    'teh': ['the'],
    'recieve': ['receive'],
    'seperate': ['separate'],
    'occured': ['occurred'],
    'definately': ['definitely'],
    'accomodate': ['accommodate'],
    'neccessary': ['necessary'],
    'existance': ['existence'],
    'maintainance': ['maintenance'],
    'buisness': ['business']
  };

  // Grammar rules
  const grammarRules = [
    { pattern: /\bi\s+am\s+going\s+to\s+went\b/gi, suggestion: 'I am going to go' },
    { pattern: /\bthere\s+is\s+many\b/gi, suggestion: 'there are many' },
    { pattern: /\bless\s+people\b/gi, suggestion: 'fewer people' },
    { pattern: /\bbetween\s+you\s+and\s+i\b/gi, suggestion: 'between you and me' }
  ];

  useEffect(() => {
    checkText();
  }, [text]);

  const checkText = () => {
    const words = text.split(/\s+/);
    const foundErrors: SpellError[] = [];
    let position = 0;

    words.forEach((word, index) => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      
      // Check spelling
      if (cleanWord && !dictionary.includes(cleanWord) && !customDictionary.includes(cleanWord)) {
        if (commonErrors[cleanWord]) {
          foundErrors.push({
            word,
            position,
            suggestions: commonErrors[cleanWord],
            type: 'spelling'
          });
        } else if (cleanWord.length > 3) {
          foundErrors.push({
            word,
            position,
            suggestions: generateSuggestions(cleanWord),
            type: 'spelling'
          });
        }
      }

      position += word.length + 1;
    });

    // Check grammar
    grammarRules.forEach(rule => {
      const matches = text.matchAll(rule.pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          foundErrors.push({
            word: match[0],
            position: match.index,
            suggestions: [rule.suggestion],
            type: 'grammar'
          });
        }
      }
    });

    setErrors(foundErrors);
  };

  const generateSuggestions = (word: string): string[] => {
    // Simple suggestion algorithm
    const suggestions: string[] = [];
    
    // Try removing each character
    for (let i = 0; i < word.length; i++) {
      const suggestion = word.slice(0, i) + word.slice(i + 1);
      if (dictionary.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }

    // Try adding common letters
    const commonLetters = 'aeiou';
    for (let i = 0; i <= word.length; i++) {
      for (const letter of commonLetters) {
        const suggestion = word.slice(0, i) + letter + word.slice(i);
        if (dictionary.includes(suggestion)) {
          suggestions.push(suggestion);
        }
      }
    }

    return [...new Set(suggestions)].slice(0, 3);
  };

  const applySuggestion = (error: SpellError, suggestion: string) => {
    const newText = text.slice(0, error.position) + 
                   suggestion + 
                   text.slice(error.position + error.word.length);
    onTextChange(newText);
    setSelectedError(null);
  };

  const addToDictionary = (word: string) => {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    setDictionary(prev => [...prev, cleanWord]);
    checkText();
  };

  const ignoreError = (error: SpellError) => {
    setErrors(prev => prev.filter(e => e !== error));
    setSelectedError(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Spell & Grammar Check
            <Badge variant={errors.length > 0 ? "destructive" : "secondary"}>
              {errors.length} issues found
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.length === 0 ? (
            <div className="text-center py-4 text-green-600">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No spelling or grammar errors found!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {errors.slice(0, 5).map((error, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`w-4 h-4 ${
                      error.type === 'spelling' ? 'text-red-500' : 
                      error.type === 'grammar' ? 'text-orange-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <span className="font-medium text-red-600">"{error.word}"</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {error.type}
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => ignoreError(error)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Custom Dictionary: {dictionary.length} words</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button size="sm" variant="outline">
                <Lightbulb className="w-4 h-4 mr-2" />
                Writing Tips
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSpellChecker;