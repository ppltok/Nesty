import React from 'react';
import { Composition } from 'remotion';
import { NestyVideo } from './NestyVideo';
import { VIDEO, PORTRAIT, LANDSCAPE } from './constants';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Portrait version for Instagram/TikTok */}
      <Composition
        id="NestyVideo"
        component={NestyVideo}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={PORTRAIT.width}
        height={PORTRAIT.height}
      />

      {/* Landscape version for YouTube/Web */}
      <Composition
        id="NestyLandscape"
        component={NestyVideo}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={LANDSCAPE.width}
        height={LANDSCAPE.height}
      />
    </>
  );
};
