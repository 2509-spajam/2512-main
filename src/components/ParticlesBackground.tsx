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

const PARTICLE_COUNT = 80;
const PARTICLE_RADIUS = 2;
const CONNECTION_DISTANCE = 150;
const PARTICLE_COLOR = "#03FFD1";
const LINE_COLOR = "#03FFD1";
const LINE_OPACITY = 0.3;

export const ParticlesBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateTimeRef = useRef<number>(0);
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
      setParticles(initialParticles);
      initializedRef.current = true;
    }

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastUpdateTimeRef.current;
      const targetFPS = 60;
      const frameInterval = 1000 / targetFPS;

      if (deltaTime >= frameInterval) {
        particlesRef.current = particlesRef.current.map((particle) => {
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

          return {
            ...particle,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
          };
        });

        setParticles([...particlesRef.current]);
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

  const getDistanceSquared = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  };

  if (width === 0 || height === 0 || particles.length === 0) {
    return null;
  }

  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={width}
      height={height}
      pointerEvents="none"
    >
      {particles.map((particle, index) => (
        <Circle
          key={index}
          cx={particle.x}
          cy={particle.y}
          r={particle.radius}
          fill={PARTICLE_COLOR}
          opacity={0.6}
        />
      ))}

      {particles.map((particle1, i) => {
        return particles.slice(i + 1).map((particle2, j) => {
          const distanceSquared = getDistanceSquared(
            particle1.x,
            particle1.y,
            particle2.x,
            particle2.y
          );
          const connectionDistanceSquared =
            CONNECTION_DISTANCE * CONNECTION_DISTANCE;

          if (distanceSquared < connectionDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);
            const opacity = LINE_OPACITY * (1 - distance / CONNECTION_DISTANCE);
            return (
              <Line
                key={`${i}-${j}`}
                x1={particle1.x}
                y1={particle1.y}
                x2={particle2.x}
                y2={particle2.y}
                stroke={LINE_COLOR}
                strokeWidth={1}
                opacity={opacity}
              />
            );
          }
          return null;
        });
      })}
    </Svg>
  );
};
