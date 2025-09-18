import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

const BusinessEcosystem = () => {
  const ecosystemLevels = [
    {
      level: "Startup & Solo",
      description: "Launch with enterprise-grade tools from day one",
      features: ["AI-powered market analysis", "Automated compliance", "Smart bidding algorithms"],
      color: "from-green-400 to-emerald-500"
    },
    {
      level: "Small to Medium",
      description: "Scale operations with intelligent automation",
      features: ["Team collaboration tools", "Advanced analytics", "Multi-project management"],
      color: "from-blue-400 to-cyan-500"
    },
    {
      level: "Enterprise & Beyond",
      description: "Transform entire organizations with AI orchestration",
      features: ["Custom AI models", "Enterprise integrations", "Advanced security protocols"],
      color: "from-purple-400 to-indigo-500"
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">One Platform, Every Business Size</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Our adaptive technology ecosystem grows with your ambitions. Whether you're just starting out 
            or managing a global enterprise, experience the same cutting-edge capabilities.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {ecosystemLevels.map((level, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300">
              <CardHeader>
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${level.color} mb-4`}></div>
                <CardTitle className="text-white text-xl">{level.level}</CardTitle>
                <p className="text-gray-400">{level.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {level.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-300">
                      <span className="text-green-400 mr-3">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Explore Solutions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <p className="text-gray-400 text-lg mb-6">
            Join businesses of all sizes already transforming their operations
          </p>
          <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
            Start Your Transformation
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BusinessEcosystem;