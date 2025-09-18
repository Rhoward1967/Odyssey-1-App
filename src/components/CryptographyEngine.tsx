import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const CryptographyEngine = () => {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-green-500/30 hover:border-green-400/50 transition-all">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center gap-2">
          🔐 Cryptography Engine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">RSA Key Size:</span>
            <span className="text-green-300 font-mono">4096-bit</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Elliptic Curve:</span>
            <span className="text-green-300 font-mono">secp256k1</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Hash Function:</span>
            <span className="text-green-300 font-mono">SHA-3</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-green-300 font-semibold">Number Theory Operations:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-green-500/20 p-2 rounded">
              <div className="text-green-300">Modular Exp</div>
              <div className="text-gray-400 font-mono">a^b mod n</div>
            </div>
            <div className="bg-green-500/20 p-2 rounded">
              <div className="text-green-300">Prime Test</div>
              <div className="text-gray-400 font-mono">Miller-Rabin</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-500/10 rounded border border-green-500/20">
          <div className="text-xs text-green-300 font-mono">
            Encryption active • Zero-knowledge proofs verified
          </div>
        </div>
      </CardContent>
    </Card>
  );
};