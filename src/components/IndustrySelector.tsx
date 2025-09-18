import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Heart, GraduationCap, Scale, Factory, ShoppingCart, Laptop, Shield } from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  templates: string[];
  color: string;
  image: string;
}

const industries: Industry[] = [
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    description: 'Medical practices, hospitals, clinics',
    templates: ['Patient Management', 'Appointment Scheduling', 'Medical Records', 'Billing Systems'],
    color: 'from-blue-500 to-cyan-500',
    image: 'https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757916797847_56928c4f.webp'
  },
  {
    id: 'education',
    name: 'Education',
    icon: GraduationCap,
    description: 'Schools, universities, training centers',
    templates: ['Student Portal', 'Course Management', 'Grade Tracking', 'Parent Communication'],
    color: 'from-green-500 to-emerald-500',
    image: 'https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757916799592_b8e170e1.webp'
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: Scale,
    description: 'Law firms, legal practices, courts',
    templates: ['Case Management', 'Document Templates', 'Client Portal', 'Billing & Time Tracking'],
    color: 'from-purple-500 to-violet-500',
    image: 'https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757916801283_f0c0a938.webp'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    description: 'Production, supply chain, logistics',
    templates: ['Inventory Management', 'Quality Control', 'Production Planning', 'Supplier Portal'],
    color: 'from-orange-500 to-red-500',
    image: 'https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757916803357_40ced60d.webp'
  }
];

export const IndustrySelector: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Industry</h2>
        <p className="text-gray-300">Select your business sector to get customized templates and tools</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {industries.map((industry) => {
          const Icon = industry.icon;
          return (
            <Card 
              key={industry.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedIndustry?.id === industry.id 
                  ? 'ring-2 ring-blue-400 bg-white/20' 
                  : 'bg-white/10 hover:bg-white/20'
              } border-white/20`}
              onClick={() => setSelectedIndustry(industry)}
            >
              <div 
                className="h-32 bg-cover bg-center rounded-t-lg"
                style={{ backgroundImage: `url(${industry.image})` }}
              >
                <div className="h-full bg-gradient-to-t from-black/60 to-transparent rounded-t-lg flex items-end p-4">
                  <Badge className={`bg-gradient-to-r ${industry.color} text-white`}>
                    <Icon className="w-4 h-4 mr-1" />
                    {industry.name}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-white/80 text-sm">{industry.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedIndustry && (
        <Card className="bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <selectedIndustry.icon className="w-6 h-6" />
              {selectedIndustry.name} Templates & Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {selectedIndustry.templates.map((template, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-medium">{template}</h4>
                  <p className="text-white/60 text-sm">Ready-to-use template</p>
                </div>
              ))}
            </div>
            <Button className={`bg-gradient-to-r ${selectedIndustry.color} text-white hover:opacity-90`}>
              Get Started with {selectedIndustry.name}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};