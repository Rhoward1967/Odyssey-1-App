import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Calculator, Calendar, FileText } from 'lucide-react';

interface IndustryDemoProps {
  isOpen: boolean;
  onClose: () => void;
  industry: {
    name: string;
    icon: string;
    revenue: string;
    roi: string;
    clients: string;
    growth: string;
  };
}


export const IndustryDemo: React.FC<IndustryDemoProps> = ({ isOpen, onClose, industry }) => {
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFeatures = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('industry_features')
          .select('feature')
          .eq('industry', industry.name)
          .order('feature');
        if (error) throw error;
        setFeatures((data || []).map((row: any) => row.feature));
      } catch {
        setFeatures([]);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen && industry?.name) fetchFeatures();
  }, [isOpen, industry]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center">
            <span className="text-3xl mr-3">{industry.icon}</span>
            How ODYSSEY-1 Works for {industry.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Industry-Specific AI Features</h3>
              {loading ? (
                <div className="text-gray-400">Loading features...</div>
              ) : features.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400">No features found for this industry.</div>
              )}
            </CardContent>
          </Card>
          {/* Optionally, fetch and display dynamic cards for ROI, Demo, Case Study if available from backend */}
        </div>
      </DialogContent>
    </Dialog>
  );
};