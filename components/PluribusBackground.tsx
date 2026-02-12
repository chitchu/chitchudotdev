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

interface PulseWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  strength: number;
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

// Idle animation constants
const ATTRACTOR_SPEED = 0.0008;
const ATTRACTOR_RADIUS = 250;
const ATTRACTOR_FORCE = 0.012;
const PULSE_INTERVAL = 300; // frames between pulses
const PULSE_WAVE_SPEED = 3;
const PULSE_MAX_RADIUS = 500;
const PULSE_STRENGTH = 0.6;
const FLOW_SPEED = 0.001;
const FLOW_STRENGTH = 0.15;

export default function PluribusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const pulsesRef = useRef<PulseWave[]>([]);

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
      const pulses = pulsesRef.current;

      // --- Idle animation: roaming attractor ---
      // Traces a slow Lissajous curve across the screen
      const attractorX = width * 0.5 + Math.sin(t * ATTRACTOR_SPEED) * width * 0.35;
      const attractorY = height * 0.5 + Math.cos(t * ATTRACTOR_SPEED * 0.7) * height * 0.35;

      // --- Idle animation: spawn pulse waves periodically ---
      if (t % PULSE_INTERVAL === 0) {
        pulses.push({
          x: width * (0.2 + Math.random() * 0.6),
          y: height * (0.2 + Math.random() * 0.6),
          radius: 0,
          maxRadius: PULSE_MAX_RADIUS + Math.random() * 200,
          strength: PULSE_STRENGTH,
          speed: PULSE_WAVE_SPEED + Math.random() * 1.5,
        });
      }

      // Update pulse waves
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].radius += pulses[i].speed;
        if (pulses[i].radius > pulses[i].maxRadius) {
          pulses.splice(i, 1);
        }
      }

      // --- Idle animation: flow field ---
      // A slowly rotating vector field that nudges particles
      const flowAngle = t * FLOW_SPEED;

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

        // --- Idle: attractor pull ---
        const adx = attractorX - p.x;
        const ady = attractorY - p.y;
        const aDist = Math.sqrt(adx * adx + ady * ady);
        if (aDist < ATTRACTOR_RADIUS && aDist > 0) {
          const aForce = (1 - aDist / ATTRACTOR_RADIUS) * ATTRACTOR_FORCE;
          p.vx += (adx / aDist) * aForce;
          p.vy += (ady / aDist) * aForce;
        }

        // --- Idle: pulse wave push ---
        for (let j = 0; j < pulses.length; j++) {
          const pulse = pulses[j];
          const pdx = p.x - pulse.x;
          const pdy = p.y - pulse.y;
          const pDist = Math.sqrt(pdx * pdx + pdy * pdy);
          const ringDist = Math.abs(pDist - pulse.radius);
          const ringWidth = 60;
          if (ringDist < ringWidth && pDist > 0) {
            const falloff = (1 - ringDist / ringWidth) * (1 - pulse.radius / pulse.maxRadius);
            const pForce = falloff * pulse.strength;
            p.vx += (pdx / pDist) * pForce;
            p.vy += (pdy / pDist) * pForce;
            // Brighten particles hit by pulse
            p.alpha = Math.min(1, p.alpha + falloff * 0.3);
          }
        }

        // --- Idle: flow field ---
        const cellSize = 200;
        const flowNoise = Math.sin((p.x / cellSize) + flowAngle) *
                          Math.cos((p.y / cellSize) + flowAngle * 0.6);
        const flowDir = flowAngle + flowNoise * Math.PI;
        p.vx += Math.cos(flowDir) * FLOW_STRENGTH * 0.1;
        p.vy += Math.sin(flowDir) * FLOW_STRENGTH * 0.1;

        // Mouse interaction - magnetic repulsion with swirl
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
            const angle = Math.atan2(dy, dx);
            p.vx += Math.cos(angle) * force * 8;
            p.vy += Math.sin(angle) * force * 8;
            p.vx += Math.cos(angle + Math.PI / 2) * force * 2;
            p.vy += Math.sin(angle + Math.PI / 2) * force * 2;
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

      // Draw subtle pulse wave rings (visual feedback)
      for (let i = 0; i < pulses.length; i++) {
        const pulse = pulses[i];
        const fadeout = 1 - pulse.radius / pulse.maxRadius;
        if (fadeout > 0) {
          ctx.beginPath();
          ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180, 190, 255, ${fadeout * 0.04})`;
          ctx.lineWidth = 1;
          ctx.stroke();
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
