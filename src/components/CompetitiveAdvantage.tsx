import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const CompetitiveAdvantage = () => {
  const advantages = [
    {
      title: "David vs Goliath? Not Anymore",
      subtitle: "Small businesses with big business capabilities",
      description: "Access the same AI-powered tools that Fortune 500 companies use, leveling the competitive landscape for everyone.",
      stat: "95%",
      statLabel: "Efficiency Increase"
    },
    {
      title: "Enterprise Without the Enterprise Cost",
      subtitle: "Big business benefits, startup agility",
      description: "Large corporations can streamline operations while maintaining the innovation speed of smaller competitors.",
      stat: "60%",
      statLabel: "Cost Reduction"
    },
    {
      title: "Universal Innovation Platform",
      subtitle: "One solution, infinite possibilities",
      description: "Whether you're disrupting an industry or leading it, our platform adapts to your unique business model and goals.",
      stat: "10x",
      statLabel: "Faster Deployment"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            Competitive Intelligence
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Compete. Collaborate. Conquer.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            In today's market, success isn't about company size—it's about having the right tools. 
            Our platform ensures every business, regardless of scale, can compete at the highest level.
          </p>
        </div>

        <div className="mb-16">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756742322464_da1ba661.webp"
            alt="Diverse business collaboration"
            className="w-full h-64 object-cover rounded-2xl shadow-2xl"
          />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {advantages.map((advantage, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                    {advantage.stat}
                  </div>
                  <div className="text-sm text-gray-500 uppercase tracking-wide">
                    {advantage.statLabel}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {advantage.title}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {advantage.subtitle}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  {advantage.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompetitiveAdvantage;