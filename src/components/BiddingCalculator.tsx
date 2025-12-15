
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Brain, Calculator, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import CustomerProfileModal from './CustomerProfileModal';


// --- Unified Customer Interface (matches client manager) ---
interface Customer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  billing_city?: string | null;
  billing_state?: string | null;
  billing_zip?: string | null;
}

interface AIPrediction {
  optimal_margin: number;
  confidence_score: number;
  historical_win_rate: number;
  recommendation: string;
  data_points: number;
}

export default function BiddingCalculator() {
  // Core bidding state
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [profitMargin, setProfitMargin] = useState<number>(20);
  const [projectType, setProjectType] = useState<string>('');
  const [complexity, setComplexity] = useState<string>('medium');
  // HJS Subcontract/High-Mileage override state
  const [isHighMileageSubcontract, setIsHighMileageSubcontract] = useState<boolean>(false);
  const [logisticsCostMonthly, setLogisticsCostMonthly] = useState<number>(2537.43);
  const [requiredOwnerProfit, setRequiredOwnerProfit] = useState<number>(9102.00);
  const [materialCost, setMaterialCost] = useState<number>(0);
  const [laborHours, setLaborHours] = useState<number>(0);
  // AI prediction state
  const [aiPrediction, setAiPrediction] = useState<AIPrediction | null>(null);
  const [aiLoading, setAiLoading] = useState(false);


  // --- Unified Customer State ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Fetch customers from the unified table
  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase.from('customers')
      .select('id, first_name, last_name, company_name, email, phone, address, billing_city, billing_state, billing_zip')
      .eq('user_id', user.id)
      .order('company_name', { ascending: true });
    if (error) {
      console.warn('Failed to fetch customers:', error.message);
      setCustomers([]);
      return;
    }
    setCustomers(data || []);
  };

  const handleSaveCustomer = async (formData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in first');
      return;
    }

    const newClient = {
      first_name: formData.first_name || '',
      last_name: formData.last_name || '',
      company_name: formData.organization || formData.company_name || '',
      email: formData.emails?.[0] || formData.email || '',
      phone: formData.phones?.[0] || formData.phone || '',
      address: formData.addresses?.[0]?.street || formData.address || '',
      billing_city: formData.addresses?.[0]?.city || formData.billing_city || '',
      billing_state: formData.addresses?.[0]?.state || formData.billing_state || '',
      billing_zip: formData.addresses?.[0]?.postal_code || formData.billing_zip || '',
      customer_name: formData.organization || `${formData.first_name || ''} ${formData.last_name || ''}`.trim(),
      status: 'active',
      source: 'bidding_calculator',
      user_id: user.id
    };

    const { error } = await supabase
      .from('customers')
      .insert([newClient]);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('Client saved successfully!');
      setIsModalOpen(false);
      fetchCustomers();
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);


  // --- 2. Customer Selection Logic ---
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    const displayName = customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'New Project';
    setProjectType(displayName);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const filteredCustomers = customers.filter(customer =>
    customer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Trigger AI analysis when key parameters change
  useEffect(() => {
    const fetchAIPrediction = async () => {
      if (!estimatedHours || !projectType) return;
      
      setAiLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_optimal_bid_margin', {
          project_type: projectType || null,
          estimated_hours: estimatedHours || null,
          complexity_level: complexity.toLowerCase(),
          client_budget_range: null
        });

        if (error) throw error;
        
        if (data && data.length > 0) {
          setAiPrediction(data[0]);
        }
      } catch (error) {
        console.error('AI Prediction Error:', error);
      } finally {
        setAiLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (estimatedHours && projectType) {
        fetchAIPrediction();
      }
    }, 500); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [estimatedHours, projectType, complexity]);

  // --- START: HJS Subcontract / High-Mileage Calculation Override ---
  let bidResult: any = null;
  if (isHighMileageSubcontract) {
    // 1. Calculate Base Operating Cost (Labor + Materials + Logistics)
    const baseLaborCost = laborHours * hourlyRate;
    const totalOperatingCost = materialCost + baseLaborCost + logisticsCostMonthly;
    // 2. Enforce Target Profit Mandate
    const requiredTotalRevenue = totalOperatingCost + requiredOwnerProfit;
    // 3. Apply Inflation Buffer (2% used for HJS bid)
    const finalBidPreTerms = requiredTotalRevenue * 1.02;
    // 4. Structure Final Output (Including Protective Terms)
    bidResult = {
      totalBid: finalBidPreTerms.toFixed(2),
      mandatoryTerms: {
        payment: 'NET 10 DAYS',
        lateFee: '5.0% Per Month',
        escalation: '3.0% Annual',
        supplyClause: 'Back-Charge/Suspend Required'
      },
      breakdown: {
        logisticsCost: logisticsCostMonthly.toFixed(2),
        requiredProfit: requiredOwnerProfit.toFixed(2),
      }
    };
  }
  // --- END: HJS Subcontract / High-Mileage Calculation Override ---
  // Default Cost-Plus logic if not HJS
  const baseCost = estimatedHours * hourlyRate;
  const profitAmount = baseCost * (profitMargin / 100);
  const totalBid = baseCost + profitAmount;

  // --- Save Bid to Database with line_items ---
  const [isSavingBid, setIsSavingBid] = useState(false);

  const handleSaveBid = async () => {
    if (!selectedCustomer) {
      alert('Please select a customer first');
      return;
    }

    if (!projectType || projectType.trim() === '') {
      alert('Please enter a project name');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsSavingBid(true);

    try {
      // Build line_items array in backend-compatible format
      const line_items = [];
      
      // Add labor as a line item
      if (estimatedHours > 0) {
        line_items.push({
          type: 'service',
          ref_id: null, // Manual entry, not from catalog
          name: `Labor: ${projectType}`,
          qty: isHighMileageSubcontract ? laborHours : estimatedHours,
          unit: 'hour',
          unit_price_cents: Math.round(hourlyRate * 100), // Convert to cents
          total_cents: Math.round((isHighMileageSubcontract ? laborHours : estimatedHours) * hourlyRate * 100)
        });
      }

      // Add materials if HJS mode
      if (isHighMileageSubcontract && materialCost > 0) {
        line_items.push({
          type: 'product',
          ref_id: null,
          name: 'Materials',
          qty: 1,
          unit: 'unit',
          unit_price_cents: Math.round(materialCost * 100),
          total_cents: Math.round(materialCost * 100)
        });
      }

      // Add logistics if HJS mode
      if (isHighMileageSubcontract && logisticsCostMonthly > 0) {
        line_items.push({
          type: 'service',
          ref_id: null,
          name: 'Logistics & Travel',
          qty: 1,
          unit: 'monthly',
          unit_price_cents: Math.round(logisticsCostMonthly * 100),
          total_cents: Math.round(logisticsCostMonthly * 100)
        });
      }

      // Calculate total in cents
      const total_cents = line_items.reduce((sum, item) => sum + item.total_cents, 0);

      const bidData = {
        customer_id: selectedCustomer.id,
        title: projectType,
        line_items, // NEW: Structured line items (JSONB)
        total_cents, // Total in cents (BIGINT)
        status: 'draft',
        // Store additional context in a notes-like field if needed
        description: isHighMileageSubcontract 
          ? `HJS Subcontract - Logistics: $${logisticsCostMonthly}, Required Profit: $${requiredOwnerProfit}. Terms: ${bidResult.mandatoryTerms.payment}`
          : aiPrediction 
            ? `AI Recommendation: ${aiPrediction.optimal_margin}% margin with ${(aiPrediction.confidence_score * 100).toFixed(0)}% confidence`
            : `Profit Margin: ${profitMargin}%`,
      };

      const { data, error } = await supabase
        .from('bids')
        .insert([bidData])
        .select()
        .single();

      if (error) throw error;

      alert(`✅ Bid saved successfully!\nBid ID: ${data.id}\nTotal: $${(total_cents / 100).toFixed(2)}\nLine Items: ${line_items.length}`);
    } catch (error: any) {
      console.error('Save bid error:', error);
      alert(`Failed to save bid: ${error.message}`);
    } finally {
      setIsSavingBid(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {/* --- Unified Customer Selector --- */}
      <div className="relative mb-4 p-4 border rounded-lg bg-gray-50">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-gray-800">
          <Users className="h-5 w-5 text-blue-600" />
          Client Selection (Unified System)
        </h3>
        {selectedCustomer && (
          <div className="mb-3 p-3 bg-white border rounded text-sm">
            <strong>Current Client:</strong> {selectedCustomer.company_name || `${selectedCustomer.first_name || ''} ${selectedCustomer.last_name || ''}`.trim()}
            <span className="text-gray-500 ml-3">
              ({selectedCustomer.email || 'Email Missing'})
            </span>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 font-semibold"
          >
            {selectedCustomer ? 'Change Customer' : `Select Existing Customer (${customers.length})`}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 font-semibold"
          >
            + Add New Client
          </button>
        </div>
        {isDropdownOpen && (
          <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            <input
              type="text"
              placeholder="Search by name or organization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border-b border-gray-200 sticky top-0"
            />
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => {
                const displayName = customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
                return (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className="p-2 cursor-pointer hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <strong>{displayName || 'Unnamed Client'}</strong>
                    <span className="text-gray-500 text-sm block">
                      {customer.email || customer.phone || 'Contact Info Missing'}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="p-2 text-gray-500">No matching clients found.</div>
            )}
          </div>
        )}
      </div>
      {/* Modal Integration */}
      <CustomerProfileModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
      />

      {/* HJS Subcontract/High-Mileage Toggle and Inputs */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
        <label className="flex items-center gap-2 font-semibold">
          <input
            type="checkbox"
            checked={isHighMileageSubcontract}
            onChange={e => setIsHighMileageSubcontract(e.target.checked)}
          />
          Enable HJS Subcontract / High-Mileage Override
        </label>
        {isHighMileageSubcontract && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="material-cost">Material Cost ($)</Label>
              <Input
                id="material-cost"
                type="number"
                value={materialCost}
                onChange={e => setMaterialCost(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="labor-hours">Labor Hours</Label>
              <Input
                id="labor-hours"
                type="number"
                value={laborHours}
                onChange={e => setLaborHours(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="logistics-cost">Logistics Cost (Monthly, $)</Label>
              <Input
                id="logistics-cost"
                type="number"
                value={logisticsCostMonthly}
                onChange={e => setLogisticsCostMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="required-profit">Required Owner Profit ($)</Label>
              <Input
                id="required-profit"
                type="number"
                value={requiredOwnerProfit}
                onChange={e => setRequiredOwnerProfit(Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Bidding Calculator
          {aiPrediction && (
            <div className="flex items-center gap-1 ml-auto">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-purple-600">AI-Enhanced</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Prediction Panel */}
        {aiPrediction && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-purple-800">Genesis AI Recommendation</h3>
              <div className="ml-auto flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">
                  {(aiPrediction.confidence_score * 100).toFixed(0)}% Confidence
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-purple-600">Optimal Margin</div>
                <div className="text-xl font-bold text-purple-800">
                  {aiPrediction.optimal_margin.toFixed(1)}%
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-blue-600">Historical Win Rate</div>
                <div className="text-xl font-bold text-blue-800">
                  {(aiPrediction.historical_win_rate * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-green-600">Data Points</div>
                <div className="text-xl font-bold text-green-800">
                  {aiPrediction.data_points}
                </div>
              </div>
            </div>
            <div className="bg-white p-3 rounded border mb-3">
              <div className="text-sm text-gray-600 mb-1">AI Analysis:</div>
              <div className="text-sm text-gray-800">{aiPrediction.recommendation}</div>
            </div>
            <Button 
              onClick={() => setProfitMargin(aiPrediction.optimal_margin)} 
              size="sm" 
              variant="outline"
            >
              <Zap className="h-4 w-4 mr-1" />
              Apply AI Recommendation
            </Button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section (hidden if HJS override is active) */}
          {!isHighMileageSubcontract && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-type">Project Type</Label>
                <Input
                  id="project-type"
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  placeholder="e.g., Web Development, Mobile App"
                />
              </div>
              <div>
                <Label htmlFor="estimated-hours">Estimated Hours</Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly-rate"
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="profit-margin" className="flex items-center gap-2">
                  Profit Margin (%)
                  {aiPrediction && (
                    <span className="text-xs text-purple-600">
                      (AI suggests: {aiPrediction.optimal_margin.toFixed(1)}%)
                    </span>
                  )}
                </Label>
                <Input
                  id="profit-margin"
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(Number(e.target.value))}
                  className={aiPrediction && Math.abs(profitMargin - aiPrediction.optimal_margin) > 5 
                    ? 'border-orange-300 bg-orange-50' 
                    : ''
                  }
                />
                {aiPrediction && Math.abs(profitMargin - aiPrediction.optimal_margin) > 5 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Margin differs significantly from AI recommendation
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Results Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Bid Breakdown</h3>
              {isHighMileageSubcontract && bidResult ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Bid (HJS):</span>
                      <span>${bidResult.totalBid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Logistics Cost:</span>
                      <span>${bidResult.breakdown.logisticsCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Required Profit:</span>
                      <span>${bidResult.breakdown.requiredProfit}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold">Mandatory Contract Terms</h4>
                    <ul className="list-disc ml-6 text-sm">
                      <li>Payment: {bidResult.mandatoryTerms.payment}</li>
                      <li>Late Fee: {bidResult.mandatoryTerms.lateFee}</li>
                      <li>Escalation: {bidResult.mandatoryTerms.escalation}</li>
                      <li>Supply Clause: {bidResult.mandatoryTerms.supplyClause}</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Cost:</span>
                      <span>${baseCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit ({profitMargin}%):</span>
                      <span>${profitAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t pt-2">
                      <span>Total Bid:</span>
                      <span>${totalBid.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Save Bid Button */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            onClick={handleSaveBid} 
            disabled={isSavingBid || !selectedCustomer}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {isSavingBid ? 'Saving...' : '💾 Save Bid'}
          </Button>
        </div>

        {/* AI Status Footer */}
        {aiLoading && (
          <div className="flex items-center justify-center gap-2 text-purple-600">
            <Brain className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Genesis AI analyzing historical patterns...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
