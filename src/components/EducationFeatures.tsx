import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, Calculator, Search, FileText, Brain, Users } from 'lucide-react';

const EducationFeatures = () => {
  const educationLevels = [
    {
      level: "K-12 Students",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756816320284_f0fa5a49.webp",
      features: [
        "Homework Help & Research",
        "Math Problem Solving",
        "Science Project Assistance",
        "Writing & Grammar Support",
        "Study Schedule Planning"
      ],
      price: "$15/month",
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      level: "High School",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756816319527_202168d2.webp",
      features: [
        "College Application Essays",
        "SAT/ACT Prep Support",
        "Research Paper Writing",
        "Career Path Guidance",
        "Scholarship Search"
      ],
      price: "$25/month",
      icon: <Search className="h-6 w-6" />
    },
    {
      level: "College Students",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756816318546_e5de9b69.webp",
      features: [
        "Law School Case Analysis",
        "Medical School Study Support",
        "Pharma Research Assistance",
        "Business Plan Development",
        "Thesis & Dissertation Help",
        "Academic Research Tools"
      ],
      price: "$35/month",
      icon: <Brain className="h-6 w-6" />
    },
    {
      level: "Graduate School",
      image: "https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756816321058_e5f7fbd3.webp",
      features: [
        "Advanced Research Analysis",
        "Publication Assistance",
        "Grant Writing Support",
        "Data Analysis Help",
        "Academic Networking"
      ],
      price: "$50/month",
      icon: <FileText className="h-6 w-6" />
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Empowering Future Entrepreneurs & Leaders
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From K-12 to graduate school, including specialized law, medical, and pharmaceutical programs. 
            We're targeting young entrepreneurs who will shape tomorrow's world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {educationLevels.map((level, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative overflow-hidden rounded-t-lg">
                <img 
                  src={level.image} 
                  alt={level.level}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  {level.icon}
                </div>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {level.level}
                  <Badge variant="outline">{level.price}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {level.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Start Learning</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Special Educational Institution Pricing
          </h3>
          <p className="text-gray-600 mb-6">
            Bulk discounts available for schools, universities, and educational organizations
          </p>
          <Button size="lg" variant="outline">
            <Users className="mr-2 h-5 w-5" />
            Contact for Institutional Pricing
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EducationFeatures;