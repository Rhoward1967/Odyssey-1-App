import React, { useRef, useEffect, useState, useMemo } from 'react';

// Orb + Hive VR Demo for Odyssey-1
// Requires aframe in index.html




export default function OdysseyOrbHiveVRDemo() {
  const [active, setActive] = useState(null);
  const [aframeReady, setAframeReady] = useState(false);
  const infoPanelRef = useRef(null);
  // Bee orbs: animate 3 bees in a circle around the hive
  const beeOrbs = useMemo(() => [
    { id: 'bee-1', color: '#ffe600', delay: 0 },
    { id: 'bee-2', color: '#ffd700', delay: 800 },
    { id: 'bee-3', color: '#fff700', delay: 1600 },
  ], []);

  // Dynamically load A-Frame only once on mount
  useEffect(() => {
    if ((window as any).AFRAME) {
      setAframeReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://aframe.io/releases/1.5.0/aframe.min.js';
    script.async = true;
    script.onload = () => setAframeReady(true);
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!aframeReady) return;
    if (active && infoPanelRef.current) {
      infoPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [active, aframeReady]);

  useEffect(() => {
    if (!aframeReady) return;
    // Attach click handlers after scene is rendered
  // Custom A-Frame component for a dynamic star swarm (galaxy/hive)
    const handleClick = (id) => () => setActive(id);
    const interval = setInterval(() => {
      const sceneEl = document.querySelector('a-scene');
      if (!sceneEl) return;
      // Central orb
      const core = sceneEl.querySelector('#ai-orb');
      if (core) core.addEventListener('click', handleClick('ai-orb'));
      // Small orb
      const small = sceneEl.querySelector('#orbit-orb');
      if (small) small.addEventListener('click', handleClick('orbit-orb'));
      // Bees
      beeOrbs.forEach((bee, i) => {
        const beeEl = sceneEl.querySelector(`#${bee.id}`);
        if (beeEl) beeEl.addEventListener('click', handleClick(bee.id));
      });
      clearInterval(interval);
    }, 500);
    return () => {
      const sceneEl = document.querySelector('a-scene');
      if (!sceneEl) return;
      const core = sceneEl.querySelector('#ai-orb');
      if (core) core.replaceWith(core.cloneNode(true));
      const small = sceneEl.querySelector('#orbit-orb');
      if (small) small.replaceWith(small.cloneNode(true));
      beeOrbs.forEach((bee) => {
        const beeEl = sceneEl.querySelector(`#${bee.id}`);
        if (beeEl) beeEl.replaceWith(beeEl.cloneNode(true));
      });
    };
  }, [aframeReady, beeOrbs]);

  if (!aframeReady) {
    return (
      <div className="relative w-full h-[70vh] flex items-center justify-center bg-black/60 rounded-xl my-12 shadow-2xl border border-blue-400/30">
        <span className="text-blue-300 text-lg animate-pulse">Loading VR experience...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] overflow-hidden rounded-xl my-12 shadow-2xl border border-blue-400/30">
      <a-scene {...({ embedded: true, style: { width: '100%', height: '100%' } } as any)}>
        {/* Cosmic background */}
        <a-sky {...({ color: '#0a0026' } as any)}></a-sky>
          {/* Central Blue AI Core Orb */}
          <a-sphere
            {...({
              position: '0 1.6 -3',
              radius: 0.38,
              color: '#3bb9ff',
              emissive: '#1a4d99',
              emissiveIntensity: 0.7,
              ['segments-width']: 48,
              ['segments-height']: 48,
              material: 'shader: standard; metalness: 0.8; roughness: 0.15; opacity: 0.98; transparent: true;'
            } as any)}
          >
            <a-animation {...({
              attribute: 'material.emissiveIntensity',
              direction: 'alternate',
              dur: 2200,
              to: 1.0,
              from: 0.7,
              repeat: 'indefinite',
              easing: 'ease-in-out'
            } as any)} />
          </a-sphere>
        {/* Hive: static, softly glowing star field */}
          <a-entity
            {...({
              particleSystem: 'preset: snow; color: #fff, #b3e6ff, #a18fff, #6e4cff; size: 0.028; count: 2200; positionSpread: 5.5 2.2 5.5; randomizePosition: true; opacity: 0.82; direction: 0; accelerationValue: 0 0 0; texture: /star.png;',
              position: '0 1.6 -3',
              rotation: '0 0 0',
              animation: 'property: rotation; to: 0 360 0; loop: true; dur: 48000; easing: linear'
            } as any)}
          ></a-entity>
          {/* Twinkling effect overlay for galaxy */}
          <a-animation
            {...({
              attribute: 'components.particlesystem.material.uniforms.opacity.value',
              direction: 'alternate',
              dur: 2100,
              to: 0.48,
              from: 0.82,
              repeat: 'indefinite',
              easing: 'ease-in-out'
            } as any)}
          />
          {/* Orbiting Data Orb (planet-like) */}
          <a-entity
            {...({
              id: 'orbiting-orb',
              animation: 'property: position; dir: alternate; loop: true; dur: 12000; to: 1.2 2.1 -3; from: -1.2 1.1 -3'
            } as any)}
          >
            <a-sphere
              {...({
                radius: 0.13,
                color: '#ffe600',
                emissive: '#fffbe6',
                emissiveIntensity: 0.5,
                'segments-width': 32,
                'segments-height': 32,
                material: 'shader: standard; metalness: 0.6; roughness: 0.3; opacity: 0.95; transparent: true;'
              } as any)}
            >
              <a-animation {...({
                attribute: 'material.emissiveIntensity',
                direction: 'alternate',
                dur: 1800,
                to: 0.8,
                from: 0.5,
                repeat: 'indefinite',
                easing: 'ease-in-out'
              } as any)} />
            </a-sphere>
          </a-entity>
        {/* Animated bee orbs (smaller, yellow, orbiting hive) */}
        {beeOrbs.map((bee, i) => (
          <a-entity
            key={bee.id}
            id={bee.id}
            className="interactable"
            {...({
              position: '0 1.6 -3',
              animation: `property: rotation; to: 0 360 0; loop: true; dur: 3500; delay: ${bee.delay}; easing: linear`
            } as any)}
          >
            <a-sphere
              {...({
                position: '2.0 0 0',
                radius: '0.07',
                material: `color: ${bee.color}; emissive: #fff700; emissiveIntensity: 0.9; metalness: 0.7; roughness: 0.2; opacity: 0.98; transparent: true; shader: standard`,
                shadow: true
              } as any)}
            />
          </a-entity>
        ))}
        {/* Small orb orbiting the core */}
        <a-entity
          id="orbit-orb"
          className="interactable"
          {...({
            position: '0 1.6 -3',
            animation: 'property: rotation; to: 0 360 0; loop: true; dur: 4000; easing: linear'
          } as any)}
        >
          <a-sphere
            {...({
              position: '1.2 0 0',
              radius: '0.18',
              material: 'color: #ffe600; emissive: #ffe600; emissiveIntensity: 0.8; metalness: 0.7; roughness: 0.2; opacity: 0.98; transparent: true; shader: standard',
              shadow: true
            } as any)}
          />
        </a-entity>
        {/* Holographic grid floor */}
        <a-grid {...({ color: '#00fff7', opacity: '0.12', width: '30', height: '30', position: '0 0 -4', rotation: '-90 0 0' } as any)}></a-grid>
      </a-scene>
      {active && (
        <div
          ref={infoPanelRef}
          className="absolute top-0 left-0 w-full h-full bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10"
          onClick={() => setActive(null)}
        >
          <div className="info-panel rounded-lg shadow-2xl p-6 max-w-xl w-full text-gray-100 relative" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-blue-400 mb-4">
              {active === 'ai-orb' && 'Odyssey-1 AI Core'}
              {active.startsWith('hive-') && 'The Hive Node'}
              {active === 'orbit-orb' && 'Orbiting Data Node'}
            </h2>
            <p className="text-gray-300 mb-4 text-sm">
              {active === 'ai-orb' && 'The central intelligence of Odyssey-1, glowing with quantum power.'}
              {active.startsWith('hive-') && 'A node in the self-evolving Hive, supporting the AI core.'}
              {active === 'orbit-orb' && 'A data or business process, always in motion around the core.'}
            </p>
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
