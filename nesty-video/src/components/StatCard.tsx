import React from 'react';
import { BRAND, FONTS } from '../constants';

interface StatCardProps {
  emoji: string;
  value: string;
  label: string;
  style?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = ({
  emoji,
  value,
  label,
  style = {},
}) => {
  return (
    <div
      style={{
        backgroundColor: BRAND.white,
        borderRadius: 24,
        padding: '40px 30px',
        boxShadow: '0 8px 30px rgba(103, 80, 164, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        minWidth: 200,
        ...style,
      }}
    >
      <span style={{ fontSize: 80 }}>{emoji}</span>
      <span
        style={{
          fontSize: FONTS.sectionTitle,
          fontWeight: 700,
          color: BRAND.primary,
          fontFamily: FONTS.fontFamily,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: FONTS.bodyMedium,
          color: BRAND.gray,
          fontFamily: FONTS.fontFamily,
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
};
