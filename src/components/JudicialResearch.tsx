import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Scale, BookOpen, Users, Target, Clock, Gavel } from 'lucide-react';

interface ResearchSection {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
}

const JudicialResearch: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => 
      prev.includes(id) 
        ? prev.filter(sectionId => sectionId !== id)
        : [...prev, id]
    );
  };

  const researchSections: ResearchSection[] = [
    {
      id: 'tendencies',
      title: 'Understanding Judicial Tendencies and Philosophy',
      content: 'Judges, like all individuals, possess their own unique experiences, legal philosophies, and preferred methods for handling cases. Lawyers meticulously research a judge\'s general outlook on specific types of cases, their preferred legal arguments, and even their judicial temperament. This insight allows attorneys to anticipate how a judge might interpret legal precedents or react to certain lines of questioning.',
      icon: <Scale className="w-5 h-5 text-indigo-400" />
    },
    {
      id: 'outcomes',
      title: 'Predicting Outcomes',
      content: 'While no legal outcome can ever be guaranteed, understanding a judge\'s past rulings, their approach to similar motions, and their general leanings significantly aids a lawyer in anticipating potential challenges. This foresight allows them to craft arguments that are more likely to resonate with the specific judge presiding over the case.',
      icon: <Target className="w-5 h-5 text-green-400" />
    },
    {
      id: 'arguments',
      title: 'Tailoring Arguments and Presentation',
      content: 'Knowing a judge\'s preferences—for example, whether they favor concise arguments or require detailed historical context, or their comfort level with technology in the courtroom—enables a lawyer to meticulously tailor their arguments, presentation style, and even the format of their legal filings. This customization aims for maximum impact and clarity, ensuring the judge receives information in their preferred manner.',
      icon: <BookOpen className="w-5 h-5 text-blue-400" />
    },
    {
      id: 'expectations',
      title: 'Managing Client Expectations',
      content: 'If a particular judge is known for strict adherence to rules, a slower pace in issuing rulings, or specific procedural requirements, lawyers can proactively manage their clients\' expectations regarding the entire legal process and potential timelines. This transparency helps clients understand the journey ahead.',
      icon: <Users className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'courtroom',
      title: 'Courtroom Management and Demeanor',
      content: 'Some judges maintain very strict rules for their courtroom, while others exhibit a more flexible approach. Understanding these preferences helps lawyers prepare appropriately for court appearances and ensures professional conduct that aligns with judicial expectations.',
      icon: <Gavel className="w-5 h-5 text-yellow-400" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
          Understanding Judicial Research: A Lawyer's Essential Tool
        </h1>
        <Badge className="bg-indigo-600 text-white px-4 py-2">
          Professional Legal Practice
        </Badge>
      </div>

      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-2xl flex items-center gap-3">
            <Scale className="w-8 h-8 text-indigo-400" />
            Why Lawyers Research Judges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300 leading-relaxed">
            Lawyers engage in extensive judicial research, or "profiling," of judges they will appear before. 
            This practice is not just common; it's considered absolutely essential for effective litigation 
            and ensuring the best representation for their clients. Here's why:
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {researchSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          
          return (
            <Card key={section.id} className="bg-gray-900/50 border-gray-700">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <CardTitle className="text-white text-lg">
                      {section.title}
                    </CardTitle>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-indigo-400" />
            <h3 className="text-xl font-bold text-white">Professional Practice Standard</h3>
          </div>
          <p className="text-gray-300 leading-relaxed">
            This comprehensive approach to judicial research represents the gold standard in legal practice, 
            ensuring that every client receives the most informed and strategically sound representation possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JudicialResearch;