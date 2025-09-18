import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AIProviderSelectorProps {
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

const providers = [
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    description: 'Advanced conversational AI with excellent reasoning',
    features: ['High Quality', 'Fast Response', 'Creative'],
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Open-source AI models with diverse capabilities',
    features: ['Open Source', 'Specialized Models', 'Research-Focused'],
    color: 'bg-yellow-100 text-yellow-800'
  }
];

export default function AIProviderSelector({ selectedProvider, onProviderChange }: AIProviderSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700">AI Provider</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => (
          <Card 
            key={provider.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedProvider === provider.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onProviderChange(provider.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                {selectedProvider === provider.id && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{provider.description}</p>
              <div className="flex flex-wrap gap-1">
                {provider.features.map((feature) => (
                  <Badge 
                    key={feature} 
                    variant="outline" 
                    className={`text-xs ${provider.color}`}
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}