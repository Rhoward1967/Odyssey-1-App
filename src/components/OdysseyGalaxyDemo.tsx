import React, { useRef, useEffect, useState } from 'react';
// Three.js-based dynamic galaxy demo for Odyssey-1
// This is a standalone React component (not A-Frame)

// @ts-ignore
import * as THREE from 'three';

const STAR_COUNT = 2500;
const ORBIT_RADIUS = 2.2;
const ORBIT_SPEED = 0.18;
const PLANET_RADIUS = 0.18;
const CORE_RADIUS = 0.65;

function randomGalaxyPosition(radius: number, spiralArms = 3) {
  // Disk/halo distribution: stars in a wide, thin circle around the orb
  const angle = Math.random() * Math.PI * 2;
  // More stars at a fixed radius, some randomization for natural look
  const distance = radius * (0.85 + 0.25 * Math.random());
  // Thin vertical spread for a disk/halo
  const y = (Math.random() - 0.5) * 0.18;
  const x = Math.cos(angle) * distance;
  const z = Math.sin(angle) * distance;
  return new THREE.Vector3(x, y, z);
}

export default function OdysseyGalaxyDemo({ full = false }: { full?: boolean } = {}) {
  // For mouse drag interaction
  const [drag, setDrag] = useState({ active: false, lastX: 0, velocity: 0 });
  const [info, setInfo] = useState<null | string>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>();
  const planetAngle = useRef(0);

  useEffect(() => {
    const mountNode = mountRef.current;
    const width = mountNode?.clientWidth || 800;
    const height = mountNode?.clientHeight || 500;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0026');

    // Galaxy stars
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starColors = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const pos = randomGalaxyPosition(3.5, 4);
      starPositions[i * 3] = pos.x;
      starPositions[i * 3 + 1] = pos.y;
      starPositions[i * 3 + 2] = pos.z;
      // Color: blue/white core, purple/blue edges
      const t = Math.min(1, pos.length() / 3.5);
      const color = new THREE.Color().lerpColors(
        new THREE.Color('#fff'),
        new THREE.Color('#6e4cff'),
        t
      );
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMaterial = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);


    // Central AI core (blue orb)
    const coreGeometry = new THREE.SphereGeometry(CORE_RADIUS, 48, 48);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: '#3bb9ff',
      emissive: '#1a4d99',
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.15,
      transparent: true,
      opacity: 0.98,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.position.set(0, 0, 0);
    core.name = 'core';
    scene.add(core);

    // No head or face, just the original AI core orb

    // Add a wireframe cage around the orb
    const cageGeometry = new THREE.SphereGeometry(CORE_RADIUS * 1.18, 32, 32);
    const cageMaterial = new THREE.MeshBasicMaterial({
      color: '#b3e6ff',
      wireframe: true,
      opacity: 0.45,
      transparent: true
    });
    const cage = new THREE.Mesh(cageGeometry, cageMaterial);
    cage.name = 'cage';
    scene.add(cage);

    // Orbiting planet
    const planetGeometry = new THREE.SphereGeometry(PLANET_RADIUS, 32, 32);
    const planetMaterial = new THREE.MeshPhysicalMaterial({
      color: '#ffe600',
      emissive: '#fffbe6',
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.3,
      transparent: true,
      opacity: 0.95
    });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  planet.name = 'planet';
  scene.add(planet);

    // Lighting
    const ambient = new THREE.AmbientLight('#b3e6ff', 0.7);
    scene.add(ambient);
    const point = new THREE.PointLight('#3bb9ff', 1.2, 10);
    point.position.set(0, 0, 0);
    scene.add(point);

    // Camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 30);
    camera.position.set(0, 0.7, 5.5);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x0a0026, 1);
    mountNode?.appendChild(renderer.domElement);

    // Add pointer cursor on hover and handle clicks (must be after renderer is defined)
    let hovered = false;
    let userRotation = 0;
    let userVelocity = 0;
    let lastDragX = 0;
    let dragging = false;

    // Mouse/touch drag handlers
    const onPointerDownDrag = (event: MouseEvent | TouchEvent) => {
      dragging = true;
      lastDragX = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX);
    };
    const onPointerMoveDrag = (event: MouseEvent | TouchEvent) => {
      if (!dragging) return;
      const x = (event instanceof MouseEvent ? event.clientX : event.touches[0].clientX);
      const deltaX = x - lastDragX;
      userVelocity = deltaX * 0.002;
      userRotation += userVelocity;
      lastDragX = x;
    };
    const onPointerUpDrag = () => {
      dragging = false;
    };
    const onPointerMove = (event: MouseEvent) => {
      if (!renderer.domElement) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([core, cage, planet]);
      if (intersects.length > 0) {
        if (!hovered) {
          renderer.domElement.style.cursor = 'pointer';
          hovered = true;
        }
      } else {
        if (hovered) {
          renderer.domElement.style.cursor = '';
          hovered = false;
        }
      }
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!renderer.domElement) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([core, cage, planet]);
      if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.name === 'core') setInfo('core');
        else if (obj.name === 'cage') setInfo('cage');
        else if (obj.name === 'planet') setInfo('planet');
      }
    };
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  // Mouse drag listeners for galaxy rotation
  renderer.domElement.addEventListener('mousedown', onPointerDownDrag);
  renderer.domElement.addEventListener('mousemove', onPointerMoveDrag);
  renderer.domElement.addEventListener('mouseup', onPointerUpDrag);
  renderer.domElement.addEventListener('mouseleave', onPointerUpDrag);
  // Touch support
  renderer.domElement.addEventListener('touchstart', onPointerDownDrag);
  renderer.domElement.addEventListener('touchmove', onPointerMoveDrag);
  renderer.domElement.addEventListener('touchend', onPointerUpDrag);

    // Animation loop
    let t = 0;
    function animate() {
      t += 0.016;
      // Twinkle effect
      starMaterial.opacity = 0.7 + 0.25 * Math.abs(Math.sin(t * 0.7));
      // Galaxy rotation: user controlled + inertia
      if (!dragging) {
        userVelocity *= 0.97; // inertia
      }
      userRotation += userVelocity + 0.0007;
      stars.rotation.y = userRotation;
      // Orbiting planet
      planetAngle.current += ORBIT_SPEED * 0.016;
      planet.position.set(
        Math.cos(planetAngle.current) * ORBIT_RADIUS,
        0.2 * Math.sin(planetAngle.current * 1.7),
        Math.sin(planetAngle.current) * ORBIT_RADIUS
      );
      // Core subtle pulse
      core.scale.setScalar(1 + 0.04 * Math.sin(t * 1.2));
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    }
    animate();

    // Cleanup
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('mousedown', onPointerDownDrag);
      renderer.domElement.removeEventListener('mousemove', onPointerMoveDrag);
      renderer.domElement.removeEventListener('mouseup', onPointerUpDrag);
      renderer.domElement.removeEventListener('mouseleave', onPointerUpDrag);
      renderer.domElement.removeEventListener('touchstart', onPointerDownDrag);
      renderer.domElement.removeEventListener('touchmove', onPointerMoveDrag);
      renderer.domElement.removeEventListener('touchend', onPointerUpDrag);
      mountNode?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={full
        ? {
            width: '100%',
            height: '60vh',
            borderRadius: '1rem',
            background: '#0a0026',
            boxShadow: '0 0 32px #1a4d99',
            position: 'relative',
          }
        : {
            width: '100%',
            height: '100%',
            position: 'relative',
            background: 'transparent',
            borderRadius: 0,
            boxShadow: 'none',
          }
      }
    >
      {info && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10,0,38,0.92)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }} onClick={() => setInfo(null)}>
          <div style={{
            background: 'rgba(30,30,60,0.98)',
            borderRadius: '1rem',
            boxShadow: '0 0 32px #1a4d99',
            padding: '2.5rem 2rem',
            maxWidth: 420,
            textAlign: 'center',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '2rem', color: '#b3e6ff', marginBottom: 16 }}>
              {info === 'core' && 'Odyssey-1 AI Core'}
              {info === 'cage' && 'Quantum Containment Cage'}
              {info === 'planet' && 'Orbiting Data Node'}
            </h2>
            <p style={{ color: '#e0e0ff', fontSize: '1.1rem', marginBottom: 24 }}>
              {info === 'core' && 'The central intelligence of Odyssey-1, glowing with quantum power and insight.'}
              {info === 'cage' && 'A protective quantum lattice, containing and amplifying the AI core\'s abilities.'}
              {info === 'planet' && 'A data or business process, always in motion around the core, connecting the hive.'}
            </p>
            <button style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: '#1a4d99',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              fontSize: 20,
              cursor: 'pointer',
              boxShadow: '0 0 8px #3bb9ff'
            }} onClick={() => setInfo(null)}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
}
