import React from 'react';
import OdysseyGalaxyDemo from '@/components/OdysseyGalaxyDemo';


const OdysseyLogo: React.FC<{ style?: React.CSSProperties; className?: string }> = ({ style, className }) => (
  <div
    style={{
      aspectRatio: '1 / 1',
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      ...style,
    }}
    className={className}
  >
    <OdysseyGalaxyDemo />
  </div>
);

export default OdysseyLogo;
