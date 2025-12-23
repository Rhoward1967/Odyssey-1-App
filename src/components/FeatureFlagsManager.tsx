import { useAuth } from '@/components/AuthProvider'; // Needed to get user for RLS
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabaseClient';
import { Flag } from 'lucide-react';
import { useEffect, useState } from 'react';

// Define the structure of a feature flag from the database
interface FeatureFlag {
  id: number; // Assuming ID is bigint/number, adjust if UUID
  organization_id: number; // Assuming bigint, adjust if UUID
  key: string;
  description: string | null;
  is_enabled: boolean;
  category: string | null; // Assuming category is optional
  updated_at: string;
  updated_by: string; // Assuming UUID
}

// Helper to get the user's current organization ID (replace with your actual logic)
async function getCurrentOrganizationId(userId: string): Promise<number | null> {
  // --- Replace this with your actual logic ---
  // Example: Fetch the first organization the user belongs to
  const { data, error } = await supabase
    .from('user_organizations')
    .select('organization_id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error || !data) {
    console.error("Could not determine user's organization:", error);
    return null; // Handle cases where user isn't in an org
  }
  return data.organization_id;
  // --- End of placeholder logic ---
}


export default function FeatureFlagsManager() {
  const { user } = useAuth(); // Get the real or fake user
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null); // Use key for toggling state
  const [organizationId, setOrganizationId] = useState<number | null>(null);

  // Fetch flags from Supabase
  const fetchFlags = async (orgId: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('organization_id', orgId) // Filter by the user's organization
        .order('key', { ascending: true });

      if (fetchError) throw fetchError;
      setFlags(data || []);
    } catch (err: any) {
      console.error("Error fetching feature flags:", err);
      setError("Failed to load feature flags. Check RLS policies.");
      setFlags([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to get Organization ID and fetch initial flags
  useEffect(() => {
    // Check if we're in bypass mode - use demo data
    if (import.meta.env.VITE_AUTH_BYPASS === "true") {
      console.log('🚪 Using demo feature flags data (bypass mode)');
      const demoFlags = [
        { id: 1, organization_id: 1, key: 'admin_control_panel', description: 'Enable advanced admin control panel features', is_enabled: true, category: 'System', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 2, organization_id: 1, key: 'time_clock_management', description: 'Enable employee time clock management system', is_enabled: true, category: 'System', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 3, organization_id: 1, key: 'advanced_ai_features', description: 'Enable R.O.M.A.N. AI integration and advanced processing', is_enabled: false, category: 'AI', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 4, organization_id: 1, key: 'realtime_collaboration', description: 'Enable real-time collaborative editing and updates', is_enabled: false, category: 'UI', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 5, organization_id: 1, key: 'enhanced_security_mode', description: 'Enable enhanced security protocols and authentication', is_enabled: true, category: 'Security', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 6, organization_id: 1, key: 'quantum_processing', description: 'Enable experimental quantum processing capabilities', is_enabled: false, category: 'Experimental', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 7, organization_id: 1, key: 'automated_reporting', description: 'Enable automated report generation and scheduling', is_enabled: true, category: 'System', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 8, organization_id: 1, key: 'dark_mode_ui', description: 'Enable dark mode interface theming', is_enabled: true, category: 'UI', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 9, organization_id: 1, key: 'biometric_auth', description: 'Enable biometric authentication methods', is_enabled: false, category: 'Security', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' },
        { id: 10, organization_id: 1, key: 'predictive_analytics', description: 'Enable AI-powered predictive analytics', is_enabled: false, category: 'AI', updated_at: new Date().toISOString(), updated_by: 'dev-user-id' }
      ];
      setFlags(demoFlags);
      setOrganizationId(1); // Demo org ID
      setError("Demo Mode: Showing sample feature flags data");
      setLoading(false);
      return;
    }

    if (user) {
      getCurrentOrganizationId(user.id).then(orgId => {
        if (orgId) {
          setOrganizationId(orgId);
          fetchFlags(orgId);
        } else {
          setError("Could not determine your organization membership.");
          setLoading(false);
        }
      });
    } else {
       // Handle case where user is null (e.g., during initial load or logout)
       setError("You must be logged in to manage feature flags.");
       setLoading(false);
    }
  }, [user]); // Re-run if user changes


  // Set up Supabase Realtime subscription
  useEffect(() => {
    if (!organizationId) return; // Don't subscribe until we have an org ID

    const channel = supabase
      .channel(`feature_flags_org_${organizationId}`) // Org-specific channel
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'feature_flags',
          filter: `organization_id=eq.${organizationId}` // Only listen for this org's flags
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Re-fetch flags to ensure consistency, or apply diffs carefully
          fetchFlags(organizationId);
        }
      )
      .subscribe((status, err) => {
         if (status === 'SUBSCRIBED') {
           console.log(`Realtime connected for org ${organizationId}`);
         }
         if (status === 'CHANNEL_ERROR') {
            console.error('Realtime channel error:', err);
         }
      });

    // Clean up subscription on unmount or org change
    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId]); // Re-subscribe if organizationId changes

  // Function to handle toggling a flag
  const handleToggleFlag = async (flagKey: string) => {
    if (!organizationId) {
       setError("Cannot toggle flag: Organization ID not found.");
       return;
    }
    setTogglingId(flagKey); // Show loading state for this specific switch
    setError(null);
    
    // Handle bypass mode - just update local state
    if (import.meta.env.VITE_AUTH_BYPASS === "true") {
      console.log(`🚪 Demo toggle: ${flagKey} -> flipping state`);
      setFlags(currentFlags => 
        currentFlags.map(f => 
          f.key === flagKey ? {...f, is_enabled: !f.is_enabled} : f
        )
      );
      setTogglingId(null);
      return;
    }
    
    try {
      const { error: invokeError } = await supabase.functions.invoke('feature-flags-toggler', {
        body: {
          key: flagKey,
          organization_id: organizationId, // Pass the organization ID
          // Omitting is_enabled flips the value
        },
      });
      if (invokeError) throw invokeError;
      // Realtime listener should update the UI automatically
    } catch (err: any) {
      console.error('Error toggling flag:', err);
      setError(`Failed to toggle flag "${flagKey}". Error: ${err.message}`);
      // Re-fetch to revert optimistic UI if needed
      fetchFlags(organizationId);
    } finally {
      setTogglingId(null); // Hide loading state
    }
  };

  // Group flags by category for display
  const groupedFlags: { [key: string]: FeatureFlag[] } = flags.reduce((acc, flag) => {
    const category = flag.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(flag);
    return acc;
  }, {} as { [key: string]: FeatureFlag[] });


  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5" /> Feature Flags Management
        </CardTitle>
        <CardDescription>
          Enable or disable application features for your organization. Changes take effect in real-time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading feature flags...</p>}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!loading && !error && flags.length === 0 && (
           <p>No feature flags found for this organization.</p>
        )}
        {!loading && !error && flags.length > 0 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>Total Flags: {flags.length}</span>
              <span>Enabled: {flags.filter(f => f.is_enabled).length}</span>
            </div>
            {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-3 border-b pb-1">{category}</h3>
                <div className="space-y-4">
                  {categoryFlags.map((flag) => (
                    <div key={flag.key} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div>
                        <p className="font-medium">{flag.key}</p>
                        {flag.description && <p className="text-sm text-gray-500 dark:text-gray-400">{flag.description}</p>}
                      </div>
                      <Switch
                        checked={flag.is_enabled}
                        onCheckedChange={() => handleToggleFlag(flag.key)}
                        disabled={togglingId === flag.key}
                        aria-label={`Toggle ${flag.key}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}