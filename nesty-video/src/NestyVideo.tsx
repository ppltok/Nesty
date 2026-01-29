import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion';
import { SCENES, BRAND, FONTS, SCREENSHOTS } from './constants';
import { ScreenshotScene } from './components/ScreenshotScene';

// Chaos bubble - floats upward like drowning bubbles
const ChaosBubble: React.FC<{
  frame: number;
  x: number;
  startY: number;
  text: string;
  size: number;
  speed: number;
  delay: number;
  chaosLevel: number;
  isStressItem?: boolean;
}> = ({ frame, x, startY, text, size, speed, delay, chaosLevel, isStressItem = false }) => {
  const adjustedFrame = Math.max(0, frame - delay);

  // Float upward (drowning bubbles effect)
  const floatUp = adjustedFrame * speed * chaosLevel * 0.8;
  const wobbleX = Math.sin(adjustedFrame * 0.15 + delay) * (15 * chaosLevel);
  const wobbleRotate = Math.sin(adjustedFrame * 0.1 + delay * 0.5) * (10 * chaosLevel);

  // Fade in then out as it rises
  const opacity = interpolate(
    adjustedFrame,
    [0, 15, 80, 100],
    [0, 0.7 * chaosLevel, 0.5 * chaosLevel, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Scale grows with chaos
  const scale = interpolate(chaosLevel, [1, 5], [0.8, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const bgColor = isStressItem ? '#ffebee' : BRAND.white;
  const textColor = isStressItem ? '#c62828' : BRAND.gray;

  return (
    <div
      style={{
        position: 'absolute',
        left: x + wobbleX,
        top: startY - floatUp,
        padding: '8px 14px',
        background: bgColor,
        border: `2px solid ${isStressItem ? '#ef535050' : BRAND.gray}40`,
        borderRadius: 8,
        transform: `rotate(${wobbleRotate}deg) scale(${scale})`,
        opacity,
        boxShadow: isStressItem
          ? '0 4px 15px rgba(239, 83, 80, 0.2)'
          : '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <span
        style={{
          fontSize: size,
          fontFamily: 'monospace',
          color: textColor,
          whiteSpace: 'nowrap',
          fontWeight: isStressItem ? 'bold' : 'normal',
        }}
      >
        {text}
      </span>
    </div>
  );
};

// Grid line for spreadsheet background
const GridLine: React.FC<{
  frame: number;
  x: number;
  y: number;
  length: number;
  vertical?: boolean;
  delay: number;
  chaosLevel: number;
}> = ({ frame, x, y, length, vertical = false, delay, chaosLevel }) => {
  const adjustedFrame = Math.max(0, frame - delay);
  const shake = Math.sin(adjustedFrame * 0.6) * (4 * chaosLevel);

  const opacity = interpolate(adjustedFrame, [0, 10], [0, 0.1 * chaosLevel], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: vertical ? 1 : length,
        height: vertical ? length : 1,
        background: BRAND.gray,
        opacity: Math.min(opacity, 0.3),
        transform: `translate(${shake}px, ${vertical ? shake : 0}px)`,
      }}
    />
  );
};

// Hook Scene - 2-BEAT STRUCTURE: Calm → Chaos
const HookScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // ============ BEAT TIMING ============
  // Beat 1: Calm question (frames 0-50) - ~1.7s
  // Beat 2: Chaos explosion (frames 50-120) - ~2.3s for reading
  const beat2Start = 50;
  const isBeat2 = frame >= beat2Start;

  // ============ TEXT ANIMATIONS ============
  // Text 1: "?הריון ראשון" (frames 0-50)
  const text1Opacity = interpolate(frame, [0, 10, 42, 50], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const text1Scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Text 2: "?מרגישה שאת טובעת באקסלים" (frames 50-120) - EXTENDED for readability
  const text2Opacity = interpolate(frame, [50, 60, 110, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ============ CHAOS LEVEL ============
  // Chaos multiplier: starts at 1, explodes to 5 when Text 2 appears
  const chaosLevel = interpolate(frame, [45, 70], [1, 5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ============ CAMERA SHAKE ============
  // Increases dramatically at Beat 2
  const shakeIntensity = interpolate(frame, [45, 65], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const shakeX = isBeat2 ? Math.sin(frame * 1.5) * 15 * shakeIntensity : 0;
  const shakeY = isBeat2 ? Math.cos(frame * 1.2) * 10 * shakeIntensity : 0;

  // ============ BACKGROUND ============
  // Transitions from calm to stressed
  const bgStress = interpolate(frame, [45, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const gradientAngle = 135 + frame * 0.3 * chaosLevel;

  // ============ BEAT 1 ELEMENTS ============
  // Calm baby icon for Beat 1
  const babyIconOpacity = interpolate(frame, [5, 15, 40, 50], [0, 0.8, 0.8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const babyIconScale = spring({
    frame: frame - 5,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // ============ BEAT 2 EXCEL MOCKUP ============
  const excelOpacity = interpolate(frame, [50, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const excelScale = spring({
    frame: frame - beat2Start,
    fps,
    config: { damping: 10, stiffness: 120 },
  });

  // Chaos bubbles data - stress items for Beat 2 (starts at frame 50)
  const chaosBubbles = [
    // Layer 1 - initial bubbles
    { x: 80, startY: 1800, text: '❓', size: 28, speed: 2.5, delay: 50, isStress: true },
    { x: 900, startY: 1750, text: '₪???', size: 18, speed: 2.8, delay: 52, isStress: true },
    { x: 200, startY: 1850, text: 'עגלה?', size: 16, speed: 2.2, delay: 53, isStress: false },
    { x: 750, startY: 1900, text: '#REF!', size: 16, speed: 3, delay: 55, isStress: true },
    { x: 450, startY: 1820, text: '❓', size: 24, speed: 2.6, delay: 54, isStress: true },
    // Layer 2 - more chaos
    { x: 120, startY: 1950, text: 'ERROR', size: 14, speed: 2.4, delay: 58, isStress: true },
    { x: 820, startY: 1880, text: 'כפול???', size: 15, speed: 2.9, delay: 60, isStress: true },
    { x: 350, startY: 1920, text: '❓', size: 20, speed: 2.3, delay: 59, isStress: true },
    { x: 650, startY: 1870, text: 'מיטה/עריסה', size: 14, speed: 2.7, delay: 62, isStress: false },
    { x: 50, startY: 1960, text: 'N/A', size: 16, speed: 2.5, delay: 63, isStress: true },
    // Layer 3 - explosion
    { x: 550, startY: 1980, text: '❓❓', size: 22, speed: 3.2, delay: 68, isStress: true },
    { x: 280, startY: 1900, text: 'v47_סופי', size: 12, speed: 2.8, delay: 72, isStress: true },
    { x: 700, startY: 1940, text: '???', size: 18, speed: 3, delay: 70, isStress: true },
    { x: 180, startY: 2000, text: '💰❓', size: 24, speed: 2.6, delay: 75, isStress: true },
    { x: 850, startY: 1970, text: 'לבדוק!', size: 14, speed: 2.9, delay: 73, isStress: true },
    // Extra chaos burst
    { x: 400, startY: 2050, text: '❓', size: 32, speed: 3.5, delay: 80, isStress: true },
    { x: 600, startY: 2020, text: 'סבתא?', size: 15, speed: 3.1, delay: 78, isStress: false },
    { x: 100, startY: 2080, text: '#VALUE!', size: 13, speed: 3.3, delay: 82, isStress: true },
    { x: 950, startY: 2030, text: '❓', size: 26, speed: 3.4, delay: 85, isStress: true },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg,
          ${interpolate(bgStress, [0, 1], [0, 0]).toString() === '0' ? BRAND.primaryLight : '#fff5f5'} 0%,
          ${BRAND.white} 30%,
          ${interpolate(bgStress, [0, 1], [0, 0]).toString() === '0' ? '#fafafa' : '#ffebee'}30 60%,
          ${interpolate(bgStress, [0, 1], [0, 0]).toString() === '0' ? BRAND.primaryLight : '#ffcdd2'}20 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'rtl',
        overflow: 'hidden',
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      }}
    >
      {/* Grid lines - appear during Beat 2 chaos (starts at frame 50) */}
      {isBeat2 && (
        <>
          <GridLine frame={frame} x={50} y={100} length={200} delay={50} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={800} y={150} length={180} delay={52} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={100} y={400} length={250} delay={55} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={750} y={500} length={220} delay={53} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={80} y={800} length={300} delay={58} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={700} y={900} length={280} delay={62} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={50} y={1200} length={200} delay={68} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={820} y={1300} length={160} delay={72} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={150} y={50} length={300} vertical delay={51} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={900} y={200} length={350} vertical delay={54} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={100} y={600} length={400} vertical delay={60} chaosLevel={chaosLevel} />
          <GridLine frame={frame} x={950} y={750} length={300} vertical delay={65} chaosLevel={chaosLevel} />
        </>
      )}

      {/* Chaos bubbles - float upward like drowning */}
      {chaosBubbles.map((bubble, i) => (
        <ChaosBubble
          key={i}
          frame={frame}
          x={bubble.x}
          startY={bubble.startY}
          text={bubble.text}
          size={bubble.size}
          speed={bubble.speed}
          delay={bubble.delay}
          chaosLevel={chaosLevel}
          isStressItem={bubble.isStress}
        />
      ))}

      {/* ============ BEAT 1: Calm "First Pregnancy?" ============ */}
      {!isBeat2 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${text1Scale})`,
          }}
        >
          {/* Calm baby/heart icon */}
          <div
            style={{
              fontSize: 120,
              opacity: babyIconOpacity,
              transform: `scale(${babyIconScale})`,
              marginBottom: 30,
            }}
          >
            💜
          </div>

          <h1
            style={{
              fontSize: FONTS.heroTitle + 15,
              color: BRAND.primary,
              fontFamily: FONTS.fontFamily,
              fontWeight: 'bold',
              opacity: text1Opacity,
              textShadow: `0 4px 20px ${BRAND.primary}30`,
              textAlign: 'center',
            }}
          >
            הריון ראשון?
          </h1>
        </div>
      )}

      {/* ============ BEAT 2: Chaos "Drowning in Excels?" ============ */}
      {isBeat2 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: `scale(${excelScale})`,
          }}
        >
          {/* Distressed Excel mockup */}
          <div
            style={{
              opacity: excelOpacity,
              position: 'relative',
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 340,
                height: 220,
                background: BRAND.white,
                border: '3px solid #ef535050',
                borderRadius: 12,
                boxShadow: '0 20px 60px rgba(239, 83, 80, 0.25)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Excel header - stressed color */}
              <div
                style={{
                  height: 32,
                  background: `linear-gradient(90deg, #217346, #1a5c38)`,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 10px',
                  gap: 6,
                }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ color: 'white', fontSize: 11, fontFamily: 'monospace', marginLeft: 12, opacity: 0.9 }}>
                  רשימה_v47_סופי_באמת.xlsx
                </span>
              </div>
              {/* Grid cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, padding: 6 }}>
                {['פריט', 'כמות', 'הערות'].map((header, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#f0f0f0',
                      padding: '5px 3px',
                      fontSize: 10,
                      fontFamily: 'monospace',
                      textAlign: 'center',
                    }}
                  >
                    {header}
                  </div>
                ))}
                {['עגלה', '???', 'לבדוק'].map((cell, i) => (
                  <div
                    key={`r1-${i}`}
                    style={{
                      padding: '5px 3px',
                      fontSize: 10,
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      background: i === 1 ? '#ffebee' : 'white',
                      color: i === 1 ? '#c62828' : BRAND.dark,
                    }}
                  >
                    {cell}
                  </div>
                ))}
                {['מיטה', '#REF!', 'סבתא?'].map((cell, i) => (
                  <div
                    key={`r2-${i}`}
                    style={{
                      padding: '5px 3px',
                      fontSize: 10,
                      fontFamily: 'monospace',
                      textAlign: 'center',
                      background: i === 1 ? '#fff3e0' : 'white',
                      color: i === 1 ? '#e65100' : BRAND.dark,
                    }}
                  >
                    {cell}
                  </div>
                ))}
              </div>
            </div>

            {/* Warning badge */}
            <div
              style={{
                position: 'absolute',
                top: -15,
                right: -15,
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: '#ef5350',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(239, 83, 80, 0.5)',
                transform: `scale(${spring({ frame: frame - 50, fps, config: { damping: 10, stiffness: 180 } })})`,
              }}
            >
              <span style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>!</span>
            </div>
          </div>

          <h1
            style={{
              fontSize: FONTS.heroTitle,
              color: BRAND.dark,
              fontFamily: FONTS.fontFamily,
              fontWeight: 'bold',
              opacity: text2Opacity,
              textShadow: '0 4px 20px rgba(0,0,0,0.15)',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            מרגישה שאת טובעת באקסלים?
          </h1>
        </div>
      )}
    </AbsoluteFill>
  );
};

// Intro Scene - What is Nesty
const IntroScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const textOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const featuresOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const gradientAngle = 135 + frame * 0.2;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg,
          ${BRAND.white} 0%,
          ${BRAND.primaryLight} 50%,
          ${BRAND.pink}15 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'rtl',
        overflow: 'hidden',
      }}
    >
      {/* Floating decorations */}
      <div
        style={{
          position: 'absolute',
          left: -100,
          top: 200,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.primary}12 0%, transparent 70%)`,
          transform: `translate(${Math.sin(frame * 0.03) * 20}px, ${Math.cos(frame * 0.04) * 25}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -120,
          bottom: 300,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.pink}18 0%, transparent 70%)`,
          transform: `translate(${Math.cos(frame * 0.04) * 25}px, ${Math.sin(frame * 0.03) * 20}px)`,
        }}
      />

      {/* Logo */}
      <div
        style={{
          background: BRAND.white,
          borderRadius: 35,
          padding: '30px 50px',
          marginBottom: 50,
          transform: `scale(${logoScale})`,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
      >
        <img
          src={staticFile('nesty-logo.png')}
          style={{ width: 300, height: 'auto' }}
        />
      </div>

      {/* Tagline - CLEAR marketing message */}
      <h1
        style={{
          fontSize: FONTS.heroTitle,
          color: BRAND.primary,
          fontFamily: FONTS.fontFamily,
          fontWeight: 'bold',
          opacity: textOpacity,
          textAlign: 'center',
          textShadow: `0 4px 20px ${BRAND.primary}30`,
          marginBottom: 25,
          lineHeight: 1.2,
        }}
      >
        רשימת לידה חינמית
        <br />
        <span style={{ fontSize: FONTS.sectionTitle, opacity: 0.9 }}>
          שכולם ירצו להשתמש בה
        </span>
      </h1>

      {/* Features - benefit-focused, LARGER text */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          opacity: featuresOpacity,
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            background: BRAND.white,
            padding: '18px 35px',
            borderRadius: 28,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: 44 }}>📋</span>
          <span style={{ fontSize: 34, fontFamily: FONTS.fontFamily, color: BRAND.dark, fontWeight: 'bold' }}>
            צ׳קליסט חכם לתינוק
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            background: BRAND.white,
            padding: '18px 35px',
            borderRadius: 28,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: 44 }}>🔗</span>
          <span style={{ fontSize: 34, fontFamily: FONTS.fontFamily, color: BRAND.dark, fontWeight: 'bold' }}>
            שיתוף קל עם המשפחה
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            background: BRAND.white,
            padding: '18px 35px',
            borderRadius: 28,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}
        >
          <span style={{ fontSize: 44 }}>🎁</span>
          <span style={{ fontSize: 34, fontFamily: FONTS.fontFamily, color: BRAND.dark, fontWeight: 'bold' }}>
            מתנות בלי כפילויות
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Floating Focus Overlay - Draws attention to key features
const FocusOverlay: React.FC<{
  frame: number;
  emoji: string;
  label: string;
  delay?: number;
}> = ({ frame, emoji, label, delay = 30 }) => {
  const { fps } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const scale = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 10, stiffness: 150 },
  });

  const floatY = adjustedFrame > 20 ? Math.sin(adjustedFrame * 0.08) * 12 : 0;
  const floatRotate = adjustedFrame > 20 ? Math.sin(adjustedFrame * 0.1) * 5 : 0;

  const opacity = interpolate(adjustedFrame, [0, 10, 60, 80], [0, 1, 1, 0.7], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (frame < delay - 5) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: 'absolute',
          width: 250,
          height: 250,
          background: `radial-gradient(circle, ${BRAND.primary}40 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(20px)',
          transform: `scale(${scale})`,
        }}
      />

      {/* Main emoji */}
      <div
        style={{
          fontSize: 140,
          transform: `scale(${scale}) translateY(${floatY}px) rotate(${floatRotate}deg)`,
          opacity,
          filter: `drop-shadow(0 15px 30px ${BRAND.primary}50)`,
        }}
      >
        {emoji}
      </div>

      {/* Label badge */}
      <div
        style={{
          marginTop: 15,
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, #8b5cf6 100%)`,
          padding: '12px 28px',
          borderRadius: 25,
          transform: `scale(${scale})`,
          opacity,
          boxShadow: `0 8px 25px ${BRAND.primary}50`,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontFamily: FONTS.fontFamily,
            color: BRAND.white,
            fontWeight: 'bold',
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

// Family Sharing Scene - LARGER & SLOWER for mobile readability
const FamilyScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // SLOWER timing for better readability (scene now runs 150 frames = 5s)
  const beat1Appear = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 80 },  // Slower, more deliberate
  });

  const arrowAppear = spring({
    frame: frame - 50,  // Later start
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const beat2Appear = spring({
    frame: frame - 75,  // Much later for readability
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  // Title animation - stays visible longer
  const titleOpacity = interpolate(frame, [0, 20, 130, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Background animation
  const gradientShift = frame * 0.3;

  // Link pulse - more subtle
  const linkPulse = frame > 20 && frame < 60 ? 1 + Math.sin(frame * 0.2) * 0.03 : 1;

  // Gift wiggle (for beat 2)
  const giftWiggle = beat2Appear > 0.8 ? Math.sin(frame * 0.2) * 8 : 0;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${180 + gradientShift * 0.3}deg,
          ${BRAND.primaryLight} 0%,
          ${BRAND.white} 30%,
          ${BRAND.pink}15 70%,
          ${BRAND.primaryLight} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'rtl',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background circles */}
      <div
        style={{
          position: 'absolute',
          left: -100,
          top: 200,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.primary}12 0%, transparent 70%)`,
          transform: `translate(${Math.sin(frame * 0.03) * 20}px, ${Math.cos(frame * 0.04) * 25}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -100,
          bottom: 250,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.pink}15 0%, transparent 70%)`,
          transform: `translate(${Math.cos(frame * 0.04) * 25}px, ${Math.sin(frame * 0.03) * 20}px)`,
        }}
      />

      {/* Scene title - LARGER & clearer marketing message */}
      <h1
        style={{
          position: 'absolute',
          top: 60,
          fontSize: FONTS.heroTitle + 10,  // Larger
          color: BRAND.primary,
          fontFamily: FONTS.fontFamily,
          fontWeight: 'bold',
          opacity: titleOpacity,
          textShadow: `0 4px 20px ${BRAND.primary}30`,
          textAlign: 'center',
          lineHeight: 1.2,
        }}
      >
        שתפי. הם קונים. קיבלת. ✨
      </h1>

      {/* Main content - 2 beats vertical, LARGER */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          marginTop: 100,
        }}
      >
        {/* BEAT 1: You Create & Share - LARGER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 25,
            transform: `scale(${beat1Appear}) translateX(${interpolate(beat1Appear, [0, 1], [60, 0])}px)`,
            opacity: beat1Appear,
          }}
        >
          {/* Mom icon with phone - BIGGER */}
          <div
            style={{
              position: 'relative',
              width: 180,
              height: 180,
              background: BRAND.white,
              borderRadius: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 15px 50px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ fontSize: 90 }}>📱</div>
            {/* Small user badge */}
            <div
              style={{
                position: 'absolute',
                top: -12,
                right: -12,
                width: 55,
                height: 55,
                borderRadius: '50%',
                background: BRAND.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 20px ${BRAND.primary}50`,
                fontSize: 32,
              }}
            >
              👤
            </div>
          </div>

          {/* Arrow */}
          <div
            style={{
              fontSize: 55,
              color: BRAND.primary,
              transform: `scale(${linkPulse})`,
            }}
          >
            →
          </div>

          {/* Share link card - BIGGER text */}
          <div
            style={{
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, #8b5cf6 100%)`,
              borderRadius: 28,
              padding: '28px 45px',
              boxShadow: `0 18px 55px ${BRAND.primary}40`,
              transform: `scale(${linkPulse})`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <span style={{ fontSize: 55 }}>🔗</span>
              <div>
                <div
                  style={{
                    fontSize: 34,  // Bigger
                    fontFamily: FONTS.fontFamily,
                    color: BRAND.white,
                    fontWeight: 'bold',
                  }}
                >
                  שלחי לינק למשפחה
                </div>
                <div
                  style={{
                    fontSize: 24,  // Bigger
                    fontFamily: FONTS.fontFamily,
                    color: 'rgba(255,255,255,0.85)',
                    marginTop: 6,
                  }}
                >
                  כולם יראו מה חסר
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Down arrow between beats - BIGGER */}
        <div
          style={{
            fontSize: 65,
            transform: `scale(${arrowAppear}) rotate(90deg)`,
            opacity: arrowAppear,
            color: BRAND.primary,
          }}
        >
          →
        </div>

        {/* BEAT 2: They Buy & You Receive - BIGGER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 25,
            transform: `scale(${beat2Appear}) translateX(${interpolate(beat2Appear, [0, 1], [-60, 0])}px)`,
            opacity: beat2Appear,
          }}
        >
          {/* Family icons - BIGGER */}
          <div
            style={{
              position: 'relative',
              width: 180,
              height: 180,
              background: BRAND.white,
              borderRadius: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 15px 50px rgba(0,0,0,0.12)',
            }}
          >
            <div style={{ fontSize: 75 }}>👨‍👩‍👧</div>
            {/* Click indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                width: 45,
                height: 45,
                borderRadius: '50%',
                background: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                fontSize: 26,
              }}
            >
              ✓
            </div>
          </div>

          {/* Arrow */}
          <div style={{ fontSize: 55, color: BRAND.primary }}>→</div>

          {/* Gift result card - BIGGER */}
          <div
            style={{
              background: BRAND.white,
              borderRadius: 28,
              padding: '28px 45px',
              boxShadow: `0 18px 55px rgba(0,0,0,0.15)`,
              border: `3px solid ${BRAND.primary}30`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <span
                style={{
                  fontSize: 65,
                  transform: `rotate(${giftWiggle}deg)`,
                  display: 'inline-block',
                }}
              >
                🎁
              </span>
              <div>
                <div
                  style={{
                    fontSize: 34,  // Bigger
                    fontFamily: FONTS.fontFamily,
                    color: BRAND.dark,
                    fontWeight: 'bold',
                  }}
                >
                  את מקבלת בדיוק מה שרצית
                </div>
                <div
                  style={{
                    fontSize: 24,  // Bigger
                    fontFamily: FONTS.fontFamily,
                    color: BRAND.gray,
                    marginTop: 6,
                  }}
                >
                  בלי כפילויות! 💝
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Gift Pop-Out Overlay - Animated gift with WIGGLE anticipation then POP
const GiftPopOutOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  // Phase 1: Wiggle anticipation (frames 15-35)
  const wiggleStart = 15;
  const popDelay = 35;

  // Wiggle phase - gift appears small and wiggles excitedly
  const isWiggling = frame >= wiggleStart && frame < popDelay;
  const wiggleFrame = Math.max(0, frame - wiggleStart);

  // Wiggle scale - small and building up
  const wiggleScale = isWiggling
    ? interpolate(wiggleFrame, [0, 20], [0.3, 0.5], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Intense wiggle rotation
  const wiggleRotate = isWiggling ? Math.sin(wiggleFrame * 0.8) * 15 : 0;
  const wiggleX = isWiggling ? Math.sin(wiggleFrame * 1.2) * 8 : 0;
  const wiggleY = isWiggling ? Math.cos(wiggleFrame * 0.9) * 5 : 0;

  // Phase 2: Main pop-out (frames 35+)
  const popFrame = Math.max(0, frame - popDelay);

  // Main gift pop-out animation with MASSIVE spring
  const giftScale = spring({
    frame: popFrame,
    fps,
    config: { damping: 10, stiffness: 180, mass: 0.8 },
  });

  // Float animation after popping out
  const floatY = popFrame > 20 ? Math.sin(popFrame * 0.08) * 15 : 0;
  const floatRotate = popFrame > 20 ? Math.sin(popFrame * 0.1) * 8 : 0;

  // Glow pulse - more intense
  const glowIntensity = interpolate(popFrame % 25, [0, 12, 25], [0.5, 1, 0.5]);

  // Sparkles around the gift
  const sparkles = [
    { x: -100, y: -80, delay: 8, size: 40 },
    { x: 90, y: -70, delay: 12, size: 35 },
    { x: -80, y: 70, delay: 16, size: 32 },
    { x: 100, y: 60, delay: 20, size: 38 },
    { x: 0, y: -100, delay: 10, size: 30 },
    { x: -110, y: 0, delay: 14, size: 33 },
    { x: 115, y: -20, delay: 18, size: 30 },
    { x: -40, y: 90, delay: 22, size: 28 },
    { x: 50, y: 95, delay: 24, size: 32 },
  ];

  // Don't render if too early
  if (frame < wiggleStart - 2) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Glow effect behind gift */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${giftScale})`,
          background: `radial-gradient(circle, ${BRAND.primary}${Math.round(glowIntensity * 60).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          borderRadius: '50%',
          filter: 'blur(20px)',
        }}
      />

      {/* Sparkles */}
      {sparkles.map((sparkle, i) => {
        const sparkleFrame = Math.max(0, popFrame - sparkle.delay);
        const sparkleScale = spring({
          frame: sparkleFrame,
          fps,
          config: { damping: 10, stiffness: 200 },
        });
        const sparkleOpacity = interpolate(
          sparkleFrame,
          [0, 10, 40, 60],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const sparkleRotate = sparkleFrame * 3;
        const sparkleFloat = Math.sin(sparkleFrame * 0.15) * 8;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              fontSize: sparkle.size,
              transform: `translate(calc(-50% + ${sparkle.x}px), calc(-50% + ${sparkle.y + sparkleFloat}px)) scale(${sparkleScale}) rotate(${sparkleRotate}deg)`,
              opacity: sparkleOpacity,
            }}
          >
            ✨
          </div>
        );
      })}

      {/* Main gift emoji - with wiggle anticipation then pop */}
      <div
        style={{
          fontSize: 180,
          transform: isWiggling
            ? `scale(${wiggleScale}) translate(${wiggleX}px, ${wiggleY}px) rotate(${wiggleRotate}deg)`
            : `scale(${giftScale}) translateY(${floatY}px) rotate(${floatRotate}deg)`,
          filter: `drop-shadow(0 20px 40px rgba(103, 80, 164, 0.5)) drop-shadow(0 0 ${30 * glowIntensity}px ${BRAND.primary})`,
          textAlign: 'center',
        }}
      >
        🎁
      </div>

      {/* Emotional dopamine-hit badge */}
      {popFrame > 25 && (
        <div
          style={{
            position: 'absolute',
            bottom: -70,
            left: '50%',
            transform: `translateX(-50%) scale(${spring({
              frame: popFrame - 25,
              fps,
              config: { damping: 12, stiffness: 150 },
            })})`,
            background: `linear-gradient(135deg, ${BRAND.primary} 0%, #8b5cf6 100%)`,
            padding: '15px 35px',
            borderRadius: 30,
            boxShadow: `0 10px 40px ${BRAND.primary}60`,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              fontSize: 32,
              fontFamily: FONTS.fontFamily,
              color: BRAND.white,
              fontWeight: 'bold',
            }}
          >
            יש! משהו ירד מהרשימה 🎉
          </span>
        </div>
      )}

      {/* Confetti particles */}
      {popFrame > 15 && Array.from({ length: 12 }).map((_, i) => {
        const confettiFrame = popFrame - 15;
        const angle = (i / 12) * Math.PI * 2;
        const distance = interpolate(confettiFrame, [0, 40], [0, 150 + Math.random() * 50], {
          extrapolateRight: 'clamp',
        });
        const confettiOpacity = interpolate(confettiFrame, [0, 10, 35, 50], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const confettiY = confettiFrame * confettiFrame * 0.03; // Gravity effect
        const colors = [BRAND.primary, BRAND.pink, '#8b5cf6', '#ffd700', '#4caf50'];

        return (
          <div
            key={`confetti-${i}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 12,
              height: 12,
              borderRadius: i % 2 === 0 ? '50%' : 2,
              background: colors[i % colors.length],
              transform: `translate(
                calc(-50% + ${Math.cos(angle) * distance}px),
                calc(-50% + ${Math.sin(angle) * distance + confettiY}px)
              ) rotate(${confettiFrame * 5}deg)`,
              opacity: confettiOpacity,
            }}
          />
        );
      })}
    </div>
  );
};

// CTA Scene - Call to action with animated background
const CTAScene: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();

  const logoScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const textOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const urlSlide = spring({
    frame: frame - 50,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Pulse effect on logo
  const pulse = 1 + Math.sin(frame * 0.12) * 0.03;

  // Click animation on URL - repeating tap effect
  const clickCycle = 40; // Frames per click cycle
  const clickFrame = (frame - 70) % clickCycle; // Start after URL appears
  const isClickActive = frame > 70;

  // Click scale: press down then release
  const clickScale = isClickActive
    ? interpolate(
        clickFrame,
        [0, 5, 10, 15, clickCycle],
        [1, 0.95, 1.02, 1, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      )
    : 1;

  // Click glow effect
  const clickGlow = isClickActive
    ? interpolate(clickFrame, [5, 15, 25], [0, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Finger cursor animation
  const fingerOpacity = isClickActive
    ? interpolate(clickFrame, [0, 3, 8, 12, clickCycle], [0.8, 1, 0.9, 0.7, 0.8], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;
  const fingerY = isClickActive
    ? interpolate(clickFrame, [0, 5, 10, clickCycle], [0, 8, 0, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Background animation
  const gradientAngle = 135 + frame * 0.3;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${gradientAngle}deg,
          ${BRAND.primary} 0%,
          #7c4dff 30%,
          #9575cd 60%,
          ${BRAND.pink} 100%)`,
        justifyContent: 'center',
        alignItems: 'center',
        direction: 'rtl',
        overflow: 'hidden',
      }}
    >
      {/* Animated background shapes */}
      <div
        style={{
          position: 'absolute',
          left: -150,
          top: 200,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          transform: `translate(${Math.sin(frame * 0.03) * 30}px, ${Math.cos(frame * 0.04) * 25}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -100,
          bottom: 300,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          transform: `translate(${Math.cos(frame * 0.04) * 25}px, ${Math.sin(frame * 0.03) * 30}px)`,
        }}
      />

      {/* Floating emojis - subtle and classy */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 250,
          fontSize: 50,
          opacity: 0.25,
          transform: `translateY(${Math.sin(frame * 0.05) * 15}px)`,
          filter: 'grayscale(30%)',
        }}
      >
        🪺
      </div>
      <div
        style={{
          position: 'absolute',
          right: 100,
          top: 350,
          fontSize: 45,
          opacity: 0.2,
          transform: `translateY(${Math.cos(frame * 0.06) * 12}px)`,
          filter: 'grayscale(50%)',
        }}
      >
        💜
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          bottom: 350,
          fontSize: 40,
          opacity: 0.25,
          transform: `translateY(${Math.sin(frame * 0.04) * 18}px)`,
        }}
      >
        ✨
      </div>
      <div
        style={{
          position: 'absolute',
          right: 80,
          bottom: 280,
          fontSize: 48,
          opacity: 0.2,
          transform: `translateY(${Math.cos(frame * 0.05) * 14}px)`,
          filter: 'grayscale(40%)',
        }}
      >
        🎁
      </div>

      {/* Logo with white background */}
      <div
        style={{
          background: BRAND.white,
          borderRadius: 35,
          padding: '35px 60px',
          marginBottom: 45,
          transform: `scale(${logoScale * pulse})`,
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.35)',
        }}
      >
        <img
          src={staticFile('nesty-logo.png')}
          style={{ width: 340, height: 'auto' }}
        />
      </div>

      <h1
        style={{
          fontSize: FONTS.heroTitle - 8,
          color: BRAND.white,
          fontFamily: FONTS.fontFamily,
          fontWeight: 'bold',
          textShadow: '0 4px 25px rgba(0, 0, 0, 0.4)',
          opacity: textOpacity,
          marginBottom: 18,
          textAlign: 'center',
          lineHeight: 1.3,
        }}
      >
        תפסיקי לעבוד באקסל.
        <br />
        תתחילי לעצב.
      </h1>

      <p
        style={{
          fontSize: FONTS.bodyLarge,
          color: BRAND.white,
          fontFamily: FONTS.fontFamily,
          textShadow: '0 2px 15px rgba(0, 0, 0, 0.35)',
          opacity: textOpacity,
        }}
      >
        ללא עלות. ללא התחייבות.
      </p>

      {/* URL button with click animation */}
      <div
        style={{
          position: 'relative',
          marginTop: 45,
          transform: `translateY(${interpolate(urlSlide, [0, 1], [60, 0])}px)`,
          opacity: urlSlide,
        }}
      >
        {/* Click glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: -15,
            borderRadius: 45,
            background: `radial-gradient(ellipse, ${BRAND.white}${Math.round(clickGlow * 40).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            transform: `scale(${1 + clickGlow * 0.15})`,
            opacity: clickGlow,
            pointerEvents: 'none',
          }}
        />

        {/* Main URL button - LARGER */}
        <div
          style={{
            background: BRAND.white,
            borderRadius: 40,
            padding: '28px 80px',
            transform: `scale(${clickScale})`,
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.3), 0 0 ${40 * clickGlow}px ${BRAND.white}`,
            transition: 'box-shadow 0.1s ease',
          }}
        >
          <span
            style={{
              fontSize: FONTS.heroTitle - 10,
              color: BRAND.primary,
              fontWeight: 'bold',
              fontFamily: FONTS.fontFamily,
              letterSpacing: 1,
            }}
          >
            nestyil.com
          </span>
        </div>

        {/* Animated finger cursor */}
        {isClickActive && (
          <div
            style={{
              position: 'absolute',
              right: -30,
              bottom: -25,
              fontSize: 55,
              transform: `translateY(${fingerY}px) rotate(-15deg)`,
              opacity: fingerOpacity,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
            }}
          >
            👆
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export const NestyVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const transitionDuration = 15;

  const getSceneOpacity = (start: number, end: number) => {
    const fadeIn = interpolate(frame, [start, start + transitionDuration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const fadeOut = interpolate(frame, [end - transitionDuration, end], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return Math.min(fadeIn, fadeOut);
  };

  // Scene visibility
  const isHookVisible = frame >= SCENES.hook.start && frame < SCENES.hook.end + transitionDuration;
  const isIntroVisible =
    frame >= SCENES.intro.start - transitionDuration && frame < SCENES.intro.end + transitionDuration;
  const isChecklistVisible =
    frame >= SCENES.checklist.start - transitionDuration && frame < SCENES.checklist.end + transitionDuration;
  const isRegistryVisible =
    frame >= SCENES.registry.start - transitionDuration && frame < SCENES.registry.end + transitionDuration;
  const isFamilyVisible =
    frame >= SCENES.family.start - transitionDuration && frame < SCENES.family.end + transitionDuration;
  const isGiftsVisible =
    frame >= SCENES.gifts.start - transitionDuration && frame < SCENES.gifts.end + transitionDuration;
  const isStatsVisible =
    frame >= SCENES.stats.start - transitionDuration && frame < SCENES.stats.end + transitionDuration;
  const isCTAVisible = frame >= SCENES.cta.start - transitionDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.white }}>
      {/* Scene 1: Hook */}
      {isHookVisible && (
        <AbsoluteFill style={{ opacity: getSceneOpacity(SCENES.hook.start, SCENES.hook.end) }}>
          <HookScene frame={frame - SCENES.hook.start} />
        </AbsoluteFill>
      )}

      {/* Scene 2: Intro - What is Nesty */}
      {isIntroVisible && (
        <AbsoluteFill style={{ opacity: getSceneOpacity(SCENES.intro.start, SCENES.intro.end) }}>
          <IntroScene frame={frame - SCENES.intro.start} />
        </AbsoluteFill>
      )}

      {/* Scene 3: Checklist - IMG_9861 */}
      {isChecklistVisible && (
        <AbsoluteFill style={{ opacity: getSceneOpacity(SCENES.checklist.start, SCENES.checklist.end) }}>
          <ScreenshotScene
            screenshot={SCREENSHOTS.checklist.file}
            imageWidth={SCREENSHOTS.checklist.width}
            imageHeight={SCREENSHOTS.checklist.height}
            title="רשימה חכמה שלא שוכחת כלום 📋"
            subtitle="כל מה שתינוק צריך - מאורגן"
            scrollStart={0}
            scrollEnd={1200}
            frame={frame - SCENES.checklist.start}
            sceneDuration={SCENES.checklist.end - SCENES.checklist.start}
          />
          {/* Focus overlay - checklist checkmark */}
          <FocusOverlay
            frame={frame - SCENES.checklist.start}
            emoji="✅"
            label="מסומן ומאורגן!"
            delay={50}
          />
        </AbsoluteFill>
      )}

      {/* Scene 4: Registry - IMG_9859 */}
      {isRegistryVisible && (
        <AbsoluteFill style={{ opacity: getSceneOpacity(SCENES.registry.start, SCENES.registry.end) }}>
          <ScreenshotScene
            screenshot={SCREENSHOTS.registry.file}
            imageWidth={SCREENSHOTS.registry.width}
            imageHeight={SCREENSHOTS.registry.height}
            title="הרישום שלך - מעוצב ומוכן 🎁"
            subtitle="הוסיפי מוצרים מכל אתר"
            scrollStart={300}
            scrollEnd={2000}
            frame={frame - SCENES.registry.start}
            sceneDuration={SCENES.registry.end - SCENES.registry.start}
          />
          {/* Focus overlay - shopping cart */}
          <FocusOverlay
            frame={frame - SCENES.registry.start}
            emoji="🛒"
            label="מכל חנות שתרצי!"
            delay={40}
          />
        </AbsoluteFill>
      )}

      {/* Scene 5: Family Sharing */}
      {isFamilyVisible && (
        <AbsoluteFill style={{ opacity: getSceneOpacity(SCENES.family.start, SCENES.family.end) }}>
          <FamilyScene frame={frame - SCENES.family.start} />
        </AbsoluteFill>
      )}

      {/* Scene 6: Gifts - IMG_9857 with pop-out effect */}
      {isGiftsVisible && (
        <AbsoluteFill style={{ opacity: getSceneOpacity(SCENES.gifts.start, SCENES.gifts.end) }}>
          <ScreenshotScene
            screenshot={SCREENSHOTS.gifts.file}
            imageWidth={SCREENSHOTS.gifts.width}
            imageHeight={SCREENSHOTS.gifts.height}
            title="מתנות שהגיעו! 💝"
            subtitle="עוקבים אוטומטית - בלי לשאול"
            scrollStart={0}
            scrollEnd={800}
            frame={frame - SCENES.gifts.start}
            sceneDuration={SCENES.gifts.end - SCENES.gifts.start}
          />
          {/* Pop-out gift overlay */}
          <GiftPopOutOverlay frame={frame - SCENES.gifts.start} />
        </AbsoluteFill>
      )}

      {/* Scene 7: Stats - IMG_9864 - Control messaging with savings highlight */}
      {isStatsVisible && (
        <AbsoluteFill style={{ opacity: getSceneOpacity(SCENES.stats.start, SCENES.stats.end) }}>
          <ScreenshotScene
            screenshot={SCREENSHOTS.stats.file}
            imageWidth={SCREENSHOTS.stats.width}
            imageHeight={SCREENSHOTS.stats.height}
            title="תראי כמה חסכת! 📊"
            subtitle="שליטה מלאה על ההכנות"
            scrollStart={0}
            scrollEnd={1200}
            frame={frame - SCENES.stats.start}
            sceneDuration={SCENES.stats.end - SCENES.stats.start}
            highlights={[
              {
                x: 5,
                y: 450,
                width: 90,
                height: 200,
                startFrame: 30,
                endFrame: 80,
                label: 'חיסכון!',
              },
            ]}
          />
          {/* Focus overlay - money saved */}
          <FocusOverlay
            frame={frame - SCENES.stats.start}
            emoji="💰"
            label="חיסכון אמיתי!"
            delay={45}
          />
        </AbsoluteFill>
      )}

      {/* Scene 8: CTA */}
      {isCTAVisible && (
        <AbsoluteFill style={{ opacity: getSceneOpacity(SCENES.cta.start, durationInFrames) }}>
          <CTAScene frame={frame - SCENES.cta.start} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
