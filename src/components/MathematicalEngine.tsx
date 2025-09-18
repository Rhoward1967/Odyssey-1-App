import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const MathematicalEngine = () => {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30 hover:border-blue-400/50 transition-all">
      <CardHeader>
        <CardTitle className="text-blue-400 flex items-center gap-2">
          🧮 Mathematical Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-blue-300 font-semibold">🤖 ML & AI Math</div>
            <div className="text-gray-300">Linear Algebra</div>
            <div className="text-gray-300">Multivariable Calculus</div>
            <div className="text-gray-300">Bayesian Inference</div>
          </div>
          <div className="space-y-2">
            <div className="text-green-300 font-semibold">🔐 Cryptography</div>
            <div className="text-gray-300">Number Theory</div>
            <div className="text-gray-300">Abstract Algebra</div>
            <div className="text-gray-300">Elliptic Curves</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-purple-300 font-semibold">⚛️ Quantum Computing</div>
            <div className="text-gray-300">Complex Linear Algebra</div>
            <div className="text-gray-300">Hilbert Spaces</div>
            <div className="text-gray-300">Unitary Matrices</div>
          </div>
          <div className="space-y-2">
            <div className="text-yellow-300 font-semibold">🧠 Computer Vision</div>
            <div className="text-gray-300">Projective Geometry</div>
            <div className="text-gray-300">Fourier Analysis</div>
            <div className="text-gray-300">Differential Geometry</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 rounded border border-blue-500/20">
          <div className="text-xs text-blue-300 font-mono">
            Status: Advanced mathematical frameworks integrated
          </div>
        </div>
      </CardContent>
    </Card>
  );
};