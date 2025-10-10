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
export default function AutomatedInvoicing() {
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
   // --- Professional Invoice Form Implementation ---
   const [client, setClient] = useState(initialInvoice?.customers?.customer_name || '');
   const [terms, setTerms] = useState('Net 30');
   const [invoiceDate, setInvoiceDate] = useState(initialInvoice?.due_date || new Date().toISOString().split('T')[0]);
   const [dueDate, setDueDate] = useState(initialInvoice?.due_date || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]);
  // po_number is not present on Invoice type; use blank or add to form only
  const [poNumber, setPoNumber] = useState('');
   const [creditCard, setCreditCard] = useState('');
   const [vendorDetails, setVendorDetails] = useState('');
   // line_items is not present on Invoice type; use default blank line item
   const [lineItems, setLineItems] = useState([
     {
       id: 1,
       serviceDate: invoiceDate,
       product: '',
       sku: '',
       description: '',
       qty: 1,
       rate: 0,
       amount: 0,
       tax: 0,
     },
   ]);
   const [notes, setNotes] = useState('Thank You for your Business. Please Make Checks Payable to HJS SERVICES LLC SEND TO P. O BOX 80054 ATHENS GA 30608');
   const [customerNote, setCustomerNote] = useState('We Appreciate your Business and look forward to working with you again.');
   const [internalNotes, setInternalNotes] = useState('');
   const [memo, setMemo] = useState('');
   const [attachments, setAttachments] = useState<File[]>([]);
   const [shipping, setShipping] = useState(0);
   const [deposit, setDeposit] = useState(0);
   const [taxRate, setTaxRate] = useState(0);

   // Helper functions
   const handleLineItemChange = (index: number, field: string, value: any) => {
     const items = [...lineItems];
     items[index][field] = value;
     if (field === 'qty' || field === 'rate') {
       items[index].amount = (items[index].qty || 0) * (items[index].rate || 0);
     }
     setLineItems(items);
   };
   const addLineItem = () => setLineItems([...lineItems, {
     id: lineItems.length + 1,
     serviceDate: invoiceDate,
     product: '',
     sku: '',
     description: '',
     qty: 1,
     rate: 0,
     amount: 0,
     tax: 0,
   }]);
   const removeLineItem = (index: number) => setLineItems(lineItems.filter((_, i) => i !== index));

   // Calculations
   const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
   const taxableSubtotal = lineItems.reduce((sum, item) => sum + (item.tax ? item.amount : 0), 0);
   const salesTax = taxRate ? taxableSubtotal * (taxRate / 100) : 0;
   const total = subtotal + salesTax + shipping;
   const balanceDue = total - deposit;

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

         {/* Client & Terms Section */}
         <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
           <div>
             <label className='block font-medium'>Add client</label>
             <input className='w-full border p-2 rounded' value={client} onChange={e => setClient(e.target.value)} placeholder='Client name' />
           </div>
           <div>
             <label className='block font-medium'>Terms</label>
             <select className='w-full border p-2 rounded' value={terms} onChange={e => setTerms(e.target.value)}>
               <option>Net 30</option>
               <option>Net 15</option>
               <option>Due on receipt</option>
             </select>
           </div>
           <div>
             <label className='block font-medium'>Invoice date</label>
             <input type='date' className='w-full border p-2 rounded' value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
           </div>
           <div>
             <label className='block font-medium'>Due date</label>
             <input type='date' className='w-full border p-2 rounded' value={dueDate} onChange={e => setDueDate(e.target.value)} />
           </div>
           <div>
             <label className='block font-medium'>PO Number</label>
             <input className='w-full border p-2 rounded' value={poNumber} onChange={e => setPoNumber(e.target.value)} />
           </div>
           <div>
             <label className='block font-medium'>Credit Card</label>
             <input className='w-full border p-2 rounded' value={creditCard} onChange={e => setCreditCard(e.target.value)} />
           </div>
           <div className='md:col-span-2'>
             <label className='block font-medium'>Vendor Details</label>
             <input className='w-full border p-2 rounded' value={vendorDetails} onChange={e => setVendorDetails(e.target.value)} />
           </div>
         </div>

         {/* Line Items Table */}
         <div className='mb-6'>
           <table className='w-full border mb-2'>
             <thead>
               <tr className='bg-gray-100'>
                 <th className='p-2'>#</th>
                 <th className='p-2'>Service Date</th>
                 <th className='p-2'>Product/Service</th>
                 <th className='p-2'>SKU</th>
                 <th className='p-2'>Description</th>
                 <th className='p-2'>Qty</th>
                 <th className='p-2'>Rate</th>
                 <th className='p-2'>Amount</th>
                 <th className='p-2'>Tax</th>
                 <th></th>
               </tr>
             </thead>
             <tbody>
               {lineItems.map((item, idx) => (
                 <tr key={item.id}>
                   <td className='p-2 text-center'>{idx + 1}</td>
                   <td className='p-2'><input type='date' className='border p-1 rounded' value={item.serviceDate} onChange={e => handleLineItemChange(idx, 'serviceDate', e.target.value)} /></td>
                   <td className='p-2'><input className='border p-1 rounded' value={item.product} onChange={e => handleLineItemChange(idx, 'product', e.target.value)} placeholder='Product/Service' /></td>
                   <td className='p-2'><input className='border p-1 rounded' value={item.sku} onChange={e => handleLineItemChange(idx, 'sku', e.target.value)} placeholder='SKU' /></td>
                   <td className='p-2'><input className='border p-1 rounded' value={item.description} onChange={e => handleLineItemChange(idx, 'description', e.target.value)} placeholder='Description' /></td>
                   <td className='p-2'><input type='number' className='border p-1 rounded w-16' value={item.qty} min={1} onChange={e => handleLineItemChange(idx, 'qty', parseInt(e.target.value) || 1)} /></td>
                   <td className='p-2'><input type='number' className='border p-1 rounded w-24' value={item.rate} min={0} step={0.01} onChange={e => handleLineItemChange(idx, 'rate', parseFloat(e.target.value) || 0)} /></td>
                   <td className='p-2 text-right'>${item.amount.toFixed(2)}</td>
                   <td className='p-2'><input type='checkbox' checked={!!item.tax} onChange={e => handleLineItemChange(idx, 'tax', e.target.checked ? 1 : 0)} /></td>
                   <td className='p-2'><button onClick={() => removeLineItem(idx)} className='text-red-500'>✕</button></td>
                 </tr>
               ))}
             </tbody>
           </table>
           <button onClick={addLineItem} className='text-blue-600 hover:underline'>+ Add line item</button>
         </div>

         {/* Notes & Attachments */}
         <div className='mb-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
           <div>
             <label className='block font-medium'>Thank You Message</label>
             <textarea className='w-full border p-2 rounded' value={notes} onChange={e => setNotes(e.target.value)} />
           </div>
           <div>
             <label className='block font-medium'>Note to customer</label>
             <textarea className='w-full border p-2 rounded' value={customerNote} onChange={e => setCustomerNote(e.target.value)} />
           </div>
           {/* Hidden fields for internal notes and memo */}
           {/* <div><label>Internal customer notes (hidden)</label><textarea className='w-full border p-2 rounded' value={internalNotes} onChange={e => setInternalNotes(e.target.value)} /></div> */}
           {/* <div><label>Memo on statement (hidden)</label><textarea className='w-full border p-2 rounded' value={memo} onChange={e => setMemo(e.target.value)} /></div> */}
         </div>
         <div className='mb-6'>
           <label className='block font-medium'>Attachments</label>
           <input type='file' multiple onChange={e => setAttachments(e.target.files ? Array.from(e.target.files) : [])} />
           <div className='text-xs text-gray-500 mt-1'>Max file size: 20 MB</div>
         </div>

         {/* Totals Section */}
         <div className='bg-gray-50 p-4 rounded-lg mb-4'>
           <div className='flex justify-between mb-2'><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
           <div className='flex justify-between mb-2'><span>Taxable subtotal</span><span>${taxableSubtotal.toFixed(2)}</span></div>
           <div className='flex justify-between mb-2'>
             <span>Select sales tax rate</span>
             <input type='number' className='border p-1 rounded w-24' value={taxRate} min={0} max={100} step={0.01} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} />
             <span>Automatic Calculation</span>
           </div>
           <div className='flex justify-between mb-2'><span>Sales tax</span><span>${salesTax.toFixed(2)}</span></div>
           <div className='flex justify-between mb-2'><span>Shipping</span><input type='number' className='border p-1 rounded w-24' value={shipping} min={0} step={0.01} onChange={e => setShipping(parseFloat(e.target.value) || 0)} /></div>
           <div className='flex justify-between mb-2 font-bold text-lg'><span>Invoice total</span><span>${total.toFixed(2)}</span></div>
           <div className='flex justify-between mb-2'><span>Deposit</span><input type='number' className='border p-1 rounded w-24' value={deposit} min={0} step={0.01} onChange={e => setDeposit(parseFloat(e.target.value) || 0)} /></div>
           {/* <div className='flex justify-between mb-2'><span>Balance due (hidden)</span><span>${balanceDue.toFixed(2)}</span></div> */}
           <button className='mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>Edit totals</button>
         </div>
       </div>
     </div>
   );
}
