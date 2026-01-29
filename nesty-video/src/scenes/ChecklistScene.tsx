import React from 'react';
import { AbsoluteFill, interpolate, spring, useVideoConfig } from 'remotion';
import { BRAND, FONTS } from '../constants';
import { PhoneMockup, ChecklistUI } from '../components';

interface ChecklistSceneProps {
  frame: number;
}

export const ChecklistScene: React.FC<ChecklistSceneProps> = ({ frame }) => {
  const { fps, width, height } = useVideoConfig();

  // Phone entrance animation
  const phoneEntry = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  const phoneSlide = interpolate(phoneEntry, [0, 1], [100, 0]);
  const phoneOpacity = phoneEntry;

  // Text animation
  const textOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const textSlide = interpolate(frame, [30, 50], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // FULL SCREEN phone - 90% of available space
  const phoneWidth = Math.min(width * 0.92, 1000);
  const phoneHeight = height * 0.82;

  return (
    <AbsoluteFill
      style={{
        background: BRAND.primaryLight,
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontFamily: FONTS.fontFamily,
        direction: 'rtl',
        padding: '40px 0',
      }}
    >
      {/* Headline above phone */}
      <h2
        style={{
          fontSize: FONTS.sectionTitle,
          color: BRAND.dark,
          fontWeight: 700,
          margin: '0 0 30px 0',
          opacity: textOpacity,
          transform: `translateY(${textSlide}px)`,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        נסטי יודעת בדיוק מה את צריכה ✨
      </h2>

      {/* Phone mockup with checklist - FULL SCREEN */}
      <div
        style={{
          transform: `translateY(${phoneSlide}px)`,
          opacity: phoneOpacity,
        }}
      >
        <PhoneMockup width={phoneWidth} height={phoneHeight}>
          <ChecklistUI frame={frame} startFrame={0} />
        </PhoneMockup>
      </div>
    </AbsoluteFill>
  );
};
