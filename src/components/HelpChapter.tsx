import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, FileText, Scan, Brain, Target, CheckCircle } from 'lucide-react';

interface HelpChapterProps {
  title: string;
  content: string;
  readTime: number;
  category: string;
  onClick?: () => void;
}

const HelpChapter: React.FC<HelpChapterProps> = ({ title, content, readTime, category, onClick }) => {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'document scanning':
        return <Scan className="w-5 h-5" />;
      case 'ai analysis':
        return <Brain className="w-5 h-5" />;
      case 'bidding':
        return <Target className="w-5 h-5" />;
      case 'compliance':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'document scanning':
        return 'bg-blue-600/20 text-blue-300';
      case 'ai analysis':
        return 'bg-purple-600/20 text-purple-300';
      case 'bidding':
        return 'bg-green-600/20 text-green-300';
      case 'compliance':
        return 'bg-yellow-600/20 text-yellow-300';
      default:
        return 'bg-slate-600/20 text-slate-300';
    }
  };

  return (
    <Card 
      className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getCategoryIcon(category)}
            <CardTitle className="text-white text-lg sm:text-xl leading-tight">{title}</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge className={`${getCategoryColor(category)} text-xs px-2 py-1`}>
              {category}
            </Badge>
            <div className="flex items-center text-slate-400 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              <span>{readTime} min</span>
            </div>
            <button
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-black text-white border border-slate-600 hover:bg-slate-800"
            >
              Read More
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-400 text-sm leading-relaxed">
          {content.substring(0, 120)}...
        </p>
      </CardContent>
    </Card>
  );
};

export default HelpChapter;