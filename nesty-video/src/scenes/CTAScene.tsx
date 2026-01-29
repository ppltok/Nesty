import React from 'react';
import { AbsoluteFill, interpolate, spring, staticFile, useVideoConfig } from 'remotion';
import { BRAND, FONTS } from '../constants';

interface CTASceneProps {
  frame: number;
}

export const CTAScene: React.FC<CTASceneProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoEntry = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // Logo pulse
  const logoPulse = 1 + Math.sin(frame * 0.08) * 0.03;

  // Text animations
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleSlide = interpolate(frame, [20, 40], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const urlEntry = spring({
    frame: Math.max(0, frame - 60),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Floating elements
  const floatY = Math.sin(frame * 0.05) * 15;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BRAND.primary} 0%, #8b5cf6 50%, ${BRAND.pink} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.fontFamily,
        direction: 'rtl',
      }}
    >
      {/* Logo with white background - BIGGER */}
      <div
        style={{
          backgroundColor: BRAND.white,
          borderRadius: 40,
          padding: '50px 80px',
          marginBottom: 60,
          transform: `scale(${logoEntry * logoPulse}) translateY(${floatY}px)`,
          opacity: logoEntry,
          boxShadow: '0 40px 100px rgba(0,0,0,0.3)',
        }}
      >
        <img
          src={staticFile('nesty-logo.png')}
          alt="Nesty Logo"
          style={{
            width: 450,
            height: 'auto',
          }}
        />
      </div>

      {/* Main headline - BIGGER */}
      <h1
        style={{
          fontSize: 96,
          color: BRAND.white,
          fontWeight: 700,
          margin: 0,
          marginBottom: 30,
          textShadow: '3px 6px 30px rgba(0,0,0,0.35)',
          opacity: titleOpacity,
          transform: `translateY(${titleSlide}px)`,
          textAlign: 'center',
        }}
      >
        הקן שלך מחכה 🪺
      </h1>

      {/* Subheadline - BIGGER */}
      <p
        style={{
          fontSize: 56,
          color: BRAND.white,
          margin: 0,
          marginBottom: 50,
          opacity: subtitleOpacity,
          textAlign: 'center',
          textShadow: '2px 4px 15px rgba(0,0,0,0.25)',
        }}
      >
        הירשמי עכשיו - בחינם!
      </p>

      {/* URL button - BIGGER */}
      <div
        style={{
          backgroundColor: BRAND.white,
          borderRadius: 30,
          padding: '32px 90px',
          transform: `scale(${urlEntry})`,
          opacity: urlEntry,
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        }}
      >
        <span
          style={{
            fontSize: 56,
            color: BRAND.primary,
            fontWeight: 700,
          }}
        >
          nestyil.com
        </span>
      </div>

      {/* Decorative elements - BIGGER */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2 + frame * 0.01;
        const radius = 550 + Math.sin(frame * 0.03 + i) * 40;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const opacity = interpolate(frame, [0, 30], [0, 0.7], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              fontSize: 80,
              opacity,
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            {['🪺', '👶', '🎁', '💕', '✨', '🌟'][i]}
          </span>
        );
      })}

      {/* Bottom tagline - BIGGER */}
      <p
        style={{
          position: 'absolute',
          bottom: 100,
          fontSize: 42,
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
        }}
      >
        הכנה לתינוק - בקלות ובשמחה
      </p>
    </AbsoluteFill>
  );
};
