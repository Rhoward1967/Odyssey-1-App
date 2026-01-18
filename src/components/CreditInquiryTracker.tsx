import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabaseClient';
import { AlertTriangle, CheckCircle2, FileText, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CreditInquiry {
  id: string;
  inquiryDate: Date;
  creditorName: string;
  inquiryType: 'hard' | 'soft' | 'account_review' | 'promotional' | 'unknown';
  inquiryPurpose?: string;
  wasAuthorized: boolean;
  isViolation: boolean;
  violationType?: string;
  disputeSent: boolean;
  disputeDate?: Date;
  status: 'pending' | 'disputed' | 'removed' | 'verified' | 'settled';
  removedDate?: Date;
  statutoryDamages: number;
  bureau?: 'equifax' | 'experian' | 'transunion' | 'all';
  notes?: string;
}

export default function CreditInquiryTracker() {
  const [inquiries, setInquiries] = useState<CreditInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [newInquiry, setNewInquiry] = useState({
    inquiryDate: '',
    creditorName: '',
    inquiryType: 'hard' as CreditInquiry['inquiryType'],
    inquiryPurpose: '',
    wasAuthorized: false,
    bureau: 'equifax' as CreditInquiry['bureau'],
    notes: ''
  });

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('credit_inquiries')
        .select('*')
        .order('inquiry_date', { ascending: false });

      if (error) throw error;

      if (data) {
        setInquiries(data.map(row => ({
          id: row.id,
          inquiryDate: new Date(row.inquiry_date),
          creditorName: row.creditor_name,
          inquiryType: row.inquiry_type,
          inquiryPurpose: row.inquiry_purpose,
          wasAuthorized: row.was_authorized,
          isViolation: row.is_violation,
          violationType: row.violation_type,
          disputeSent: row.dispute_sent,
          disputeDate: row.dispute_date ? new Date(row.dispute_date) : undefined,
          status: row.status,
          removedDate: row.removed_date ? new Date(row.removed_date) : undefined,
          statutoryDamages: parseFloat(row.statutory_damages || 0),
          bureau: row.bureau,
          notes: row.notes
        })));
      }
    } catch (error) {
      console.error('Error loading inquiries:', error);
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const addInquiry = async () => {
    if (!newInquiry.inquiryDate || !newInquiry.creditorName) {
      alert('Please fill in inquiry date and creditor name');
      return;
    }

    try {
      const { error } = await supabase
        .from('credit_inquiries')
        .insert({
          inquiry_date: newInquiry.inquiryDate,
          creditor_name: newInquiry.creditorName,
          inquiry_type: newInquiry.inquiryType,
          inquiry_purpose: newInquiry.inquiryPurpose || null,
          was_authorized: newInquiry.wasAuthorized,
          is_violation: !newInquiry.wasAuthorized, // Unauthorized = violation
          violation_type: !newInquiry.wasAuthorized ? 'Unauthorized credit inquiry without permissible purpose' : null,
          statutory_damages: !newInquiry.wasAuthorized ? 1000 : 0, // FCRA statutory damages
          bureau: newInquiry.bureau,
          notes: newInquiry.notes || null
        });

      if (error) throw error;

      await loadInquiries();
      setShowAdd(false);
      setNewInquiry({
        inquiryDate: '',
        creditorName: '',
        inquiryType: 'hard',
        inquiryPurpose: '',
        wasAuthorized: false,
        bureau: 'equifax',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding inquiry:', error);
      alert('Failed to add inquiry');
    }
  };

  const markDisputed = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credit_inquiries')
        .update({
          dispute_sent: true,
          dispute_date: new Date().toISOString().split('T')[0],
          status: 'disputed'
        })
        .eq('id', id);

      if (error) throw error;
      await loadInquiries();
    } catch (error) {
      console.error('Error marking disputed:', error);
    }
  };

  const markRemoved = async (id: string) => {
    try {
      const { error } = await supabase
        .from('credit_inquiries')
        .update({
          status: 'removed',
          removed_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;
      await loadInquiries();
    } catch (error) {
      console.error('Error marking removed:', error);
    }
  };

  const totalViolations = inquiries.filter(i => i.isViolation && i.status !== 'removed').length;
  const totalDamages = inquiries
    .filter(i => i.isViolation && i.status !== 'removed')
    .reduce((sum, i) => sum + i.statutoryDamages, 0);
  const removedCount = inquiries.filter(i => i.status === 'removed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="text-sm text-slate-400">Total Inquiries</div>
            <div className="text-2xl font-bold text-white">{inquiries.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-red-900/50">
          <CardContent className="p-4">
            <div className="text-sm text-red-400">FCRA Violations</div>
            <div className="text-2xl font-bold text-red-400">{totalViolations}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-green-900/50">
          <CardContent className="p-4">
            <div className="text-sm text-green-400">Statutory Damages</div>
            <div className="text-2xl font-bold text-green-400">${totalDamages.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Inquiry Button */}
      <Button onClick={() => setShowAdd(true)} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="w-4 h-4 mr-2" />
        Add Credit Inquiry
      </Button>

      {/* Inquiries List */}
      <div className="space-y-3">
        {inquiries.map(inquiry => (
          <Card key={inquiry.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white">{inquiry.creditorName}</h3>
                    {inquiry.isViolation && (
                      <Badge variant="destructive" className="bg-red-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        FCRA Violation
                      </Badge>
                    )}
                    {inquiry.status === 'removed' && (
                      <Badge className="bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Removed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div className="text-slate-400">
                      Date: <span className="text-white">{inquiry.inquiryDate.toLocaleDateString()}</span>
                    </div>
                    <div className="text-slate-400">
                      Type: <span className="text-white capitalize">{inquiry.inquiryType.replace('_', ' ')}</span>
                    </div>
                    {inquiry.inquiryPurpose && (
                      <div className="text-slate-400">
                        Purpose: <span className="text-white">{inquiry.inquiryPurpose}</span>
                      </div>
                    )}
                    {inquiry.bureau && (
                      <div className="text-slate-400">
                        Bureau: <span className="text-white capitalize">{inquiry.bureau}</span>
                      </div>
                    )}
                    {inquiry.isViolation && (
                      <div className="text-slate-400">
                        Damages: <span className="text-red-400 font-semibold">${inquiry.statutoryDamages.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {inquiry.notes && (
                    <p className="text-slate-300 text-sm mt-2">{inquiry.notes}</p>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  {inquiry.isViolation && !inquiry.disputeSent && inquiry.status !== 'removed' && (
                    <Button 
                      onClick={() => markDisputed(inquiry.id)}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Mark Disputed
                    </Button>
                  )}
                  {inquiry.disputeSent && inquiry.status !== 'removed' && (
                    <Button 
                      onClick={() => markRemoved(inquiry.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Removed
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {inquiries.length === 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No credit inquiries tracked yet</p>
              <p className="text-slate-500 text-sm mt-1">Add inquiries from your credit report to track violations</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Inquiry Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-white">Add Credit Inquiry</CardTitle>
              <CardDescription className="text-slate-400">Track unauthorized credit report pulls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inquiryDate" className="text-white">Inquiry Date *</Label>
                  <Input
                    id="inquiryDate"
                    type="date"
                    value={newInquiry.inquiryDate}
                    onChange={(e) => setNewInquiry({...newInquiry, inquiryDate: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="creditorName" className="text-white">Creditor/Company Name *</Label>
                  <Input
                    id="creditorName"
                    value={newInquiry.creditorName}
                    onChange={(e) => setNewInquiry({...newInquiry, creditorName: e.target.value})}
                    className="bg-slate-900 border-slate-700 text-white"
                    placeholder="e.g., CITIBANK NA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inquiryType" className="text-white">Inquiry Type</Label>
                  <select
                    id="inquiryType"
                    value={newInquiry.inquiryType}
                    onChange={(e) => setNewInquiry({...newInquiry, inquiryType: e.target.value as CreditInquiry['inquiryType']})}
                    className="w-full bg-slate-900 border-slate-700 text-white rounded-md p-2"
                  >
                    <option value="hard">Hard Inquiry</option>
                    <option value="soft">Soft Inquiry</option>
                    <option value="account_review">Account Review</option>
                    <option value="promotional">Promotional</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bureau" className="text-white">Credit Bureau</Label>
                  <select
                    id="bureau"
                    value={newInquiry.bureau}
                    onChange={(e) => setNewInquiry({...newInquiry, bureau: e.target.value as CreditInquiry['bureau']})}
                    className="w-full bg-slate-900 border-slate-700 text-white rounded-md p-2"
                  >
                    <option value="equifax">Equifax</option>
                    <option value="experian">Experian</option>
                    <option value="transunion">TransUnion</option>
                    <option value="all">All Bureaus</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inquiryPurpose" className="text-white">Purpose (as shown on report)</Label>
                <Input
                  id="inquiryPurpose"
                  value={newInquiry.inquiryPurpose}
                  onChange={(e) => setNewInquiry({...newInquiry, inquiryPurpose: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="e.g., Account Review Inquiry, CONS RPT"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="wasAuthorized"
                  checked={newInquiry.wasAuthorized}
                  onChange={(e) => setNewInquiry({...newInquiry, wasAuthorized: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label htmlFor="wasAuthorized" className="text-white">
                  I authorized this credit check
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-white">Notes</Label>
                <Textarea
                  id="notes"
                  value={newInquiry.notes}
                  onChange={(e) => setNewInquiry({...newInquiry, notes: e.target.value})}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowAdd(false)} variant="outline" className="border-slate-600">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={addInquiry} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inquiry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
