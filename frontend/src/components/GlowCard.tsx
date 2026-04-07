import React, { useRef, useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({ children, className, glowColor = 'hsl(220 100% 80%)' }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [proximity, setProximity] = useState(0);
  const [angle, setAngle] = useState(45);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if mouse is within a reasonable distance of the card
      const padding = 100;
      const isNear = (
        e.clientX >= rect.left - padding &&
        e.clientX <= rect.right + padding &&
        e.clientY >= rect.top - padding &&
        e.clientY <= rect.bottom + padding
      );

      if (isNear) {
        // Calculate angle relative to center
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const newAngle = (Math.atan2(y - centerY, x - centerX) * 180) / Math.PI + 90;
        setAngle(newAngle);

        // Proximity is 100 when inside, fades out when moving away
        const isInside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
        if (isInside) {
          setProximity(100);
        } else {
          // Calculate distance to nearest edge
          const dx = Math.max(0 - x, x - rect.width, 0);
          const dy = Math.max(0 - y, y - rect.height, 0);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const newProximity = Math.max(0, 100 - (distance / padding) * 100);
          setProximity(newProximity);
        }
      } else {
        setProximity(0);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn("border-glow-card", className)}
      style={{
        '--edge-proximity': proximity,
        '--cursor-angle': `${angle}deg`,
        '--glow-color': glowColor,
      } as React.CSSProperties}
    >
      <div className="edge-light" />
      <div className="border-glow-inner">
        {children}
      </div>
    </div>
  );
}
