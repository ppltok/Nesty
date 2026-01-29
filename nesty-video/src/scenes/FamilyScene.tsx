import React from 'react';
import { AbsoluteFill, interpolate, spring, useVideoConfig } from 'remotion';
import { BRAND, FONTS } from '../constants';

interface FamilySceneProps {
  frame: number;
}

export const FamilyScene: React.FC<FamilySceneProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Staggered emoji entrances
  const emoji1 = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const arrow1 = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const emoji2 = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  const arrow2 = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const emoji3 = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 10, stiffness: 80 },
  });

  // Text animation
  const textOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating hearts
  const heartsVisible = frame > 60;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${BRAND.pink} 0%, ${BRAND.primaryLight} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.fontFamily,
        direction: 'rtl',
      }}
    >
      {/* Main emoji flow - MUCH BIGGER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 50,
          marginBottom: 80,
        }}
      >
        {/* Family */}
        <span
          style={{
            fontSize: 200,
            transform: `scale(${emoji1})`,
            opacity: emoji1,
          }}
        >
          👨‍👩‍👧
        </span>

        {/* Arrow */}
        <span
          style={{
            fontSize: 100,
            color: BRAND.primary,
            transform: `scale(${arrow1}) translateX(${interpolate(arrow1, [0, 1], [-20, 0])}px)`,
            opacity: arrow1,
          }}
        >
          ←
        </span>

        {/* Gift */}
        <span
          style={{
            fontSize: 200,
            transform: `scale(${emoji2})`,
            opacity: emoji2,
          }}
        >
          🎁
        </span>

        {/* Arrow */}
        <span
          style={{
            fontSize: 100,
            color: BRAND.primary,
            transform: `scale(${arrow2}) translateX(${interpolate(arrow2, [0, 1], [-20, 0])}px)`,
            opacity: arrow2,
          }}
        >
          ←
        </span>

        {/* Heart gift */}
        <span
          style={{
            fontSize: 200,
            transform: `scale(${emoji3})`,
            opacity: emoji3,
          }}
        >
          💝
        </span>
      </div>

      {/* Text - BIGGER */}
      <div
        style={{
          textAlign: 'center',
          opacity: textOpacity,
        }}
      >
        <h2
          style={{
            fontSize: 80,
            color: BRAND.dark,
            fontWeight: 700,
            margin: 0,
            marginBottom: 30,
          }}
        >
          שתפי עם המשפחה
        </h2>
        <p
          style={{
            fontSize: 56,
            color: BRAND.gray,
            margin: 0,
          }}
        >
          הם ידעו בדיוק מה לקנות
        </p>
      </div>

      {/* Floating hearts animation - BIGGER */}
      {heartsVisible &&
        [...Array(8)].map((_, i) => {
          const floatProgress = (frame - 60 + i * 5) * 0.02;
          const x = Math.sin(floatProgress + i) * 150;
          const y = Math.cos(floatProgress * 0.7 + i) * 80;
          const scale = 0.6 + Math.sin(floatProgress + i) * 0.3;
          const opacity = interpolate(frame, [60, 75], [0, 0.7], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <span
              key={i}
              style={{
                position: 'absolute',
                fontSize: 80,
                opacity: opacity * (0.4 + Math.random() * 0.4),
                transform: `translate(${x}px, ${y}px) scale(${scale})`,
                top: `${15 + (i % 4) * 20}%`,
                left: `${10 + (i % 5) * 20}%`,
              }}
            >
              {i % 2 === 0 ? '💕' : '✨'}
            </span>
          );
        })}
    </AbsoluteFill>
  );
};
