import React from 'react';

// Placeholder for future: agreements, invoices, jobs, emails, payroll, HR, etc.
export interface CustomerProfileData {
  id: string;
  customer_name: string;
  email?: string;
  address?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  agreements?: any[];
  invoices?: any[];
  jobs?: any[];
  emails?: any[];
  payroll?: any[];
  hr?: any[];
  attachments?: any[];
}

interface CustomerProfileProps {
  customer: CustomerProfileData;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{customer.customer_name}</h2>
          <div className="text-gray-600 text-sm">{customer.email}</div>
          <div className="text-gray-600 text-sm">{customer.phone}</div>
          <div className="text-gray-600 text-sm">{customer.address}</div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {customer.tags?.map(tag => (
            <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">{tag}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Notes</h3>
          <div className="bg-gray-50 p-3 rounded min-h-[60px] text-gray-700">{customer.notes || 'No notes yet.'}</div>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Agreements</h3>
          <ul className="bg-gray-50 p-3 rounded min-h-[60px] text-gray-700">
            {customer.agreements?.length ? customer.agreements.map((a, i) => (
              <li key={i}>{a.title || 'Agreement'} ({a.status || 'Active'})</li>
            )) : <li>No agreements yet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Invoices</h3>
          <ul className="bg-gray-50 p-3 rounded min-h-[60px] text-gray-700">
            {customer.invoices?.length ? customer.invoices.map((inv, i) => (
              <li key={i}>Invoice #{inv.invoice_number} - ${inv.total_amount} ({inv.status})</li>
            )) : <li>No invoices yet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Jobs / Leads</h3>
          <ul className="bg-gray-50 p-3 rounded min-h-[60px] text-gray-700">
            {customer.jobs?.length ? customer.jobs.map((job, i) => (
              <li key={i}>{job.title || 'Job'} ({job.status || 'Open'})</li>
            )) : <li>No jobs or leads yet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Emails</h3>
          <ul className="bg-gray-50 p-3 rounded min-h-[60px] text-gray-700">
            {customer.emails?.length ? customer.emails.map((email, i) => (
              <li key={i}>{email.subject || 'Email'} ({email.date || ''})</li>
            )) : <li>No emails yet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Payroll / HR</h3>
          <ul className="bg-gray-50 p-3 rounded min-h-[60px] text-gray-700">
            {customer.payroll?.length ? customer.payroll.map((p, i) => (
              <li key={i}>{p.type || 'Payroll'} ({p.status || ''})</li>
            )) : <li>No payroll/HR records yet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-2">Attachments</h3>
          <ul className="bg-gray-50 p-3 rounded min-h-[60px] text-gray-700">
            {customer.attachments?.length ? customer.attachments.map((a, i) => (
              <li key={i}><a href={a.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{a.name || 'Attachment'}</a></li>
            )) : <li>No attachments yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
