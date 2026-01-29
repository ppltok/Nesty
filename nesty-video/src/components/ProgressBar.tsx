import React from 'react';
import { BRAND } from '../constants';

interface ProgressBarProps {
  value: number; // 0-100
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  width = 600,
  height = 24,
  style = {},
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: BRAND.primaryLight,
        borderRadius: height / 2,
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          width: `${clampedValue}%`,
          height: '100%',
          backgroundColor: BRAND.primary,
          borderRadius: height / 2,
          transition: 'width 0.3s ease-out',
        }}
      />
    </div>
  );
};
