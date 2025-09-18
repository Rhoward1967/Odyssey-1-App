import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, Brain, Calculator, Users } from 'lucide-react';

const StudentHero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756844550686_a5c185e7.webp"
          alt="Student with AI Technology"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/80 to-indigo-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Brain className="w-4 h-4 mr-2" />
            AI-Powered Education Platform
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Empower Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}Learning Journey
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            From K-12 to graduate school, unlock your potential with AI-powered study tools, 
            research assistance, and personalized learning experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Start Learning Today
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg">
              <Calculator className="mr-2 h-5 w-5" />
              Try Free Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-400">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Grade Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">AI Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentHero;