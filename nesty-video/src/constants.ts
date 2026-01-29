// Brand Guidelines
export const BRAND = {
  primary: '#6750a4',       // Purple - main brand color
  primaryLight: '#f3edff',  // Light purple background
  pink: '#ffd8e4',          // Accent pink
  dark: '#1d192b',          // Text dark
  gray: '#49454f',          // Secondary text
  white: '#ffffff',
  success: '#4caf50',       // Green for checkmarks
};

// Typography - ALL text must be LARGE and readable
export const FONTS = {
  heroTitle: 72,        // Main headlines - MINIMUM
  sectionTitle: 56,     // Section headers
  bodyLarge: 42,        // Primary body text
  bodyMedium: 36,       // Secondary text
  caption: 28,          // Smallest allowed text
  fontFamily: 'Heebo, Arial, sans-serif', // Hebrew-friendly font
};

// Portrait layout (1080x1920)
export const PORTRAIT = {
  width: 1080,
  height: 1920,
  phoneWidth: 900,
  phoneHeight: 1600,
  padding: 40,
};

// Landscape layout (1920x1080)
export const LANDSCAPE = {
  width: 1920,
  height: 1080,
  phoneWidth: 500,
  phoneHeight: 900,
  padding: 60,
};

// Video settings
export const VIDEO = {
  fps: 30,
  durationInSeconds: 30,
  durationInFrames: 900,
};

// Scene timing (in frames) - Screenshot-based flow
// ADJUSTED: Extended hook (for Beat 2 readability) and family (for mobile readability)
export const SCENES = {
  hook: { start: 0, end: 120 },           // 0-4 seconds - emotional hook (extended for Beat 2)
  intro: { start: 120, end: 195 },        // 4-6.5 seconds - what is Nesty
  checklist: { start: 195, end: 300 },    // 6.5-10 seconds - IMG_9861 checklist
  registry: { start: 300, end: 390 },     // 10-13 seconds - IMG_9859 products
  family: { start: 390, end: 540 },       // 13-18 seconds - share with family (EXTENDED for readability)
  gifts: { start: 540, end: 630 },        // 18-21 seconds - IMG_9857 received
  stats: { start: 630, end: 720 },        // 21-24 seconds - IMG_9864 statistics
  cta: { start: 720, end: 900 },          // 24-30 seconds - CTA
};

// Screenshot data
export const SCREENSHOTS = {
  checklist: {
    file: 'IMG_9861.JPG',
    width: 804,
    height: 6340,
  },
  registry: {
    file: 'IMG_9859.JPG',
    width: 501,
    height: 7500,
  },
  gifts: {
    file: 'IMG_9857.JPG',
    width: 820,
    height: 3942,
  },
  stats: {
    file: 'IMG_9864.JPG',
    width: 804,
    height: 4878,
  },
};

// Category data from the real app
export const CATEGORIES = [
  { emoji: '🚗', name: 'עגלות וטיולים', items: 8 },
  { emoji: '🛏️', name: 'ריהוט', items: 12 },
  { emoji: '🍼', name: 'האכלה', items: 15 },
  { emoji: '👶', name: 'טיפוח', items: 10 },
  { emoji: '🛁', name: 'רחצה', items: 6 },
  { emoji: '👕', name: 'ביגוד', items: 20 },
  { emoji: '🧸', name: 'צעצועים', items: 5 },
  { emoji: '📦', name: 'כללי', items: 8 },
];
