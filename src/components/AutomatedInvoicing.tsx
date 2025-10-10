import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

// This should be initialized from your central Supabase client instance
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// --- Type Definitions ---
type CompanyProfile = { company_name: string; address: string };
type Customer = {
  id: string;
  customer_name: string;
  email?: string;
  address?: string;
};
type Invoice = {
  id: string;
  invoice_number: string;
  customer_id: string;
  total_amount: number;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'void';
  customers: { customer_name: string } | null; // For displaying customer name in list
};

// --- Main Dashboard Component ---
export default function InvoiceDashboard() {
  const [view, setView] = useState<'list' | 'invoice_form' | 'customer_form'>(
    'list'
  );
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // FIX: Added missing state for company profile
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated. Please log in.');

      // OPTIMIZATION: Narrow select statement
      const { data: profileData, error: profileError } = await supabase
        .from('company_profiles')
        .select('company_name, address')
        .eq('user_id', user.id)
        .single();
      if (profileError) throw profileError;
      setCompanyProfile(profileData);

      // OPTIMIZATION: Narrow select and add ordering/limit
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(
          'id, invoice_number, customer_id, total_amount, due_date, status, customers:customers(customer_name)'
        )
        .order('created_at', { ascending: false })
        .limit(100);
      if (invoiceError) throw invoiceError;
      // Supabase returns customers as array, but we want a single object or null
      const normalizedInvoices = (invoiceData || []).map((inv: any) => ({
        ...inv,
        customers: Array.isArray(inv.customers)
          ? inv.customers[0] || null
          : inv.customers || null,
      }));
      setInvoices(normalizedInvoices);

      // OPTIMIZATION: Narrow select and add ordering/limit
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id, customer_name, email')
        .order('customer_name', { ascending: true })
        .limit(200);
      if (customerError) throw customerError;
      setCustomers(customerData || []);
    } catch (err: any) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'list') {
      fetchData();
    }
  }, [view, fetchData]);

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?'))
      return;
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);
    if (deleteError)
      setError(`Failed to delete invoice: ${deleteError.message}`);
    else fetchData();
  };

  const navigateTo = (newView: 'list' | 'invoice_form' | 'customer_form') => {
    setEditingInvoice(null);
    setView(newView);
  };

  return (
    <div className='p-4 md:p-6 bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>
            {error}
          </div>
        )}

        {view === 'list' && (
          <div>
            <div className='flex justify-between items-center mb-4'>
              <h1 className='text-2xl font-bold text-gray-800'>Invoices</h1>
              <div>
                <button
                  onClick={() => navigateTo('customer_form')}
                  className='px-4 py-2 mr-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700'
                >
                  Manage Customers
                </button>
                <button
                  onClick={() => navigateTo('invoice_form')}
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Create New Invoice
                </button>
              </div>
            </div>
            {loading ? (
              <p>Loading invoices...</p>
            ) : (
              <InvoiceList
                invoices={invoices}
                onEdit={i => {
                  setEditingInvoice(i);
                  setView('invoice_form');
                }}
                onDelete={handleDeleteInvoice}
              />
            )}
          </div>
        )}

        {view === 'invoice_form' && (
          <InvoiceForm
            initialInvoice={editingInvoice}
            customers={customers}
            companyProfile={companyProfile}
            onSaveSuccess={() => setView('list')}
            onCancel={() => setView('list')}
          />
        )}

        {view === 'customer_form' && (
          <CustomerManager
            customers={customers}
            onSaveSuccess={fetchData}
            onBack={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}

// --- Sub-components ---

function InvoiceList({
  invoices,
  onEdit,
  onDelete,
}: {
  invoices: Invoice[];
  onEdit: (i: Invoice) => void;
  onDelete: (id: string) => void;
}) {
  if (invoices.length === 0)
    return (
      <p className='text-center p-8 bg-white rounded-lg shadow'>
        No invoices found. Create one to get started.
      </p>
    );
  return (
    <div className='bg-white shadow rounded-lg overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
              Invoice #
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
              Customer
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
              Due Date
            </th>
            <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
              Amount
            </th>
            <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
              Status
            </th>
            <th className='px-6 py-3'></th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {invoices.map(invoice => (
            <tr key={invoice.id}>
              <td className='px-6 py-4 whitespace-nowrap font-medium text-gray-900'>
                {invoice.invoice_number}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-gray-500'>
                {invoice.customers?.customer_name || 'N/A'}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-gray-500'>
                {invoice.due_date}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-right text-gray-900 font-semibold'>
                ${invoice.total_amount.toFixed(2)}
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                >
                  {invoice.status}
                </span>
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                <button
                  onClick={() => onEdit(invoice)}
                  className='text-indigo-600 hover:text-indigo-900 mr-4'
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(invoice.id)}
                  className='text-red-600 hover:text-red-900'
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerManager({
  customers,
  onSaveSuccess,
  onBack,
}: {
  customers: Customer[];
  onSaveSuccess: () => void;
  onBack: () => void;
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerName) {
      setError('Customer name is required.');
      return;
    }
    const { error: insertError } = await supabase
      .from('customers')
      .insert([{ customer_name: customerName, email: customerEmail }]);
    if (insertError) {
      setError(`Failed to add customer: ${insertError.message}`);
    } else {
      setCustomerName('');
      setCustomerEmail('');
      onSaveSuccess();
    }
  };

  return (
    <div className='bg-white p-8 rounded-lg shadow-lg'>
      <button
        onClick={onBack}
        className='mb-4 text-sm text-gray-600 hover:underline'
      >
        ← Back to Invoice List
      </button>
      <h2 className='text-2xl font-bold mb-4'>Manage Customers</h2>
      {error && (
        <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>
          {error}
        </div>
      )}
      <form
        onSubmit={handleAddCustomer}
        className='mb-6 flex items-center gap-4'
      >
        <input
          type='text'
          value={customerName}
          onChange={e => setCustomerName(e.target.value)}
          placeholder='New Customer Name'
          className='p-2 border rounded-md flex-grow'
        />
        <input
          type='email'
          value={customerEmail}
          onChange={e => setCustomerEmail(e.target.value)}
          placeholder='Customer Email (Optional)'
          className='p-2 border rounded-md flex-grow'
        />
        <button
          type='submit'
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
        >
          Add Customer
        </button>
      </form>
      <h3 className='font-bold mb-2'>Existing Customers:</h3>
      <ul className='list-disc list-inside'>
        {customers.map(c => (
          <li key={c.id}>
            {c.customer_name} ({c.email || 'No email'})
          </li>
        ))}
      </ul>
    </div>
  );
}

function InvoiceForm({
  initialInvoice,
  customers,
  companyProfile,
  onSaveSuccess,
  onCancel,
}: {
  initialInvoice: Invoice | null;
  customers: Customer[];
  companyProfile: CompanyProfile | null;
  onSaveSuccess: () => void;
  onCancel: () => void;
}) {
  // A full implementation of the professional form would go here.
  // This is a placeholder to show the structure.
  return (
    <div>
      <button
        onClick={onCancel}
        className='mb-4 text-sm text-gray-600 hover:underline'
      >
        ← Back to Invoice List
      </button>
      <div className='bg-white p-8 rounded-lg shadow-lg'>
        <div className='flex justify-between items-start mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>
              {companyProfile?.company_name || 'Your Company'}
            </h1>
            <p className='text-gray-500'>
              {companyProfile?.address || 'Your Address'}
            </p>
          </div>
          <h2 className='text-4xl font-light text-gray-400'>INVOICE</h2>
        </div>
        <h2 className='text-2xl font-bold mb-4'>
          {initialInvoice
            ? `Edit Invoice #${initialInvoice.invoice_number}`
            : 'Create New Invoice'}
        </h2>
        <p>
          A full professional invoice form would be rendered here, allowing
          selection from the customer list.
        </p>
        {/* Full form UI from previous steps would be integrated here */}
      </div>
    </div>
  );
}
