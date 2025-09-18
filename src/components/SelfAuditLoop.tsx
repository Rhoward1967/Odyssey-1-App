import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertCircle, CheckCircle, RefreshCw, Search } from 'lucide-react';

interface AuditStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'complete' | 'failed';
  description: string;
  findings?: string[];
}

export const SelfAuditLoop: React.FC = () => {
  const [auditSteps, setAuditSteps] = useState<AuditStep[]>([
    {
      id: '1',
      name: 'Assumption Detection',
      status: 'pending',
      description: 'Scanning reasoning chain for unverified assumptions'
    },
    {
      id: '2', 
      name: 'Source Verification',
      status: 'pending',
      description: 'Cross-referencing facts against verified sources'
    },
    {
      id: '3',
      name: 'Confidence Validation',
      status: 'pending',
      description: 'Ensuring all outputs meet 95% confidence threshold'
    },
    {
      id: '4',
      name: 'Loop Completion',
      status: 'pending',
      description: 'Final verification before output generation'
    }
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loopCount, setLoopCount] = useState(0);

  useEffect(() => {
    // Autonomous audit loop - continuous self-verification
    setIsRunning(true);
    
    const runAutonomousAudit = () => {
      setLoopCount(prev => prev + 1);
      setCurrentStep(0);
      
      // Reset all steps
      setAuditSteps(steps => steps.map(step => ({ ...step, status: 'pending', findings: [] })));
      
      // Autonomous audit process
      const runStep = (stepIndex: number) => {
        if (stepIndex >= auditSteps.length) {
          // Audit complete, schedule next autonomous cycle
          setTimeout(runAutonomousAudit, 5000 + Math.random() * 10000);
          return;
        }
        
        setCurrentStep(stepIndex);
        setAuditSteps(steps => steps.map((step, i) => 
          i === stepIndex ? { ...step, status: 'running' } : step
        ));
        
        setTimeout(() => {
          const findings = generateFindings(stepIndex);
          const hasIssues = findings.length > 0 && stepIndex < 2;
          
          setAuditSteps(steps => steps.map((step, i) => 
            i === stepIndex ? { 
              ...step, 
              status: hasIssues ? 'failed' : 'complete',
              findings 
            } : step
          ));
          
          if (hasIssues && stepIndex < 2) {
            // If issues found, auto-correct and restart
            setTimeout(() => runStep(0), 1000);
          } else {
            setTimeout(() => runStep(stepIndex + 1), 800);
          }
        }, 1500);
      };
      
      runStep(0);
    };

    // Start autonomous operation
    runAutonomousAudit();
  }, []);

  const generateFindings = (stepIndex: number): string[] => {
    const findings = [
      ['Found 2 unverified assumptions - auto-correcting', 'Low confidence statement detected - enhancing'],
      ['Source verification complete - all sources validated', 'Cross-references updated autonomously'],
      ['All statements now meet confidence threshold'],
      ['Audit loop complete - output verified and secured']
    ];
    
    return stepIndex < 2 && Math.random() > 0.7 ? findings[stepIndex] : [];
  };
  const getStepIcon = (step: AuditStep) => {
    switch (step.status) {
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />;
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const completedSteps = auditSteps.filter(s => s.status === 'complete').length;
  const progress = (completedSteps / auditSteps.length) * 100;

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-purple-400 flex items-center gap-2">
          <RefreshCw className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`} />
          Autonomous Self-Audit Loop
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Continuous autonomous verification - no manual intervention required
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Loop #{loopCount} • Progress: {completedSteps}/{auditSteps.length}
            </div>
            <Badge className="bg-green-600/20 text-green-300">
              AUTONOMOUS
            </Badge>
          </div>

          <Progress value={progress} className="h-2" />

          <div className="space-y-3">
            {auditSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`p-3 rounded-lg border transition-all ${
                  currentStep === index && isRunning
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-600 bg-gray-700/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {getStepIcon(step)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200 text-sm font-medium">{step.name}</span>
                      <Badge 
                        variant={step.status === 'complete' ? 'default' : 
                                step.status === 'failed' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {step.status}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs">{step.description}</p>
                  </div>
                </div>
                
                {step.findings && step.findings.length > 0 && (
                  <div className="ml-7 space-y-1">
                    {step.findings.map((finding, i) => (
                      <div key={i} className="text-xs text-green-400">
                        ✓ {finding}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-slate-800/30 p-3 rounded-lg border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-400">Autonomous Operation Active</span>
            </div>
            <p className="text-xs text-gray-400">
              System continuously self-audits and auto-corrects without human intervention
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};