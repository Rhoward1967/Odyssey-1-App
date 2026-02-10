import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, AlertTriangle, FileText, Upload } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface CertifiedMailTracking {
  id: string;
  entity_name: string;
  entity_type: string;
  tracking_number: string;
  mail_date: string;
  delivery_date: string | null;
  response_deadline: string;
  response_received: boolean;
  response_date: string | null;
  verification_provided: boolean;
  notes: string | null;
  created_at: string;
}

export default function FCRAComplianceTracker() {
  const [trackingData, setTrackingData] = useState<CertifiedMailTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  useEffect(() => {
    loadTrackingData();
  }, []);

  async function loadTrackingData() {
    try {
      const { data, error } = await supabase
        .from('certified_mail_tracking')
        .select('*')
        .order('response_deadline', { ascending: true });

      if (error) throw error;
      setTrackingData(data || []);
    } catch (error) {
      console.error('Error loading tracking data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateResponse(id: string, updates: Partial<CertifiedMailTracking>) {
    try {
      const { error } = await supabase
        .from('certified_mail_tracking')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadTrackingData();
    } catch (error) {
      console.error('Error updating tracking data:', error);
    }
  }

  function getStatusBadge(item: CertifiedMailTracking) {
    const daysUntilDeadline = differenceInDays(new Date(item.response_deadline), new Date());

    if (item.response_received) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Response Received
        </Badge>
      );
    }

    if (daysUntilDeadline < 0) {
      return (
        <Badge className="bg-red-500">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue ({Math.abs(daysUntilDeadline)} days)
        </Badge>
      );
    }

    if (daysUntilDeadline <= 7) {
      return (
        <Badge className="bg-amber-500">
          <Clock className="h-3 w-3 mr-1" />
          {daysUntilDeadline} days remaining
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-500">
        <Clock className="h-3 w-3 mr-1" />
        {daysUntilDeadline} days remaining
      </Badge>
    );
  }

  function getSummaryStats() {
    const total = trackingData.length;
    const responded = trackingData.filter(t => t.response_received).length;
    const overdue = trackingData.filter(t => {
      const daysUntil = differenceInDays(new Date(t.response_deadline), new Date());
      return daysUntil < 0 && !t.response_received;
    }).length;
    const pending = total - responded - overdue;

    return { total, responded, overdue, pending };
  }

  const stats = getSummaryStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            FCRA Compliance Tracker
          </CardTitle>
          <CardDescription>
            15 USC §1692g - Debt Validation Tracking (30-Day Response Window)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Mailings</div>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.responded}</div>
              <div className="text-sm text-muted-foreground">Responded</div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</div>
              <div className="text-sm text-muted-foreground">Non-Responsive</div>
            </div>
          </div>

          <div className="space-y-4">
            {trackingData.map(item => {
              const daysUntilDeadline = differenceInDays(new Date(item.response_deadline), new Date());
              
              return (
                <Card key={item.id} className={`${daysUntilDeadline < 0 && !item.response_received ? 'border-red-500' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.entity_name}</CardTitle>
                        <CardDescription className="mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {item.entity_type}
                            </Badge>
                            <span className="text-xs ml-2">Tracking: {item.tracking_number}</span>
                          </span>
                        </CardDescription>
                      </div>
                      {getStatusBadge(item)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground mb-1">Mail Date</div>
                        <div className="font-medium">{format(new Date(item.mail_date), 'MMM d, yyyy')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Delivery Date</div>
                        <div className="font-medium">
                          {item.delivery_date ? format(new Date(item.delivery_date), 'MMM d, yyyy') : 'Pending'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Response Deadline</div>
                        <div className="font-medium">{format(new Date(item.response_deadline), 'MMM d, yyyy')}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Days Remaining</div>
                        <div className={`font-bold ${daysUntilDeadline < 0 ? 'text-red-600' : daysUntilDeadline <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
                          {daysUntilDeadline < 0 ? `Overdue by ${Math.abs(daysUntilDeadline)}` : daysUntilDeadline}
                        </div>
                      </div>
                    </div>

                    {!item.response_received && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateResponse(item.id, {
                            response_received: true,
                            response_date: new Date().toISOString(),
                          })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Response Received
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const notes = prompt('Add notes about this entity:');
                            if (notes) {
                              updateResponse(item.id, { notes });
                            }
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Add Notes
                        </Button>
                      </div>
                    )}

                    {item.response_received && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            Response received on {item.response_date ? format(new Date(item.response_date), 'MMM d, yyyy') : 'unknown date'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.verification_provided}
                            onChange={(e) => updateResponse(item.id, { verification_provided: e.target.checked })}
                            className="h-4 w-4"
                          />
                          <label className="text-sm">
                            Verification provided (original contract or acceptable proof)
                          </label>
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded text-sm">
                        <div className="font-medium mb-1">Notes:</div>
                        <div className="text-muted-foreground">{item.notes}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
