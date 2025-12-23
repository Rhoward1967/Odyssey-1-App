import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export interface SiteContent {
  id: string;
  section: string;
  title: string;
  description: string;
  content: any;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  features: string[];
  price_monthly: number;
  price_yearly: number;
  category: string;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  client_name: string;
  company?: string;
  testimonial: string;
  rating: number;
  image_url?: string;
  is_featured: boolean;
  is_active: boolean;
}

export const useRealtimeContent = () => {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
    setupRealtimeSubscriptions();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [contentRes, servicesRes, testimonialsRes] = await Promise.all([
        supabase.from('site_content').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('services').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('testimonials').select('*').eq('is_active', true).order('created_at', { ascending: false })
      ]);

      if (contentRes.data) setContent(contentRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (testimonialsRes.data) setTestimonials(testimonialsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const contentChannel = supabase
      .channel('site_content_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, () => {
        fetchInitialData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(contentChannel);
    };
  };

  const getContentBySection = (section: string) => {
    return content.find(item => item.section === section);
  };

  const getFeaturedServices = () => {
    return services.filter(service => service.is_featured);
  };

  const getFeaturedTestimonials = () => {
    return testimonials.filter(testimonial => testimonial.is_featured);
  };

  return {
    content,
    services,
    testimonials,
    loading,
    getContentBySection,
    getFeaturedServices,
    getFeaturedTestimonials
  };
};