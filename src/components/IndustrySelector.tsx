import React, { useState } from 'react';
import { 
  Briefcase, Wrench, Coffee, Stethoscope, Car, UtensilsCrossed,
  Scissors, Dumbbell, Home, Zap, Calculator, Camera,
  Smile, HardHat, Target, Flower, PawPrint, Check, Lock
} from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  premium: boolean;
  color: string;
}

interface IndustrySelectorProps {
  userTier: 'professional' | 'business' | 'enterprise';
  onSelect: (industry: Industry) => void;
}

export default function IndustrySelector({ userTier, onSelect }: IndustrySelectorProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const industries: Industry[] = [
    { id: 'lawyer', name: 'Lawyer', icon: Briefcase, description: 'Legal services, consultations, case management', premium: true, color: 'blue' },
    { id: 'plumber', name: 'Plumber', icon: Wrench, description: 'Plumbing services, emergency repairs, installations', premium: true, color: 'cyan' },
    { id: 'baker', name: 'Baker', icon: Coffee, description: 'Bakery, pastries, custom cakes, catering', premium: true, color: 'amber' },
    { id: 'doctor', name: 'Doctor', icon: Stethoscope, description: 'Medical practice, appointments, patient care', premium: true, color: 'sky' },
    { id: 'mechanic', name: 'Mechanic', icon: Car, description: 'Auto repair, maintenance, diagnostics', premium: true, color: 'slate' },
    { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed, description: 'Dining, reservations, menu showcase', premium: true, color: 'red' },
    { id: 'salon', name: 'Salon/Barber', icon: Scissors, description: 'Hair, beauty services, appointments', premium: true, color: 'pink' },
    { id: 'gym', name: 'Gym/Fitness', icon: Dumbbell, description: 'Fitness center, classes, memberships', premium: true, color: 'green' },
    { id: 'realtor', name: 'Real Estate', icon: Home, description: 'Property listings, virtual tours, agents', premium: true, color: 'indigo' },
    { id: 'electrician', name: 'Electrician', icon: Zap, description: 'Electrical services, repairs, installations', premium: true, color: 'yellow' },
    { id: 'accountant', name: 'Accountant', icon: Calculator, description: 'Tax services, bookkeeping, financial planning', premium: true, color: 'emerald' },
    { id: 'photographer', name: 'Photographer', icon: Camera, description: 'Photography services, portfolio, bookings', premium: true, color: 'purple' },
    { id: 'dentist', name: 'Dentist', icon: Smile, description: 'Dental practice, appointments, patient care', premium: true, color: 'teal' },
    { id: 'contractor', name: 'Contractor', icon: HardHat, description: 'Construction, remodeling, project management', premium: true, color: 'orange' },
    { id: 'consultant', name: 'Consultant', icon: Target, description: 'Professional consulting, expertise showcase', premium: true, color: 'violet' },
    { id: 'florist', name: 'Florist', icon: Flower, description: 'Floral arrangements, events, seasonal offerings', premium: true, color: 'rose' },
    { id: 'pet_services', name: 'Pet Services', icon: PawPrint, description: 'Grooming, boarding, veterinary care', premium: true, color: 'lime' }
  ];

  const canAccessPremium = userTier === 'business' || userTier === 'enterprise';
  const availableIndustries = userTier === 'professional' 
    ? industries.slice(0, 3) // Only first 3 for $99 tier
    : industries;

  const handleSelect = (industry: Industry) => {
    if (industry.premium && !canAccessPremium) {
      setShowUpgradePrompt(true);
      return;
    }
    setSelectedIndustry(industry);
  };

  const confirmSelection = () => {
    if (selectedIndustry) {
      onSelect(selectedIndustry);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Industry</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Your website will instantly transform to match your profession
          </p>
          {userTier === 'professional' && (
            <div className="mt-4 inline-block bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Professional Plan: Access to 3 industries. <a href="/upgrade" className="underline font-semibold">Upgrade to Business</a> for all 17 premium themes!
              </p>
            </div>
          )}
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {availableIndustries.map((industry) => {
            const Icon = industry.icon;
            const isSelected = selectedIndustry?.id === industry.id;
            const isLocked = industry.premium && !canAccessPremium;
            
            return (
              <button
                key={industry.id}
                onClick={() => handleSelect(industry)}
                disabled={isLocked}
                className={`
                  relative p-6 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? `border-${industry.color}-500 bg-${industry.color}-50 dark:bg-${industry.color}-900/20 ring-4 ring-${industry.color}-200` 
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }
                  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center">
                  <Icon className={`w-12 h-12 mb-3 ${isSelected ? `text-${industry.color}-600` : 'text-slate-600 dark:text-slate-400'}`} />
                  <h3 className="font-semibold mb-1">{industry.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{industry.description}</p>
                  
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {industry.premium && canAccessPremium && (
                    <div className="mt-2">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                        Premium
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Locked Industries Preview (for Professional tier) */}
        {userTier === 'professional' && (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-600">
            <div className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold mb-2">14 More Industries Available</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Unlock all 17 premium industry themes with the Business plan
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {industries.slice(3).map(ind => (
                  <span key={ind.id} className="text-sm bg-white dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">
                    {ind.name}
                  </span>
                ))}
              </div>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Upgrade to Business Plan ($299/mo)
              </button>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        {selectedIndustry && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 shadow-lg">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Selected Industry</p>
                <p className="text-xl font-semibold">{selectedIndustry.name}</p>
              </div>
              <button
                onClick={confirmSelection}
                className={`bg-${selectedIndustry.color}-600 hover:bg-${selectedIndustry.color}-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors shadow-lg`}
              >
                Transform My Website
              </button>
            </div>
          </div>
        )}

        {/* Upgrade Prompt Modal */}
        {showUpgradePrompt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md">
              <Lock className="w-16 h-16 mx-auto mb-4 text-purple-500" />
              <h2 className="text-2xl font-bold text-center mb-4">Premium Industry Theme</h2>
              <p className="text-slate-600 dark:text-slate-400 text-center mb-6">
                This industry's premium theme is only available on the Business plan. Upgrade now to unlock all 17 industry-specific themes!
              </p>
              <div className="space-y-3">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition-colors">
                  Upgrade to Business ($299/mo)
                </button>
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 py-3 rounded-lg font-semibold transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {/* The Magic Explanation */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-4 text-center">What Happens Next?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-3">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Instant Transformation</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Your website immediately adopts your industry's premium theme with optimized layouts, colors, and sections.
              </p>
            </div>
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-3">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Knowledge Base Loaded</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Industry-specific content, FAQs, and best practices are pre-loaded and ready to customize.
              </p>
            </div>
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-3">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">You're Live!</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Your professional industry-specific website is ready. Just add your details and you're in business.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}