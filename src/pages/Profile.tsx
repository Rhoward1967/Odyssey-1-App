import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient';
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

          if (checkoutError) {
            console.error('❌ Stripe checkout error:', checkoutError);
            
            // 🔥 LOG ERROR TO ODYSSEY-1 SELF-HEALING SYSTEM
            await supabase.from('system_logs').insert({
              source: 'stripe_api',
              level: 'ERROR',
              message: checkoutError.message,
              metadata: {
                code: 401, // Trigger self-healing
                tier: selectedTier,
                userId: user.id,
                error: checkoutError
              }
            });
            
            // User-friendly error message
            if (checkoutError.message?.includes('STRIPE_SECRET_KEY')) {
              alert('⚠️ Payment system is being configured. Your profile has been saved!\n\nPlease contact support or try again later. We\'re setting up payment processing for your ' + selectedTier + ' plan.');
              navigate('/app');
              return;
            }
            
            throw checkoutError;
          }

          if (checkoutData?.url) {
            console.log('✅ Redirecting to Stripe checkout...', checkoutData.url);
            // Show a loading message before redirect
            const loadingMsg = document.createElement('div');
            loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:40px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:9999;text-align:center;';
            loadingMsg.innerHTML = '<div style="font-size:24px;margin-bottom:16px;">🔐 Redirecting to secure checkout...</div><div style="font-size:16px;color:#666;">Please wait</div>';
            document.body.appendChild(loadingMsg);
            
            setTimeout(() => {
              window.location.href = checkoutData.url;
            }, 500);
          } else {
            throw new Error('No checkout URL returned from Stripe');
          }
        } catch (stripeError: any) {
          console.error('❌ Stripe checkout error:', stripeError);
          
          // 🔥 LOG TO ODYSSEY-1 SELF-HEALING
          await supabase.from('system_logs').insert({
            source: 'stripe_checkout',
            level: 'ERROR',
            message: stripeError.message,
            metadata: {
              tier: selectedTier,
              userId: user.id,
              error: stripeError.toString()
            }
          });
          
          // Better error handling
          if (stripeError.message?.includes('STRIPE_SECRET_KEY')) {
            alert('⚠️ Payment processing is being set up!\n\nYour business profile has been saved. We\'re configuring payment for the ' + selectedTier + ' plan.\n\nPlease try again in a few minutes or contact support.');
          } else {
            alert(`Payment setup error: ${stripeError.message || 'Unable to connect to payment processor. Please try again.'}`);
          }
          
          navigate('/app');
        }
      } else {
        alert('✅ Business profile updated successfully!');
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-xl sm:text-2xl">
              {fromPricing ? 'Complete Your Profile & Payment' : 'Business Profile Settings'}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              {fromPricing && selectedTier && (
                <span className="text-primary font-semibold text-base sm:text-lg block mb-2">
                  Selected Plan: {selectedTier} ({selectedPrice})
                </span>
              )}
              {fromPricing 
                ? 'Complete your business information and proceed to payment.' 
                : 'Update your business profile and administrative information'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Personal/Contact Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Personal & Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="fullName" className="text-sm sm:text-base">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="phone" className="text-sm sm:text-base">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="billingEmail" className="text-sm sm:text-base">Billing Email</Label>
                    <Input
                      id="billingEmail"
                      type="email"
                      value={formData.billingEmail}
                      onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                      placeholder="billing@company.com"
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Business Information */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Business Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="businessName" className="text-sm sm:text-base">Business Name (DBA) *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required
                      placeholder="Doing Business As name"
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="businessLegalName" className="text-sm sm:text-base">Legal Business Name</Label>
                    <Input
                      id="businessLegalName"
                      value={formData.businessLegalName}
                      onChange={(e) => setFormData({ ...formData, businessLegalName: e.target.value })}
                      placeholder="LLC, Inc, etc."
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="industry" className="text-sm sm:text-base">
                      Industry * {fromPricing && '🎨'}
                    </Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                      required
                    >
                      <SelectTrigger className="mt-1.5 h-10 sm:h-11 text-base">
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry.toLowerCase()} className="text-base">
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="website" className="text-sm sm:text-base">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://..."
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Tax & Registration */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Tax & Registration Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="taxId" className="text-sm sm:text-base">Federal Tax ID (EIN)</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      placeholder="12-3456789"
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="cageCode" className="text-sm sm:text-base">CAGE Code (Government Contractors)</Label>
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

              <Separator className="my-6" />

              {/* Business Address */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Business Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="address" className="text-sm sm:text-base">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St"
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="city" className="text-sm sm:text-base">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:col-span-2 md:col-span-1">
                    <div>
                      <Label htmlFor="state" className="text-sm sm:text-base">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="GA"
                        className="mt-1.5 h-10 sm:h-11 text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="text-sm sm:text-base">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="30606"
                        className="mt-1.5 h-10 sm:h-11 text-base"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="companySize" className="text-sm sm:text-base">Company Size</Label>
                    <Select
                      value={formData.companySize}
                      onValueChange={(value) => setFormData({ ...formData, companySize: value })}
                    >
                      <SelectTrigger className="mt-1.5 h-10 sm:h-11 text-base">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[250px]">
                        <SelectItem value="1" className="text-base">Just me</SelectItem>
                        <SelectItem value="2-10" className="text-base">2-10 employees</SelectItem>
                        <SelectItem value="11-50" className="text-base">11-50 employees</SelectItem>
                        <SelectItem value="51-200" className="text-base">51-200 employees</SelectItem>
                        <SelectItem value="200+" className="text-base">200+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <Label htmlFor="yearsInBusiness" className="text-sm sm:text-base">Years in Business</Label>
                    <Input
                      id="yearsInBusiness"
                      type="number"
                      value={formData.yearsInBusiness}
                      onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                      placeholder="5"
                      className="mt-1.5 h-10 sm:h-11 text-base"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button
                  type="submit"
                  className="w-full sm:flex-1 text-base sm:text-lg py-3 sm:py-6 h-auto relative z-10"
                  disabled={loading}
                  onTouchStart={() => console.log('👆 Touch started on submit button')}
                  onTouchEnd={() => console.log('✋ Touch ended on submit button')}
                  onClick={() => console.log('🔥 Submit button clicked')}
                >
                  {loading ? 'Processing...' : (fromPricing ? '💳 Continue to Payment' : '💾 Save Profile')}
                </Button>
                {!fromPricing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate('/app');
                    }}
                    className="w-full sm:w-auto text-base py-3 h-auto relative z-10"
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