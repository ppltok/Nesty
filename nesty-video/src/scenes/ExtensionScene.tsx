import React from 'react';
import { AbsoluteFill, interpolate, spring, useVideoConfig } from 'remotion';
import { BRAND, FONTS } from '../constants';
import { BrowserMockup } from '../components';

interface ExtensionSceneProps {
  frame: number;
}

export const ExtensionScene: React.FC<ExtensionSceneProps> = ({ frame }) => {
  const { fps, width, height } = useVideoConfig();

  // Browser entrance
  const browserEntry = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
  });

  // Popup appearance
  const popupOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const popupScale = spring({
    frame: Math.max(0, frame - 40),
    fps,
    config: { damping: 10, stiffness: 100 },
  });

  // Click animation
  const clickPulse = frame > 30 && frame < 50 ? Math.sin((frame - 30) * 0.5) * 0.1 + 1 : 1;

  // Product fly animation
  const productFly = interpolate(frame, [70, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const flyX = interpolate(productFly, [0, 1], [0, 300]);
  const flyY = interpolate(productFly, [0, 1], [0, -200]);
  const flyScale = interpolate(productFly, [0, 0.5, 1], [1, 1.2, 0]);
  const flyOpacity = interpolate(productFly, [0, 0.8, 1], [1, 1, 0]);

  // FULL SCREEN browser - 95% of available space
  const browserWidth = width * 0.95;
  const browserHeight = height * 0.75;

  return (
    <AbsoluteFill
      style={{
        background: BRAND.white,
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontFamily: FONTS.fontFamily,
        direction: 'rtl',
        padding: '50px 0',
      }}
    >
      {/* Title */}
      <h2
        style={{
          fontSize: FONTS.sectionTitle,
          color: BRAND.dark,
          fontWeight: 700,
          textAlign: 'center',
          zIndex: 10,
          margin: '0 0 30px 0',
        }}
      >
        ראית משהו? הוסיפי בקליק 🔗
      </h2>

      {/* Browser mockup - FULL SCREEN */}
      <div
        style={{
          transform: `scale(${browserEntry})`,
          opacity: browserEntry,
          position: 'relative',
        }}
      >
        <BrowserMockup width={browserWidth} height={browserHeight}>
          {/* Fake product page - FULL content */}
          <div
            style={{
              padding: '60px 80px',
              display: 'flex',
              gap: 60,
              direction: 'rtl',
              height: '100%',
            }}
          >
            {/* Product image - LARGE */}
            <div
              style={{
                width: browserWidth * 0.35,
                height: browserWidth * 0.35,
                backgroundColor: BRAND.primaryLight,
                borderRadius: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 200,
                flexShrink: 0,
              }}
            >
              🚗
            </div>

            {/* Product details */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3
                style={{
                  fontSize: 52,
                  fontWeight: 700,
                  color: BRAND.dark,
                  margin: 0,
                  marginBottom: 24,
                  fontFamily: FONTS.fontFamily,
                }}
              >
                עגלת תינוק פרמיום
              </h3>
              <p
                style={{
                  fontSize: 36,
                  color: BRAND.gray,
                  margin: 0,
                  marginBottom: 30,
                  fontFamily: FONTS.fontFamily,
                  lineHeight: 1.4,
                }}
              >
                עגלה איכותית עם מערכת נסיעה חלקה, מתאימה מגיל לידה ועד 3 שנים
              </p>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  color: BRAND.primary,
                  fontFamily: FONTS.fontFamily,
                  marginBottom: 30,
                }}
              >
                ₪2,499
              </div>

              {/* Buy button */}
              <button
                style={{
                  padding: '24px 60px',
                  backgroundColor: BRAND.primary,
                  color: BRAND.white,
                  border: 'none',
                  borderRadius: 20,
                  fontSize: 32,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: FONTS.fontFamily,
                  width: 'fit-content',
                }}
              >
                🛒 הוסף לסל
              </button>
            </div>
          </div>
        </BrowserMockup>

        {/* Extension popup - positioned on browser */}
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 30,
            width: 380,
            backgroundColor: BRAND.white,
            borderRadius: 20,
            boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
            opacity: popupOpacity,
            transform: `scale(${popupScale})`,
            transformOrigin: 'top right',
            overflow: 'hidden',
            zIndex: 20,
          }}
        >
          {/* Popup header */}
          <div
            style={{
              backgroundColor: BRAND.primary,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <span style={{ fontSize: 36 }}>🪺</span>
            <span
              style={{
                color: BRAND.white,
                fontSize: 26,
                fontWeight: 600,
                fontFamily: FONTS.fontFamily,
              }}
            >
              הוסף לנסטי
            </span>
          </div>

          {/* Popup content */}
          <div style={{ padding: 24, direction: 'rtl' }}>
            <div
              style={{
                display: 'flex',
                gap: 16,
                marginBottom: 20,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  backgroundColor: BRAND.primaryLight,
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 44,
                }}
              >
                🚗
              </div>
              <div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: BRAND.dark,
                    fontFamily: FONTS.fontFamily,
                  }}
                >
                  עגלת תינוק פרמיום
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    color: BRAND.primary,
                    fontFamily: FONTS.fontFamily,
                  }}
                >
                  ₪2,499
                </div>
              </div>
            </div>

            {/* Add button */}
            <button
              style={{
                width: '100%',
                padding: '18px',
                backgroundColor: BRAND.success,
                color: BRAND.white,
                border: 'none',
                borderRadius: 14,
                fontSize: 24,
                fontWeight: 600,
                cursor: 'pointer',
                transform: `scale(${clickPulse})`,
                fontFamily: FONTS.fontFamily,
              }}
            >
              ✓ הוסף לרשימה
            </button>
          </div>
        </div>

        {/* Flying product animation */}
        {productFly > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 250,
              right: 220,
              fontSize: 80,
              opacity: flyOpacity,
              transform: `translate(${flyX}px, ${flyY}px) scale(${flyScale})`,
              zIndex: 30,
            }}
          >
            🚗
          </div>
        )}
      </div>

      {/* Success indicator */}
      {productFly > 0.8 && (
        <div
          style={{
            position: 'absolute',
            top: 300,
            right: 150,
            fontSize: 100,
            opacity: interpolate(productFly, [0.8, 1], [0, 1]),
          }}
        >
          ✅
        </div>
      )}
    </AbsoluteFill>
  );
};
