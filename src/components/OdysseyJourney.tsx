import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

export default function OdysseyJourney() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <span className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              ODYSSEY
            </span>
            <span className="text-4xl md:text-6xl font-bold text-white ml-2">-1</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Your First Step Into the Future
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Every great journey begins with a single step. Odyssey-1 is your gateway to transformative technology, 
            where innovation meets accessibility, and where your business evolution starts today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
              Begin Your Journey
            </Button>
            <Button variant="outline" size="lg" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg">
              Explore the Path
            </Button>
          </div>
        </div>

        {/* Journey Visualization */}
        <div className="relative">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68b549aa729ecbe34b6f737e_1756742535675_d3af7b01.webp"
            alt="3D Journey Path"
            className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-2xl"></div>
        </div>

        {/* Journey Steps */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="bg-slate-800/50 border-blue-500/30 p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">First Step</h3>
              <p className="text-gray-300">Begin your transformation with cutting-edge 3D interfaces and AI-powered tools designed for your success.</p>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-purple-500/30 p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">∞</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Infinite Possibilities</h3>
              <p className="text-gray-300">Unlock unlimited potential as you progress through advanced features and capabilities.</p>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-cyan-500/30 p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">★</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Your Destination</h3>
              <p className="text-gray-300">Reach new heights of business excellence with technology that evolves with you.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}