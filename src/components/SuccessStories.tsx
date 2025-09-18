import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Quote, TrendingUp, Users } from 'lucide-react';

interface SuccessStoriesProps {
  isOpen: boolean;
  onClose: () => void;
  industry: {
    name: string;
    icon: string;
    revenue: string;
    roi: string;
    clients: string;
    growth: string;
  };
}

const successStories: { [key: string]: any[] } = {
  Healthcare: [
    { company: 'Metro Health System', ceo: 'Dr. Sarah Johnson', result: '40% faster patient processing', quote: 'ODYSSEY-1 transformed our entire operation' },
    { company: 'Regional Medical Center', ceo: 'Michael Chen', result: '$2.1M cost savings', quote: 'Best investment we ever made' }
  ],
  Manufacturing: [
    { company: 'Precision Industries', ceo: 'Robert Martinez', result: '60% production increase', quote: 'Our efficiency skyrocketed overnight' },
    { company: 'Advanced Manufacturing Co', ceo: 'Lisa Thompson', result: '$4.2M revenue boost', quote: 'Game-changing technology' }
  ],
  Finance: [
    { company: 'Capital Trust Bank', ceo: 'David Wilson', result: '85% fraud reduction', quote: 'Security and efficiency combined perfectly' },
    { company: 'Investment Partners LLC', ceo: 'Amanda Foster', result: '$8.1M portfolio growth', quote: 'AI-powered insights are incredible' }
  ]
};

export const SuccessStories: React.FC<SuccessStoriesProps> = ({ isOpen, onClose, industry }) => {
  const stories = successStories[industry.name] || [
    { company: 'Leading Company', ceo: 'John Smith', result: '50% efficiency gain', quote: 'ODYSSEY-1 exceeded all expectations' },
    { company: 'Industry Leader', ceo: 'Jane Doe', result: '300% ROI achieved', quote: 'Revolutionary business transformation' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-slate-900 border-purple-500/30 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center">
            <span className="text-3xl mr-3">{industry.icon}</span>
            Success Stories from {industry.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="bg-green-600/80 text-white mb-4">
              Real Results from Real Companies
            </Badge>
            <p className="text-gray-300">See how businesses like yours achieved extraordinary results</p>
          </div>

          {stories.map((story, index) => (
            <Card key={index} className="bg-gradient-to-r from-slate-800/80 to-purple-800/20 border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Quote className="w-8 h-8 text-purple-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <blockquote className="text-lg text-white mb-4 italic">
                      "{story.quote}"
                    </blockquote>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white">{story.ceo}</p>
                        <p className="text-purple-300">{story.company}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-green-400 mb-1">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="font-bold">{story.result}</span>
                        </div>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-4">Ready to Join These Success Stories?</h3>
              <div className="flex gap-4 justify-center">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Start Your Success Story
                </Button>
                <Button variant="outline" className="border-purple-500/50 text-purple-300">
                  Get Free Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};