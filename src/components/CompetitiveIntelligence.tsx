import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, Target, Shield, Zap, Users, DollarSign } from 'lucide-react';

const CompetitiveIntelligence: React.FC = () => {
  const competitiveAdvantages = [
    {
      category: 'Technology Edge',
      icon: <Zap className="w-5 h-5" />,
      advantages: [
        'AI-driven document analysis with 99.2% accuracy',
        'Real-time collaborative bidding platform',
        'Predictive analytics for win probability',
        'Automated compliance checking'
      ],
      vsCompetitors: 'Most competitors offer basic document management without AI intelligence'
    },
    {
      category: 'Security & Compliance',
      icon: <Shield className="w-5 h-5" />,
      advantages: [
        'SOC 2 Type II certified',
        'FedRAMP authorized for government contracts',
        'Zero-knowledge architecture',
        'End-to-end encryption'
      ],
      vsCompetitors: 'Enterprise-grade security vs consumer-level protection'
    },
    {
      category: 'ROI & Performance',
      icon: <DollarSign className="w-5 h-5" />,
      advantages: [
        '60% reduction in proposal preparation time',
        '87% bidding success prediction accuracy',
        'Average ROI within 3 months',
        '25% improvement in project margins'
      ],
      vsCompetitors: 'Proven metrics vs theoretical benefits'
    }
  ];

  const marketPositioning = [
    {
      competitor: 'Traditional Consultants',
      ourAdvantage: '24/7 AI availability vs limited human hours',
      marketShare: '15%',
      weakness: 'High costs, inconsistent quality'
    },
    {
      competitor: 'Generic AI Platforms',
      ourAdvantage: 'Industry-specific training vs generic solutions',
      marketShare: '25%',
      weakness: 'Lack domain expertise'
    },
    {
      competitor: 'Legacy Software',
      ourAdvantage: 'Modern AI-driven vs outdated manual processes',
      marketShare: '40%',
      weakness: 'No AI capabilities, poor UX'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Target className="w-8 h-8 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Competitive Intelligence</h2>
          <p className="text-slate-400">Strategic advantages and market positioning</p>
        </div>
      </div>

      <div className="grid gap-6">
        {competitiveAdvantages.map((category, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                {category.icon}
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">Our Advantages:</h4>
                  <ul className="space-y-1">
                    {category.advantages.map((advantage, i) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-2">vs Competitors:</h4>
                  <p className="text-sm text-slate-400">{category.vsCompetitors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <TrendingUp className="w-5 h-5" />
            Market Positioning Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketPositioning.map((position, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{position.competitor}</h4>
                  <Badge className="bg-blue-600/20 text-blue-300">
                    {position.marketShare} Market Share
                  </Badge>
                </div>
                <p className="text-sm text-green-400 mb-1">
                  <strong>Our Advantage:</strong> {position.ourAdvantage}
                </p>
                <p className="text-sm text-slate-400">
                  <strong>Their Weakness:</strong> {position.weakness}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitiveIntelligence;