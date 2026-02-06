import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
  speed: number;
}

const PARTICLE_COUNT = 800;
const MOUSE_RADIUS = 180;
const MOUSE_FORCE = 0.08;
const RETURN_FORCE = 0.015;
const FRICTION = 0.92;
const WAVE_SPEED = 0.003;
const WAVE_AMPLITUDE = 30;
const PARTICLE_MIN_SIZE = 1;
const PARTICLE_MAX_SIZE = 3;
const CONNECTION_DISTANCE = 80;

export default function PluribusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: 0,
        vy: 0,
        size: PARTICLE_MIN_SIZE + Math.random() * (PARTICLE_MAX_SIZE - PARTICLE_MIN_SIZE),
        alpha: 0.2 + Math.random() * 0.6,
        baseAlpha: 0.2 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimensionsRef.current = { width, height };

      // Reinitialize particles on resize
      particlesRef.current = initParticles(width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    const animate = () => {
      const { width, height } = dimensionsRef.current;
      timeRef.current += 1;
      const t = timeRef.current;

      ctx.fillStyle = 'rgba(5, 5, 12, 0.15)';
      ctx.fillRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Organic wave motion
        const waveX = Math.sin(t * WAVE_SPEED + p.phase) * WAVE_AMPLITUDE * 0.3;
        const waveY = Math.cos(t * WAVE_SPEED * 0.7 + p.phase) * WAVE_AMPLITUDE * 0.5;
        const targetX = p.baseX + waveX;
        const targetY = p.baseY + waveY;

        // Return to base position with wave offset
        p.vx += (targetX - p.x) * RETURN_FORCE;
        p.vy += (targetY - p.y) * RETURN_FORCE;

        // Mouse interaction - magnetic repulsion with swirl
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
            const angle = Math.atan2(dy, dx);
            // Repulsion + slight tangential swirl for that magnetic feel
            p.vx += Math.cos(angle) * force * 8;
            p.vy += Math.sin(angle) * force * 8;
            p.vx += Math.cos(angle + Math.PI / 2) * force * 2;
            p.vy += Math.sin(angle + Math.PI / 2) * force * 2;

            // Brighten particles near mouse
            p.alpha = Math.min(1, p.baseAlpha + (1 - dist / MOUSE_RADIUS) * 0.5);
          } else {
            p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          }
        } else {
          p.alpha += (p.baseAlpha - p.alpha) * 0.05;
        }

        // Apply friction
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Pulsing alpha
        const pulse = Math.sin(t * 0.02 + p.phase) * 0.15;
        const finalAlpha = Math.max(0.05, Math.min(1, p.alpha + pulse));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 225, 240, ${finalAlpha})`;
        ctx.fill();
      }

      // Draw connections between nearby particles
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(180, 190, 220, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    // Initial clear to black
    ctx.fillStyle = '#05050c';
    ctx.fillRect(0, 0, dimensionsRef.current.width, dimensionsRef.current.height);

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: '#05050c',
      }}
    />
  );
}
