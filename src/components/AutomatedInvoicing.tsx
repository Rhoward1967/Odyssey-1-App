import { supabase } from '@/lib/supabaseClient';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import CustomerProfile, {
  CustomerProfileData,
} from './customers/CustomerProfile';
// Service type for cleaning/janitorial services/products
type Service = {
  id: string;
  name: string;
  sku?: string;
  default_rate?: number;
};

// Use shared supabase client

// --- Type Definitions based on your template ---
type CompanyProfile = { company_name: string; address: string };
type Customer = {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  address?: string;
  phone?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
};
type LineItem = {
  description: string;
  sku?: string;
  quantity: number;
  rate: number;
  amount: number;
  is_taxable: boolean;
};
type Invoice = {
  id: string;
  invoice_number: string;
  customer_id: string;
  total_amount: number;
  due_date: string;
  issue_date: string;
  status: 'draft' | 'sent' | 'paid' | 'void';
  line_items: LineItem[];
  po_number?: string;
  notes?: string;
  shipping_amount?: number;
  deposit_amount?: number;
  tax_rate?: number;
  customers: { company_name: string };
};
type RecurringInvoice = {
  id: string;
  customer_id: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
  start_date: string;
  end_date?: string;
  next_invoice_date: string;
  line_items: LineItem[];
  total_amount: number;
  is_active: boolean;
  notes?: string;
  tax_rate?: number;
  customers: { company_name: string; first_name?: string; last_name?: string };
};

// --- Main Dashboard Component ---
export default function InvoiceDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [view, setView] = useState<
    'list' | 'invoice_form' | 'customer_manager' | 'recurring_invoices' | 'recurring_form'
  >('list');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null
  );
  const [editingInvoice, setEditingInvoice] = useState<Partial<Invoice> | null>(
    null
  );
  const [editingRecurring, setEditingRecurring] = useState<Partial<RecurringInvoice> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated.');

      const [invoiceRes, customerRes, profileRes, recurringRes] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, customers(company_name, first_name, last_name)')
          .order('created_at', { ascending: false }),
        // Remove user_id filter to get all customers (QuickBooks synced customers may not have user_id)
        supabase.from('customers').select('*').order('company_name'),
        supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('recurring_invoices')
          .select('*, customers(company_name, first_name, last_name)')
          .eq('user_id', user.id)
          .order('next_invoice_date', { ascending: true }),
      ]);

      if (invoiceRes.error) throw invoiceRes.error;
      if (customerRes.error) throw customerRes.error;
      // Gracefully handle missing company_profiles table or permission denied
      if (profileRes.error && profileRes.error.code !== 'PGRST116' && !profileRes.error.message?.includes('permission denied')) {
        console.warn('Company profile error (non-fatal):', profileRes.error);
      }
      if (recurringRes.error && recurringRes.error.code !== 'PGRST116')
        console.warn('Recurring invoices table may not exist:', recurringRes.error);

      setInvoices(invoiceRes.data || []);
      setCustomers(customerRes.data || []);
      setCompanyProfile(profileRes.data || null);
      setRecurringInvoices(recurringRes.data || []);
    } catch (err: any) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkAndFetch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && isMounted && view === 'list') {
        fetchData();
      }
    };
    checkAndFetch();
    return () => {
      isMounted = false;
    };
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

  const showForm = (invoice: Partial<Invoice> | null = null) => {
    setEditingInvoice(invoice);
    setView('invoice_form');
  };

  const handleCustomerAdded = (newCustomer: Customer) => {
    const updatedCustomers = [...customers, newCustomer].sort((a, b) => {
      const aName = a.company_name || `${a.first_name || ''} ${a.last_name || ''}`.trim() || 'Unknown';
      const bName = b.company_name || `${b.first_name || ''} ${b.last_name || ''}`.trim() || 'Unknown';
      return aName.localeCompare(bName);
    });
    setCustomers(updatedCustomers);
  };

  // Loading timeout fallback
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoadingTimeout(true), 7000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [loading]);

  if (authLoading)
    return (
      <div className='p-8 text-center animate-pulse'>
        Checking authentication...
      </div>
    );
  if (!user) {
    return (
      <div className='p-8 text-center'>
        <div className='mb-4 text-red-700'>
          Not authenticated. Please log in to access invoicing.
        </div>
        <a
          href='/login'
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          Go to Login
        </a>
      </div>
    );
  }
  if (loading && !loadingTimeout)
    return (
      <div className='p-8 text-center animate-pulse'>
        Loading Invoicing Module...
      </div>
    );
  if (loading && loadingTimeout)
    return (
      <div className='p-8 text-center'>
        <div className='mb-4 animate-pulse'>
          Still loading...
          <br />
          If this takes too long, click below to retry.
        </div>
        <button
          className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
          onClick={() => {
            setLoading(true);
            setLoadingTimeout(false);
            fetchData();
          }}
        >
          Retry Loading
        </button>
      </div>
    );

  return (
    <div className='p-4 md:p-6 bg-gray-100'>
      <div className='max-w-7xl mx-auto'>
        {error && (
          <div className='mb-4 p-4 bg-red-100 text-red-800 rounded-lg shadow flex flex-col items-center'>
            <div>{error}</div>
            <button
              className='mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              onClick={() => fetchData()}
            >
              Retry
            </button>
          </div>
        )}
        {view === 'list' && !error && (
          <InvoiceListView
            invoices={invoices}
            recurringInvoices={recurringInvoices}
            onCreateNew={() => showForm()}
            onEdit={showForm}
            onDelete={handleDeleteInvoice}
            onManageCustomers={() => setView('customer_manager')}
            onManageRecurring={() => setView('recurring_invoices')}
          />
        )}
        {view === 'invoice_form' && !error && (
          <InvoiceForm
            initialInvoice={editingInvoice}
            customers={customers}
            companyProfile={companyProfile}
            onSaveSuccess={() => setView('list')}
            onCancel={() => setView('list')}
            onCustomerAdded={handleCustomerAdded}
          />
        )}
        {view === 'recurring_invoices' && !error && (
          <RecurringInvoicesView
            recurringInvoices={recurringInvoices}
            customers={customers}
            onCreateNew={() => setView('recurring_form')}
            onEdit={(recurring) => {
              setEditingRecurring(recurring);
              setView('recurring_form');
            }}
            onGenerateNow={async (recurringId) => {
              const { data, error } = await supabase.rpc('generate_invoice_from_recurring', { recurring_id: recurringId });
              if (error) {
                setError(`Failed to generate invoice: ${error.message}`);
              } else {
                alert('Invoice generated successfully!');
                fetchData();
              }
            }}
            onBack={() => setView('list')}
          />
        )}
        {view === 'recurring_form' && !error && (
          <RecurringInvoiceForm
            initialRecurring={editingRecurring}
            customers={customers}
            onSaveSuccess={() => {
              setView('recurring_invoices');
              fetchData();
            }}
            onCancel={() => setView('recurring_invoices')}
          />
        )}
        {view === 'customer_manager' && !error && (
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

// --- Invoice List View ---
function InvoiceListView({
  invoices,
  recurringInvoices,
  onCreateNew,
  onEdit,
  onDelete,
  onManageCustomers,
  onManageRecurring,
}: any) {
  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-900'>Invoices</h1>
        <div className='flex items-center space-x-2'>
          <button
            onClick={onManageCustomers}
            className='px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm'
          >
            Manage Customers
          </button>
          <button
            onClick={onManageRecurring}
            className='px-4 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm'
          >
            Recurring Invoices ({recurringInvoices?.filter((r: any) => r.is_active).length || 0})
          </button>
          <button
            onClick={onCreateNew}
            className='px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm'
          >
            Create New Invoice
          </button>
        </div>
      </div>
      {invoices.length === 0 ? (
        <p className='text-center p-12 bg-white rounded-lg shadow'>
          No invoices found. Create one to get started.
        </p>
      ) : (
        <>
          {/* Desktop Table - Hidden on mobile/tablet */}
          <div className='hidden md:block bg-white shadow-md rounded-lg overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Invoice #
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Customer
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Due Date
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Amount
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 relative'></th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {invoices.map((invoice: Invoice) => (
                  <tr key={invoice.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 font-medium text-gray-900'>
                      {invoice.invoice_number}
                    </td>
                    <td className='px-6 py-4 text-gray-600'>
                      {invoice.customers?.company_name || 'N/A'}
                    </td>
                    <td className='px-6 py-4 text-gray-600'>
                      {invoice.due_date}
                    </td>
                    <td className='px-6 py-4 text-right font-semibold text-gray-900'>
                      ${invoice.total_amount.toFixed(2)}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                      >
                        {invoice.status}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right text-sm font-medium'>
                    <button
                      onClick={() => onEdit(invoice)}
                      className='text-indigo-600 hover:text-indigo-900'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(invoice.id)}
                      className='text-red-600 hover:text-red-900 ml-4'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile/Tablet Card View - Shown only on small screens */}
          <div className='md:hidden space-y-4'>
            {invoices.map((invoice: Invoice) => (
              <div key={invoice.id} className='bg-white shadow-md rounded-lg p-4 border border-gray-200'>
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <div className='font-bold text-gray-900 text-lg'>{invoice.invoice_number}</div>
                    <div className='text-sm text-gray-600 mt-1'>{invoice.customers?.company_name || 'N/A'}</div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {invoice.status}
                  </span>
                </div>
                <div className='flex justify-between text-sm mb-3'>
                  <span className='text-gray-500'>Due Date:</span>
                  <span className='text-gray-900 font-medium'>{invoice.due_date}</span>
                </div>
                <div className='flex justify-between text-sm mb-4'>
                  <span className='text-gray-500'>Amount:</span>
                  <span className='text-gray-900 font-bold text-lg'>${invoice.total_amount.toFixed(2)}</span>
                </div>
                <div className='flex gap-2 pt-3 border-t border-gray-200'>
                  <button
                    onClick={() => onEdit(invoice)}
                    className='flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700'
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(invoice.id)}
                    className='flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700'
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// --- Customer Management View ---
function CustomerManager({ customers, onSaveSuccess, onBack }: any) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerProfileData | null>(null);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name) return setError('Customer name is required.');
    setIsSaving(true);
    const { error: insertError } = await supabase
      .from('customers')
      .insert([
        {
          customer_name: form.name,
          email: form.email,
          address: form.address,
          phone: form.phone,
        },
      ]);
    setIsSaving(false);
    if (insertError) setError(`Failed to add customer: ${insertError.message}`);
    else {
      setForm({ name: '', email: '', address: '', phone: '' });
      onSaveSuccess();
    }
  };

  return (
    <div className='flex flex-col md:flex-row gap-8 bg-white p-8 rounded-lg shadow-lg'>
      <div className='md:w-1/3 w-full'>
        <button
          onClick={onBack}
          className='mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center'
        >
          <svg
            className='w-4 h-4 mr-2'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M10 19l-7-7m0 0l7-7m-7 7h18'
            ></path>
          </svg>
          Back to Invoices
        </button>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>Clients</h2>
        <form
          onSubmit={handleAddCustomer}
          className='p-4 border rounded-lg mb-6 space-y-4 bg-gray-50'
        >
          <h3 className='font-semibold text-lg'>Add New Client</h3>
          <input
            type='text'
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder='Full Name or Company'
            className='p-2 w-full border rounded-md'
          />
          <input
            type='email'
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder='Email'
            className='p-2 w-full border rounded-md'
          />
          <input
            type='text'
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder='Address'
            className='p-2 w-full border rounded-md'
          />
          <input
            type='text'
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder='Phone'
            className='p-2 w-full border rounded-md'
          />
          <button
            type='submit'
            disabled={isSaving}
            className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300'
          >
            {isSaving ? 'Saving...' : 'Add Client'}
          </button>
        </form>
        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>
            {error}
          </div>
        )}
        <h3 className='font-bold mb-2 text-lg'>All Clients</h3>
        <ul className='divide-y divide-gray-200 bg-gray-50 rounded-lg overflow-hidden'>
          {customers.map((c: any) => (
            <li
              key={c.id}
              className={`p-3 cursor-pointer hover:bg-blue-50 ${selectedCustomer?.id === c.id ? 'bg-blue-100' : ''}`}
              onClick={() => setSelectedCustomer({ ...c })}
            >
              <div className='font-medium text-gray-900'>{c.customer_name}</div>
              <div className='text-xs text-gray-500'>{c.email}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className='md:w-2/3 w-full'>
        {selectedCustomer ? (
          <CustomerProfile customer={selectedCustomer} />
        ) : (
          <div className='flex items-center justify-center h-full min-h-[300px] text-gray-400'>
            Select a client to view full profile
          </div>
        )}
      </div>
    </div>
  );
}

// --- Invoice Form View (Built EXACTLY to your template) ---
function InvoiceForm({
  initialInvoice,
  customers,
  companyProfile,
  onSaveSuccess,
  onCancel,
  onCustomerAdded,
}: any) {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: initialInvoice?.customer_id || '',
    due_date:
      initialInvoice?.due_date || new Date().toISOString().split('T')[0],
    issue_date:
      initialInvoice?.issue_date || new Date().toISOString().split('T')[0],
    line_items: initialInvoice?.line_items || [
      {
        description: '',
        sku: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        is_taxable: true,
      },
    ],
    status: initialInvoice?.status || 'draft',
    po_number: initialInvoice?.po_number || '',
    notes: initialInvoice?.notes || 'Thank You for your Business.',
    shipping_amount: initialInvoice?.shipping_amount || 0,
    deposit_amount: initialInvoice?.deposit_amount || 0,
    tax_rate: initialInvoice?.tax_rate || 8.25,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Service/product catalog state
  const [services, setServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    sku: '',
    default_rate: '',
  });
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Fetch services/products from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');
      if (!error) setServices(data || []);
    };
    fetchServices();
  }, []);

  // Handle line item change, including service selection
  const handleLineItemChange = (
    index: number,
    field: keyof Omit<LineItem, 'amount'>,
    value: any
  ) => {
    const items = [...formData.line_items];
    let updatedItem = { ...items[index], [field]: value };
    if (field === 'description' && value) {
      // If a service is selected by id, auto-fill fields
      const svc = services.find(s => s.id === value);
      if (svc) {
        updatedItem.description = svc.name;
        updatedItem.sku = svc.sku || '';
        updatedItem.rate = svc.default_rate || 0;
      } else {
        updatedItem.description = value; // fallback for manual entry
      }
    }
    if (field === 'quantity' || field === 'rate') {
      updatedItem[field] = parseFloat(value) || 0;
    }
    updatedItem.amount = updatedItem.quantity * updatedItem.rate;
    items[index] = updatedItem;
    setFormData({ ...formData, line_items: items });
  };

  const addLineItem = () =>
    setFormData({
      ...formData,
      line_items: [
        ...formData.line_items,
        {
          description: '',
          sku: '',
          quantity: 1,
          rate: 0,
          amount: 0,
          is_taxable: true,
        },
      ],
    });
  const removeLineItem = (index: number) =>
    setFormData({
      ...formData,
      line_items: formData.line_items.filter((_, i) => i !== index),
    });

  const subtotal = formData.line_items.reduce(
    (sum: number, item: LineItem) => sum + item.amount,
    0
  );
  const taxableSubtotal = formData.line_items
    .filter(i => i.is_taxable)
    .reduce((sum: number, item: LineItem) => sum + item.amount, 0);
  const taxAmount = taxableSubtotal * (formData.tax_rate / 100);
  const totalAmount = subtotal + taxAmount + formData.shipping_amount;
  const balanceDue = totalAmount - formData.deposit_amount;

  const handleSave = async () => {
    if (!formData.customer_id) return setError('Please select a customer.');
    setIsSaving(true);
    const submission = {
      ...formData,
      total_amount: totalAmount,
      invoice_number: initialInvoice?.invoice_number || `INV-${Date.now()}`,
    };

    const { error: saveError } = initialInvoice?.id
      ? await supabase
          .from('invoices')
          .update(submission)
          .eq('id', initialInvoice.id)
      : await supabase.from('invoices').insert([submission]).select();

    setIsSaving(false);
    if (saveError) setError(`Failed to save invoice: ${saveError.message}`);
    else onSaveSuccess();
  };

  const handleNewCustomerSuccess = (newCustomer: Customer) => {
    onCustomerAdded(newCustomer);
    setFormData({ ...formData, customer_id: newCustomer.id });
    setIsCustomerModalOpen(false);
  };

  // Add new service/product to catalog
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    setServiceError(null);
    if (!newService.name) return setServiceError('Service name is required.');
    const { data, error } = await supabase
      .from('services')
      .insert([
        {
          name: newService.name,
          sku: newService.sku,
          default_rate: parseFloat(newService.default_rate) || 0,
        },
      ])
      .select()
      .single();
    if (error) setServiceError(`Failed to add service: ${error.message}`);
    else {
      setServices([...services, data]);
      setNewService({ name: '', sku: '', default_rate: '' });
      setIsServiceModalOpen(false);
    }
  };

  return (
    <div>
      <button
        onClick={onCancel}
        className='mb-4 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center'
      >
        <svg
          className='w-4 h-4 mr-2'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M10 19l-7-7m0 0l7-7m-7 7h18'
          ></path>
        </svg>
        Back to Invoice List
      </button>
      <div className='bg-white p-8 rounded-lg shadow-lg'>
        <div className='flex justify-between items-start mb-8'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              {companyProfile?.company_name}
            </h1>
            <p className='text-gray-600 whitespace-pre-line'>
              {companyProfile?.address}
            </p>
          </div>
          <h2 className='text-4xl font-light text-gray-400 uppercase tracking-widest'>
            Invoice
          </h2>
        </div>
        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>
            {error}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8 border-b pb-8'>
          <div>
            <label className='block text-sm font-medium text-gray-500 mb-1'>
              Bill To
            </label>
            <div className='flex items-center space-x-2'>
              <select
                value={formData.customer_id}
                onChange={e =>
                  setFormData({ ...formData, customer_id: e.target.value })
                }
                className='p-2 w-full border rounded-md bg-gray-50 flex-grow'
              >
                <option value=''>Select a Customer</option>
                {customers.map((c: Customer) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown Customer'}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className='px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-semibold'
              >
                New
              </button>
            </div>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-500 mb-1'>
              PO Number
            </label>
            <input
              type='text'
              value={formData.po_number}
              onChange={e =>
                setFormData({ ...formData, po_number: e.target.value })
              }
              className='p-2 w-full border rounded-md'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-500 mb-1'>
              Invoice Date
            </label>
            <input
              type='date'
              value={formData.issue_date}
              onChange={e =>
                setFormData({ ...formData, issue_date: e.target.value })
              }
              className='p-2 w-full border rounded-md'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-500 mb-1'>
              Due Date
            </label>
            <input
              type='date'
              value={formData.due_date}
              onChange={e =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              className='p-2 w-full border rounded-md'
            />
          </div>
        </div>

        {/* Desktop Line Items Table - Hidden on mobile */}
        <div className='hidden md:block overflow-x-auto'>
          <table className='w-full mb-4'>
            <thead className='border-b-2 border-gray-300'>
              <tr className='text-left text-xs font-semibold text-gray-500 uppercase'>
                <th className='p-2'>Product/Service</th>
                <th className='p-2 w-40'>SKU</th>
                <th className='p-2 w-24 text-right'>Qty</th>
                <th className='p-2 w-32 text-right'>Rate</th>
                <th className='p-2 w-32 text-right'>Amount</th>
                <th className='p-2 w-20 text-center'>Taxable</th>
                <th className='w-10'></th>
              </tr>
            </thead>
            <tbody>
            {formData.line_items.map((item: LineItem, index: number) => (
              <tr key={index}>
                <td>
                  <div className='flex items-center space-x-2'>
                    <select
                      value={
                        services.find(s => s.name === item.description)?.id ||
                        ''
                      }
                      onChange={e =>
                        handleLineItemChange(
                          index,
                          'description',
                          e.target.value
                        )
                      }
                      className='p-2 w-full border-b bg-gray-50'
                    >
                      <option value=''>Select Service/Product</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type='button'
                      onClick={() => setIsServiceModalOpen(true)}
                      className='text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200'
                    >
                      New
                    </button>
                  </div>
                  <input
                    type='text'
                    value={item.description}
                    onChange={e =>
                      handleLineItemChange(index, 'description', e.target.value)
                    }
                    className='p-2 w-full border-b mt-1'
                    placeholder='Item or service description'
                  />
                </td>
                <td>
                  <input
                    type='text'
                    value={item.sku || ''}
                    onChange={e =>
                      handleLineItemChange(index, 'sku', e.target.value)
                    }
                    className='p-2 w-full border-b'
                  />
                </td>
                <td>
                  <input
                    type='number'
                    value={item.quantity}
                    onChange={e =>
                      handleLineItemChange(index, 'quantity', e.target.value)
                    }
                    className='p-2 w-full text-right border-b'
                  />
                </td>
                <td>
                  <input
                    type='number'
                    value={item.rate}
                    onChange={e =>
                      handleLineItemChange(index, 'rate', e.target.value)
                    }
                    className='p-2 w-full text-right border-b'
                  />
                </td>
                <td className='p-2 text-right font-medium'>
                  ${item.amount.toFixed(2)}
                </td>
                <td className='p-2 text-center'>
                  <input
                    type='checkbox'
                    checked={item.is_taxable}
                    onChange={e =>
                      handleLineItemChange(
                        index,
                        'is_taxable',
                        e.target.checked
                      )
                    }
                  />
                </td>
                <td>
                  <button
                    onClick={() => removeLineItem(index)}
                    className='text-red-500 p-2 opacity-50 hover:opacity-100'
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Mobile Line Items - Card-based layout */}
        <div className='md:hidden space-y-4 mb-4'>
          {formData.line_items.map((item: LineItem, index: number) => (
            <div key={index} className='bg-gray-50 p-4 rounded-lg border border-gray-200 relative'>
              <button
                onClick={() => removeLineItem(index)}
                className='absolute top-2 right-2 text-red-500 text-xl'
              >
                ✕
              </button>
              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-medium text-gray-500 mb-1'>Service/Product</label>
                  <div className='flex gap-2'>
                    <select
                      value={services.find(s => s.name === item.description)?.id || ''}
                      onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                      className='p-2 flex-1 border rounded-md bg-white text-sm'
                    >
                      <option value=''>Select Service</option>
                      {services.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                    </select>
                    <button type='button' onClick={() => setIsServiceModalOpen(true)} className='px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs'>+</button>
                  </div>
                  <input
                    type='text'
                    value={item.description}
                    onChange={e => handleLineItemChange(index, 'description', e.target.value)}
                    className='p-2 w-full border rounded-md mt-2 text-sm'
                    placeholder='Description'
                  />
                </div>
                <input
                  type='text'
                  value={item.sku || ''}
                  onChange={e => handleLineItemChange(index, 'sku', e.target.value)}
                  placeholder='SKU (optional)'
                  className='p-2 w-full border rounded-md text-sm'
                />
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='block text-xs font-medium text-gray-500 mb-1'>Quantity</label>
                    <input type='number' value={item.quantity} onChange={e => handleLineItemChange(index, 'quantity', e.target.value)} className='p-2 w-full border rounded-md text-sm'/>
                  </div>
                  <div>
                    <label className='block text-xs font-medium text-gray-500 mb-1'>Rate</label>
                    <input type='number' value={item.rate} onChange={e => handleLineItemChange(index, 'rate', e.target.value)} className='p-2 w-full border rounded-md text-sm'/>
                  </div>
                </div>
                <div className='flex justify-between items-center pt-2 border-t'>
                  <label className='flex items-center text-sm'><input type='checkbox' checked={item.is_taxable} onChange={e => handleLineItemChange(index, 'is_taxable', e.target.checked)} className='mr-2'/> Taxable</label>
                  <span className='text-lg font-bold'>${item.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addLineItem}
          className='text-sm text-blue-600 hover:underline mb-8'
        >
          + Add Line Item
        </button>

        <div className='flex flex-col md:flex-row md:justify-between mt-8 gap-6'>
          <div className='w-full md:w-1/2'>
            <label className='block text-sm font-medium text-gray-500 mb-1'>
              Note to customer
            </label>
            <textarea
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              className='p-2 w-full border rounded-md'
            ></textarea>
          </div>
          <div className='w-full md:w-1/3 space-y-2'>
            <div className='flex justify-between'>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span>Sales Tax Rate (%)</span>
              <input
                type='number'
                step='0.01'
                value={formData.tax_rate}
                onChange={e =>
                  setFormData({
                    ...formData,
                    tax_rate: parseFloat(e.target.value) || 0,
                  })
                }
                className='p-1 w-24 text-right border rounded-md'
              />
            </div>
            <div className='flex justify-between'>
              <span>Sales Tax</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className='flex justify-between items-center'>
              <span>Shipping</span>
              <input
                type='number'
                value={formData.shipping_amount}
                onChange={e =>
                  setFormData({
                    ...formData,
                    shipping_amount: parseFloat(e.target.value) || 0,
                  })
                }
                className='p-1 w-24 text-right border rounded-md'
              />
            </div>
            <div className='flex justify-between items-center'>
              <span>Deposit</span>
              <input
                type='number'
                value={formData.deposit_amount}
                onChange={e =>
                  setFormData({
                    ...formData,
                    deposit_amount: parseFloat(e.target.value) || 0,
                  })
                }
                className='p-1 w-24 text-right border rounded-md'
              />
            </div>
            <div className='flex justify-between p-2 font-bold text-lg border-t-2 mt-2 pt-2'>
              <span>Balance Due</span>
              <span>${balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className='w-full py-3 mt-8 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400'
        >
          {isSaving
            ? 'Saving...'
            : initialInvoice?.id
              ? 'Update Invoice'
              : 'Save Invoice'}
        </button>
      </div>

      {isCustomerModalOpen && (
        <CustomerModal
          onClose={() => setIsCustomerModalOpen(false)}
          onSaveSuccess={handleNewCustomerSuccess}
        />
      )}

      {isServiceModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-8 rounded-lg shadow-2xl w-full max-w-md'>
            <h2 className='text-2xl font-bold mb-4'>Add New Service/Product</h2>
            {serviceError && (
              <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>
                {serviceError}
              </div>
            )}
            <form onSubmit={handleAddService} className='space-y-4'>
              <input
                type='text'
                value={newService.name}
                onChange={e =>
                  setNewService({ ...newService, name: e.target.value })
                }
                placeholder='Service/Product Name'
                className='p-2 w-full border rounded-md'
                required
              />
              <input
                type='text'
                value={newService.sku}
                onChange={e =>
                  setNewService({ ...newService, sku: e.target.value })
                }
                placeholder='SKU (optional)'
                className='p-2 w-full border rounded-md'
              />
              <input
                type='number'
                value={newService.default_rate}
                onChange={e =>
                  setNewService({ ...newService, default_rate: e.target.value })
                }
                placeholder='Default Rate'
                className='p-2 w-full border rounded-md'
              />
              <div className='flex justify-end space-x-2 pt-4'>
                <button
                  type='button'
                  onClick={() => setIsServiceModalOpen(false)}
                  className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Customer Modal (The Pop-up Form) ---
function CustomerModal({
  onClose,
  onSaveSuccess,
}: {
  onClose: () => void;
  onSaveSuccess: (c: Customer) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name) return setError('Customer name is required.');
    setIsSaving(true);

    const { data, error: insertError } = await supabase
      .from('customers')
      .insert([
        {
          customer_name: form.name,
          email: form.email,
          address: form.address,
          phone: form.phone,
        },
      ])
      .select()
      .single();

    setIsSaving(false);
    if (insertError) {
      setError(`Failed to add customer: ${insertError.message}`);
    } else {
      onSaveSuccess(data);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-8 rounded-lg shadow-2xl w-full max-w-md'>
        <h2 className='text-2xl font-bold mb-4'>Add New Customer</h2>
        {error && (
          <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>
            {error}
          </div>
        )}
        <form onSubmit={handleAddCustomer} className='space-y-4'>
          <input
            type='text'
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder='Full Name or Company'
            className='p-2 w-full border rounded-md'
            required
          />
          <input
            type='email'
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder='Email'
            className='p-2 w-full border rounded-md'
          />
          <input
            type='text'
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder='Address'
            className='p-2 w-full border rounded-md'
          />
          <input
            type='text'
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder='Phone'
            className='p-2 w-full border rounded-md'
          />
          <div className='flex justify-end space-x-2 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSaving}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300'
            >
              {isSaving ? 'Saving...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Recurring Invoices View ---
function RecurringInvoicesView({
  recurringInvoices,
  customers,
  onCreateNew,
  onEdit,
  onGenerateNow,
  onBack,
}: any) {
  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <button onClick={onBack} className='text-blue-600 hover:underline mb-2'>← Back to Invoices</button>
          <h1 className='text-3xl font-bold text-gray-900'>Recurring Invoices</h1>
        </div>
        <button
          onClick={onCreateNew}
          className='px-5 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm'
        >
          Create Recurring Invoice
        </button>
      </div>
      {recurringInvoices.length === 0 ? (
        <div className='text-center p-12 bg-white rounded-lg shadow'>
          <p className='text-gray-600 mb-4'>No recurring invoices yet.</p>
          <p className='text-sm text-gray-500'>Set up automatic monthly, quarterly, or annual billing for your clients.</p>
        </div>
      ) : (
        <div className='bg-white shadow-md rounded-lg overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Client</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Frequency</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Amount</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Next Invoice</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase'>Actions</th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {recurringInvoices.map((recurring: any) => {
                const customer = customers.find((c: any) => c.id === recurring.customer_id);
                const displayName = customer?.company_name || `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Unknown';
                return (
                  <tr key={recurring.id}>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {displayName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize'>
                      {recurring.frequency}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      ${recurring.total_amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {new Date(recurring.next_invoice_date).toLocaleDateString()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${recurring.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {recurring.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm space-x-2'>
                      <button
                        onClick={() => onGenerateNow(recurring.id)}
                        className='text-purple-600 hover:text-purple-900'
                        disabled={!recurring.is_active}
                      >
                        Generate Now
                      </button>
                      <button
                        onClick={() => onEdit(recurring)}
                        className='text-blue-600 hover:text-blue-900'
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Recurring Invoice Form ---
function RecurringInvoiceForm({
  initialRecurring,
  customers,
  onSaveSuccess,
  onCancel,
}: any) {
  const [form, setForm] = useState({
    customer_id: initialRecurring?.customer_id || '',
    frequency: initialRecurring?.frequency || 'monthly',
    start_date: initialRecurring?.start_date || new Date().toISOString().split('T')[0],
    end_date: initialRecurring?.end_date || '',
    line_items: initialRecurring?.line_items || [],
    tax_rate: initialRecurring?.tax_rate || 0,
    notes: initialRecurring?.notes || '',
    is_active: initialRecurring?.is_active ?? true,
  });
  const [lineItems, setLineItems] = useState<LineItem[]>(initialRecurring?.line_items || [{ description: '', quantity: 1, rate: 0, amount: 0, is_taxable: false }]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      updated[index].amount = updated[index].quantity * updated[index].rate;
    }
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0, is_taxable: false }]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (form.tax_rate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const recurringData = {
        ...form,
        user_id: user.id,
        line_items: lineItems,
        total_amount: total,
        next_invoice_date: form.start_date,
      };

      if (initialRecurring?.id) {
        const { error: updateError } = await supabase
          .from('recurring_invoices')
          .update(recurringData)
          .eq('id', initialRecurring.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('recurring_invoices')
          .insert([recurringData]);
        if (insertError) throw insertError;
      }

      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save recurring invoice');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className='max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-2xl font-bold text-gray-900'>
          {initialRecurring ? 'Edit' : 'Create'} Recurring Invoice
        </h2>
        <button onClick={onCancel} className='text-gray-600 hover:text-gray-900'>✕</button>
      </div>

      {error && (
        <div className='mb-4 p-4 bg-red-100 text-red-700 rounded-lg'>{error}</div>
      )}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Client *</label>
            <select
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              className='w-full p-2 border border-gray-300 rounded-md'
              required
            >
              <option value=''>Select a client...</option>
              {customers.map((c: any) => {
                const displayName = c.company_name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
                return (
                  <option key={c.id} value={c.id}>{displayName}</option>
                );
              })}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Frequency *</label>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              className='w-full p-2 border border-gray-300 rounded-md'
              required
            >
              <option value='monthly'>Monthly</option>
              <option value='quarterly'>Quarterly (Every 3 months)</option>
              <option value='annual'>Annual (Yearly)</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Start Date *</label>
            <input
              type='date'
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className='w-full p-2 border border-gray-300 rounded-md'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>End Date (Optional)</label>
            <input
              type='date'
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              className='w-full p-2 border border-gray-300 rounded-md'
            />
            <p className='text-xs text-gray-500 mt-1'>Leave blank for perpetual billing</p>
          </div>
        </div>

        <div>
          <div className='flex justify-between items-center mb-2'>
            <label className='block text-sm font-medium text-gray-700'>Line Items *</label>
            <button
              type='button'
              onClick={addLineItem}
              className='text-sm text-blue-600 hover:text-blue-800'
            >
              + Add Line Item
            </button>
          </div>
          {lineItems.map((item, index) => (
            <div key={index} className='grid grid-cols-12 gap-2 mb-2 items-center'>
              <input
                type='text'
                placeholder='Description'
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                className='col-span-5 p-2 border border-gray-300 rounded-md text-sm'
                required
              />
              <input
                type='number'
                placeholder='Qty'
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                className='col-span-2 p-2 border border-gray-300 rounded-md text-sm'
                min='0'
                step='1'
                required
              />
              <input
                type='number'
                placeholder='Rate'
                value={item.rate}
                onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                className='col-span-2 p-2 border border-gray-300 rounded-md text-sm'
                min='0'
                step='0.01'
                required
              />
              <div className='col-span-2 text-sm font-medium text-gray-700'>
                ${item.amount.toFixed(2)}
              </div>
              <button
                type='button'
                onClick={() => removeLineItem(index)}
                className='col-span-1 text-red-600 hover:text-red-800 text-sm'
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Tax Rate (%)</label>
            <input
              type='number'
              value={form.tax_rate}
              onChange={(e) => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })}
              className='w-full p-2 border border-gray-300 rounded-md'
              min='0'
              step='0.01'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Status</label>
            <select
              value={form.is_active ? 'active' : 'inactive'}
              onChange={(e) => setForm({ ...form, is_active: e.target.value === 'active' })}
              className='w-full p-2 border border-gray-300 rounded-md'
            >
              <option value='active'>Active</option>
              <option value='inactive'>Inactive</option>
            </select>
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className='w-full p-2 border border-gray-300 rounded-md'
            rows={3}
            placeholder='Internal notes about this recurring invoice...'
          />
        </div>

        <div className='bg-gray-50 p-4 rounded-lg'>
          <div className='flex justify-between text-sm mb-1'>
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className='flex justify-between text-sm mb-1'>
            <span>Tax ({form.tax_rate}%):</span>
            <span>${taxAmount.toFixed(2)}</span>
          </div>
          <div className='flex justify-between text-lg font-bold border-t pt-2'>
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className='flex justify-end space-x-3 pt-4'>
          <button
            type='button'
            onClick={onCancel}
            className='px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isSaving}
            className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-300'
          >
            {isSaving ? 'Saving...' : initialRecurring ? 'Update' : 'Create'} Recurring Invoice
          </button>
        </div>
      </form>
    </div>
  );
}
