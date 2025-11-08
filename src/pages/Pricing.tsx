import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const tiers = [
	{
		name: 'Professional',
		price: '$99',
		period: '/month',
		description: 'Get Online & Look Good',
		persona: 'The Solopreneur / Starter',
		features: [
			'Full access to 7-book framework',
			'AI Legal Assistant',
			'FDCPA violation detection',
			'Template letter generation',
			'5-10 General Themes',
			'Basic customization (logo, colors)',
			'3 Industry Knowledge Bases',
			'1 User Seat',
			'10 GB Storage',
			'Email & Community Support',
		],
		cta: 'Start Building',
		highlight: false,
	},
	{
		name: 'Business',
		price: '$299',
		period: '/month',
		description: 'Dominate Your Niche',
		persona: 'The Growing Business',
		badge: 'MOST POPULAR',
		features: [
			'Everything in Professional, PLUS:',
			'ALL 17+ Premium Industry Themes',
			'INSTANT shape-shifting transformation',
			'ALL 17 Industry Knowledge Bases',
			'Full Calculator suite',
			'Advanced AI Module (priority)',
			'Advanced customization (fonts, layouts)',
			'Up to 5 User Seats',
			'100 GB Storage',
			'Priority Chat & Email Support',
		],
		cta: 'Start Dominating',
		highlight: true,
	},
	{
		name: 'Enterprise',
		price: '$999',
		period: '/month',
		description: 'Full Control & Scale',
		persona: 'The Established Agency / Developer',
		features: [
			'Everything in Business, PLUS:',
			'UNLIMITED Custom Themes',
			'Developer Code Editor (CSS/JS)',
			'Upload Custom Themes',
			'Create Custom Knowledge Bases',
			'Full White-label Platform',
			'Premium AI Module (API access)',
			'Dedicated Account Manager',
			'Unlimited User Seats',
			'Unlimited Storage',
			'Phone Support',
		],
		cta: 'Go Enterprise',
		highlight: false,
	},
];

export default function Pricing() {
	const [billingCycle] = useState<'monthly' | 'yearly'>('monthly');

	return (
		<div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">
						Choose Your Sovereignty Level
					</h1>
					<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
						Three tiers. One mission: Empower you to reclaim your sovereignty.
						<br />
						Primary value: Industry-specific themes that transform your site instantly.
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-3 gap-8 mb-12">
					{tiers.map((tier) => (
						<Card
							key={tier.name}
							className={`relative ${
								tier.highlight ? 'border-primary shadow-xl scale-105' : ''
							}`}
						>
							{tier.badge && (
								<div className="absolute -top-4 left-1/2 -translate-x-1/2">
									<span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
										{tier.badge}
									</span>
								</div>
							)}

							<CardHeader>
								<CardTitle className="text-2xl">{tier.name}</CardTitle>
								<CardDescription className="text-sm">
									{tier.persona}
								</CardDescription>
								<div className="mt-4">
									<span className="text-4xl font-bold">{tier.price}</span>
									<span className="text-muted-foreground">
										{tier.period}
									</span>
								</div>
								<p className="text-sm font-medium text-primary mt-2">
									{tier.description}
								</p>
							</CardHeader>

							<CardContent>
								<ul className="space-y-3">
									{tier.features.map((feature, idx) => (
										<li key={idx} className="flex items-start gap-2">
											<Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								<Button
									className="w-full"
									variant={tier.highlight ? 'default' : 'outline'}
									size="lg"
								>
									{tier.cta}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>

				{/* Shape-Shifting Explanation */}
				<div className="bg-card border rounded-lg p-8 text-center">
					<h2 className="text-2xl font-bold mb-4">
						🎨 The Shape-Shifting Magic
					</h2>
					<div className="max-w-3xl mx-auto space-y-4 text-left">
						<div>
							<span className="font-semibold">$99 Professional:</span> Choose your
							industry → Get professional generic theme + 3 KBs → See premium themes
							locked with "Upgrade" badges
						</div>
						<div className="bg-primary/10 p-4 rounded-lg">
							<span className="font-semibold">$299 Business (Sweet Spot):</span>{' '}
							Choose your industry → Site INSTANTLY transforms into premium
							industry-specific theme + ALL 17 KBs → Look like an industry leader
							immediately
						</div>
						<div>
							<span className="font-semibold">$999 Enterprise:</span> Same as
							Business + Advanced dashboard tab → Code editor unlocked → Upload custom
							themes or build your own
						</div>
					</div>
				</div>

				{/* Value Prop */}
				<div className="mt-12 text-center">
					<p className="text-muted-foreground max-w-2xl mx-auto">
						No free tier. No ads. No data selling. Pure value exchange: you support
						sovereignty, we support you.
						<br />
						Every subscription sustains the platform and keeps it independent.
					</p>
				</div>
			</div>
		</div>
	);
}