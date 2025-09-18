import { Button } from '@/components/ui/button';
import { useRealtimeContent } from '@/hooks/useRealtimeContent';

export const RealtimeHeroSection = () => {
  const { getContentBySection, loading } = useRealtimeContent();
  const heroContent = getContentBySection('hero');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  const content = heroContent?.content || {};

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
      <div className="max-w-6xl mx-auto text-center text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {heroContent?.title || 'HJS Services - Odyssey-1'}
        </h1>
        
        <p className="text-xl md:text-2xl mb-4 text-blue-100">
          {heroContent?.description || 'Advanced Government Contracting & Business Intelligence Platform'}
        </p>
        
        <p className="text-lg mb-8 text-gray-300 max-w-4xl mx-auto">
          {content.subtitle || 'Streamline your government contracting process with AI-powered bidding, comprehensive janitorial services, and intelligent business solutions.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
            {content.cta_primary || 'Start Free Trial'}
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
            {content.cta_secondary || 'Schedule Demo'}
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">500+</h3>
            <p className="text-blue-200">Government Contracts Won</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">98%</h3>
            <p className="text-blue-200">Client Satisfaction Rate</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-2">24/7</h3>
            <p className="text-blue-200">Expert Support</p>
          </div>
        </div>
      </div>
    </section>
  );
};