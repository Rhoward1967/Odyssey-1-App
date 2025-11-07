import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';

/**
 * Industry-Specific Components
 * These components adapt their styling based on the active theme
 */

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function IndustryCTAButton({ children, onClick, size = 'md' }: CTAButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        font-semibold rounded-lg transition-all
        hover:scale-105 hover:shadow-lg
      `}
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white'
      }}
    >
      {children}
    </button>
  );
}

interface EmergencyContactProps {
  phone: string;
  available24_7?: boolean;
}

export function EmergencyContactBanner({ phone, available24_7 = false }: EmergencyContactProps) {
  return (
    <div 
      className="p-4 rounded-lg flex items-center justify-between"
      style={{
        backgroundColor: 'var(--color-accent)',
        color: 'white'
      }}
    >
      <div className="flex items-center gap-2">
        <Phone className="w-6 h-6" />
        <div>
          <p className="text-sm font-medium">Emergency Service</p>
          <p className="text-xl font-bold">{phone}</p>
        </div>
      </div>
      {available24_7 && (
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">24/7 Available</span>
        </div>
      )}
    </div>
  );
}

interface ServiceCardProps {
  title: string;
  description: string;
  price?: string;
  icon?: React.ReactNode;
}

export function IndustryServiceCard({ title, description, price, icon }: ServiceCardProps) {
  return (
    <div 
      className="p-6 rounded-xl transition-all hover:scale-105"
      style={{
        backgroundColor: 'var(--color-secondary)',
        borderLeft: '4px solid var(--color-primary)'
      }}
    >
      {icon && (
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {icon}
        </div>
      )}
      <h3 
        className="text-xl font-bold mb-2"
        style={{ 
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-primary)'
        }}
      >
        {title}
      </h3>
      <p 
        className="mb-4"
        style={{ color: 'var(--color-text)' }}
      >
        {description}
      </p>
      {price && (
        <div 
          className="text-2xl font-bold"
          style={{ color: 'var(--color-accent)' }}
        >
          {price}
        </div>
      )}
    </div>
  );
}

interface ContactInfoProps {
  phone: string;
  email: string;
  address: string;
  hours: string;
}

export function IndustryContactInfo({ phone, email, address, hours }: ContactInfoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Phone 
          className="w-5 h-5 mt-1" 
          style={{ color: 'var(--color-primary)' }}
        />
        <div>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Phone</p>
          <a 
            href={`tel:${phone}`}
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            {phone}
          </a>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Mail 
          className="w-5 h-5 mt-1" 
          style={{ color: 'var(--color-primary)' }}
        />
        <div>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Email</p>
          <a 
            href={`mailto:${email}`}
            className="hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            {email}
          </a>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <MapPin 
          className="w-5 h-5 mt-1" 
          style={{ color: 'var(--color-primary)' }}
        />
        <div>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Location</p>
          <p style={{ color: 'var(--color-text)' }}>{address}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Clock 
          className="w-5 h-5 mt-1" 
          style={{ color: 'var(--color-primary)' }}
        />
        <div>
          <p className="font-semibold" style={{ color: 'var(--color-text)' }}>Hours</p>
          <p style={{ color: 'var(--color-text)' }}>{hours}</p>
        </div>
      </div>
    </div>
  );
}
