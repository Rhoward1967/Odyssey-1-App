import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-2xl ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-700/50">
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default GlassPanel;