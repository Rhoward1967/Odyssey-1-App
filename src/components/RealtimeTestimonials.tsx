import { Card, CardContent } from '@/components/ui/card';
import { useRealtimeContent } from '@/hooks/useRealtimeContent';
import { Star } from 'lucide-react';

export const RealtimeTestimonials = () => {
  const { getFeaturedTestimonials, loading } = useRealtimeContent();
  const testimonials = getFeaturedTestimonials();

  if (loading) {
    return (
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-xl text-gray-600">Trusted by businesses nationwide</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.testimonial}"
                </p>
                
                <div className="border-t pt-4">
                  <p className="font-semibold">{testimonial.client_name}</p>
                  {testimonial.company && (
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};