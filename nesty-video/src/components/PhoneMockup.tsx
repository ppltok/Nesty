import React from 'react';
import { BRAND } from '../constants';

interface PhoneMockupProps {
  width: number;
  height: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  width,
  height,
  children,
  style = {},
}) => {
  const borderRadius = 60;
  const bezelWidth = 12;
  const notchWidth = 200;
  const notchHeight = 35;

  return (
    <div
      style={{
        width: width + bezelWidth * 2,
        height: height + bezelWidth * 2,
        backgroundColor: '#1a1a1a',
        borderRadius: borderRadius + bezelWidth,
        padding: bezelWidth,
        boxShadow: '0 50px 100px rgba(0,0,0,0.3), 0 20px 40px rgba(0,0,0,0.2)',
        position: 'relative',
        ...style,
      }}
    >
      {/* Screen */}
      <div
        style={{
          width,
          height,
          backgroundColor: BRAND.white,
          borderRadius,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: notchWidth,
            height: notchHeight,
            backgroundColor: '#1a1a1a',
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            zIndex: 10,
          }}
        >
          {/* Camera dot */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 30,
              width: 12,
              height: 12,
              backgroundColor: '#2a2a3a',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Status bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 50,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 30px',
            zIndex: 5,
          }}
        >
          <span style={{
            fontSize: 16,
            fontWeight: 600,
            color: BRAND.dark,
          }}>
            9:41
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Signal */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill={BRAND.dark}>
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5" width="3" height="7" rx="1" />
              <rect x="10" y="2" width="3" height="10" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill={BRAND.dark}>
              <path d="M8 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-4-3a6 6 0 0 1 8 0l-1.5 1.5a4 4 0 0 0-5 0L4 7zm-3-3a10 10 0 0 1 14 0l-1.5 1.5a8 8 0 0 0-11 0L1 4z" />
            </svg>
            {/* Battery */}
            <div style={{
              width: 26,
              height: 12,
              border: `2px solid ${BRAND.dark}`,
              borderRadius: 4,
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: 2,
                left: 2,
                right: 4,
                bottom: 2,
                backgroundColor: BRAND.success,
                borderRadius: 2,
              }} />
              <div style={{
                position: 'absolute',
                right: -5,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 3,
                height: 6,
                backgroundColor: BRAND.dark,
                borderTopRightRadius: 2,
                borderBottomRightRadius: 2,
              }} />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div
          style={{
            position: 'absolute',
            top: 50,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
