import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, AlertCircle, X, RotateCcw } from 'lucide-react';

interface SpellCheckerProps {
  text: string;
  onTextChange: (text: string) => void;
  className?: string;
}

interface SpellError {
  word: string;
  position: number;
  suggestions: string[];
}

const SpellChecker: React.FC<SpellCheckerProps> = ({ text, onTextChange, className = '' }) => {
  const [errors, setErrors] = useState<SpellError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null);

  // Common misspellings and corrections
  const corrections = {
    'teh': 'the',
    'adn': 'and',
    'recieve': 'receive',
    'seperate': 'separate',
    'definately': 'definitely',
    'occured': 'occurred',
    'neccessary': 'necessary',
    'accomodate': 'accommodate',
    'beleive': 'believe',
    'acheive': 'achieve',
    'begining': 'beginning',
    'calender': 'calendar',
    'cemetary': 'cemetery',
    'changeable': 'changeable',
    'concious': 'conscious',
    'embarass': 'embarrass',
    'existance': 'existence',
    'foriegn': 'foreign',
    'goverment': 'government',
    'independant': 'independent',
    'maintainance': 'maintenance',
    'occassion': 'occasion',
    'priviledge': 'privilege',
    'recomend': 'recommend',
    'succesful': 'successful',
    'tommorrow': 'tomorrow',
    'untill': 'until',
    'wierd': 'weird'
  };

  const checkSpelling = () => {
    setIsChecking(true);
    const words = text.split(/\s+/);
    const foundErrors: SpellError[] = [];
    let position = 0;

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      if (corrections[cleanWord]) {
        foundErrors.push({
          word: cleanWord,
          position,
          suggestions: [corrections[cleanWord]]
        });
      }
      position += word.length + 1;
    });

    setErrors(foundErrors);
    setIsChecking(false);
  };

  const replaceWord = (errorIndex: number, suggestion: string) => {
    const error = errors[errorIndex];
    const newText = text.replace(new RegExp(`\\b${error.word}\\b`, 'gi'), suggestion);
    onTextChange(newText);
    
    // Remove this error from the list
    setErrors(errors.filter((_, index) => index !== errorIndex));
    setShowSuggestions(null);
  };

  const ignoreError = (errorIndex: number) => {
    setErrors(errors.filter((_, index) => index !== errorIndex));
    setShowSuggestions(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.length > 0) {
        checkSpelling();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [text]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Spell Check</span>
          {isChecking && (
            <RotateCcw className="w-4 h-4 animate-spin text-blue-500" />
          )}
        </div>
        <Badge variant={errors.length > 0 ? "destructive" : "secondary"}>
          {errors.length} {errors.length === 1 ? 'error' : 'errors'}
        </Badge>
      </div>

      {errors.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Spelling Suggestions
              </h4>
              {errors.map((error, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-red-100 px-2 py-1 rounded">
                      {error.word}
                    </span>
                    <span className="text-sm text-gray-600">→</span>
                    <div className="flex gap-1">
                      {error.suggestions.map((suggestion, suggestionIndex) => (
                        <Button
                          key={suggestionIndex}
                          size="sm"
                          variant="outline"
                          onClick={() => replaceWord(index, suggestion)}
                          className="h-6 px-2 text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => ignoreError(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {errors.length === 0 && text.length > 0 && !isChecking && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          No spelling errors found
        </div>
      )}
    </div>
  );
};

export default SpellChecker;