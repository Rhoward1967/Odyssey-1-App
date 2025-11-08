import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const industries = [
  'Plumber', 'Electrician', 'Lawyer', 'Baker', 'Consultant',
  'Construction', 'Healthcare', 'Retail', 'Technology', 'Finance',
  'Real Estate', 'Food Service', 'Marketing', 'Design', 'Education',
  'Automotive', 'Cleaning Services'
];

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Get tier info from pricing page
  const selectedTier = location.state?.selectedTier || null;
  const selectedPrice = location.state?.selectedPrice || null;
  const fromPricing = location.state?.fromPricing || false;

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    industry: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      // Load existing profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setFormData({
          fullName: profile.full_name || '',
          businessName: profile.business_name || '',
          industry: profile.industry || '',
          phone: profile.phone || '',
          website: profile.website || ''
        });
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: formData.fullName,
          business_name: formData.businessName,
          industry: formData.industry,
          phone: formData.phone,
          website: formData.website,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // If coming from pricing, redirect to payment
      if (fromPricing && selectedTier) {
        navigate('/checkout', { 
          state: { 
            tier: selectedTier,
            price: selectedPrice,
            industry: formData.industry
          }
        });
      } else {
        // Regular profile update
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {fromPricing ? 'Complete Your Profile' : 'Profile Settings'}
            </CardTitle>
            <CardDescription>
              {fromPricing && selectedTier && (
                <span className="text-primary font-semibold">
                  Selected Plan: {selectedTier} ({selectedPrice}/month)
                </span>
              )}
              {fromPricing ? ' Choose your industry to unlock shape-shifting themes!' : ' Update your profile information'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="industry">
                  Industry * {fromPricing && '(Unlocks Your Shape-Shifting Theme!)'}
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry.toLowerCase()}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (fromPricing ? 'Continue to Payment' : 'Save Changes')}
                </Button>
                {!fromPricing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {fromPricing && formData.industry && (
          <Card className="mt-6 bg-primary/10">
            <CardContent className="pt-6">
              <p className="text-center font-semibold">
                🎨 Shape-Shifting Preview
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                After payment, your site will instantly transform into a premium {formData.industry} theme!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}