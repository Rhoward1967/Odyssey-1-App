import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// This should be initialized from your central Supabase client instance
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// --- Type Definitions ---
type LineItem = {
  description: string;
  amount: number;
};

type InvoiceSubmission = {
  invoice_number: string;
  due_date: string; // YYYY-MM-DD format
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'void';
  line_items: LineItem[];
};

export default function AutomatedInvoicing() {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', amount: 0 },
  ]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent' | 'paid' | 'void'>(
    'draft'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLineItemChange = (
    index: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const updatedLineItems = [...lineItems];
    if (field === 'amount') {
      updatedLineItems[index].amount =
        typeof value === 'number' ? value : parseFloat(value as string) || 0;
    } else if (field === 'description') {
      updatedLineItems[index].description = value as string;
    }
    setLineItems(updatedLineItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    const updatedLineItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedLineItems);
  };

  const calculateTotal = () => {
    return lineItems.reduce((total, item) => total + item.amount, 0);
  };

  const handleGenerateInvoice = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      setError('Cannot generate an invoice with a total of $0.');
      setIsSaving(false);
      return;
    }

    const submissionData: InvoiceSubmission = {
      invoice_number: `INV-${Date.now()}`,
      due_date: dueDate,
      total_amount: totalAmount,
      status: status,
      line_items: lineItems,
    };

    const { error: insertError } = await supabase
      .from('invoices')
      .insert([submissionData]);

    setIsSaving(false);

    if (insertError) {
      console.error('Error saving invoice:', insertError);
      setError(`Failed to save invoice: ${insertError.message}`);
    } else {
      setSuccessMessage(
        `Invoice ${submissionData.invoice_number} successfully saved!`
      );
      // Reset form
      setLineItems([{ description: '', amount: 0 }]);
      setDueDate('');
    }
  };

  return (
    <div className='p-4 md:p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Generate New Invoice</h2>

      {error && (
        <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-lg'>
          {error}
        </div>
      )}
      {successMessage && (
        <div className='mb-4 p-3 bg-green-100 text-green-700 rounded-lg'>
          {successMessage}
        </div>
      )}

      <div className='space-y-4'>
        {lineItems.map((item, index) => (
          <div key={index} className='flex items-center space-x-2'>
            <input
              type='text'
              placeholder='Description'
              value={item.description}
              onChange={e =>
                handleLineItemChange(index, 'description', e.target.value)
              }
              className='p-2 w-full border rounded-md'
            />
            <input
              type='number'
              placeholder='Amount'
              value={item.amount}
              onChange={e =>
                handleLineItemChange(index, 'amount', e.target.value)
              }
              className='p-2 w-40 border rounded-md'
            />
            <button
              onClick={() => removeLineItem(index)}
              className='p-2 text-red-500 hover:text-red-700'
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addLineItem}
          className='text-sm text-blue-600 hover:underline'
        >
          + Add Line Item
        </button>
      </div>

      <div className='mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='dueDate' className='block text-sm font-medium'>
            Due Date
          </label>
          <input
            type='date'
            id='dueDate'
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className='mt-1 p-2 w-full border rounded-md'
          />
        </div>
        <div>
          <label htmlFor='status' className='block text-sm font-medium'>
            Status
          </label>
          <select
            id='status'
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className='mt-1 p-2 w-full border rounded-md'
          >
            <option value='draft'>Draft</option>
            <option value='sent'>Sent</option>
          </select>
        </div>
      </div>

      <div className='mt-6 border-t pt-4'>
        <h3 className='text-lg font-semibold text-right'>
          Total: ${calculateTotal().toFixed(2)}
        </h3>
      </div>

      <div className='mt-4'>
        <button
          onClick={handleGenerateInvoice}
          disabled={isSaving}
          className='w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300'
        >
          {isSaving ? 'Saving Invoice...' : 'Generate and Save Invoice'}
        </button>
      </div>
    </div>
  );
}
