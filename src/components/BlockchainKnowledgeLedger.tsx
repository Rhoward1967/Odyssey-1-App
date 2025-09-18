import React, { useState, useEffect } from 'react';
import { Shield, Link, Hash, Clock, CheckCircle, AlertCircle, Database, Zap } from 'lucide-react';

interface KnowledgeBlock {
  id: string;
  hash: string;
  previousHash: string;
  timestamp: string;
  validator: string;
  knowledgeType: 'research' | 'discovery' | 'synthesis' | 'validation' | 'breakthrough';
  content: string;
  confidence: number;
  consensusScore: number;
  citations: number;
  verified: boolean;
  gasUsed: number;
}

const BlockchainKnowledgeLedger: React.FC = () => {
  const [knowledgeBlocks, setKnowledgeBlocks] = useState<KnowledgeBlock[]>([
    {
      id: '1',
      hash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      previousHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      timestamp: new Date().toISOString(),
      validator: 'ODYSSEY-Core-Node-7',
      knowledgeType: 'breakthrough',
      content: 'Quantum entanglement patterns in neural network optimization discovered',
      confidence: 97.3,
      consensusScore: 94.7,
      citations: 23,
      verified: true,
      gasUsed: 847
    },
    {
      id: '2',
      hash: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
      previousHash: '0xa7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      validator: 'ODYSSEY-Validator-3',
      knowledgeType: 'synthesis',
      content: 'Cross-domain integration of blockchain consensus with AI learning protocols',
      confidence: 89.4,
      consensusScore: 87.2,
      citations: 15,
      verified: true,
      gasUsed: 623
    },
    {
      id: '3',
      hash: '0xc9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0',
      previousHash: '0xb8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      validator: 'ODYSSEY-Research-Node-12',
      knowledgeType: 'research',
      content: 'Advanced mathematical proofs for distributed knowledge validation systems',
      confidence: 92.1,
      consensusScore: 91.8,
      citations: 31,
      verified: true,
      gasUsed: 1247
    }
  ]);

  const [networkStats, setNetworkStats] = useState({
    totalBlocks: 47293,
    activeValidators: 847,
    consensusRate: 97.3,
    networkHashRate: 2847.3,
    totalKnowledge: 15847,
    verifiedKnowledge: 14923,
    pendingValidation: 124
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new knowledge blocks
      if (Math.random() > 0.8) {
        const newBlock: KnowledgeBlock = {
          id: Date.now().toString(),
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          previousHash: knowledgeBlocks[0]?.hash || '0x0',
          timestamp: new Date().toISOString(),
          validator: `ODYSSEY-Node-${Math.floor(Math.random() * 20) + 1}`,
          knowledgeType: ['research', 'discovery', 'synthesis', 'validation'][Math.floor(Math.random() * 4)] as any,
          content: [
            'Novel AI architecture patterns discovered in distributed systems',
            'Breakthrough in quantum-classical hybrid computing protocols',
            'Advanced cryptographic validation mechanisms implemented',
            'Cross-domain knowledge synthesis protocols optimized'
          ][Math.floor(Math.random() * 4)],
          confidence: Math.random() * 20 + 80,
          consensusScore: Math.random() * 15 + 85,
          citations: Math.floor(Math.random() * 50),
          verified: Math.random() > 0.1,
          gasUsed: Math.floor(Math.random() * 1000) + 200
        };

        setKnowledgeBlocks(prev => [newBlock, ...prev.slice(0, 9)]);
      }

      setNetworkStats(prev => ({
        ...prev,
        totalBlocks: prev.totalBlocks + Math.floor(Math.random() * 3),
        activeValidators: prev.activeValidators + Math.floor((Math.random() - 0.5) * 10),
        consensusRate: prev.consensusRate + (Math.random() - 0.5) * 2,
        networkHashRate: prev.networkHashRate + (Math.random() - 0.5) * 100,
        totalKnowledge: prev.totalKnowledge + Math.floor(Math.random() * 5),
        verifiedKnowledge: prev.verifiedKnowledge + Math.floor(Math.random() * 3)
      }));
    }, 6000);

    return () => clearInterval(interval);
  }, [knowledgeBlocks]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'research': return <Database className="w-4 h-4 text-blue-400" />;
      case 'discovery': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'synthesis': return <Link className="w-4 h-4 text-purple-400" />;
      case 'validation': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'breakthrough': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Hash className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'research': return 'border-blue-500 bg-blue-500/10';
      case 'discovery': return 'border-yellow-500 bg-yellow-500/10';
      case 'synthesis': return 'border-purple-500 bg-purple-500/10';
      case 'validation': return 'border-green-500 bg-green-500/10';
      case 'breakthrough': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-green-900 to-blue-900 p-6 rounded-xl">
      <div className="flex items-center mb-6">
        <Shield className="w-8 h-8 text-cyan-400 mr-3" />
        <h2 className="text-2xl font-bold text-white">Blockchain Knowledge Ledger</h2>
      </div>

      {/* Network Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Total Blocks</div>
          <div className="text-cyan-400 font-mono text-lg">{networkStats.totalBlocks.toLocaleString()}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Active Validators</div>
          <div className="text-green-400 font-mono text-lg">{networkStats.activeValidators}</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Consensus Rate</div>
          <div className="text-blue-400 font-mono text-lg">{networkStats.consensusRate.toFixed(1)}%</div>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <div className="text-sm text-gray-400">Hash Rate</div>
          <div className="text-purple-400 font-mono text-lg">{networkStats.networkHashRate.toFixed(1)} TH/s</div>
        </div>
      </div>

      {/* Knowledge Validation Stats */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Knowledge Validation Status</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{networkStats.verifiedKnowledge.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Verified</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{networkStats.pendingValidation}</div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">{networkStats.totalKnowledge.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Recent Knowledge Blocks */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Knowledge Blocks</h3>
        {knowledgeBlocks.map(block => (
          <div key={block.id} className={`border-l-4 ${getTypeColor(block.knowledgeType)} p-4 rounded-r-lg`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {getTypeIcon(block.knowledgeType)}
                <div className="ml-3">
                  <div className="text-white font-medium">{block.content}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Hash: {block.hash.substring(0, 20)}...
                  </div>
                </div>
              </div>
              <div className="text-right">
                {block.verified ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-400" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Confidence</div>
                <div className="text-cyan-300 font-mono">{block.confidence.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-400">Consensus</div>
                <div className="text-green-300 font-mono">{block.consensusScore.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-400">Citations</div>
                <div className="text-blue-300 font-mono">{block.citations}</div>
              </div>
              <div>
                <div className="text-gray-400">Gas Used</div>
                <div className="text-purple-300 font-mono">{block.gasUsed}</div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between text-xs text-gray-500">
              <span>Validator: {block.validator}</span>
              <span>{new Date(block.timestamp).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainKnowledgeLedger;