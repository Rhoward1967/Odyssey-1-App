import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';

interface FactNode {
  id: string;
  statement: string;
  source: string;
  confidence: number;
  verified: boolean;
  assumptions: string[];
}

export const TruthAnchor: React.FC = () => {
  const [facts, setFacts] = useState<FactNode[]>([
    {
      id: '1',
      statement: 'The meeting was moved to 3 PM',
      source: 'user_input',
      confidence: 85,
      verified: false,
      assumptions: ['Original meeting time exists']
    },
    {
      id: '2', 
      statement: 'Water boils at 100°C at sea level',
      source: 'validated_dataset',
      confidence: 99,
      verified: true,
      assumptions: []
    },
    {
      id: '3',
      statement: 'The project deadline is next Friday',
      source: 'inferred_logic',
      confidence: 70,
      verified: false,
      assumptions: ['Standard work week applies', 'No holidays intervening']
    }
  ]);

  const [auditActive, setAuditActive] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<string | null>(null);

  const runSelfAudit = () => {
    setAuditActive(true);
    const lowConfidenceFacts = facts.filter(f => f.confidence < 95 || f.assumptions.length > 0);
    
    if (lowConfidenceFacts.length > 0) {
      setCurrentAudit(lowConfidenceFacts[0].id);
      
      setTimeout(() => {
        // Simulate verification process
        setFacts(prev => prev.map(f => 
          f.id === lowConfidenceFacts[0].id 
            ? { ...f, confidence: Math.min(f.confidence + 10, 99) }
            : f
        ));
        setCurrentAudit(null);
        setAuditActive(false);
      }, 2000);
    } else {
      setAuditActive(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return 'text-green-400';
    if (confidence >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'validated_dataset': return 'default';
      case 'user_input': return 'secondary';
      case 'inferred_logic': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Truth Anchor Module
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Prime Directive: Source verification and assumption elimination
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Core Rules: Source tagging • Confidence scoring • Verification loops
            </div>
            <Button 
              onClick={runSelfAudit}
              disabled={auditActive}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {auditActive ? (
                <>
                  <Search className="w-4 h-4 mr-2 animate-spin" />
                  Auditing...
                </>
              ) : (
                'Run Self-Audit'
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {facts.map((fact) => (
              <div 
                key={fact.id}
                className={`p-3 rounded-lg border transition-all ${
                  currentAudit === fact.id 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-gray-600 bg-gray-700/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-gray-200 text-sm">{fact.statement}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {fact.verified ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : fact.confidence < 95 ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getSourceBadgeVariant(fact.source)} className="text-xs">
                    {fact.source.replace('_', ' ')}
                  </Badge>
                  <span className={`text-xs font-mono ${getConfidenceColor(fact.confidence)}`}>
                    {fact.confidence}% confidence
                  </span>
                </div>

                {fact.assumptions.length > 0 && (
                  <div className="text-xs text-red-400">
                    Assumptions: {fact.assumptions.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-500 border-t border-gray-600 pt-2">
            Status: {facts.filter(f => f.confidence >= 95 && f.assumptions.length === 0).length}/{facts.length} facts verified
          </div>
        </div>
      </CardContent>
    </Card>
  );
};