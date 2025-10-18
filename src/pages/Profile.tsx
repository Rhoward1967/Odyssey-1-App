import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider'; // We need the user's session
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
  const { user } = useAuth(); // Get the currently logged-in user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{ email: string | undefined }>({ email: '' });

  useEffect(() => {
    // We only run the fetch if we have a user from the auth context
    if (user) {
      const fetchProfile = async () => {
        try {
          // This query is protected by the RLS policy we just created.
          // It will only return the row where the 'id' matches the logged-in user's ID.
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(); // We expect only one row

          if (error) throw error;

          // For now, we'll just display the user's email from the auth session.
          // In the future, we'll display data from the 'profiles' table itself.
          setProfileData({ email: user.email });

        } catch (err: any) {
          console.error("Error fetching profile:", err);
          setError("Failed to load profile data.");
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [user]); // This effect runs whenever the user object changes

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading profile...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            <p className="font-medium">Email Address</p>
            <p className="text-gray-600 dark:text-gray-300">{profileData.email}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}