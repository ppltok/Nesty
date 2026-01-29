import React from 'react';
import { AbsoluteFill, interpolate, spring, useVideoConfig } from 'remotion';
import { BRAND, FONTS } from '../constants';
import { ProgressBar } from '../components';

interface StatsSceneProps {
  frame: number;
}

export const StatsScene: React.FC<StatsSceneProps> = ({ frame }) => {
  const { fps, width, height } = useVideoConfig();

  // Card entrance
  const cardEntry = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Animated numbers
  const savedAmount = Math.round(
    interpolate(frame, [20, 70], [0, 4200], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  const percentComplete = Math.round(
    interpolate(frame, [20, 70], [0, 67], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );

  // Celebration effect
  const celebration = frame > 70;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${BRAND.primaryLight} 0%, ${BRAND.pink} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.fontFamily,
        direction: 'rtl',
        padding: 60,
      }}
    >
      {/* Title - BIGGER */}
      <h2
        style={{
          position: 'absolute',
          top: 80,
          fontSize: 72,
          color: BRAND.dark,
          fontWeight: 700,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        תראי כמה חסכת! 🎉
      </h2>

      {/* Stats cards - SIMPLIFIED & BIGGER - no phone mockup */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 40,
          alignItems: 'center',
          width: '90%',
          maxWidth: 900,
          transform: `scale(${cardEntry})`,
          opacity: cardEntry,
        }}
      >
        {/* Main savings card - HUGE */}
        <div
          style={{
            backgroundColor: BRAND.white,
            borderRadius: 40,
            padding: '50px 60px',
            boxShadow: '0 20px 60px rgba(103, 80, 164, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            width: '100%',
          }}
        >
          <span style={{ fontSize: 120 }}>💰</span>
          <span
            style={{
              fontSize: 96,
              fontWeight: 700,
              color: BRAND.primary,
              fontFamily: FONTS.fontFamily,
            }}
          >
            ₪{savedAmount.toLocaleString()}
          </span>
          <span
            style={{
              fontSize: 42,
              color: BRAND.gray,
              fontFamily: FONTS.fontFamily,
            }}
          >
            חסכת במתנות
          </span>
        </div>

        {/* Progress card */}
        <div
          style={{
            backgroundColor: BRAND.white,
            borderRadius: 40,
            padding: '40px 60px',
            boxShadow: '0 20px 60px rgba(103, 80, 164, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <span style={{ fontSize: 60 }}>📊</span>
            <span
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: BRAND.primary,
                fontFamily: FONTS.fontFamily,
              }}
            >
              {percentComplete}%
            </span>
            <span
              style={{
                fontSize: 36,
                color: BRAND.gray,
                fontFamily: FONTS.fontFamily,
              }}
            >
              מוכנה להריון
            </span>
          </div>
          <ProgressBar value={percentComplete} width={width * 0.7} height={30} />
        </div>
      </div>

      {/* Celebration particles - BIGGER */}
      {celebration &&
        [...Array(10)].map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          const distance = 350 + Math.sin(frame * 0.1 + i) * 80;
          const x = Math.cos(angle) * distance;
          const y = Math.sin(angle) * distance;
          const opacity = interpolate(frame, [70, 90], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                fontSize: 70,
                opacity: opacity * 0.8,
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              {['🎉', '✨', '💫', '⭐', '🌟'][i % 5]}
            </span>
          );
        })}
    </AbsoluteFill>
  );
};
