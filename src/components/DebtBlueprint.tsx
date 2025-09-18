import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function DebtBlueprint() {
  const [activeSection, setActiveSection] = useState<string>('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: '🎯' },
    { id: 'consumer-reality', title: 'Consumer Reality', icon: '⚖️' },
    { id: 'wealthy-paradigm', title: 'Wealthy Paradigm', icon: '💎' },
    { id: 'strategic-framework', title: 'Strategic Framework', icon: '🏗️' }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "outline"}
            onClick={() => setActiveSection(section.id)}
            className={`${
              activeSection === section.id 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'border-purple-500/50 text-purple-300 hover:bg-purple-900/30'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.title}
          </Button>
        ))}
      </div>

      {/* Content Sections */}
      {activeSection === 'introduction' && (
        <Card className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              🎯 The Unseen Divide in Debt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              For most people, debt is a heavy burden, a relentless treadmill of payments and interest, 
              often leading to a feeling of powerlessness. Yet, for the financially sophisticated – the 
              wealthy and large corporations – debt is a tool, a lever for acquiring assets, optimizing 
              taxes, and building even greater wealth.
            </p>
            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
              <h4 className="text-amber-300 font-semibold mb-2">Key Insight:</h4>
              <p className="text-sm">
                The methods used by the wealthy to leverage debt are not inherently secret or exclusive. 
                They operate within the very same legal and financial systems that govern everyone. 
                The key difference lies in knowledge, mindset, and strategic application.
              </p>
            </div>
            <p>
              "The Sovereign Self" recognizes that individuals, much like corporations, can reclaim 
              their financial autonomy by understanding the "divine intent" embedded in these laws – 
              laws often designed to facilitate commerce, which, when understood, can also be bent 
              to serve individual liberation.
            </p>
          </CardContent>
        </Card>
      )}

      {activeSection === 'consumer-reality' && (
        <Card className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              ⚖️ The Consumer's Current Reality: Reactive Debt Relief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <p>
              The typical consumer journey with debt is often characterized by reaction. A credit card 
              bill arrives, a student loan payment is due, a medical emergency creates unforeseen expenses. 
              The focus is on making the next payment, often without a deeper understanding of the system at play.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-amber-300 font-semibold">Common Consumer Debts:</h4>
                <div className="space-y-2">
                  <Badge variant="destructive" className="block w-full justify-start">
                    💳 Credit Card Debt - High-interest, revolving
                  </Badge>
                  <Badge variant="destructive" className="block w-full justify-start">
                    🎓 Student Loans - Often non-dischargeable
                  </Badge>
                  <Badge variant="destructive" className="block w-full justify-start">
                    🏥 Medical Debt - Unexpected, ruinous
                  </Badge>
                  <Badge variant="destructive" className="block w-full justify-start">
                    🏠 Mortgages/Auto - Secured to assets
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-amber-300 font-semibold">Conventional Solutions:</h4>
                <div className="space-y-2">
                  <Badge variant="secondary" className="block w-full justify-start">
                    📊 Budgeting & Frugality
                  </Badge>
                  <Badge variant="secondary" className="block w-full justify-start">
                    🔄 Debt Consolidation
                  </Badge>
                  <Badge variant="secondary" className="block w-full justify-start">
                    📞 Credit Counseling
                  </Badge>
                  <Badge variant="secondary" className="block w-full justify-start">
                    ⚖️ Bankruptcy (Last Resort)
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-red-900/20 p-4 rounded-lg border border-red-500/30">
              <h4 className="text-red-300 font-semibold mb-2">The Problem:</h4>
              <p className="text-sm">
                These tools primarily address the symptoms of debt, not the underlying power dynamics 
                or the strategic use of financial systems. Key laws like the FDCPA, FCRA, and TILA 
                are frequently misunderstood as mere protections, rather than powerful tools for 
                strategic negotiation and defense.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'wealthy-paradigm' && (
        <Card className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              💎 The Wealthy's Paradigm: Debt as Strategic Tool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <p>
              The financially sophisticated view debt not as a liability to be eliminated at all costs, 
              but as a flexible instrument for capital deployment. Their strategies are woven into the 
              fabric of banking, credit, and monetary policy.
            </p>

            <div className="space-y-4">
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                  📈 Principle 1: Leveraging Debt for Asset Acquisition
                </h4>
                <p className="text-sm mb-3">
                  Wealthy individuals and corporations routinely borrow large sums to acquire appreciating 
                  assets – real estate, businesses, high-growth stocks. The objective is for the return 
                  on these assets to significantly exceed the cost of borrowing.
                </p>
                <div className="bg-black/30 p-3 rounded text-xs">
                  <strong className="text-amber-300">Example:</strong> Borrowing at 4% interest to acquire 
                  an asset that generates a 10% return. The 6% difference is pure profit, amplified by 
                  the borrowed capital.
                </div>
              </div>

              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                  🛡️ Principle 2: Asset Protection Through Legal Structures
                </h4>
                <p className="text-sm">
                  Strategic use of non-recourse loans, portfolio loans, and interest deductions 
                  that can offset taxable income while protecting personal assets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Badge className="bg-purple-600 hover:bg-purple-700 p-3 text-center">
                🏦 Non-Recourse Loans
              </Badge>
              <Badge className="bg-purple-600 hover:bg-purple-700 p-3 text-center">
                📊 Portfolio Loans
              </Badge>
              <Badge className="bg-purple-600 hover:bg-purple-700 p-3 text-center">
                💰 Interest Deductions
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSection === 'strategic-framework' && (
        <Card className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-3">
              🏗️ Strategic Framework: From Reactive to Proactive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div className="bg-amber-900/20 p-4 rounded-lg border border-amber-500/30">
              <h4 className="text-amber-300 font-semibold mb-2">Sovereign Debt Strategy:</h4>
              <p className="text-sm">
                Transform from reactive "debt relief" mindset to proactive "debt leveraging" approach 
                by understanding and utilizing the same legal and financial frameworks used by the wealthy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-red-300 font-semibold">❌ Reactive Approach:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Making minimum payments</li>
                  <li>• Feeling powerless against collectors</li>
                  <li>• Viewing debt as moral failing</li>
                  <li>• Focusing only on elimination</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-green-300 font-semibold">✅ Proactive Approach:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Strategic negotiation using law</li>
                  <li>• Leveraging FDCPA/FCRA/TILA</li>
                  <li>• Viewing debt as financial tool</li>
                  <li>• Converting to asset acquisition</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
              <h4 className="text-purple-300 font-semibold mb-2">Next Steps:</h4>
              <p className="text-sm">
                The complete blueprint includes detailed strategies for debt validation, negotiation 
                tactics, legal protections, and the transformation of consumer debt into wealth-building 
                opportunities using the same principles employed by financial institutions.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}