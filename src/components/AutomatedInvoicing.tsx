import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

type CompanyProfile = {
  company_name: string;
  address: string;
  phone?: string;
  email?: string;
};

type Customer = {
  id: string;
  customer_name: string;
  email?: string;
  address?: string;
};

type LineItem = {
  description: string;
  amount: number;
};

export default function AutomatedInvoicing() {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: '', amount: 0 }]);
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch company profile and customers
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('company_profiles')
        .select('*')
        .single();
      if (profileError) throw profileError;
      setCompanyProfile(profileData);

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*');
      if (customerError) throw customerError;
      setCustomers(customerData || []);
    } catch (err: any) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addLineItem = () => setLineItems([...lineItems, { description: '', amount: 0 }]);
  const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));
  const handleLineItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const items = [...lineItems];
    const item = items[index];
    if (typeof item[field] === 'number') {
      items[index] = { ...item, [field]: parseFloat(value as string) || 0 };
    } else {
      items[index] = { ...item, [field]: value as string };
    }
    setLineItems(items);
  };
  const calculateTotal = () => lineItems.reduce((total, item) => total + item.amount, 0);

  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }
    if (calculateTotal() <= 0) {
      setError('Invoice total must be greater than $0.');
      return;
    }
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    const invoiceData = {
      customer_id: selectedCustomer,
      invoice_number: `INV-${Date.now()}`,
      due_date: dueDate,
      total_amount: calculateTotal(),
      line_items: lineItems,
      status: 'draft',
    };
    const { error: insertError } = await supabase.from('invoices').insert([invoiceData]);
    setIsSaving(false);
    if (insertError) {
      setError(`Failed to save invoice: ${insertError.message}`);
    } else {
      setSuccessMessage(`Invoice ${invoiceData.invoice_number} saved successfully!`);
      setLineItems([{ description: '', amount: 0 }]);
      setSelectedCustomer('');
      setDueDate('');
    }
  };

  if (loading) {
    return <div>Loading Invoicing Module...</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{successMessage}</div>}

        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{companyProfile?.company_name || 'Your Company'}</h1>
            <p className="text-gray-500">{companyProfile?.address || 'Your Address'}</p>
          </div>
          <h2 className="text-4xl font-light text-gray-400">INVOICE</h2>
        </div>

        {/* Customer & Dates */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-500 mb-2">BILL TO</h3>
            <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="p-2 w-full border rounded-md">
              <option value="">Select a Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-gray-500">Invoice #</span>
              <span>INV-{Date.now()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-500">Due Date</span>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="p-1 border rounded-md text-right"/>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left font-bold text-gray-500 p-2">DESCRIPTION</th>
              <th className="text-right font-bold text-gray-500 p-2">AMOUNT</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, index) => (
              <tr key={index}>
                <td><input type="text" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} className="p-2 w-full" placeholder="Service or Product"/></td>
                <td><input type="number" value={item.amount} onChange={(e) => handleLineItemChange(index, 'amount', e.target.value)} className="p-2 w-full text-right" placeholder="0.00"/></td>
                <td><button onClick={() => removeLineItem(index)} className="text-red-500 p-2">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addLineItem} className="text-sm text-blue-600 hover:underline mb-8">+ Add Line Item</button>

        {/* Total */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between items-center p-2">
              <span className="font-bold text-gray-500">Subtotal</span>
              <span className="text-gray-800">${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-100 rounded-lg">
              <span className="font-bold text-xl text-gray-800">Total</span>
              <span className="font-bold text-xl text-gray-800">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Save Button */}
        <button onClick={handleSaveInvoice} disabled={isSaving} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-bold">
          {isSaving ? 'Saving...' : 'Save Invoice'}
        </button>
      </div>
    </div>
  );
}
