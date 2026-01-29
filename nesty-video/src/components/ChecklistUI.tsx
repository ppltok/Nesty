import React from 'react';
import { interpolate } from 'remotion';
import { BRAND, FONTS, CATEGORIES } from '../constants';

interface ChecklistUIProps {
  frame: number;
  startFrame?: number;
}

// Real app layout with side nav + main content
export const ChecklistUI: React.FC<ChecklistUIProps> = ({ frame, startFrame = 0 }) => {
  const localFrame = frame - startFrame;

  const progress = Math.round(
    interpolate(localFrame, [0, 180], [23, 67], { extrapolateRight: 'clamp' })
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#fffbff',
        fontFamily: FONTS.fontFamily,
        direction: 'rtl',
      }}
    >
      {/* Side Navigation - matches real SideNav.tsx */}
      <div
        style={{
          width: 72,
          height: '100%',
          backgroundColor: BRAND.white,
          borderLeft: '1px solid #e7e0ec',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px 0',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 44,
            height: 44,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          🪺
        </div>

        {/* Nav Items */}
        {[
          { icon: '❤️', active: false },
          { icon: '📋', active: true },
          { icon: '🎁', active: false },
          { icon: '📊', active: false },
        ].map((item, index) => (
          <div
            key={index}
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: item.active ? '#eaddff' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              fontSize: 24,
            }}
          >
            {item.icon}
          </div>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Settings & Logout */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            fontSize: 20,
            color: BRAND.gray,
          }}
        >
          ⚙️
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: '#b3261e',
          }}
        >
          🚪
        </div>
      </div>

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          padding: '24px 28px',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 20,
                backgroundColor: '#eaddff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                transform: 'rotate(3deg)',
              }}
            >
              📋
            </div>
            <div>
              <h1
                style={{
                  fontSize: 32,
                  fontWeight: 500,
                  color: BRAND.dark,
                  margin: 0,
                }}
              >
                מה <span style={{ color: BRAND.primary }}>באמת</span> צריך?
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: BRAND.gray,
                  margin: '4px 0 0 0',
                }}
              >
                התחילי כאן לגלות מה לקנות לגוזל הקטן 🐣
              </p>
            </div>
          </div>

          {/* Nesting Score Card */}
          <div
            style={{
              width: 200,
              background: 'linear-gradient(135deg, #ffd8e4 0%, #fff0f5 100%)',
              borderRadius: 20,
              padding: 16,
              border: '1px solid #ffd8e4',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>❤️</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#b3261e',
                    textTransform: 'uppercase',
                  }}
                >
                  מדד הקינון
                </span>
              </div>
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: BRAND.dark,
                }}
              >
                {progress}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 8,
                backgroundColor: 'rgba(255,255,255,0.5)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#b3261e',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CATEGORIES.slice(0, 5).map((category, index) => {
            const itemDelay = index * 20;
            const itemOpacity = interpolate(
              localFrame,
              [itemDelay, itemDelay + 15],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );
            const itemSlide = interpolate(
              localFrame,
              [itemDelay, itemDelay + 15],
              [20, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            const isExpanded = index === 0;
            const categoryProgress = interpolate(
              localFrame,
              [60, 150],
              [index === 0 ? 40 : 20, index === 0 ? 100 : 30 + index * 15],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            );

            return (
              <div
                key={category.name}
                style={{
                  backgroundColor: BRAND.white,
                  borderRadius: 20,
                  border: '1px solid #e7e0ec',
                  overflow: 'hidden',
                  opacity: itemOpacity,
                  transform: `translateX(${itemSlide}px)`,
                  boxShadow: isExpanded ? '0 8px 30px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {/* Category Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      backgroundColor: isExpanded ? '#eaddff' : '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                    }}
                  >
                    {category.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: 15,
                          color: isExpanded ? BRAND.dark : BRAND.gray,
                        }}
                      >
                        {category.name}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: BRAND.gray,
                        }}
                      >
                        {Math.round(categoryProgress * category.items / 100)}/{category.items}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 6,
                        backgroundColor: '#f3edff',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${categoryProgress}%`,
                          height: '100%',
                          backgroundColor:
                            categoryProgress === 100 ? '#00c875' : BRAND.primary,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: isExpanded ? '#f3edff' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      fontSize: 16,
                      color: isExpanded ? BRAND.primary : BRAND.gray,
                    }}
                  >
                    ▼
                  </div>
                </div>

                {/* Expanded Items (only first category) */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid #e7e0ec',
                      padding: 12,
                      backgroundColor: '#fdfcff',
                    }}
                  >
                    {['עגלה', 'סלקל', 'עריסת נסיעות'].map((item, itemIndex) => {
                      const checkDelay = 80 + itemIndex * 25;
                      const isChecked = localFrame > checkDelay;

                      return (
                        <div
                          key={item}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '10px 12px',
                            backgroundColor: isChecked ? 'rgba(243,237,255,0.3)' : BRAND.white,
                            borderRadius: 14,
                            marginBottom: 8,
                            border: `1px solid ${isChecked ? '#eaddff' : '#e7e0ec'}`,
                          }}
                        >
                          <div
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              border: `2px solid ${isChecked ? BRAND.primary : '#e7e0ec'}`,
                              backgroundColor: isChecked ? BRAND.primary : BRAND.white,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: BRAND.white,
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {isChecked ? '✓' : ''}
                          </div>
                          <span
                            style={{
                              flex: 1,
                              fontSize: 14,
                              fontWeight: 500,
                              color: isChecked ? 'rgba(73,69,79,0.6)' : BRAND.dark,
                              textDecoration: isChecked ? 'line-through' : 'none',
                            }}
                          >
                            {item}
                          </span>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 20,
                              backgroundColor: '#1d192b',
                              color: BRAND.white,
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            חובה
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
