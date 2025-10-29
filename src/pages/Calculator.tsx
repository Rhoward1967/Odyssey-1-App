import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createCustomer, getCustomers, type Customer } from '@/lib/supabase/customer-actions';
import { supabase } from '@/lib/supabase/supabase';
import { Building, Calculator as CalculatorIcon, DollarSign, Download, Edit3, FileText, History, Trash2, UserPlus } from 'lucide-react';
import React, { useState } from 'react';

export default function Calculator() {
  const [sqft, setSqft] = useState('');
  const [pricePerSqft, setPricePerSqft] = useState('0.15');
  const [visits, setVisits] = useState('4');
  const [employees, setEmployees] = useState('2');
  const [employeePayRate, setEmployeePayRate] = useState('15.00');
  const [supplies, setSupplies] = useState('');
  const [miscCost, setMiscCost] = useState('');
  const [profitMargin, setProfitMargin] = useState('25');
  const [calculations, setCalculations] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedBids, setSavedBids] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [editingBid, setEditingBid] = useState<any>(null);
  const [clients, setClients] = useState<Customer[]>([]);
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    customer_name: '',
    customer_type: 'commercial' as const,
    primary_contact: { name: '', email: '', phone: '', title: '' },
    address: { street: '', city: '', state: 'GA', zip: '', country: 'USA' },
    facility_info: { square_footage: 0, building_type: '' },
    organization_id: 1
  });

  // Load saved bids and clients when component mounts
  React.useEffect(() => {
    loadSavedBids();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const result = await getCustomers();
      if (result.success) {
        setClients(result.customers);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      // Auto-populate square footage if available
      if (client.facility_info?.square_footage) {
        setSqft(client.facility_info.square_footage.toString());
      }
    }
  };

  const handleAddClient = async () => {
    try {
      const result = await createCustomer({
        ...clientForm,
        status: 'active',
        service_details: {
          services: [],
          frequency: 'monthly',
          contract_start: new Date().toISOString().split('T')[0],
          contract_value: 0,
          payment_terms: 'Net 30'
        }
      });

      if (result.success) {
        await loadClients();
        setSelectedClient(result.customer);
        setShowAddClient(false);
        // Auto-populate square footage
        if (result.customer.facility_info?.square_footage) {
          setSqft(result.customer.facility_info.square_footage.toString());
        }
        alert('Client added successfully!');
      } else {
        alert(result.error || 'Failed to add client');
      }
    } catch (error) {
      alert('Failed to add client');
    }
  };

  const calculateBid = () => {
    const squareFootage = parseFloat(sqft) || 0;
    const pricePerSq = parseFloat(pricePerSqft) || 0;
    const numberOfVisits = parseFloat(visits) || 0;
    const numberOfEmployees = parseFloat(employees) || 0;
    const payRate = parseFloat(employeePayRate) || 0;
    const supplyCost = parseFloat(supplies) || 0;
    const miscellaneousCost = parseFloat(miscCost) || 0;
    const profitPercent = parseFloat(profitMargin) || 0;

    // Janitorial calculations
    const baseCost = squareFootage * pricePerSq;
    const monthlyBaseCost = baseCost * numberOfVisits;
    
    // Estimate hours based on square footage (industry standard: ~1000 sqft per hour per person)
    const hoursPerVisit = Math.ceil(squareFootage / 1000) || 1;
    const totalHoursPerMonth = hoursPerVisit * numberOfVisits * numberOfEmployees;
    const laborCost = totalHoursPerMonth * payRate;
    
    const totalMonthlyCost = monthlyBaseCost + laborCost + supplyCost + miscellaneousCost;
    const profitAmount = totalMonthlyCost * (profitPercent / 100);
    const totalBid = totalMonthlyCost + profitAmount;

    const result = {
      squareFootage,
      pricePerSq,
      numberOfVisits,
      numberOfEmployees,
      payRate,
      supplyCost,
      miscellaneousCost,
      baseCost,
      monthlyBaseCost,
      hoursPerVisit,
      totalHoursPerMonth,
      laborCost,
      totalMonthlyCost,
      profitAmount,
      totalBid,
      profitPercent,
      createdAt: new Date().toISOString()
    };

    setCalculations(result);
  };

  const saveBid = async () => {
    if (!calculations) return;

    setSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert('Please log in to save bids.');
        setSaving(false);
        return;
      }

      const bidData = {
        project_name: selectedClient 
          ? `${selectedClient.customer_name} - Janitorial Services`
          : 'Janitorial Services Bid',
        client_id: selectedClient?.id || null,
        client_name: selectedClient?.customer_name || null,
        client_contact: selectedClient?.primary_contact?.name || null,
        client_email: selectedClient?.primary_contact?.email || null,
        client_phone: selectedClient?.primary_contact?.phone || null,
        facility_address: selectedClient 
          ? `${selectedClient.address.street}, ${selectedClient.address.city}, ${selectedClient.address.state} ${selectedClient.address.zip}`
          : null,
        square_footage: calculations.squareFootage,
        price_per_sqft: calculations.pricePerSq,
        visits_per_month: calculations.numberOfVisits,
        employees_needed: calculations.numberOfEmployees,
        employee_pay_rate: calculations.payRate,
        supply_costs: calculations.supplyCost,
        misc_costs: calculations.miscellaneousCost,
        total_monthly_cost: calculations.totalMonthlyCost,
        profit_margin: calculations.profitPercent,
        total_bid_amount: calculations.totalBid,
        user_id: user.id,
        created_at: calculations.createdAt
      };

      const { data, error } = await supabase
        .from('bids')
        .insert([bidData])
        .select('id');

      if (error) {
        console.error('Detailed save error:', error);
        alert(`Failed to save bid: ${error.message}`);
      } else {
        alert('✅ Janitorial services bid saved successfully!');
      }
    } catch (error) {
      console.error('Save bid error:', error);
      alert('Failed to save bid. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadSavedBids = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedBids(data || []);
    } catch (error) {
      console.error('Failed to load saved bids:', error);
    }
  };

  const deleteBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to delete this bid? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bids')
        .delete()
        .eq('id', bidId);

      if (error) throw error;

      alert('Bid deleted successfully!');
      await loadSavedBids();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete bid');
    }
  };

  const editBid = (bid: any) => {
    // Load bid data into form
    setSqft(bid.square_footage?.toString() || '');
    setPricePerSqft(bid.price_per_sqft?.toString() || '0.15');
    setVisits(bid.visits_per_month?.toString() || '4');
    setEmployees(bid.employees_needed?.toString() || '2');
    setEmployeePayRate(bid.employee_pay_rate?.toString() || '15.00');
    setSupplies(bid.supply_costs?.toString() || '');
    setMiscCost(bid.misc_costs?.toString() || '');
    setProfitMargin('25'); // Default if not stored

    setEditingBid(bid);
    setShowHistory(false);
    
    // Recalculate with loaded data
    setTimeout(() => calculateBid(), 100);
  };

  const updateBid = async () => {
    if (!editingBid || !calculations) return;

    setSaving(true);
    try {
      const bidData = {
        project_name: 'Janitorial Services Bid (Updated)',
        square_footage: calculations.squareFootage,
        price_per_sqft: calculations.pricePerSq,
        visits_per_month: calculations.numberOfVisits,
        employees_needed: calculations.numberOfEmployees,
        employee_pay_rate: calculations.payRate,
        supply_costs: calculations.supplyCost,
        misc_costs: calculations.miscellaneousCost,
        total_monthly_cost: calculations.totalMonthlyCost,
        profit_margin: calculations.profitPercent,
        total_bid_amount: calculations.totalBid,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('bids')
        .update(bidData)
        .eq('id', editingBid.id);

      if (error) throw error;

      alert('✅ Bid updated successfully!');
      setEditingBid(null);
      await loadSavedBids();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update bid');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Janitorial Services Calculator</h1>
            <p className="text-gray-600">Professional cleaning services bid calculator for HJS Services</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          SAM.gov Registered: UEI YXEYCV2T1DM5
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form with Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Selection Section */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Client Information
              </h3>
              
              <div className="flex gap-2 mb-3">
                <Select onValueChange={handleClientSelect}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select existing client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id!}>
                        {client.customer_name} - {client.address.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Client</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client_name">Company Name *</Label>
                        <Input
                          id="client_name"
                          value={clientForm.customer_name}
                          onChange={(e) => setClientForm(prev => ({...prev, customer_name: e.target.value}))}
                          placeholder="e.g. Athens Medical Center"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contact_name">Contact Name</Label>
                          <Input
                            id="contact_name"
                            value={clientForm.primary_contact.name}
                            onChange={(e) => setClientForm(prev => ({
                              ...prev, 
                              primary_contact: {...prev.primary_contact, name: e.target.value}
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact_email">Email</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={clientForm.primary_contact.email}
                            onChange={(e) => setClientForm(prev => ({
                              ...prev, 
                              primary_contact: {...prev.primary_contact, email: e.target.value}
                            }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="facility_sqft">Facility Square Footage</Label>
                        <Input
                          id="facility_sqft"
                          type="number"
                          value={clientForm.facility_info.square_footage}
                          onChange={(e) => setClientForm(prev => ({
                            ...prev, 
                            facility_info: {...prev.facility_info, square_footage: parseInt(e.target.value)}
                          }))}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddClient} className="flex-1">
                          Add Client
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddClient(false)} className="flex-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {selectedClient && (
                <div className="bg-white p-3 rounded border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="font-semibold">{selectedClient.customer_name}</p>
                      <p className="text-gray-600">{selectedClient.customer_type}</p>
                    </div>
                    <div>
                      <p>{selectedClient.primary_contact.name}</p>
                      <p className="text-gray-600">{selectedClient.primary_contact.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {selectedClient.address.street}, {selectedClient.address.city}, {selectedClient.address.state}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sqft">Square Footage *</Label>
                <Input
                  id="sqft"
                  type="number"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  placeholder="e.g. 5000"
                />
              </div>
              <div>
                <Label htmlFor="pricePerSqft">Price per Sq Ft ($)</Label>
                <Input
                  id="pricePerSqft"
                  type="number"
                  step="0.01"
                  value={pricePerSqft}
                  onChange={(e) => setPricePerSqft(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visits"># of Visits (per month)</Label>
                <Input
                  id="visits"
                  type="number"
                  value={visits}
                  onChange={(e) => setVisits(e.target.value)}
                  placeholder="e.g. 4 for weekly"
                />
              </div>
              <div>
                <Label htmlFor="employees"># of Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  value={employees}
                  onChange={(e) => setEmployees(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employeePayRate">Employee Pay Rate ($/hr)</Label>
                <Input
                  id="employeePayRate"
                  type="number"
                  step="0.01"
                  value={employeePayRate}
                  onChange={(e) => setEmployeePayRate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supplies">Supply Costs ($/month)</Label>
                <Input
                  id="supplies"
                  type="number"
                  step="0.01"
                  value={supplies}
                  onChange={(e) => setSupplies(e.target.value)}
                  placeholder="Cleaning supplies"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="miscCost">Miscellaneous Costs ($)</Label>
                <Input
                  id="miscCost"
                  type="number"
                  step="0.01"
                  value={miscCost}
                  onChange={(e) => setMiscCost(e.target.value)}
                  placeholder="Equipment, travel, etc."
                />
              </div>
              <div>
                <Label htmlFor="profitMargin">Profit Margin (%)</Label>
                <Input
                  id="profitMargin"
                  type="number"
                  step="0.1"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={calculateBid} className="w-full" size="lg">
              <CalculatorIcon className="h-4 w-4 mr-2" />
              Calculate Janitorial Bid
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Results with Client Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {selectedClient ? `${selectedClient.customer_name} - Bid Estimate` : 'Bid Calculation Results'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClient && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900">Client Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                  <div>
                    <p><strong>Contact:</strong> {selectedClient.primary_contact.name}</p>
                    <p><strong>Email:</strong> {selectedClient.primary_contact.email}</p>
                  </div>
                  <div>
                    <p><strong>Phone:</strong> {selectedClient.primary_contact.phone}</p>
                    <p><strong>Type:</strong> {selectedClient.customer_type}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  <strong>Address:</strong> {selectedClient.address.street}, {selectedClient.address.city}, {selectedClient.address.state} {selectedClient.address.zip}
                </p>
              </div>
            )}

            {calculations ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Square Footage:</span>
                    <span className="font-semibold">{calculations.squareFootage.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Cost (${calculations.pricePerSq}/sq ft):</span>
                    <span className="font-semibold">${calculations.baseCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Base ({calculations.numberOfVisits} visits):</span>
                    <span className="font-semibold">${calculations.monthlyBaseCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Estimated Hours per Visit:</span>
                    <span className="font-semibold">{calculations.hoursPerVisit}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Monthly Hours:</span>
                    <span className="font-semibold">{calculations.totalHoursPerMonth}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Labor Cost (${calculations.payRate}/hr):</span>
                    <span className="font-semibold">${calculations.laborCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supply Costs:</span>
                    <span className="font-semibold">${calculations.supplyCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Miscellaneous Costs:</span>
                    <span className="font-semibold">${calculations.miscellaneousCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${calculations.totalMonthlyCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit ({calculations.profitPercent}%):</span>
                    <span className="font-semibold">${calculations.profitAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg">
                    <span className="font-bold">Monthly Bid Amount:</span>
                    <span className="font-bold text-green-600">
                      ${calculations.totalBid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Annual Contract Value:</span>
                    <span className="font-bold text-blue-600">
                      ${(calculations.totalBid * 12).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {editingBid ? (
                    <>
                      <Button 
                        onClick={updateBid} 
                        disabled={saving}
                        className="flex-1"
                      >
                        {saving ? 'Updating...' : 'Update Bid'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setEditingBid(null)}
                        className="flex-1"
                      >
                        Cancel Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={saveBid} 
                        disabled={saving}
                        className="flex-1"
                      >
                        {saving ? 'Saving...' : selectedClient ? `Save Bid for ${selectedClient.customer_name}` : 'Save Bid'}
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Export PDF
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>
                  {selectedClient 
                    ? `Enter facility details for ${selectedClient.customer_name} and calculate bid`
                    : 'Select a client and enter facility details to calculate bid'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bid History Panel */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Saved Bids History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedBids.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No saved bids yet</p>
                <p className="text-sm">Calculate and save your first bid to see it here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedBids.map((bid) => (
                  <div key={bid.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{bid.project_name}</h3>
                        {bid.client_name && (
                          <p className="text-sm text-blue-600">Client: {bid.client_name}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          {new Date(bid.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          ${bid.total_bid_amount?.toFixed(2)}/month
                        </Badge>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => editBid(bid)}
                            title="Edit this bid"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteBid(bid.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete this bid"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {bid.facility_address && (
                      <p className="text-xs text-gray-500 mb-2">
                        <strong>Facility:</strong> {bid.facility_address}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Square Footage</p>
                        <p className="font-semibold">{bid.square_footage?.toLocaleString()} sq ft</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Visits/Month</p>
                        <p className="font-semibold">{bid.visits_per_month}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Employees</p>
                        <p className="font-semibold">{bid.employees_needed}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Annual Value</p>
                        <p className="font-semibold text-green-600">
                          ${((bid.total_bid_amount || 0) * 12).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>HJS Services LLC - Professional Janitorial Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold">Business Credentials</p>
              <p>36+ Years Experience</p>
              <p>BBB Accredited Business</p>
              <p>Amazon Certified Provider</p>
            </div>
            <div>
              <p className="font-semibold">Government Registration</p>
              <p>SAM.gov UEI: YXEYCV2T1DM5</p>
              <p>CAGE Code: 97K10</p>
              <p>Active Federal Contractor</p>
            </div>
            <div>
              <p className="font-semibold">Service Areas</p>
              <p>Athens, GA Metro</p>
              <p>Commercial & Government</p>
              <p>Medical Facilities</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
