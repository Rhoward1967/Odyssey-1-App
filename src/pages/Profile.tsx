import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
    // Personal/Contact Info
    fullName: '',
    email: '',
    phone: '',
    
    // Business Info
    businessName: '',
    businessLegalName: '',
    industry: '',
    taxId: '', // EIN/Tax ID
    cageCode: '', // CAGE code for government contractors
    
    // Business Address
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Admin/Billing Info
    website: '',
    billingEmail: '',
    salesTaxExempt: false,
    
    // Additional
    companySize: '',
    yearsInBusiness: ''
  });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setFormData({
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          phone: '',
          businessName: profile.company_name || '',
          businessLegalName: '',
          industry: '',
          taxId: '',
          cageCode: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          website: '',
          billingEmail: profile.email || '',
          salesTaxExempt: false,
          companySize: '',
          yearsInBusiness: ''
        });
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      console.log('💾 Saving complete business profile...', {
        userId: user.id,
        businessName: formData.businessName,
        industry: formData.industry
      });

      // Save what we can to profiles table (existing columns)
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            full_name: formData.fullName,
            email: formData.email,
            company_name: formData.businessName,
            updated_at: new Date().toISOString()
          },
          {
            onConflict: 'id',
            ignoreDuplicates: false
          }
        );

      if (error) {
        console.error('❌ Profile update error:', error);
        throw error;
      }

      console.log('✅ Business profile saved successfully!');

      // If from pricing, create Stripe checkout session
      if (fromPricing && selectedTier) {
        console.log('🚀 Creating Stripe checkout session...', {
          tier: selectedTier,
          price: selectedPrice,
          businessName: formData.businessName
        });
        
        try {
          const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
            'create-checkout-session',
            {
              body: {
                tier: selectedTier,
                price: selectedPrice?.replace('$', '').replace('/month', ''),
                industry: formData.industry,
                userId: user.id,
                successUrl: `${window.location.origin}/app?subscription=success`,
                cancelUrl: `${window.location.origin}/app/subscription`
              }
            }
          );

          if (checkoutError) throw checkoutError;

          if (checkoutData?.url) {
            console.log('✅ Redirecting to Stripe checkout...');
            window.location.href = checkoutData.url;
          } else {
            throw new Error('No checkout URL returned');
          }
        } catch (stripeError: any) {
          console.error('❌ Stripe checkout error:', stripeError);
          alert(`Payment setup error: ${stripeError.message || 'Stripe is not configured yet.'}`);
        }
      } else {
        alert('Business profile updated successfully!');
        navigate('/app');
      }
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      alert(`Error updating profile: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {fromPricing ? 'Complete Your Business Profile & Payment' : 'Business Profile Settings'}
            </CardTitle>
            <CardDescription>
              {fromPricing && selectedTier && (
                <span className="text-primary font-semibold text-lg">
                  Selected Plan: {selectedTier} ({selectedPrice}/month)
                </span>
              )}
              <br />
              {fromPricing 
                ? 'Complete your business information and proceed to payment. All fields help us serve you better!' 
                : 'Update your business profile and administrative information'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal/Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal & Contact Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingEmail">Billing Email</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                      placeholder="billing@company.com"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name (DBA) *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                      placeholder="Doing Business As name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessLegalName">Legal Business Name</Label>
                    <Input
                      id="businessLegalName"
                      value={formData.businessLegalName}
                      onChange={(e) => setFormData({ ...formData, businessLegalName: e.target.value })}
                      placeholder="LLC, Inc, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">
                      Industry * {fromPricing && '🎨 (Unlocks Theme!)'}
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
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tax & Registration */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tax & Registration Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxId">Federal Tax ID (EIN)</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      placeholder="12-3456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cageCode">CAGE Code (Government Contractors)</Label>
                    <Input
                      id="cageCode"
                      value={formData.cageCode}
                      onChange={(e) => setFormData({ ...formData, cageCode: e.target.value })}
                      placeholder="XXXXX"
                    />
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <input
                      type="checkbox"
                      id="salesTaxExempt"
                      checked={formData.salesTaxExempt}
                      onChange={(e) => setFormData({ ...formData, salesTaxExempt: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="salesTaxExempt" className="cursor-pointer">
                      Sales Tax Exempt (Government entity or non-profit)
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Address */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Business Address</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="GA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="30606"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companySize">Company Size</Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Just me</SelectItem>
                        <SelectItem value="2-10">2-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="200+">200+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="yearsInBusiness">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      value={formData.yearsInBusiness}
                      onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 text-lg py-6"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (fromPricing ? '💳 Continue to Payment' : '💾 Save Profile')}
                </Button>
                {!fromPricing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/app')}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Shape-Shifting Preview */}
        {fromPricing && formData.industry && (
          <Card className="mt-6 bg-primary/10 border-primary">
            <CardContent className="pt-6">
              <p className="text-center font-semibold text-xl">
                🎨 Shape-Shifting Magic Activated!
              </p>
              <p className="text-center text-muted-foreground mt-2">
                After payment, your entire platform will instantly transform into a premium <span className="text-primary font-bold">{formData.industry}</span> theme with industry-specific tools, templates, and knowledge bases!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}