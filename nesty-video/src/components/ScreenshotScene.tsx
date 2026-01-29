import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useVideoConfig,
  staticFile,
} from 'remotion';
import { BRAND, FONTS } from '../constants';

interface Highlight {
  x: number;
  y: number;
  width: number;
  height: number;
  startFrame: number;
  endFrame: number;
  label?: string;
}

interface ScreenshotSceneProps {
  screenshot: string;
  imageHeight: number;
  imageWidth: number;
  title?: string;
  subtitle?: string;
  scrollStart?: number;
  scrollEnd?: number;
  highlights?: Highlight[];
  frame: number;
  sceneDuration: number;
}

// Floating animated shape component
const FloatingShape: React.FC<{
  frame: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  delay: number;
  shape: 'circle' | 'square' | 'ring';
}> = ({ frame, x, y, size, color, speed, delay, shape }) => {
  const adjustedFrame = Math.max(0, frame - delay);

  // Floating animation
  const floatY = Math.sin(adjustedFrame * speed * 0.05) * 30;
  const floatX = Math.cos(adjustedFrame * speed * 0.03) * 20;
  const rotation = adjustedFrame * speed * 0.5;
  const scale = 1 + Math.sin(adjustedFrame * speed * 0.04) * 0.15;

  // Fade in
  const opacity = interpolate(adjustedFrame, [0, 20], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const shapeStyles: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width: size,
    height: size,
    transform: `translate(${floatX}px, ${floatY}px) rotate(${rotation}deg) scale(${scale})`,
    opacity,
  };

  if (shape === 'circle') {
    return (
      <div
        style={{
          ...shapeStyles,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}40 0%, ${color}00 70%)`,
        }}
      />
    );
  }

  if (shape === 'ring') {
    return (
      <div
        style={{
          ...shapeStyles,
          borderRadius: '50%',
          border: `3px solid ${color}30`,
          background: 'transparent',
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...shapeStyles,
        borderRadius: 15,
        background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
      }}
    />
  );
};

// Sparkle particle
const Sparkle: React.FC<{
  frame: number;
  x: number;
  y: number;
  delay: number;
}> = ({ frame, x, y, delay }) => {
  const adjustedFrame = (frame - delay + 60) % 60;

  const scale = interpolate(adjustedFrame, [0, 15, 30, 45, 60], [0, 1.2, 0.8, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = interpolate(adjustedFrame, [0, 15, 45, 60], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 8,
        height: 8,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: 2,
          background: BRAND.primary,
          borderRadius: 1,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 2,
          height: '100%',
          background: BRAND.primary,
          borderRadius: 1,
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
};

export const ScreenshotScene: React.FC<ScreenshotSceneProps> = ({
  screenshot,
  imageHeight,
  imageWidth,
  title,
  subtitle,
  scrollStart = 0,
  scrollEnd = 0,
  highlights = [],
  frame,
  sceneDuration,
}) => {
  const { fps, height: videoHeight } = useVideoConfig();

  // EXTRA LARGE phone mockup - 50% bigger
  const phoneWidth = 720;
  const phoneHeight = 1470;
  const screenWidth = 660;
  const screenHeight = 1350;
  const phoneRadius = 75;
  const screenRadius = 60;

  // Calculate scroll position - SLOWER scrolling
  const scrollProgress = interpolate(
    frame,
    [0, sceneDuration * 0.15, sceneDuration * 0.95, sceneDuration],
    [0, 0, 1, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scrollY = interpolate(scrollProgress, [0, 1], [scrollStart, scrollEnd]);

  // Scale factor to fit image width in screen
  const scale = screenWidth / imageWidth;
  const scaledImageHeight = imageHeight * scale;

  // Phone entrance animation
  const phoneSlide = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 60 },
  });

  // Title animation
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const titleSlide = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Background gradient animation
  const gradientShift = frame * 0.5;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientShift}deg,
          ${BRAND.primaryLight} 0%,
          ${BRAND.white} 40%,
          ${BRAND.pink}30 70%,
          ${BRAND.primaryLight} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'rtl',
        overflow: 'hidden',
      }}
    >
      {/* Animated background shapes */}
      <FloatingShape frame={frame} x={-50} y={100} size={200} color={BRAND.primary} speed={1} delay={0} shape="circle" />
      <FloatingShape frame={frame} x={800} y={50} size={150} color={BRAND.pink} speed={1.3} delay={10} shape="ring" />
      <FloatingShape frame={frame} x={900} y={600} size={180} color={BRAND.primary} speed={0.8} delay={5} shape="circle" />
      <FloatingShape frame={frame} x={-80} y={800} size={120} color={BRAND.pink} speed={1.1} delay={15} shape="square" />
      <FloatingShape frame={frame} x={950} y={1200} size={160} color={BRAND.primary} speed={0.9} delay={8} shape="ring" />
      <FloatingShape frame={frame} x={100} y={1400} size={140} color={BRAND.pink} speed={1.2} delay={20} shape="circle" />
      <FloatingShape frame={frame} x={850} y={1600} size={100} color={BRAND.primary} speed={1.4} delay={12} shape="square" />
      <FloatingShape frame={frame} x={-30} y={1700} size={170} color={BRAND.pink} speed={0.7} delay={25} shape="ring" />

      {/* Sparkles */}
      <Sparkle frame={frame} x={150} y={300} delay={0} />
      <Sparkle frame={frame} x={900} y={400} delay={15} />
      <Sparkle frame={frame} x={200} y={900} delay={30} />
      <Sparkle frame={frame} x={850} y={1100} delay={45} />
      <Sparkle frame={frame} x={100} y={1500} delay={20} />
      <Sparkle frame={frame} x={950} y={1700} delay={35} />

      {/* Animated lines */}
      <div
        style={{
          position: 'absolute',
          left: -100,
          top: 400,
          width: 300,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${BRAND.primary}30, transparent)`,
          transform: `translateX(${Math.sin(frame * 0.05) * 50}px) rotate(-15deg)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -100,
          top: 1200,
          width: 250,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${BRAND.pink}50, transparent)`,
          transform: `translateX(${Math.cos(frame * 0.04) * 40}px) rotate(20deg)`,
        }}
      />

      {/* Title */}
      {title && (
        <div
          style={{
            position: 'absolute',
            top: 40,
            textAlign: 'center',
            opacity: titleOpacity,
            transform: `translateY(${interpolate(titleSlide, [0, 1], [-30, 0])}px)`,
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontSize: FONTS.heroTitle + 10,
              color: BRAND.primary,
              fontFamily: FONTS.fontFamily,
              fontWeight: 'bold',
              margin: 0,
              textShadow: `0 4px 20px ${BRAND.primary}40`,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              style={{
                fontSize: FONTS.bodyLarge + 4,
                color: BRAND.gray,
                fontFamily: FONTS.fontFamily,
                marginTop: 10,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Phone mockup - EXTRA LARGE */}
      <div
        style={{
          position: 'relative',
          width: phoneWidth,
          height: phoneHeight,
          transform: `translateY(${interpolate(phoneSlide, [0, 1], [150, 0])}px) scale(${interpolate(phoneSlide, [0, 1], [0.8, 1])})`,
          opacity: phoneSlide,
          marginTop: title ? 200 : 0,
        }}
      >
        {/* Phone glow effect */}
        <div
          style={{
            position: 'absolute',
            width: phoneWidth + 60,
            height: phoneHeight + 60,
            left: -30,
            top: -30,
            borderRadius: phoneRadius + 15,
            background: `radial-gradient(ellipse, ${BRAND.primary}25 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />

        {/* Phone frame */}
        <div
          style={{
            position: 'absolute',
            width: phoneWidth,
            height: phoneHeight,
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            borderRadius: phoneRadius,
            boxShadow: `
              0 50px 100px rgba(0, 0, 0, 0.5),
              0 20px 60px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
          }}
        />

        {/* Screen */}
        <div
          style={{
            position: 'absolute',
            left: (phoneWidth - screenWidth) / 2,
            top: (phoneHeight - screenHeight) / 2,
            width: screenWidth,
            height: screenHeight,
            background: BRAND.white,
            borderRadius: screenRadius,
            overflow: 'hidden',
            boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Screenshot container */}
          <div
            style={{
              position: 'absolute',
              width: screenWidth,
              height: scaledImageHeight,
              top: -scrollY * scale,
              transition: 'none',
            }}
          >
            <img
              src={staticFile(screenshot)}
              style={{
                width: screenWidth,
                height: scaledImageHeight,
                display: 'block',
              }}
            />

            {/* Highlights */}
            {highlights.map((highlight, index) => {
              const highlightOpacity = interpolate(
                frame,
                [highlight.startFrame, highlight.startFrame + 10, highlight.endFrame - 10, highlight.endFrame],
                [0, 1, 1, 0],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );

              const pulseScale = interpolate(frame % 30, [0, 15, 30], [1, 1.03, 1]);
              const glowIntensity = interpolate(frame % 20, [0, 10, 20], [0.4, 0.8, 0.4]);

              if (highlightOpacity === 0) return null;

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${highlight.x}%`,
                    top: highlight.y * scale,
                    width: `${highlight.width}%`,
                    height: highlight.height * scale,
                    border: `4px solid ${BRAND.primary}`,
                    borderRadius: 16,
                    background: `${BRAND.primary}10`,
                    boxShadow: `
                      0 0 ${30 * glowIntensity}px ${BRAND.primary}80,
                      0 0 ${60 * glowIntensity}px ${BRAND.primary}40,
                      inset 0 0 20px ${BRAND.primary}10
                    `,
                    opacity: highlightOpacity,
                    transform: `scale(${pulseScale})`,
                    transformOrigin: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  {highlight.label && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -45,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: `linear-gradient(135deg, ${BRAND.primary} 0%, #8b5cf6 100%)`,
                        color: BRAND.white,
                        padding: '10px 20px',
                        borderRadius: 25,
                        fontSize: 18,
                        fontFamily: FONTS.fontFamily,
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        boxShadow: `0 4px 15px ${BRAND.primary}50`,
                      }}
                    >
                      {highlight.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Island / Notch */}
        <div
          style={{
            position: 'absolute',
            top: (phoneHeight - screenHeight) / 2 + 15,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 180,
            height: 48,
            background: '#000',
            borderRadius: 26,
            zIndex: 10,
          }}
        />

        {/* Home indicator */}
        <div
          style={{
            position: 'absolute',
            bottom: (phoneHeight - screenHeight) / 2 + 15,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 200,
            height: 6,
            background: '#333',
            borderRadius: 3,
            zIndex: 10,
          }}
        />

        {/* Side buttons */}
        <div
          style={{
            position: 'absolute',
            right: -4,
            top: 270,
            width: 5,
            height: 120,
            background: '#2a2a2a',
            borderRadius: '0 4px 4px 0',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -4,
            top: 225,
            width: 5,
            height: 60,
            background: '#2a2a2a',
            borderRadius: '4px 0 0 4px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -4,
            top: 330,
            width: 5,
            height: 105,
            background: '#2a2a2a',
            borderRadius: '4px 0 0 4px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -4,
            top: 465,
            width: 5,
            height: 105,
            background: '#2a2a2a',
            borderRadius: '4px 0 0 4px',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
