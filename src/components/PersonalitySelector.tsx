import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { User, Briefcase, Code, Palette } from 'lucide-react';

export interface Personality {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  traits: string[];
  color: string;
}

const personalities: Personality[] = [
  {
    id: 'casual',
    name: 'Casual',
    description: 'Friendly and conversational, like chatting with a knowledgeable friend',
    icon: <User className="w-5 h-5" />,
    traits: ['Relaxed tone', 'Uses contractions', 'Conversational'],
    color: 'bg-blue-500'
  },
  {
    id: 'formal',
    name: 'Professional',
    description: 'Structured and professional, ideal for business contexts',
    icon: <Briefcase className="w-5 h-5" />,
    traits: ['Formal language', 'Detailed responses', 'Business-focused'],
    color: 'bg-gray-600'
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Precise and analytical, perfect for technical discussions',
    icon: <Code className="w-5 h-5" />,
    traits: ['Technical accuracy', 'Code examples', 'Detailed explanations'],
    color: 'bg-green-600'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Imaginative and inspiring, great for brainstorming and innovation',
    icon: <Palette className="w-5 h-5" />,
    traits: ['Creative thinking', 'Metaphors', 'Inspiring language'],
    color: 'bg-purple-600'
  }
];

interface PersonalitySelectorProps {
  selectedPersonality: string;
  onPersonalityChange: (personalityId: string) => void;
}

export const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({
  selectedPersonality,
  onPersonalityChange
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose AI Personality</h3>
        <p className="text-sm text-gray-600">Select how you'd like the AI to communicate with you</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {personalities.map((personality) => (
          <Card
            key={personality.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedPersonality === personality.id
                ? 'ring-2 ring-blue-500 bg-blue-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onPersonalityChange(personality.id)}
          >
            <div className="flex items-start space-x-3">
              <div className={`${personality.color} text-white p-2 rounded-lg flex-shrink-0`}>
                {personality.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900">{personality.name}</h4>
                  {selectedPersonality === personality.id && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{personality.description}</p>
                <div className="flex flex-wrap gap-1">
                  {personality.traits.map((trait, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};