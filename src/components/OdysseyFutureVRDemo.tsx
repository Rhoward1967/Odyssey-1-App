import React, { useRef, useEffect, useState } from 'react';

// This VR demo uses A-Frame for a futuristic, space-time themed experience
// Make sure aframe is loaded in index.html

const elements = [
  {
    id: 'ai-core',
    label: 'AI Core',
    color: '#00fff7',
    position: '0 1.6 -3',
    geometry: 'icosahedron',
    scale: '1.2 1.2 1.2',
    glow: true,
    info: 'The Odyssey-1 AI Core: Quantum intelligence at the heart of the future.'
  },
  {
    id: 'time-stream',
    label: 'Time Stream',
    color: '#ff00e6',
    position: '-2 1.2 -4',
    geometry: 'torus',
    scale: '0.7 0.7 0.7',
    glow: true,
    info: 'Time Stream: Visualizes the flow of data and decisions across time.'
  },
  {
    id: 'business-hub',
    label: 'Business Hub',
    color: '#ffe600',
    position: '2 1.2 -4',
    geometry: 'octahedron',
    scale: '0.9 0.9 0.9',
    glow: true,
    info: 'Business Hub: The future of enterprise, powered by Odyssey-1.'
  },
  {
    id: 'cosmic-portal',
    label: 'Cosmic Portal',
    color: '#7c3aed',
    position: '0 0.5 -6',
    geometry: 'ring',
    scale: '2 2 2',
    glow: false,
    info: 'Cosmic Portal: Gateway to infinite possibilities.'
  }
];

export default function OdysseyFutureVRDemo() {
  const [active, setActive] = useState(null);
  const infoPanelRef = useRef(null);

  useEffect(() => {
    if (active && infoPanelRef.current) {
      infoPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [active]);

  useEffect(() => {
    // Attach click handlers after scene is rendered
    const handleClick = (id) => () => setActive(id);
    const interval = setInterval(() => {
      const sceneEl = document.querySelector('a-scene');
      if (!sceneEl) return;
      elements.forEach(el => {
        const entity = sceneEl.querySelector(`#${el.id}`);
        if (entity) {
          entity.addEventListener('click', handleClick(el.id));
        }
      });
      clearInterval(interval);
    }, 500);
    return () => {
      const sceneEl = document.querySelector('a-scene');
      if (!sceneEl) return;
      elements.forEach(el => {
        const entity = sceneEl.querySelector(`#${el.id}`);
        if (entity) entity.replaceWith(entity.cloneNode(true));
      });
    };
  }, []);

  return (
    <div className="relative w-full h-[70vh] overflow-hidden rounded-xl my-12 shadow-2xl border border-blue-400/30">
      <a-scene {...({ embedded: true, style: { width: '100%', height: '100%' } } as any)}>
        {/* Cosmic background */}
        <a-sky {...({ color: '#0a0026' } as any)}></a-sky>
        {/* Animated stars */}
        <a-entity {...({ particleSystem: 'preset: dust; color: #fff, #00fff7, #ff00e6; size: 1; count: 2000' } as any)}></a-entity>
        {/* Orbiting data rings */}
        <a-entity {...({ id: 'data-orbit', animation: 'property: rotation; to: 0 360 0; loop: true; dur: 12000; easing: linear', position: '0 1.6 -3' } as any)}>
          <a-torus {...({ color: '#00fff7', radius: '1.7', radiusTubular: '0.03', segmentsRadial: '36', segmentsTubular: '12', opacity: '0.5', transparent: true } as any)}></a-torus>
          <a-torus {...({ color: '#ff00e6', radius: '2.1', radiusTubular: '0.02', segmentsRadial: '36', segmentsTubular: '12', opacity: '0.3', transparent: true } as any)}></a-torus>
        </a-entity>
        {/* Futuristic elements */}
        {elements.map(el => (
          <a-entity
            key={el.id}
            id={el.id}
            className="interactable"
            {...({
              geometry: `primitive: ${el.geometry}`,
              position: el.position,
              scale: el.scale,
              material: `color: ${el.color}; emissive: ${el.glow ? el.color : '#000'}; emissiveIntensity: ${el.glow ? 0.7 : 0.1}; metalness: 0.8; roughness: 0.2; opacity: 0.95; transparent: true; shader: standard`,
              animation: 'property: rotation; to: 0 360 0; loop: true; dur: 9000; easing: linear',
              shadow: true
            } as any)}
          >
            <a-text {...({ value: el.label, align: 'center', position: '0 1 0', color: '#fff', width: '3' } as any)} />
          </a-entity>
        ))}
        {/* Holographic grid floor */}
        <a-grid {...({ color: '#00fff7', opacity: '0.15', width: '30', height: '30', position: '0 0 -4', rotation: '-90 0 0' } as any)}></a-grid>
      </a-scene>
      {active && (
        <div
          ref={infoPanelRef}
          className="absolute top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10"
          onClick={() => setActive(null)}
        >
          <div className="info-panel rounded-lg shadow-2xl p-6 max-w-xl w-full text-gray-100 relative" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-blue-400 mb-4">{elements.find(e => e.id === active)?.label}</h2>
            <p className="text-gray-300 mb-4 text-sm">{elements.find(e => e.id === active)?.info}</p>
            <button
              className="absolute top-4 right-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-colors duration-200"
              onClick={() => setActive(null)}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
