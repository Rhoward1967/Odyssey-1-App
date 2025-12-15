import { useState } from 'react';

import { supabase } from '@/lib/supabaseClient';
import Papa from 'papaparse';

export type CsvRow = {
  // Google Contacts format
  'First Name'?: string;
  'Last Name'?: string;
  'Company'?: string;
  'Email 1 - Value'?: string;
  'Phone 1 - Value'?: string;
  'Address 1 - Street'?: string;
  'Address 1 - City'?: string;
  'Address 1 - Region'?: string;
  'Address 1 - Postal Code'?: string;
  // Outlook/Microsoft format
  'E-mail Address'?: string;
  'E-mail 2 Address'?: string;
  'Mobile Phone'?: string;
  'Primary Phone'?: string;
  'Business Phone'?: string;
  'Home Phone'?: string;
  'Home Address'?: string;
  'Home Street'?: string;
  'Home City'?: string;
  'Home State'?: string;
  'Home Postal Code'?: string;
  'Business Address'?: string;
  'Business Street'?: string;
  'Business City'?: string;
  'Business State'?: string;
  'Business Postal Code'?: string;
};

const chunk = <T,>(arr: T[], size: number) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const transform = (r: CsvRow, userId?: string) => {
  // Helper to normalize empty strings to null
  const normalize = (val?: string) => {
    const trimmed = val?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : null;
  };

  return {
    first_name: normalize(r['First Name']),
    last_name: normalize(r['Last Name']),
    company_name: normalize(r['Company']),
    // Support both Google and Outlook formats for email
    email: normalize(r['Email 1 - Value']) || normalize(r['E-mail Address']) || normalize(r['E-mail 2 Address']),
    // Support multiple phone formats
    phone: normalize(r['Phone 1 - Value']) || normalize(r['Mobile Phone']) || normalize(r['Primary Phone']) || normalize(r['Business Phone']) || normalize(r['Home Phone']),
    customer_name:
      normalize(r['Company']) ||
      [normalize(r['First Name']), normalize(r['Last Name'])].filter(Boolean).join(' ') ||
      null,
    // Support both formats for addresses
    address: normalize(r['Address 1 - Street']) || normalize(r['Business Street']) || normalize(r['Home Street']) || normalize(r['Home Address']) || normalize(r['Business Address']),
    billing_address_line1: normalize(r['Address 1 - Street']) || normalize(r['Business Street']) || normalize(r['Home Street']),
    billing_city: normalize(r['Address 1 - City']) || normalize(r['Business City']) || normalize(r['Home City']),
    billing_state: normalize(r['Address 1 - Region']) || normalize(r['Business State']) || normalize(r['Home State']),
    billing_zip: normalize(r['Address 1 - Postal Code']) || normalize(r['Business Postal Code']) || normalize(r['Home Postal Code']),
    source: 'csv_upload',
    user_id: userId || null,
  };
};


export function CsvCustomerUploader() {
  const [progress, setProgress] = useState({ processed: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const onFile = async (file: File) => {
    setErrors([]);
    setSuccess(false);
    // Get the current user id for strict RLS
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      worker: true,
      complete: async (res) => {
        const rows = res.data.map((r) => transform(r, userId));
        
        // Deduplicate by email (keep last occurrence)
        const dedupeMap = new Map<string, typeof rows[0]>();
        for (const row of rows) {
          // Use email as key, or if no email, use a unique combo
          const key = row.email || `${row.user_id}:${row.customer_name}:${row.phone}`;
          dedupeMap.set(key, row);
        }
        const deduped = Array.from(dedupeMap.values());
        
        console.log(`📊 CSV rows: ${rows.length}, After dedup: ${deduped.length}`);
        console.log('📋 Sample transformed row:', deduped[0]);
        console.log('🔍 CRITICAL DATA CHECK:');
        console.log('   - email:', deduped[0]?.email);
        console.log('   - phone:', deduped[0]?.phone);
        console.log('   - billing_city:', deduped[0]?.billing_city);
        console.log('   - customer_name:', deduped[0]?.customer_name);
        
        const batches = chunk(deduped, 300);
        setProgress({ processed: 0, total: deduped.length });
        let hasErrors = false;
        for (let i = 0; i < batches.length; i++) {
          const { error } = await supabase
            .from('customers')
            .insert(batches[i]); // Use INSERT instead of UPSERT for new imports
          if (error) {
            console.error('❌ Batch error:', error);
            console.error('❌ Failed data sample:', batches[i][0]);
            setErrors((e) => [...e, `Batch ${i + 1}: ${error.message}`]);
            hasErrors = true;
          }
          setProgress((p) => ({ ...p, processed: Math.min(p.processed + batches[i].length, deduped.length) }));
        }
        if (!hasErrors && errors.length === 0) {
          setSuccess(true);
        }
      },
      error: (err) => setErrors((e) => [...e, err.message]),
    });
  };

  return (
    <div style={{ margin: '2em 0' }}>
      <label style={{ fontWeight: 'bold' }}>Bulk Import Customers (CSV):</label>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
        style={{ display: 'block', margin: '1em 0' }}
      />
      <div>Progress: {progress.processed} / {progress.total}</div>
      {success && errors.length === 0 && progress.total > 0 && (
        <div style={{ color: 'green', marginTop: 8 }}>All contacts imported successfully!</div>
      )}
      {errors.length > 0 && (
        <div style={{ color: 'red', marginTop: 8 }}>
          <strong>Errors</strong>
          <ul>{errors.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </div>
      )}
      <div style={{ fontSize: '0.9em', color: '#555', marginTop: 12 }}>
        <div>CSV columns supported: First Name, Last Name, Company, Email 1 - Value, Email 2 - Value, Phone 1 - Value, Phone 2 - Value, Address 1 - Street, Address 1 - City, Address 1 - Region, Address 1 - Postal Code, Address 1 - Country, Notes, Labels</div>
        <div>Labels can be separated by <code>:::</code></div>
      </div>
    </div>
  );
}
