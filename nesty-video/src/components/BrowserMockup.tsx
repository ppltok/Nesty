import React from 'react';
import { BRAND } from '../constants';

interface BrowserMockupProps {
  width: number;
  height?: number;
  url?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({
  width,
  height = 700,
  url = 'shilav.co.il/product/baby-stroller',
  children,
  style = {},
}) => {
  const chromeHeight = 50;
  const borderRadius = 16;

  return (
    <div
      style={{
        width,
        height: height + chromeHeight,
        backgroundColor: '#f0f0f0',
        borderRadius,
        boxShadow: '0 30px 80px rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Browser Chrome */}
      <div
        style={{
          height: chromeHeight,
          backgroundColor: '#e8e8e8',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#27ca40' }} />
        </div>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            height: 32,
            backgroundColor: BRAND.white,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            marginLeft: 8,
          }}
        >
          {/* Lock icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill={BRAND.success} style={{ marginRight: 8 }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span style={{
            fontSize: 14,
            color: BRAND.gray,
            fontFamily: 'system-ui, sans-serif',
          }}>
            {url}
          </span>
        </div>

        {/* Extension icon placeholder */}
        <div
          style={{
            width: 28,
            height: 28,
            backgroundColor: BRAND.primary,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>🪺</span>
        </div>
      </div>

      {/* Browser content */}
      <div
        style={{
          height: height,
          backgroundColor: BRAND.white,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
};
