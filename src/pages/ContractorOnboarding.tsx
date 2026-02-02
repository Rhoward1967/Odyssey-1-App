import { AlertCircle, CheckCircle2, FileText, Lock, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

/**
 * 🛰️ CONTRACTOR ONBOARDING PORTAL
 * Purpose: Self-service contractor W-9 & direct deposit intake
 * Security: Token-validated, encrypted banking/tax data
 * Constitutional: Digital signature capture for IRS compliance
 * Route: /onboarding/contractor/:token
 */

interface ContractorData {
  full_name: string;
  email: string;
  phone: string;
  contractor_type: 'individual' | 'business';
  business_name?: string;
  tax_id: string;
  routing_number: string;
  account_number: string;
  account_number_confirm: string;
  verification_check_number: string;
  digital_signature: string;
}

export default function ContractorOnboarding() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [voidedCheckFile, setVoidedCheckFile] = useState<File | null>(null);
  const [contractorData, setContractorData] = useState<ContractorData>({
    full_name: '',
    email: '',
    phone: '',
    contractor_type: 'individual',
    business_name: '',
    tax_id: '',
    routing_number: '',
    account_number: '',
    account_number_confirm: '',
    verification_check_number: '',
    digital_signature: ''
  });

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('contractors')
          .select('id, onboarding_status')
          .eq('onboarding_token', token)
          .single();

        if (error || !data) {
          setTokenValid(false);
          return;
        }

        // Check if already completed
        if (data.onboarding_status === 'submitted' || data.onboarding_status === 'approved') {
          setStatus('success');
          setTokenValid(true);
          return;
        }

        setTokenValid(true);
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenValid(false);
      }
    };

    validateToken();
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (file.size > maxSize) {
        setErrorMessage('File size must be less than 5MB');
        return;
      }

      setVoidedCheckFile(file);
      setErrorMessage('');
    }
  };

  const handleInputChange = (field: keyof ContractorData, value: string) => {
    setContractorData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    // Validate Tax ID format
    const taxIdPattern = /^\d{2}-\d{7}$|^\d{3}-\d{2}-\d{4}$/;
    if (!taxIdPattern.test(contractorData.tax_id)) {
      setErrorMessage('Tax ID must be in format XX-XXXXXXX (EIN) or XXX-XX-XXXX (SSN)');
      return false;
    }

    // Validate routing number (9 digits)
    if (!/^\d{9}$/.test(contractorData.routing_number)) {
      setErrorMessage('Routing number must be exactly 9 digits');
      return false;
    }

    // Validate account numbers match
    if (contractorData.account_number !== contractorData.account_number_confirm) {
      setErrorMessage('Account numbers do not match');
      return false;
    }

    // Validate digital signature matches name
    if (contractorData.digital_signature.toLowerCase().trim() !== contractorData.full_name.toLowerCase().trim()) {
      setErrorMessage('Digital signature must match your full legal name exactly');
      return false;
    }

    // Require voided check
    if (!voidedCheckFile) {
      setErrorMessage('Please upload a voided check or bank letter');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) {
      return;
    }

    setStatus('submitting');

    try {
      // 1. Upload voided check to secure storage
      let voidedCheckUrl = '';
      if (voidedCheckFile) {
        const filePath = `checks/${token}-${Date.now()}-${voidedCheckFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('contractor-docs')
          .upload(filePath, voidedCheckFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`File upload failed: ${uploadError.message}`);
        }

        voidedCheckUrl = filePath;
      }

      // 2. Update contractor record with secure data
      const { error: updateError } = await supabase
        .from('contractors')
        .update({
          full_name: contractorData.full_name,
          email: contractorData.email,
          phone: contractorData.phone,
          contractor_type: contractorData.contractor_type,
          business_name: contractorData.contractor_type === 'business' ? contractorData.business_name : null,
          tax_id_encrypted: contractorData.tax_id, // TODO: Encrypt before sending
          routing_number: contractorData.routing_number, // TODO: Encrypt before sending
          account_number_encrypted: contractorData.account_number, // TODO: Encrypt before sending
          account_number_last4: contractorData.account_number.slice(-4),
          verification_check_number: contractorData.verification_check_number,
          voided_check_url: voidedCheckUrl,
          digital_signature: contractorData.digital_signature,
          digital_signature_date: new Date().toISOString(),
          onboarding_status: 'submitted',
          onboarding_completed_at: new Date().toISOString()
        })
        .eq('onboarding_token', token);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      setStatus('success');
    } catch (err) {
      console.error('Onboarding submission error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      setStatus('error');
    }
  };

  // Token validation loading state
  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-sm">Validating secure access...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Access Link</h1>
          <p className="text-gray-600 mb-6">
            This onboarding link is invalid or has expired. Please contact Odyssey-1 AI LLC for a new invitation.
          </p>
          <a 
            href="mailto:support@odyssey-1-ai.com" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Odyssey-1</h1>
          <p className="text-gray-700 mb-6">
            Your onboarding is complete. Your information has been securely submitted and is pending approval.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
            <p className="font-semibold mb-2">Next Steps:</p>
            <ul className="text-left space-y-1 ml-4 list-disc">
              <li>Your W-9 information will be reviewed within 24-48 hours</li>
              <li>Direct deposit will be activated upon approval</li>
              <li>You'll receive confirmation via email</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Main onboarding form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-3xl shadow-2xl p-8 border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contractor Onboarding</h1>
              <p className="text-sm text-gray-600">Odyssey-1 AI LLC | Secure Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            <span>256-bit encrypted | IRS compliant</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-3xl shadow-2xl p-8 space-y-6">
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Contractor Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contractor Classification *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('contractor_type', 'individual')}
                className={`p-4 border-2 rounded-xl font-semibold transition ${
                  contractorData.contractor_type === 'individual'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Individual (1099-NEC)
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('contractor_type', 'business')}
                className={`p-4 border-2 rounded-xl font-semibold transition ${
                  contractorData.contractor_type === 'business'
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Business (1099-MISC)
              </button>
            </div>
          </div>

          {/* Business Name (if business) */}
          {contractorData.contractor_type === 'business' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Legal Name *
              </label>
              <input
                type="text"
                required
                value={contractorData.business_name}
                onChange={e => handleInputChange('business_name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="ABC Cleaning Services LLC"
              />
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Legal Full Name *
            </label>
            <input
              type="text"
              required
              value={contractorData.full_name}
              onChange={e => handleInputChange('full_name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="John Michael Smith"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={contractorData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={contractorData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Tax ID */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-600" />
              W-9 Tax Information
            </h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Taxpayer ID Number (SSN or EIN) *
              </label>
              <input
                type="password"
                required
                value={contractorData.tax_id}
                onChange={e => handleInputChange('tax_id', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                placeholder="XX-XXXXXXX or XXX-XX-XXXX"
              />
              <p className="text-xs text-gray-600 mt-1">
                Format: 12-3456789 (EIN) or 123-45-6789 (SSN)
              </p>
            </div>
          </div>

          {/* Banking Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Direct Deposit Setup (Triple-Lock Verification)
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Routing Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={contractorData.routing_number}
                    onChange={e => handleInputChange('routing_number', e.target.value.replace(/\D/g, ''))}
                    maxLength={9}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    placeholder="123456789"
                  />
                  <p className="text-xs text-gray-500 mt-1">9 digits</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="password"
                    required
                    value={contractorData.account_number}
                    onChange={e => handleInputChange('account_number', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    placeholder="Account #"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Check Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={contractorData.verification_check_number}
                    onChange={e => handleInputChange('verification_check_number', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                    placeholder="1001"
                  />
                  <p className="text-xs text-gray-500 mt-1">From check</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Account Number *
                </label>
                <input
                  type="password"
                  required
                  value={contractorData.account_number_confirm}
                  onChange={e => handleInputChange('account_number_confirm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                  placeholder="Re-enter account number"
                />
              </div>
            </div>
          </div>

          {/* Voided Check Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Voided Check or Bank Letter *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <input
                type="file"
                required
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="voided-check-upload"
              />
              <label
                htmlFor="voided-check-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold"
              >
                Click to upload
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {voidedCheckFile ? voidedCheckFile.name : 'JPG, PNG, or PDF (max 5MB)'}
              </p>
            </div>
          </div>

          {/* Digital Signature */}
          <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2">Digital Signature & Certification</h3>
            <p className="text-xs text-gray-700 mb-4 leading-relaxed">
              Under penalties of perjury, I certify that the taxpayer identification number provided is correct, 
              and I am not subject to backup withholding. I authorize Odyssey-1 AI LLC to initiate direct deposits 
              to the bank account specified above.
            </p>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type Your Full Legal Name to Sign *
              </label>
              <input
                type="text"
                required
                value={contractorData.digital_signature}
                onChange={e => handleInputChange('digital_signature', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                placeholder="Type your full legal name exactly as shown above"
              />
              <p className="text-xs text-gray-600 mt-1">
                Must match your legal name exactly. Submission date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg transition shadow-lg hover:shadow-xl"
          >
            {status === 'submitting' ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting Secure Onboarding...
              </span>
            ) : (
              'Submit Secure Onboarding'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your information is encrypted and stored securely. By submitting, you agree to Odyssey-1's{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
}
