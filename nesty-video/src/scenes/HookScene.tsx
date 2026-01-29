import React from 'react';
import { AbsoluteFill, interpolate, spring, useVideoConfig } from 'remotion';
import { BRAND, FONTS } from '../constants';

interface HookSceneProps {
  frame: number;
}

export const HookScene: React.FC<HookSceneProps> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Animations
  const emojiScale = spring({
    frame,
    fps,
    config: { damping: 8, stiffness: 80 },
  });

  const emojiShake = Math.sin(frame * 0.3) * 8;

  const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleSlide = interpolate(frame, [20, 40], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const subtitleSlide = interpolate(frame, [50, 70], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse effect on emoji
  const pulseCycle = Math.sin(frame * 0.1) * 0.05 + 1;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${BRAND.primaryLight} 0%, ${BRAND.pink} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONTS.fontFamily,
        direction: 'rtl',
      }}
    >
      {/* Main worried emoji - HUGE */}
      <div
        style={{
          fontSize: 380,
          transform: `scale(${emojiScale * pulseCycle}) translateX(${emojiShake}px)`,
          marginBottom: 40,
          textShadow: '0 30px 80px rgba(0,0,0,0.2)',
        }}
      >
        😰
      </div>

      {/* Main headline - BIGGER */}
      <h1
        style={{
          fontSize: 96,
          color: BRAND.dark,
          fontWeight: 700,
          margin: 0,
          marginTop: 20,
          opacity: titleOpacity,
          transform: `translateY(${titleSlide}px)`,
          textAlign: 'center',
        }}
      >
        בהריון הראשון?
      </h1>

      {/* Subtext - BIGGER */}
      <p
        style={{
          fontSize: 56,
          color: BRAND.gray,
          margin: 0,
          marginTop: 30,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleSlide}px)`,
          textAlign: 'center',
          maxWidth: 900,
          lineHeight: 1.4,
        }}
      >
        יש כל כך הרבה דברים לקנות...
      </p>

      {/* Floating question marks - BIGGER */}
      {[...Array(5)].map((_, i) => {
        const delay = i * 10;
        const floatY = Math.sin((frame + delay) * 0.08) * 30;
        const opacity = interpolate(frame, [30 + delay, 50 + delay], [0, 0.4], {
          extrapolateRight: 'clamp',
        });

        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              fontSize: 100,
              opacity,
              transform: `translateY(${floatY}px)`,
              top: `${18 + i * 14}%`,
              left: i % 2 === 0 ? `${8 + i * 5}%` : undefined,
              right: i % 2 === 1 ? `${8 + i * 5}%` : undefined,
            }}
          >
            ❓
          </span>
        );
      })}
    </AbsoluteFill>
  );
};
