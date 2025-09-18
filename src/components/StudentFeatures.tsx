import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, Calculator, Search, FileText, Brain, Users, Clock, Award } from 'lucide-react';

const StudentFeatures = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      title: "Smart Study Assistant",
      description: "Get personalized help with homework, research, and exam preparation across all subjects.",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756844554658_2cb56be1.webp"
    },
    {
      icon: <Calculator className="h-8 w-8 text-green-500" />,
      title: "Math Problem Solver",
      description: "Step-by-step solutions for algebra, calculus, statistics, and advanced mathematics.",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756844556410_953610ed.webp"
    },
    {
      icon: <Search className="h-8 w-8 text-purple-500" />,
      title: "Research Tools",
      description: "Access vast databases, generate citations, and organize your research efficiently.",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756844558199_146e9cb7.webp"
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-500" />,
      title: "Writing Support",
      description: "Improve your essays, papers, and creative writing with AI-powered feedback.",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756844560214_184faf9d.webp"
    }
  ];

  const benefits = [
    { icon: <Clock className="h-6 w-6" />, title: "24/7 Availability", desc: "Study anytime, anywhere" },
    { icon: <Brain className="h-6 w-6" />, title: "Personalized Learning", desc: "Adapts to your pace" },
    { icon: <Award className="h-6 w-6" />, title: "Proven Results", desc: "95% grade improvement" },
    { icon: <Users className="h-6 w-6" />, title: "Study Groups", desc: "Connect with peers" }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform provides comprehensive support for students at every level
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  {feature.icon}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4 text-blue-600">
                {benefit.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StudentFeatures;