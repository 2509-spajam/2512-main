import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const PARTICLE_COUNT = 40;
const PARTICLE_RADIUS = 2;
const CONNECTION_DISTANCE = 120;
const PARTICLE_COLOR = "#03FFD1";
const LINE_COLOR = "#03FFD1";
const LINE_OPACITY = 0.3;
const TARGET_FPS = 30;
const CONNECTION_UPDATE_INTERVAL = 3;

export const ParticlesBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const connectionsRef = useRef<
    Array<{ i: number; j: number; opacity: number }>
  >([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (width === 0 || height === 0) return;

    if (!initializedRef.current) {
      const initialParticles = Array.from({ length: PARTICLE_COUNT }, () => {
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: PARTICLE_RADIUS,
        };
      });
      particlesRef.current = initialParticles;
      connectionsRef.current = [];
      setParticles(initialParticles);
      initializedRef.current = true;
    }

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastUpdateTimeRef.current;
      const frameInterval = 1000 / TARGET_FPS;

      if (deltaTime >= frameInterval) {
        const particles = particlesRef.current;
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;
          let newVx = particle.vx;
          let newVy = particle.vy;

          if (newX < 0 || newX > width) {
            newVx *= -1;
            newX = Math.max(0, Math.min(width, newX));
          }
          if (newY < 0 || newY > height) {
            newVy *= -1;
            newY = Math.max(0, Math.min(height, newY));
          }

          particles[i] = {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        }

        frameCountRef.current++;
        if (frameCountRef.current >= CONNECTION_UPDATE_INTERVAL) {
          frameCountRef.current = 0;
          const connections: Array<{ i: number; j: number; opacity: number }> =
            [];
          const connectionDistanceSquared =
            CONNECTION_DISTANCE * CONNECTION_DISTANCE;

          for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const distanceSquared = dx * dx + dy * dy;

              if (distanceSquared < connectionDistanceSquared) {
                const distance = Math.sqrt(distanceSquared);
                const opacity =
                  LINE_OPACITY * (1 - distance / CONNECTION_DISTANCE);
                connections.push({ i, j, opacity });
              }
            }
          }
          connectionsRef.current = connections;
        }

        setParticles([...particles]);
        lastUpdateTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastUpdateTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [width, height]);

  if (width === 0 || height === 0 || particles.length === 0) {
    return null;
  }

  const connections = connectionsRef.current;

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      pointerEvents="none"
    >
      {particles.map((particle, index) => (
        <Circle
          key={`p-${index}`}
          cx={particle.x}
          cy={particle.y}
          r={particle.radius}
          fill={PARTICLE_COLOR}
          opacity={0.6}
        />
      ))}

      {connections.map((conn, idx) => {
        const p1 = particles[conn.i];
        const p2 = particles[conn.j];
        if (!p1 || !p2) return null;
        return (
          <Line
            key={`l-${conn.i}-${conn.j}-${idx}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={LINE_COLOR}
            strokeWidth={1}
            opacity={conn.opacity}
          />
        );
      })}
    </Svg>
  );
};
