import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

const UniversalEmpowerment = () => {
  const benefits = [
    {
      title: "Level Playing Field",
      description: "Advanced AI capabilities once exclusive to Fortune 500 companies, now accessible to any business size",
      icon: "⚖️",
      badge: "Universal Access"
    },
    {
      title: "Scalable Intelligence",
      description: "Our platform grows with your business - from startup to enterprise, same powerful tools",
      icon: "📈",
      badge: "Any Size"
    },
    {
      title: "Competitive Edge",
      description: "Whether you're competing against giants or peers, gain the technological advantage you need",
      icon: "🚀",
      badge: "All Industries"
    },
    {
      title: "Resource Optimization",
      description: "Maximize efficiency regardless of team size - from solo entrepreneurs to large corporations",
      icon: "⚡",
      badge: "Smart Scaling"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Empowering Every Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From ambitious startups to established enterprises - our technology adapts to your needs, 
            giving every business the tools to compete and thrive in the modern marketplace.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <Badge variant="secondary" className="mb-2">{benefit.badge}</Badge>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UniversalEmpowerment;