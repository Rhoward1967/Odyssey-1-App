import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Star, Download, Eye } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  industry: string;
  description: string;
  rating: number;
  downloads: number;
  price: string;
  preview: string;
  features: string[];
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Medical Practice Suite',
    industry: 'Healthcare',
    description: 'Complete patient management system with scheduling and billing',
    rating: 4.9,
    downloads: 1250,
    price: 'Free',
    preview: 'https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757916805149_a2131bd0.webp',
    features: ['Patient Records', 'Appointment Booking', 'Insurance Claims', 'Prescription Management']
  },
  {
    id: '2',
    name: 'School Management Pro',
    industry: 'Education',
    description: 'K-12 school administration and parent communication platform',
    rating: 4.8,
    downloads: 890,
    price: '$29/month',
    preview: 'https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757916807077_2b302d5e.webp',
    features: ['Student Portal', 'Grade Management', 'Parent Dashboard', 'Event Calendar']
  },
  {
    id: '3',
    name: 'Legal Case Tracker',
    industry: 'Legal',
    description: 'Case management and document automation for law firms',
    rating: 4.7,
    downloads: 650,
    price: '$49/month',
    preview: 'https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757916808808_c0bd168a.webp',
    features: ['Case Timeline', 'Document Generator', 'Client Communication', 'Billing Integration']
  },
  {
    id: '4',
    name: 'Manufacturing Dashboard',
    industry: 'Manufacturing',
    description: 'Production monitoring and inventory management system',
    rating: 4.6,
    downloads: 420,
    price: '$99/month',
    preview: 'https://d64gsuwffb70l.cloudfront.net/68bb2ebf0d23e919bfda74fb_1757916810547_01eb159c.webp',
    features: ['Production Tracking', 'Inventory Control', 'Quality Metrics', 'Supplier Management']
  }
];

export const IndustryTemplateMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const filteredTemplates = templates.filter(template => 
    (selectedIndustry === 'All' || template.industry === selectedIndustry) &&
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const industries = ['All', ...Array.from(new Set(templates.map(t => t.industry)))];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Template Marketplace</h2>
        <p className="text-gray-300">Industry-specific templates to jumpstart your business</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {industries.map(industry => (
            <Button
              key={industry}
              variant={selectedIndustry === industry ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedIndustry(industry)}
              className={selectedIndustry === industry ? "bg-blue-600" : "border-white/20 text-white"}
            >
              {industry}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-all">
            <div 
              className="h-48 bg-cover bg-center rounded-t-lg"
              style={{ backgroundImage: `url(${template.preview})` }}
            >
              <div className="h-full bg-gradient-to-t from-black/80 to-transparent rounded-t-lg flex items-end p-4">
                <Badge className="bg-blue-600 text-white">
                  {template.industry}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                <Badge variant="outline" className="text-green-400 border-green-400">
                  {template.price}
                </Badge>
              </div>
              <p className="text-gray-300 text-sm">{template.description}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-white text-sm">{template.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{template.downloads}</span>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {template.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="text-xs text-gray-400">• {feature}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};