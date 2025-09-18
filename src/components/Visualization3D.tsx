import React, { useEffect, useRef } from 'react';
import GlassPanel from './GlassPanel';

const Visualization3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create animated neural network visualization
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // Neural network nodes
    const nodes: Array<{ x: number; y: number; vx: number; vy: number }> = [];
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(12, 17, 29, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x <= 0 || node.x >= canvas.width) node.vx *= -1;
        if (node.y <= 0 || node.y >= canvas.height) node.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();

        // Draw connections
        nodes.slice(i + 1).forEach(otherNode => {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${1 - distance / 100})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <GlassPanel title="Core Visualization" className="h-64 relative">
      <div ref={containerRef} className="absolute inset-6 rounded-lg overflow-hidden bg-gray-900/50" />
    </GlassPanel>
  );
};

export default Visualization3D;