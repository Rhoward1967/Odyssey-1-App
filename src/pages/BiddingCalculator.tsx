import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, Loader2, Shield, Users } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

// NOTE: Components like VerticalNavigation, SimpleBidderForm, OdysseyPricingEngine, 
// DocumentViewer, PDFExporter, AppointmentWidget are assumed to exist.

// --- Type Definitions ---
type CalculationInputs = {
    materialCost: number;
    laborHours: number;
    overheadRate: number;
    profitMargin: number;
};
// Assuming BidderInfo and ServiceSpecs are defined elsewhere
type BidderInfo = any; 
type ServiceSpecs = any; 


// --- Supabase Client Mock/Assumption ---
// This mock is ONLY to ensure the component runs in this single-file environment 
// without needing the actual Supabase client setup.
const supabase = {
    from: (tableName: string) => ({
        insert: (data: any[]) => {
            console.log(`[Supabase Mock] Attempted insert into table: ${tableName}`, data);
            // Simulates successful insert
            return { error: null };
        }
    })
};

// Mock function to simulate fetching an organizational rate from Supabase/employees table.
// This simulates the HR integration we designed.
async function fetchOrganizationalHourlyRate(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const averageRate = 28.50; 
    console.log(`[HR Integration] Fetched organizational average rate: $${averageRate.toFixed(2)}`);
    return averageRate;
}

const BiddingCalculator: React.FC = () => {
    // --- Authentication State Simplified (Supabase) ---
    // We mock the authenticated state and user ID since we cannot run full auth here.
    const [isAuthenticated, setIsAuthenticated] = useState(true); 
    const [userId, setUserId] = useState<string>('SUPABASE_USER_ID_MOCK'); 

    // --- Bidding Calculator State and Logic ---
    const [inputs, setInputs] = useState<CalculationInputs>({
        materialCost: 0,
        laborHours: 0,
        overheadRate: 15,
        profitMargin: 20,
    });
    const [hourlyRate, setHourlyRate] = useState<number>(50); // Fallback rate
    const [isLoadingRate, setIsLoadingRate] = useState(true);
    const [bidAmount, setBidAmount] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('calculator');
    
    // External states (using simplified types for stability)
    const [bidderInfo, setBidderInfo] = useState<BidderInfo | null>(null); 
    const [serviceSpecs, setServiceSpecs] = useState<ServiceSpecs | null>(null);
    const [serviceFrequency, setServiceFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'one-time'>('one-time');
    const [contractType, setContractType] = useState<'monthly' | 'one-time'>('one-time');


    // --- Dynamic Rate Fetching Effect ---
    useEffect(() => {
        const loadRate = async () => {
            setIsLoadingRate(true);
            try {
                const rate = await fetchOrganizationalHourlyRate();
                setHourlyRate(rate); 
            } catch (e) {
                console.error("Failed to load organizational rate, using default 50.", e);
            } finally {
                setIsLoadingRate(false);
            }
        };
        loadRate();
    }, []);

    // --- Calculation Logic (Uses dynamic hourlyRate) ---
    const calculateBid = useCallback(() => {
        const totalCost = inputs.materialCost + inputs.laborHours * hourlyRate;
        const costWithOverhead = totalCost * (1 + inputs.overheadRate / 100);
        const finalBid = costWithOverhead * (1 + inputs.profitMargin / 100);
        setBidAmount(parseFloat(finalBid.toFixed(2)));
    }, [inputs, hourlyRate]);

    // --- Save Logic (Supabase) ---
    const handleSaveBid = async () => {
        if (bidAmount === null) {
            setError('Please calculate a bid before saving.');
            return;
        }
        if (!userId) {
            setError('Authentication required to save bid.');
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccessMessage(null);

        const submissionData = {
            title: `Bid for ${bidderInfo?.name || 'New Client'}`,
            status: 'draft',
            bid_amount: bidAmount,
            calculation_inputs: inputs,
            user_id: userId,
            created_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
            .from('bids')
            .insert([submissionData]);
            
        setIsSaving(false);

        if (insertError) {
            console.error('Error saving bid:', insertError);
            const msg = String(insertError.message || '');
            if (/relation .*bids.* does not exist/i.test(msg)) {
                setError('Table "bids" not found. Create it in Supabase and ensure RLS is configured.');
            } else {
                setError(`Failed to save bid: ${insertError.message}`);
            }
        } else {
            setSuccessMessage('Bid successfully saved!');
        }
    };

    // Helper calculations for display
    const laborCostDisplay = inputs.laborHours * hourlyRate;
    const directCostDisplay = inputs.materialCost + laborCostDisplay;
    const overheadCostDisplay = directCostDisplay * inputs.overheadRate / 100;
    const finalBidCost = bidAmount || 0;
    const profitCostDisplay = finalBidCost - (directCostDisplay + overheadCostDisplay);


    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900'>
            <div className='flex'>
                {/* Vertical Navigation (Placeholder) */}
                <div className='w-64 flex-shrink-0'>
                    {/* Assuming VerticalNavigation is a separate component */}
                </div>

                {/* Main Content */}
                <div className='flex-1 p-6'>
                    <div className='max-w-7xl mx-auto space-y-6'>
                        {/* Header */}
                        <Card className='bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30'>
                            <CardHeader className='text-center'>
                                <CardTitle className='text-3xl font-bold text-white flex items-center justify-center gap-3'>
                                    <Calculator className='h-8 w-8 text-blue-400' />
                                    ODYSSEY-1 COMPREHENSIVE BIDDING SYSTEM
                                </CardTitle>
                                <Badge className='mx-auto bg-blue-600/20 text-blue-300 text-lg px-4 py-2'>
                                    Integrated Business Operations Suite
                                </Badge>
                            </CardHeader>
                        </Card>

                        {/* Status Messages */}
                        {error && (
                            <div className='p-3 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-sm'>
                                **ERROR:** {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className='p-3 bg-green-900/20 border border-green-500/30 rounded text-green-300 text-sm'>
                                **SUCCESS:** {successMessage}
                            </div>
                        )}

                        {/* Tabbed Interface */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className='grid w-full grid-cols-6 bg-slate-800/50'>
                                <TabsTrigger value='calculator'>Calculator</TabsTrigger>
                                <TabsTrigger value='bidder-form'>Bidder Info</TabsTrigger>
                                <TabsTrigger value='pricing'>AI Pricing</TabsTrigger>
                                <TabsTrigger value='documents'>Documents</TabsTrigger>
                                <TabsTrigger value='export'>Export</TabsTrigger>
                                <TabsTrigger value='schedule'>Schedule</TabsTrigger>
                            </TabsList>

                            {/* Calculator Tab */}
                            <TabsContent value='calculator'>
                                <div className='grid lg:grid-cols-2 gap-6'>
                                    {/* Input Form */}
                                    <Card className='bg-slate-800/50 border-blue-500/20'>
                                        <CardHeader>
                                            <CardTitle className='text-white flex items-center gap-2'>
                                                <Shield className='h-5 w-5 text-blue-400' />
                                                Bid Calculation Inputs
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <div>
                                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                    Material Cost ($)
                                                </label>
                                                <input
                                                    type='number'
                                                    value={inputs.materialCost}
                                                    onChange={(e) => setInputs({...inputs, materialCost: parseFloat(e.target.value) || 0})}
                                                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white'
                                                    placeholder='Enter material costs'
                                                />
                                            </div>

                                            <div>
                                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                    Labor Hours
                                                </label>
                                                <input
                                                    type='number'
                                                    value={inputs.laborHours}
                                                    onChange={(e) => setInputs({...inputs, laborHours: parseFloat(e.target.value) || 0})}
                                                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white'
                                                    placeholder='Enter estimated labor hours'
                                                />
                                            </div>
                                            
                                            {/* DYNAMIC HOURLY RATE INPUT */}
                                            <div>
                                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                    Hourly Rate ($) - Linked to HR Data
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type='number'
                                                        value={hourlyRate}
                                                        onChange={(e) => setHourlyRate(parseFloat(e.target.value) || 0)}
                                                        className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white'
                                                        placeholder='Hourly labor rate'
                                                        disabled={isLoadingRate}
                                                    />
                                                    {isLoadingRate && (
                                                        <Loader2 className="absolute right-3 top-2.5 w-5 h-5 animate-spin text-blue-400" />
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {isLoadingRate ? "Fetching organizational labor rate..." : `Loaded cost from HR: $${hourlyRate.toFixed(2)}/hr`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                    Overhead Rate (%)
                                                </label>
                                                <input
                                                    type='number'
                                                    value={inputs.overheadRate}
                                                    onChange={(e) => setInputs({...inputs, overheadRate: parseFloat(e.target.value) || 0})}
                                                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white'
                                                    placeholder='Overhead percentage'
                                                />
                                            </div>

                                            <div>
                                                <label className='block text-sm font-medium text-gray-300 mb-2'>
                                                    Profit Margin (%)
                                                </label>
                                                <input
                                                    type='number'
                                                    value={inputs.profitMargin}
                                                    onChange={(e) => setInputs({...inputs, profitMargin: parseFloat(e.target.value) || 0})}
                                                    className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white'
                                                    placeholder='Desired profit margin'
                                                />
                                            </div>

                                            <button
                                                onClick={calculateBid}
                                                disabled={isLoadingRate}
                                                className='w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50'
                                            >
                                                Calculate Bid
                                            </button>
                                        </CardContent>
                                    </Card>

                                    {/* Results */}
                                    <Card className='bg-slate-800/50 border-green-500/20'>
                                        <CardHeader>
                                            <CardTitle className='text-white flex items-center gap-2'>
                                                <Users className='h-5 w-5 text-green-400' />
                                                Bid Results
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            {bidAmount !== null ? (
                                                <div className='space-y-4'>
                                                    <div className='text-center'>
                                                        <div className='text-4xl font-bold text-green-400'>
                                                            ${finalBidCost.toLocaleString('en-US', {minimumFractionDigits: 2})}
                                                        </div>
                                                        <div className='text-gray-400'>Calculated Bid Amount</div>
                                                    </div>

                                                    <div className='space-y-2 text-sm'>
                                                        <div className='flex justify-between'>
                                                            <span className='text-gray-400'>Material Cost:</span>
                                                            <span className='text-white'>${inputs.materialCost.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            <span className='text-gray-400'>Labor Cost ({inputs.laborHours}h @ ${hourlyRate.toFixed(2)}/h):</span>
                                                            <span className='text-white'>${laborCostDisplay.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                                        </div>
                                                        <div className='flex justify-between font-semibold border-t border-slate-700 pt-2'>
                                                            <span className='text-gray-300'>Direct Cost:</span>
                                                            <span className='text-white'>${directCostDisplay.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            <span className='text-gray-400'>Overhead ({inputs.overheadRate}%):</span>
                                                            <span className='text-white'>${overheadCostDisplay.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                                        </div>
                                                        <div className='flex justify-between border-t border-slate-700 pt-2'>
                                                            <span className='text-green-400'>Profit Margin:</span>
                                                            <span className='text-green-400'>${profitCostDisplay.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleSaveBid}
                                                        disabled={isSaving || !isAuthenticated}
                                                        className='w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-md transition-colors'
                                                    >
                                                        {isSaving ? <Loader2 className='w-4 h-4 mr-2 animate-spin inline-block' /> : 'Save Bid to Database'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className='text-center text-gray-400 py-8'>
                                                    Enter values and calculate to see results
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                            
                            {/* All other Tabs (Bidder Form, Pricing, Documents, Export, Schedule) */}
                            <TabsContent value='bidder-form'><Card className='h-64 flex items-center justify-center bg-slate-800/50 border-blue-500/20 text-gray-400'>SimpleBidderForm Component Placeholder</Card></TabsContent>
                            <TabsContent value='pricing'><Card className='h-64 flex items-center justify-center bg-slate-800/50 border-purple-500/20 text-gray-400'>OdysseyPricingEngine Component Placeholder</Card></TabsContent>
                            <TabsContent value='documents'><Card className='h-64 flex items-center justify-center bg-slate-800/50 border-yellow-500/20 text-gray-400'>DocumentViewer Component Placeholder</Card></TabsContent>
                            <TabsContent value='export'><Card className='h-64 flex items-center justify-center bg-slate-800/50 border-green-500/20 text-gray-400'>PDFExporter Component Placeholder</Card></TabsContent>
                            <TabsContent value='schedule'><Card className='h-64 flex items-center justify-center bg-slate-800/50 border-orange-500/20 text-gray-400'>AppointmentWidget Component Placeholder</Card></TabsContent>

                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiddingCalculator;
