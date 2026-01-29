# Nesty Promotional Video - Complete Implementation Guide

## Overview

Create a 30-second promotional video for Nesty, a Hebrew baby registry app for Israeli moms. The video must feel premium, emotional, and conversion-focused.

---

## Technical Specifications

```
Framework: Remotion (React-based video generation)
Duration: 30 seconds (900 frames at 30fps)
Portrait: 1080 x 1920 pixels (for Instagram/TikTok)
Landscape: 1920 x 1080 pixels (for YouTube/Web)
FPS: 30
```

### CRITICAL: Full-Screen Layouts

**Every component must fill the entire frame.** No component should ever take less than 80% of the screen width/height.

```typescript
// Portrait (1080x1920) - Components should be:
const PORTRAIT = {
  width: 1080,
  height: 1920,
  phoneWidth: 900,      // 83% of width - NOT smaller
  phoneHeight: 1600,    // 83% of height
  padding: 40,          // Minimal padding
};

// Landscape (1920x1080) - Components should be:
const LANDSCAPE = {
  width: 1920,
  height: 1080,
  phoneWidth: 500,      // For side-by-side mockups
  phoneHeight: 900,
  padding: 60,
};
```

---

## Brand Guidelines

### Colors (from real app)
```typescript
const BRAND = {
  primary: '#6750a4',       // Purple - main brand color
  primaryLight: '#f3edff',  // Light purple background
  pink: '#ffd8e4',          // Accent pink
  dark: '#1d192b',          // Text dark
  gray: '#49454f',          // Secondary text
  white: '#ffffff',
  success: '#4caf50',       // Green for checkmarks
};
```

### Typography
```typescript
// ALL text must be LARGE and readable
const FONTS = {
  heroTitle: '72px',        // Main headlines - MINIMUM
  sectionTitle: '56px',     // Section headers
  bodyLarge: '42px',        // Primary body text
  bodyMedium: '36px',       // Secondary text
  caption: '28px',          // Smallest allowed text
  fontFamily: 'Heebo, sans-serif', // Hebrew-friendly font
};
```

### Logo Usage
- Logo MUST have a white background rectangle behind it
- Never place logo directly on colored backgrounds without white container
- Logo file: `public/nesty-logo.png`

---

## Visual Style: USE EMOJIS

**Emojis look better and more friendly than icons for this audience.**

### Recommended Emojis
```
Categories:
🚗 Car seats, strollers
🛏️ Cribs, furniture
🍼 Feeding
👶 Baby care
🛁 Bathing
👕 Clothing
🧸 Toys
📦 General items

Actions/States:
✅ Checked/complete
💝 Gift received
💰 Money saved
👨‍👩‍👧 Family/sharing
🎁 Presents
📋 Checklist
📊 Statistics
🔗 Extension/link
```

### When to Use Real App Icons
Only use the actual lucide-react icons when showing the REAL app interface:
- SideNav icons: Car, Home, ShieldAlert, Baby, etc.
- These should match exactly what users see in the app

---

## Target Audience

**Primary Persona: First-time pregnant Israeli mom**

- Age: 25-35
- First pregnancy (doesn't know what she needs)
- Overwhelmed by the amount of baby items
- Wants to feel organized and prepared
- Family/friends want to help but don't know how
- Hebrew-speaking, RTL interface

**Pain Points to Address:**
1. "I don't know what I need for the baby"
2. "Everyone asks what to buy but I have no list"
3. "I'm scared I'll forget something important"
4. "I want to feel ready before the baby comes"

**Emotional Triggers:**
- Fear of being unprepared
- Desire to feel in control
- Nesting instinct
- Joy of receiving gifts
- Pride in being organized

---

## AIDA Marketing Framework

### Scene 1: ATTENTION (0-5 seconds)
**Hook the viewer immediately with a relatable pain point**

```
Visual: Close-up of overwhelmed face emoji 😰
Text: "בהריון הראשון?"
Subtext: "יש כל כך הרבה דברים לקנות..."

Animation: Fast zoom, shake effect
```

### Scene 2: INTEREST (5-12 seconds)
**Show the solution exists**

```
Visual: Phone mockup with Checklist screen
Text: "נסטי יודעת בדיוק מה את צריכה"

Show: Real checklist with categories
- 🚗 עגלות וטיולים
- 🛏️ ריהוט
- 🍼 האכלה
- ✅ Items being checked off

Animation: Items checking themselves, progress bar filling
```

### Scene 3: DESIRE (12-22 seconds)
**Show the benefits and social proof**

```
Part A - Extension Demo (12-16s):
Visual: Browser with extension popup
Text: "ראית משהו? הוסיפי בקליק"
Animation: Click → Product flies into registry

Part B - Family Sharing (16-19s):
Visual: Phone with share screen
Text: "שתפי עם המשפחה"
Emojis: 👨‍👩‍👧 → 🎁 → 💝
Animation: Link being shared, gifts appearing

Part C - Statistics (19-22s):
Visual: Statistics dashboard
Text: "תראי כמה חסכת!"
Show: ₪4,200 saved, 67% complete
Animation: Numbers counting up, celebration
```

### Scene 4: ACTION (22-30 seconds)
**Clear call to action**

```
Visual: Nesty logo (on white background) + App screens
Text: "הקן שלך מחכה"
Subtext: "הירשמי עכשיו - בחינם!"
URL: nestyil.com

Animation: Logo pulse, screens floating around
Final: All elements settle, logo prominent
```

---

## Scene-by-Scene Implementation

### Scene 1: Hook (frames 0-150)

```typescript
const HookScene: React.FC<{frame: number}> = ({frame}) => {
  return (
    <AbsoluteFill style={{
      background: BRAND.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* FULL SCREEN - emoji should be 300px+ */}
      <div style={{fontSize: '300px'}}>😰</div>

      {/* Large readable text */}
      <h1 style={{
        fontSize: '72px',
        color: BRAND.dark,
        fontFamily: 'Heebo',
        marginTop: '40px',
      }}>
        בהריון הראשון?
      </h1>

      <p style={{
        fontSize: '48px',
        color: BRAND.gray,
      }}>
        יש כל כך הרבה דברים לקנות...
      </p>
    </AbsoluteFill>
  );
};
```

### Scene 2: Checklist Demo (frames 150-360)

```typescript
const ChecklistScene: React.FC<{frame: number}> = ({frame}) => {
  // Show REAL app checklist UI
  // Use actual category data from nesty-web/src/data/categories.ts

  const categories = [
    { emoji: '🚗', name: 'עגלות וטיולים', items: 8 },
    { emoji: '🛏️', name: 'ריהוט', items: 12 },
    { emoji: '🍼', name: 'האכלה', items: 15 },
    { emoji: '👶', name: 'טיפוח', items: 10 },
  ];

  return (
    <AbsoluteFill>
      {/* Phone mockup - MUST BE LARGE */}
      <PhoneMockup width={900} height={1600}>
        {/* Render actual checklist UI */}
        <ChecklistUI categories={categories} frame={frame} />
      </PhoneMockup>
    </AbsoluteFill>
  );
};
```

### Scene 3: Extension Demo (frames 360-480)

```typescript
const ExtensionScene: React.FC<{frame: number}> = ({frame}) => {
  return (
    <AbsoluteFill style={{background: BRAND.white}}>
      {/* Browser window mockup - FULL WIDTH */}
      <BrowserMockup width={1000}>
        {/* E-commerce product page */}
        <ProductPage />

        {/* Extension popup appearing */}
        <ExtensionPopup
          opacity={interpolate(frame, [0, 30], [0, 1])}
          product={{
            name: 'עגלת תינוק פרמיום',
            price: '₪2,499',
            image: '...'
          }}
        />
      </BrowserMockup>

      <h2 style={{fontSize: '56px'}}>
        ראית משהו? הוסיפי בקליק 🔗
      </h2>
    </AbsoluteFill>
  );
};
```

### Scene 4: Family Sharing (frames 480-570)

```typescript
const FamilyScene: React.FC<{frame: number}> = ({frame}) => {
  return (
    <AbsoluteFill style={{background: BRAND.pink}}>
      {/* Large emojis showing the flow */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '60px',
        fontSize: '150px',
      }}>
        <span>👨‍👩‍👧</span>
        <span style={{fontSize: '80px'}}>→</span>
        <span>🎁</span>
        <span style={{fontSize: '80px'}}>→</span>
        <span>💝</span>
      </div>

      <h2 style={{fontSize: '56px', color: BRAND.dark}}>
        שתפי עם המשפחה
      </h2>
      <p style={{fontSize: '42px', color: BRAND.gray}}>
        הם ידעו בדיוק מה לקנות
      </p>
    </AbsoluteFill>
  );
};
```

### Scene 5: Statistics (frames 570-660)

```typescript
const StatsScene: React.FC<{frame: number}> = ({frame}) => {
  // Animate numbers counting up
  const saved = Math.round(interpolate(frame, [0, 60], [0, 4200]));
  const percent = Math.round(interpolate(frame, [0, 60], [0, 67]));

  return (
    <AbsoluteFill style={{background: BRAND.primaryLight}}>
      <PhoneMockup width={900} height={1600}>
        {/* Real statistics dashboard UI */}
        <StatsDashboard>
          <StatCard
            emoji="💰"
            value={`₪${saved.toLocaleString()}`}
            label="חסכת במתנות"
          />
          <StatCard
            emoji="📊"
            value={`${percent}%`}
            label="מוכנה להריון"
          />
          <ProgressBar value={percent} />
        </StatsDashboard>
      </PhoneMockup>

      <h2 style={{fontSize: '56px'}}>
        תראי כמה חסכת! 🎉
      </h2>
    </AbsoluteFill>
  );
};
```

### Scene 6: Call to Action (frames 660-900)

```typescript
const CTAScene: React.FC<{frame: number}> = ({frame}) => {
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.pink})`,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {/* Logo with WHITE background */}
      <div style={{
        background: BRAND.white,
        borderRadius: '30px',
        padding: '40px 60px',
        marginBottom: '60px',
      }}>
        <Img src={staticFile('nesty-logo.png')} width={400} />
      </div>

      <h1 style={{
        fontSize: '72px',
        color: BRAND.white,
        textShadow: '2px 2px 10px rgba(0,0,0,0.3)',
      }}>
        הקן שלך מחכה 🪺
      </h1>

      <p style={{
        fontSize: '48px',
        color: BRAND.white,
        marginTop: '30px',
      }}>
        הירשמי עכשיו - בחינם!
      </p>

      <div style={{
        background: BRAND.white,
        borderRadius: '20px',
        padding: '20px 60px',
        marginTop: '40px',
      }}>
        <span style={{
          fontSize: '42px',
          color: BRAND.primary,
          fontWeight: 'bold',
        }}>
          nestyil.com
        </span>
      </div>
    </AbsoluteFill>
  );
};
```

---

## Component Requirements

### PhoneMockup Component
```typescript
interface PhoneMockupProps {
  width: number;
  height: number;
  children: React.ReactNode;
}

// Must include:
// - Realistic iPhone frame (rounded corners, notch)
// - Screen area that clips content
// - Subtle shadow
// - Status bar with time/battery
```

### BrowserMockup Component
```typescript
interface BrowserMockupProps {
  width: number;
  children: React.ReactNode;
}

// Must include:
// - Browser chrome (address bar, buttons)
// - URL showing the e-commerce site
// - Extension popup overlay capability
```

### StatCard Component
```typescript
interface StatCardProps {
  emoji: string;
  value: string;
  label: string;
}

// Match the real app's StatsSummaryCards.tsx styling
```

---

## Animation Guidelines

### Entrance Animations
```typescript
// Use spring() for natural movement
const slideIn = spring({
  frame,
  fps: 30,
  config: {
    damping: 12,
    stiffness: 100,
  },
});

// Apply to transforms
transform: `translateY(${interpolate(slideIn, [0, 1], [100, 0])}px)`,
opacity: slideIn,
```

### Timing
- Scene transitions: 10-15 frames overlap with fade
- Text appears: 5-10 frames after scene starts
- UI interactions: 20-30 frames per action

### Effects
- Subtle scale pulses on important elements
- Check marks animate in with bounce
- Numbers count up progressively
- Celebration particles on key moments

---

## File Structure

```
nesty-video/
├── src/
│   ├── Root.tsx              # Remotion composition config
│   ├── NestyTutorial.tsx     # Main video component
│   ├── components/
│   │   ├── PhoneMockup.tsx   # iPhone frame component
│   │   ├── BrowserMockup.tsx # Browser window component
│   │   ├── StatCard.tsx      # Statistics card
│   │   ├── ChecklistUI.tsx   # Checklist scene content
│   │   └── ProgressBar.tsx   # Animated progress bar
│   └── scenes/
│       ├── HookScene.tsx
│       ├── ChecklistScene.tsx
│       ├── ExtensionScene.tsx
│       ├── FamilyScene.tsx
│       ├── StatsScene.tsx
│       └── CTAScene.tsx
├── public/
│   └── nesty-logo.png
└── package.json
```

---

## Quality Checklist

Before considering the video complete, verify:

- [ ] All components fill at least 80% of the screen
- [ ] All text is readable (minimum 28px, headlines 56px+)
- [ ] Logo always has white background
- [ ] Emojis are large (100px+ for decorative, 200px+ for hero)
- [ ] Phone mockups are 900px+ wide in portrait mode
- [ ] Colors match brand guidelines exactly
- [ ] Animations are smooth and purposeful
- [ ] Hebrew text is RTL and properly aligned
- [ ] Each scene has clear visual hierarchy
- [ ] CTA is unmistakable and prominent

---

## Reference: Real App Components

Study these files to match the real app's look:

- `nesty-web/src/data/categories.ts` - Category icons and names
- `nesty-web/src/components/layout/SideNav.tsx` - Navigation styling
- `nesty-web/src/pages/Checklist.tsx` - Checklist UI patterns
- `nesty-web/src/components/statistics/StatsSummaryCards.tsx` - Stats styling
- `nesty-web/src/components/items/ItemCard.tsx` - Item display styling

---

## Final Notes

1. **Test at actual resolution** - Render and view at 1080x1920 to check sizing
2. **Hebrew is RTL** - Ensure proper text alignment throughout
3. **Emotional impact** - The video should make viewers FEEL something
4. **Professional quality** - This represents the brand, make it polished
5. **Use emojis freely** - They add warmth and friendliness to the message
