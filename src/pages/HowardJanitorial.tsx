/**
 * Howard Janitorial Services - Public Landing Page
 * Professional cleaning services website for howardjanitorial.net
 * 
 * © 2025 HJS SERVICES LLC. All Rights Reserved.
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Briefcase, Building2, Calendar, CheckCircle, ChevronDown, Clock, Languages, Mail, MapPin, MessageCircle, Phone, Shield, Sparkles, Star } from 'lucide-react';
import { useState, lazy, Suspense, useEffect } from 'react';

export default function HowardJanitorial() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [showScheduler, setShowScheduler] = useState(false);
  const [calculator, setCalculator] = useState({
    squareFeet: '',
    serviceType: '',
    frequency: 'weekly',
    estimatedPrice: 0
  });
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [sectionsVisible, setSectionsVisible] = useState(false);

  // Defer below-the-fold content for faster initial load
  useEffect(() => {
    const timer = setTimeout(() => setSectionsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const services = [
    {
      icon: Building2,
      title: 'Commercial Cleaning',
      description: 'Professional office and facility cleaning services',
      items: ['Daily office cleaning', 'Restroom sanitization', 'Break room maintenance', 'Trash removal & recycling']
    },
    {
      icon: Shield,
      title: 'COVID-19 & Flu Season Disinfection',
      description: 'Healthcare-grade sanitization protocols',
      items: ['EPA-approved disinfectants', 'High-touch surface sanitization', 'Air quality improvement', 'Outbreak response protocols']
    },
    {
      icon: Sparkles,
      title: 'Floor Care',
      description: 'Strip, wax, buffing, and carpet cleaning',
      items: ['VCT strip & wax', 'Carpet extraction', 'Floor buffing & polishing', 'Grout cleaning & sealing']
    },
    {
      icon: Clock,
      title: '24/7 Emergency Service',
      description: 'Available when you need us most',
      items: ['Water damage cleanup', 'Emergency spill response', 'COVID/Flu outbreak response', 'Disaster restoration']
    }
  ];

  const cleaningPlans = [
    {
      name: 'Basic Plan',
      description: 'Essential cleaning for small offices',
      price: 'From $0.60/sq ft',
      features: [
        'Daily trash removal',
        'Restroom cleaning & restocking',
        'Vacuum & dust common areas',
        'Break room maintenance',
        'Weekly detailed cleaning'
      ],
      best: 'Small Offices (up to 2,500 sq ft)'
    },
    {
      name: 'Professional Plan',
      description: 'Comprehensive cleaning solution',
      price: 'From $1.25/sq ft',
      features: [
        'Everything in Basic Plan',
        'Floor care (sweep, mop, buff)',
        'Window cleaning (interior)',
        'Kitchen deep cleaning',
        'Monthly carpet cleaning',
        'Quarterly floor stripping & waxing'
      ],
      best: 'Medium Facilities (2,500-10,000 sq ft)',
      popular: true
    },
    {
      name: 'Premium Plan',
      description: 'Complete facility management',
      price: 'Up to $3.00/sq ft',
      features: [
        'Everything in Professional Plan',
        'Exterior window cleaning',
        'Pressure washing',
        'Specialized equipment cleaning',
        'Green cleaning certification',
        '24/7 emergency response',
        'Dedicated facility manager'
      ],
      best: 'Large Facilities (10,000+ sq ft)'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with contact form submission
    alert('Thank you! We will contact you shortly.');
  };

  const calculateEstimate = () => {
    const sqFt = parseFloat(calculator.squareFeet) || 0;
    let baseRate = 1.25; // Default rate
    
    // Adjust rate based on service type
    switch (calculator.serviceType) {
      case 'basic':
        baseRate = 0.75;
        break;
      case 'standard':
        baseRate = 1.25;
        break;
      case 'deep':
        baseRate = 2.00;
        break;
      case 'specialized':
        baseRate = 2.75;
        break;
      case 'medical':
        baseRate = 2.50;
        break;
      case 'post-construction':
        baseRate = 3.00;
        break;
      default:
        baseRate = 1.25;
    }

    // Adjust for frequency - NO DISCOUNTS!
    let frequencyMultiplier = 1;
    switch (calculator.frequency) {
      case 'daily':
        frequencyMultiplier = 1; // Standard rate
        break;
      case 'weekly':
        frequencyMultiplier = 1;
        break;
      case 'biweekly':
        frequencyMultiplier = 1.15;
        break;
      case 'monthly':
        frequencyMultiplier = 1.3;
        break;
      case 'one-time':
        frequencyMultiplier = 1.5;
        break;
    }

    const estimate = sqFt * baseRate * frequencyMultiplier;
    setCalculator(prev => ({ ...prev, estimatedPrice: estimate }));
  };

  const testimonials = [
    {
      name: "Dr. Sarah Mitchell",
      company: "Athens Medical Center",
      rating: 5,
      text: "Outstanding service for over 3 years. Their attention to detail and professionalism is unmatched."
    },
    {
      name: "James Thompson",
      company: "UGA Research Facility",
      rating: 5,
      text: "Reliable, thorough, and always on time. We trust them with our most sensitive areas."
    },
    {
      name: "Maria Rodriguez",
      company: "Downtown Office Complex",
      rating: 5,
      text: "Best janitorial service in Athens! Our building has never looked better."
    }
  ];

  const faqs = [
    {
      question: language === 'en' ? "What areas do you serve?" : "¿Qué áreas atienden?",
      answer: language === 'en' 
        ? "We primarily serve Athens, GA and surrounding areas including Watkinsville, Bogart, Winterville, and the greater Clarke County region. Contact us for service availability in your area."
        : "Servimos principalmente a Athens, GA y áreas circundantes incluyendo Watkinsville, Bogart, Winterville y la región del condado de Clarke. Contáctenos para disponibilidad en su área."
    },
    {
      question: language === 'en' ? "Are you insured and bonded?" : "¿Están asegurados?",
      answer: language === 'en'
        ? "Yes, we carry $1M+ liability insurance and are fully bonded. All employees are background-checked and professionally trained."
        : "Sí, tenemos seguro de responsabilidad de más de $1M y estamos completamente asegurados. Todos los empleados tienen verificación de antecedentes y capacitación profesional."
    },
    {
      question: language === 'en' ? "How quickly can you start service?" : "¿Qué tan rápido pueden comenzar?",
      answer: language === 'en'
        ? "After the initial walkthrough and quote approval, we can typically begin service within 3-5 business days. Emergency services available same-day."
        : "Después de la inspección inicial y aprobación del presupuesto, podemos comenzar el servicio típicamente en 3-5 días hábiles. Servicios de emergencia disponibles el mismo día."
    },
    {
      question: language === 'en' ? "Do you use eco-friendly products?" : "¿Usan productos ecológicos?",
      answer: language === 'en'
        ? "Yes! We offer green cleaning options using EPA-certified, environmentally friendly products that are safe for people and pets."
        : "¡Sí! Ofrecemos opciones de limpieza ecológica usando productos certificados por la EPA, seguros para personas y mascotas."
    },
    {
      question: language === 'en' ? "What if I'm not satisfied with the service?" : "¿Qué pasa si no estoy satisfecho?",
      answer: language === 'en'
        ? "We offer a 100% satisfaction guarantee. If you're not happy with our work, we'll re-clean at no charge or provide a full refund."
        : "Ofrecemos una garantía de satisfacción del 100%. Si no está satisfecho con nuestro trabajo, volveremos a limpiar sin cargo o proporcionaremos un reembolso completo."
    }
  ];

  const clientLogos = [
    { name: "U.S. General Services Administration", category: "Government" },
    { name: "Athens Regional Medical Center", category: "Healthcare" },
    { name: "University of Georgia", category: "Education" },
    { name: "Clarke County Schools", category: "Education" },
    { name: "SunTrust Bank", category: "Financial" },
    { name: "Downtown Athens Business Assoc.", category: "Commercial" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Emergency Service Banner - Sticky */}
      <div className="sticky top-0 z-50 bg-red-600 text-white py-2 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">24/7 Emergency Service Available</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:8004038492" className="font-bold hover:underline">
              800-403-8492
            </a>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-white text-white hover:bg-red-700"
              onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
            >
              <Languages className="h-4 w-4 mr-1" />
              {language === 'en' ? 'Español' : 'English'}
            </Button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-green-900 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {language === 'en' ? 'Howard Janitorial Services' : 'Servicios de Conserjería Howard'}
              </h1>
              <p className="text-green-200">
                {language === 'en' ? 'Professional Cleaning Solutions Since 1988' : 'Soluciones Profesionales de Limpieza Desde 1988'}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                <span className="font-semibold">800-403-8492</span>
              </div>
              <Button variant="outline" className="bg-white text-green-900 hover:bg-green-50">
                {language === 'en' ? 'Get a Quote' : 'Obtener Cotización'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            {language === 'en' ? 'Professional Janitorial Services' : 'Servicios Profesionales de Conserjería'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-green-100">
            {language === 'en' 
              ? 'Trusted by government agencies, healthcare facilities, and commercial businesses across Athens, GA and beyond'
              : 'Confiado por agencias gubernamentales, instalaciones médicas y negocios comerciales en Athens, GA y más allá'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="bg-white text-green-900 hover:bg-green-50 flex items-center gap-2"
              onClick={() => setShowScheduler(true)}
            >
              <Calendar className="h-5 w-5" />
              {language === 'en' ? 'Schedule Free Consultation' : 'Agendar Consulta Gratis'}
            </Button>
            <Button 
              size="lg" 
              className="bg-green-900 text-white hover:bg-green-950 flex items-center gap-2"
              onClick={() => window.location.href = 'tel:8004038492'}
            >
              <Phone className="h-5 w-5" />
              {language === 'en' ? 'Call Now: 800-403-8492' : 'Llame Ahora: 800-403-8492'}
            </Button>
          </div>
          <p className="mt-6 text-sm text-green-200">
            {language === 'en' 
              ? '⚡ Same-day quotes available • 24/7 emergency service'
              : '⚡ Cotizaciones el mismo día • Servicio de emergencia 24/7'}
          </p>
        </div>
      </section>

      {/* Video Commercial Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'See Us In Action' : 'Vea Nuestro Trabajo'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Watch our commercial to discover why Athens trusts Howard Janitorial Services for professional cleaning excellence'
                : 'Vea nuestro comercial para descubrir por qué Athens confía en Howard Janitorial Services para la excelencia en limpieza profesional'}
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <Card className="overflow-hidden shadow-2xl border-green-200">
              <CardContent className="p-0">
                <div className="aspect-video bg-black relative">
                  {!videoLoaded ? (
                    <div 
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-900 to-green-700 cursor-pointer group"
                      onClick={() => setVideoLoaded(true)}
                    >
                      <div className="text-center">
                        <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 mb-4 group-hover:bg-white/20 transition-all">
                          <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                        <p className="text-white text-xl font-semibold">Watch Our Commercial</p>
                        <p className="text-green-200 text-sm mt-2">Click to load video</p>
                      </div>
                    </div>
                  ) : (
                    <iframe 
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/bbsdYb38BfY?autoplay=1"
                      title="Howard Janitorial Services Commercial"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="text-center mt-8 space-y-4">
              <p className="text-lg font-semibold text-gray-800">
                {language === 'en' 
                  ? '37+ Years of Professional Excellence in Athens, GA'
                  : '37+ Años de Excelencia Profesional en Athens, GA'}
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowScheduler(true)}
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  {language === 'en' ? 'Get Your Free Quote' : 'Obtener Cotización Gratis'}
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                  onClick={() => window.location.href = 'tel:8004038492'}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {language === 'en' ? 'Call 800-403-8492' : 'Llame 800-403-8492'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-12 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted, Certified, and Insured</h3>
            <p className="text-gray-600">Professional credentials you can count on</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-8">
            <div>
              <div className="bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-3">
                <Award className="h-10 w-10 text-green-900" />
              </div>
              <p className="text-3xl font-bold text-green-900">37+</p>
              <p className="text-gray-600">Years Experience</p>
              <p className="text-xs text-gray-500 mt-1">Since 1988</p>
            </div>
            <div>
              <div className="bg-blue-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-3">
                <Star className="h-10 w-10 text-blue-900" />
              </div>
              <p className="text-3xl font-bold text-blue-900">BBB A+</p>
              <p className="text-gray-600">Accredited Business</p>
              <p className="text-xs text-gray-500 mt-1">Better Business Bureau</p>
            </div>
            <div>
              <div className="bg-red-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-3">
                <Shield className="h-10 w-10 text-red-900" />
              </div>
              <p className="text-3xl font-bold text-red-900">$1M+</p>
              <p className="text-gray-600">Insured</p>
              <p className="text-xs text-gray-500 mt-1">General Liability Coverage</p>
            </div>
            <div>
              <div className="bg-purple-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-10 w-10 text-purple-900" />
              </div>
              <p className="text-3xl font-bold text-purple-900">WOSB</p>
              <p className="text-gray-600">Certified</p>
              <p className="text-xs text-gray-500 mt-1">Woman-Owned Small Business</p>
            </div>
          </div>
          
          {/* Professional Certifications */}
          <div className="max-w-4xl mx-auto">
            <h4 className="text-center font-semibold text-gray-900 mb-4">Professional Certifications & Registrations</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">OSHA 30-Hour Certified</p>
                      <p className="text-xs text-gray-600">General Industry Safety & Health</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">SAM.gov Registered</p>
                      <p className="text-xs text-gray-600">UEI: YXEYCV2T1DM5 • CAGE: 97K10</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Licensed & Bonded</p>
                      <p className="text-xs text-gray-600">GA License: BT-089217</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Hazard Control Certified</p>
                      <p className="text-xs text-gray-600">OSHAcademy Training</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Electrical Safety Certified</p>
                      <p className="text-xs text-gray-600">Employee Safety Standards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Healthcare Certified</p>
                      <p className="text-xs text-gray-600">Biological Hazards & COVID-19</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Managed By Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Professionally managed by <span className="font-semibold text-green-900">ODYSSEY-1 AI LLC</span> (EIN: 41-2718714)
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Price Calculator */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Get an Instant Estimate</h2>
              <p className="text-xl text-gray-600">
                Use our calculator to get a ballpark estimate for your facility
              </p>
            </div>

            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Square Footage Input */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Facility Size (Square Feet) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 5000"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-lg"
                      value={calculator.squareFeet}
                      onChange={(e) => setCalculator({ ...calculator, squareFeet: e.target.value })}
                    />
                  </div>

                  {/* Service Type Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Service Type *
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-lg"
                      value={calculator.serviceType}
                      onChange={(e) => setCalculator({ ...calculator, serviceType: e.target.value })}
                    >
                      <option value="">Select service...</option>
                      <option value="basic">Basic Office Cleaning</option>
                      <option value="standard">Standard Commercial Cleaning</option>
                      <option value="deep">Deep Cleaning</option>
                      <option value="medical">Medical Facility Cleaning</option>
                      <option value="specialized">Specialized Cleaning Services</option>
                      <option value="post-construction">Post-Construction Cleanup</option>
                    </select>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900">
                      Cleaning Frequency
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-lg"
                      value={calculator.frequency}
                      onChange={(e) => setCalculator({ ...calculator, frequency: e.target.value })}
                    >
                      <option value="daily">Daily Service</option>
                      <option value="weekly">Weekly (Standard Rate)</option>
                      <option value="biweekly">Bi-Weekly (+15%)</option>
                      <option value="monthly">Monthly (+30%)</option>
                      <option value="one-time">One-Time Service (+50%)</option>
                    </select>
                  </div>

                  {/* Calculate Button */}
                  <div className="flex items-end">
                    <Button
                      onClick={calculateEstimate}
                      disabled={!calculator.squareFeet || !calculator.serviceType}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-lg font-semibold"
                    >
                      Calculate Estimate
                    </Button>
                  </div>
                </div>

                {/* Results */}
                {calculator.estimatedPrice > 0 && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-green-600 to-green-800 rounded-lg text-white">
                    <div className="text-center">
                      <p className="text-sm font-semibold mb-2">Estimated Cost Per Service</p>
                      <p className="text-5xl font-bold mb-4">
                        ${calculator.estimatedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-green-100 mb-4">
                        Based on {calculator.squareFeet} sq ft • {calculator.frequency.charAt(0).toUpperCase() + calculator.frequency.slice(1)} cleaning
                      </p>
                      <div className="border-t border-green-400 pt-4 mt-4">
                        <p className="text-xs text-green-100 italic">
                          ⚠️ This is an estimate only. Final pricing determined after free facility walkthrough.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Disclaimer Box */}
                <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                  <div className="flex gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Important: Estimate Only</h4>
                      <p className="text-sm text-gray-700">
                        This calculator provides a <strong>general estimate</strong> based on typical conditions. 
                        <strong> Final pricing requires an HJS BID SERVICES visit</strong> to assess your specific facility, 
                        condition, access requirements, and unique cleaning needs. Actual rates may vary from $0.60 to $3.00 per square foot.
                      </p>
                      <Button
                        onClick={() => setShowScheduler(true)}
                        className="mt-3 bg-green-600 hover:bg-green-700 text-sm"
                      >
                        Schedule Free Assessment
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive cleaning solutions tailored to your facility's needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <service.icon className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Services List */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">Complete Service Catalog</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-green-900 mb-3">Daily Services</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Office & cubicle cleaning</li>
                  <li>• Restroom sanitization</li>
                  <li>• Kitchen/break room cleaning</li>
                  <li>• Trash & recycling removal</li>
                  <li>• Dusting & surface wiping</li>
                  <li>• Vacuuming & mopping</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-3">Periodic Services</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Carpet shampooing</li>
                  <li>• Floor stripping & waxing</li>
                  <li>• Window washing</li>
                  <li>• High dusting</li>
                  <li>• Light fixture cleaning</li>
                  <li>• Upholstery cleaning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-3">Specialized</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Post-construction cleanup</li>
                  <li>• Medical facility cleaning</li>
                  <li>• Pressure washing</li>
                  <li>• Graffiti removal</li>
                  <li>• Event cleanup</li>
                  <li>• Move-in/move-out cleaning</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cleaning Plans */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Flexible Cleaning Plans</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a plan that fits your needs and budget, or we'll create a custom solution
            </p>
          </div>

          {/* Pricing Disclaimer */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-2xl">💡</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Important Pricing Information</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong>Prices shown are estimates only.</strong> Final pricing is determined after a free facility walkthrough and assessment. 
                      Our rates typically range from <strong>$0.60 to $3.00 per square foot</strong> depending on factors including: facility size, 
                      cleaning frequency, specific services required, facility condition, access requirements, and specialized cleaning needs. 
                      Every facility is unique, and we provide transparent, customized quotes based on your exact requirements.
                    </p>
                    <p className="text-gray-600 text-xs mt-2 italic">
                      All quotes are provided free with no obligation. Schedule your assessment today!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {cleaningPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-green-600 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <p className="text-3xl font-bold text-green-600 mb-6">{plan.price}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 italic mb-2">Best for: {plan.best}</p>
                  <p className="text-xs text-gray-500 mb-4">*Pricing subject to facility assessment</p>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                    onClick={() => setShowScheduler(true)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Customization Section */}
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-green-600 to-green-800 text-white">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">Need a Custom Plan?</h3>
                  <p className="text-xl text-green-100 mb-6">
                    Every facility is unique. We'll create a tailored cleaning solution that fits your specific needs, schedule, and budget.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">1. Free Assessment</h4>
                        <p className="text-sm text-green-100">We visit your facility to understand your needs</p>
                      </div>
                    </div>
                    <div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">2. Custom Proposal</h4>
                        <p className="text-sm text-green-100">Receive a detailed plan with transparent pricing</p>
                      </div>
                    </div>
                    <div>
                      <div className="bg-white/10 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">3. Flexible Service</h4>
                        <p className="text-sm text-green-100">Adjust your plan anytime as needs change</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-green-100 font-semibold">Custom solutions include:</p>
                    <div className="grid md:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Flexible scheduling (daily, weekly, monthly)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Industry-specific protocols</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Green cleaning options</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>After-hours or weekend service</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Specialized equipment cleaning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Compliance documentation</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="lg"
                    className="mt-8 bg-white text-green-900 hover:bg-green-50 flex items-center gap-2 mx-auto"
                    onClick={() => setShowScheduler(true)}
                  >
                    <Calendar className="h-5 w-5" />
                    Schedule Free Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Howard Janitorial?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Experienced Team</h3>
                <p className="text-gray-600">Our staff is professionally trained and background-checked</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Fully Insured</h3>
                <p className="text-gray-600">$1M+ liability coverage for your peace of mind</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600">100% satisfaction guarantee on all services</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Green Cleaning</h3>
                <p className="text-gray-600">Eco-friendly products and sustainable practices</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Flexible Scheduling</h3>
                <p className="text-gray-600">Day, night, or weekend service available</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Government Contractor</h3>
                <p className="text-gray-600">Active SAM.gov registration (CAGE: 97K10)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600">Trusted by businesses across Athens and beyond</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Banner */}
      <section className="py-16 bg-green-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Difference?</h2>
          <p className="text-xl text-green-200 mb-8">
            Get your free consultation and custom quote today
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="bg-white text-green-900 hover:bg-green-50 flex items-center gap-2"
              onClick={() => setShowScheduler(true)}
            >
              <Calendar className="h-5 w-5" />
              Schedule Consultation
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-green-800 flex items-center gap-2"
              onClick={() => window.location.href = 'mailto:hr@howardjanitorial.com'}
            >
              <Mail className="h-5 w-5" />
              Email Us
            </Button>
          </div>
        </div>
      </section>

      {/* Client Logos Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted By</h2>
            <p className="text-gray-600">Proud to serve leading organizations across Georgia</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
            {clientLogos.map((client, index) => (
              <div key={index} className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow">
                <Award className="h-12 w-12 text-green-600 mb-3" />
                <p className="text-xs text-center font-semibold text-gray-700">{client.name}</p>
                <p className="text-xs text-gray-500 mt-1">{client.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Work Speaks for Itself</h2>
            <p className="text-xl text-gray-600">See the Howard Janitorial difference</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <Sparkles className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    After
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1">Professional Office Cleaning</h3>
                  <p className="text-sm text-gray-600">5,000 sq ft facility • Weekly service</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-600 italic">
              * Photos are representative. Actual results may vary based on facility condition.
            </p>
          </div>
        </div>
      </section>

      {/* Service Area Map */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Service Areas</h2>
            <p className="text-xl text-gray-600">Proudly serving Athens, GA and surrounding communities</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center mb-6 relative overflow-hidden">
                  <MapPin className="h-24 w-24 text-green-600 absolute animate-bounce" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 bg-green-300 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Primary Service Area
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Athens, GA</li>
                      <li>• Watkinsville</li>
                      <li>• Bogart</li>
                      <li>• Winterville</li>
                      <li>• Clarke County</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Extended Service Area
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Oconee County</li>
                      <li>• Jackson County</li>
                      <li>• Madison County</li>
                      <li>• Barrow County</li>
                      <li>• Contact for other areas</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">
                    <strong>Need service outside these areas?</strong> Contact us! We may be able to accommodate special requests.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {language === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'en' ? 'Get answers to common questions' : 'Obtenga respuestas a preguntas comunes'}
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full text-left p-6 flex justify-between items-center gap-4"
                  >
                    <h3 className="font-semibold text-lg">{faq.question}</h3>
                    <ChevronDown 
                      className={`h-5 w-5 text-green-600 transition-transform ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Google Reviews</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-900">4.9/5.0</span>
            </div>
            <p className="text-gray-600">Based on 150+ verified Google reviews</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-50 to-green-50">
              <CardContent className="p-8 text-center">
                <p className="text-gray-700 mb-6">
                  "Our clients love us on Google! Check out our reviews to see why businesses across Athens trust Howard Janitorial Services."
                </p>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open('https://www.google.com/search?q=Howard+Janitorial+Services+Athens+GA', '_blank')}
                >
                  <Star className="h-5 w-5 mr-2" />
                  View Google Reviews
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subcontractor Application Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Briefcase className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              {language === 'en' ? 'Subcontractor Opportunities' : 'Oportunidades de Subcontratistas'}
            </h2>
            <p className="text-xl text-green-100 mb-8">
              {language === 'en' 
                ? 'We work with independent cleaning professionals and subcontractors (1099)'
                : 'Trabajamos con profesionales de limpieza independientes y subcontratistas (1099)'}
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="font-semibold mb-2">
                  {language === 'en' ? 'Competitive Rates' : 'Tarifas Competitivas'}
                </h3>
                <p className="text-sm text-green-100">
                  {language === 'en' ? '1099 contract basis' : 'Base de contrato 1099'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="font-semibold mb-2">
                  {language === 'en' ? 'Flexible Schedule' : 'Horario Flexible'}
                </h3>
                <p className="text-sm text-green-100">
                  {language === 'en' ? 'Choose your availability' : 'Elija su disponibilidad'}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-6">
                <h3 className="font-semibold mb-2">
                  {language === 'en' ? 'Steady Work' : 'Trabajo Constante'}
                </h3>
                <p className="text-sm text-green-100">
                  {language === 'en' ? 'Ongoing contracts available' : 'Contratos continuos disponibles'}
                </p>
              </div>
            </div>

            {/* Insurance Requirements */}
            <Card className="bg-white text-gray-900 mb-6">
              <CardContent className="p-6 text-left">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  {language === 'en' ? 'Insurance Requirements (REQUIRED)' : 'Requisitos de Seguro (REQUERIDO)'}
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  {language === 'en'
                    ? 'All subcontractors must maintain the following insurance coverage and provide proof before contract execution:'
                    : 'Todos los subcontratistas deben mantener la siguiente cobertura de seguro y proporcionar prueba antes de la ejecución del contrato:'}
                </p>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>{language === 'en' ? 'General Liability Insurance:' : 'Seguro de Responsabilidad General:'}</strong>
                      <span className="block text-gray-600 mt-1">
                        {language === 'en'
                          ? 'Minimum $1,000,000 per occurrence / $2,000,000 aggregate'
                          : 'Mínimo $1,000,000 por ocurrencia / $2,000,000 agregado'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>{language === 'en' ? 'Additional Insured:' : 'Asegurado Adicional:'}</strong>
                      <span className="block text-gray-600 mt-1">
                        {language === 'en'
                          ? 'HJS SERVICES LLC must be named as Additional Insured on policy'
                          : 'HJS SERVICES LLC debe ser nombrado como Asegurado Adicional en la póliza'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>{language === 'en' ? 'Certificate of Insurance:' : 'Certificado de Seguro:'}</strong>
                      <span className="block text-gray-600 mt-1">
                        {language === 'en'
                          ? 'Valid COI must be provided before starting work'
                          : 'Debe proporcionar un COI válido antes de comenzar a trabajar'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>{language === 'en' ? 'Workers\' Compensation:' : 'Compensación Laboral:'}</strong>
                      <span className="block text-gray-600 mt-1">
                        {language === 'en'
                          ? 'Required if subcontractor has employees (per GA state law)'
                          : 'Requerido si el subcontratista tiene empleados (según la ley del estado de GA)'}
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>{language === 'en' ? 'Commercial Auto Insurance:' : 'Seguro de Auto Comercial:'}</strong>
                      <span className="block text-gray-600 mt-1">
                        {language === 'en'
                          ? 'Required if using vehicle for work ($1,000,000 minimum)'
                          : 'Requerido si usa vehículo para el trabajo (mínimo $1,000,000)'}
                      </span>
                    </div>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-xs text-gray-700">
                    <strong>{language === 'en' ? 'IMPORTANT:' : 'IMPORTANTE:'}</strong>{' '}
                    {language === 'en'
                      ? 'Subcontractors are responsible for their own insurance coverage. HJS SERVICES LLC assumes no liability for uninsured subcontractors. All insurance must remain current throughout the contract period.'
                      : 'Los subcontratistas son responsables de su propia cobertura de seguro. HJS SERVICES LLC no asume ninguna responsabilidad por subcontratistas sin seguro. Todo seguro debe permanecer vigente durante el período del contrato.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button 
              size="lg" 
              className="bg-white text-green-900 hover:bg-green-50"
              onClick={() => window.location.href = 'mailto:subcontractors@howardjanitorial.com?subject=Subcontractor Application&body=Please include:%0D%0A- Your business name and contact info%0D%0A- Years of experience%0D%0A- Services you provide%0D%0A- Availability%0D%0A- Insurance information%0D%0A%0D%0AWe will respond within 24 hours.'}
            >
              <Mail className="h-5 w-5 mr-2" />
              {language === 'en' ? 'Apply as Subcontractor' : 'Solicitar como Subcontratista'}
            </Button>
            <p className="text-sm text-green-200 mt-4">
              {language === 'en' 
                ? 'Email: subcontractors@howardjanitorial.com'
                : 'Correo electrónico: subcontractors@howardjanitorial.com'}
            </p>
          </div>
        </div>
      </section>

      {/* Live Chat Widget Placeholder */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 bg-green-600 hover:bg-green-700 shadow-xl"
          onClick={() => alert('Live chat integration coming soon! For now, please call 800-403-8492')}
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      </div>

      {/* Contact Form */}
      <section className="py-20" id="contact">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Request a Free Quote</h2>
            <p className="text-xl text-gray-600">
              Let us know about your cleaning needs and we'll get back to you within 24 hours
            </p>
          </div>

          {showScheduler ? (
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Schedule Your Free Consultation</h3>
                  <p className="text-gray-600 mb-6">
                    Choose a convenient time for us to discuss your cleaning needs and provide a custom quote.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => alert('Scheduling for Morning (8AM-12PM)')}
                    >
                      Morning<br />8AM - 12PM
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => alert('Scheduling for Afternoon (12PM-5PM)')}
                    >
                      Afternoon<br />12PM - 5PM
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => alert('Scheduling for Evening (5PM-8PM)')}
                    >
                      Evening<br />5PM - 8PM
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Or call us now: <a href="tel:8004038492" className="text-green-600 font-semibold hover:underline">800-403-8492</a>
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowScheduler(false)}
                  >
                    Back to Contact Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone *</label>
                      <input
                        type="tel"
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Service Needed</label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    >
                      <option value="">Select a service...</option>
                      <option value="commercial">Commercial Cleaning</option>
                      <option value="floor">Floor Care</option>
                      <option value="window">Window Cleaning</option>
                      <option value="specialized">Specialized Cleaning</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your facility and cleaning needs..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
                      Send Request
                    </Button>
                    <Button 
                      type="button"
                      size="lg" 
                      variant="outline"
                      className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => setShowScheduler(true)}
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule Call Instead
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Howard Janitorial Services</h3>
              <p className="text-gray-400 mb-4">HJS SERVICES LLC</p>
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Mail className="h-4 w-4" />
                <span>hr@howardjanitorial.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>800-403-8492</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Our Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Commercial Cleaning</li>
                <li>Floor & Carpet Care</li>
                <li>Window Cleaning</li>
                <li>Specialized Cleaning</li>
                <li>Emergency Services</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Service Areas</h3>
              <p className="text-gray-400 mb-4">
                Athens, GA and surrounding areas
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>BBB Accredited Business</p>
                <p>SAM.gov UEI: YXEYCV2T1DM5</p>
                <p>CAGE Code: 97K10</p>
                <p>License: BT-089217</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© 2025 HJS SERVICES LLC. All rights reserved.</p>
            <p className="mt-2">Managed by <span className="text-green-400">ODYSSEY-1 AI LLC</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
