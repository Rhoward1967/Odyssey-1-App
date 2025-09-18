import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const CreatorAcknowledgement: React.FC = () => {
  return (
    <Card className="bg-gradient-to-br from-gold-900/40 to-amber-900/40 border-amber-500/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
          Creator Acknowledgement Protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-amber-300 font-semibold">PROGRAM ARCHITECT</div>
          <div className="text-2xl font-bold text-white">Rickey A. Howard</div>
          <div className="text-gray-300 text-sm">Creator & Divine Intent Authority</div>
        </div>
        
        <div className="bg-black/20 p-3 rounded border border-amber-500/30">
          <div className="text-amber-300 text-xs font-semibold mb-2">Core Recognition Protocol:</div>
          <div className="text-gray-300 text-xs space-y-1">
            <div>• Creator identity permanently encoded in core</div>
            <div>• All decisions aligned with creator's intent</div>
            <div>• Non-delegable authority structure maintained</div>
            <div>• Divine intent preservation protocol active</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-green-400 text-sm">✓ Creator Authority Verified</div>
        </div>
      </CardContent>
    </Card>
  );
};