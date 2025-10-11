import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';

// Define the expected columns for services/products
const REQUIRED_FIELDS = ['name', 'sku', 'default_rate'];

export default function BulkUploadServices({ table = 'services', onComplete }: { table?: string; onComplete?: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  // Parse CSV or Excel
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      Papa.parse(f, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreview(results.data);
        },
        error: (err) => setError('CSV parse error: ' + err.message),
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
        setPreview(json as any[]);
      };
      reader.readAsBinaryString(f);
    } else {
      setError('Unsupported file type. Please upload a CSV or Excel file.');
    }
  };

  // Validate and upload
  const handleUpload = async () => {
    setError(null);
    if (!preview.length) return setError('No data to upload.');
    // Validate required fields
    const missing = REQUIRED_FIELDS.filter(field => !Object.keys(preview[0]).includes(field));
    if (missing.length) return setError('Missing required columns: ' + missing.join(', '));
    setUploading(true);
    // Clean and cast data
    const rows = preview.map(row => ({
      name: String(row.name).trim(),
      sku: row.sku ? String(row.sku).trim() : '',
      default_rate: row.default_rate ? Number(row.default_rate) : 0,
    }));
    // Insert in batches (Supabase limit is 500 rows per insert)
    try {
      for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500);
        const { error: upErr } = await supabase.from(table).insert(batch);
        if (upErr) throw upErr;
      }
      setData([]);
      setFile(null);
      setPreview([]);
      if (onComplete) onComplete();
    } catch (err: any) {
      setError('Upload failed: ' + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2">Bulk Upload Services/Products</h2>
      <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} />
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {preview.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Preview ({preview.length} rows)</h3>
          <div className="overflow-x-auto max-h-64 border rounded">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  {Object.keys(preview[0]).map(col => <th key={col} className="px-2 py-1 border-b bg-gray-50">{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((row, i) => (
                  <tr key={i} className="odd:bg-gray-50">
                    {Object.keys(preview[0]).map(col => <td key={col} className="px-2 py-1 border-b">{row[col]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && <div className="text-xs text-gray-500 p-2">Showing first 10 of {preview.length} rows</div>}
          </div>
          <button onClick={handleUpload} disabled={uploading} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">
            {uploading ? 'Uploading...' : 'Upload All'}
          </button>
        </div>
      )}
    </div>
  );
}
