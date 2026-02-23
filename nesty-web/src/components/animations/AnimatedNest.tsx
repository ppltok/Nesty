export default function AnimatedNest() {
  return (
    <div className="animated-nest-container relative w-64 h-64 md:w-80 md:h-80 mx-auto">
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow effect */}
        <defs>
          <radialGradient id="nestGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eaddff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eaddff" stopOpacity="0" />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#6750a4" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Background glow circle */}
        <circle cx="200" cy="200" r="160" fill="url(#nestGlow)" className="animate-breathe" />

        {/* Nest body - woven twigs */}
        <g className="animate-nest-float" filter="url(#softShadow)">
          {/* Nest bowl shape */}
          <path
            d="M100 240 Q120 310 200 320 Q280 310 300 240"
            fill="none"
            stroke="#8B6914"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M90 250 Q115 325 200 330 Q285 325 310 250"
            fill="none"
            stroke="#A0822A"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M110 235 Q130 300 200 310 Q270 300 290 235"
            fill="none"
            stroke="#6d4e14"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Nest interior - filled */}
          <path
            d="M105 242 Q125 305 200 315 Q275 305 295 242 Q280 260 200 265 Q120 260 105 242Z"
            fill="#d4a84b"
            opacity="0.3"
          />
          {/* Woven texture lines */}
          <path d="M120 260 Q160 290 200 285 Q240 290 280 260" fill="none" stroke="#8B6914" strokeWidth="3" opacity="0.4" />
          <path d="M130 275 Q165 300 200 295 Q235 300 270 275" fill="none" stroke="#A0822A" strokeWidth="3" opacity="0.35" />
          <path d="M115 248 Q155 275 200 270 Q245 275 285 248" fill="none" stroke="#6d4e14" strokeWidth="3" opacity="0.3" />
        </g>

        {/* Eggs */}
        <g className="animate-nest-float">
          {/* Egg 1 - lavender */}
          <ellipse cx="170" cy="260" rx="22" ry="28" fill="#eaddff" stroke="#d0bcff" strokeWidth="1.5" className="animate-egg-wobble-1" />
          <ellipse cx="170" cy="255" rx="10" ry="14" fill="white" opacity="0.3" />

          {/* Egg 2 - pink */}
          <ellipse cx="215" cy="258" rx="20" ry="26" fill="#ffd8e4" stroke="#f4acb7" strokeWidth="1.5" className="animate-egg-wobble-2" />
          <ellipse cx="215" cy="253" rx="9" ry="12" fill="white" opacity="0.3" />

          {/* Egg 3 - light purple, tilted */}
          <ellipse cx="190" cy="270" rx="18" ry="24" fill="#f3edff" stroke="#eaddff" strokeWidth="1.5" transform="rotate(-10 190 270)" className="animate-egg-wobble-3" />
          <ellipse cx="190" cy="265" rx="8" ry="11" fill="white" opacity="0.25" transform="rotate(-10 190 265)" />
        </g>

        {/* Bird - mama */}
        <g className="animate-bird-bob" style={{ transformOrigin: '200px 180px' }}>
          {/* Body */}
          <ellipse cx="200" cy="200" rx="40" ry="30" fill="#6750a4" />
          {/* Head */}
          <circle cx="235" cy="180" r="20" fill="#6750a4" />
          {/* Eye */}
          <circle cx="242" cy="177" r="4" fill="white" />
          <circle cx="243" cy="176" r="2" fill="#1d192b" />
          {/* Beak */}
          <polygon points="255,180 270,176 255,185" fill="#f4acb7" />
          {/* Wing */}
          <path
            d="M180 195 Q160 170 175 150 Q190 170 195 195Z"
            fill="#7c66b8"
            className="animate-wing-flap"
            style={{ transformOrigin: '190px 195px' }}
          />
          {/* Chest highlight */}
          <ellipse cx="210" cy="205" rx="18" ry="15" fill="#eaddff" opacity="0.3" />
          {/* Tail */}
          <path d="M160 200 Q140 190 130 200 Q145 195 160 205Z" fill="#5a4690" />
        </g>

        {/* Baby bird - peeking from egg */}
        <g className="animate-baby-peek">
          <circle cx="172" cy="240" r="10" fill="#8B6914" opacity="0.0" />
          {/* Baby head */}
          <circle cx="172" cy="238" r="9" fill="#eaddff" />
          {/* Baby eye */}
          <circle cx="176" cy="236" r="2.5" fill="#1d192b" />
          {/* Baby beak */}
          <polygon points="180,237 188,234 180,240" fill="#ffd8e4" />
        </g>

        {/* Floating hearts */}
        <g>
          <path
            d="M310 160 Q310 150 320 150 Q330 150 330 160 Q330 170 310 185 Q290 170 290 160 Q290 150 300 150 Q310 150 310 160Z"
            fill="#ffd8e4"
            className="animate-heart-float-1"
            opacity="0.7"
          />
          <path
            d="M85 180 Q85 173 92 173 Q99 173 99 180 Q99 187 85 197 Q71 187 71 180 Q71 173 78 173 Q85 173 85 180Z"
            fill="#f4acb7"
            className="animate-heart-float-2"
            opacity="0.5"
          />
        </g>

        {/* Sparkles */}
        <g className="animate-sparkle-1">
          <circle cx="320" cy="120" r="3" fill="#6750a4" />
          <line x1="320" y1="113" x2="320" y2="127" stroke="#6750a4" strokeWidth="1.5" />
          <line x1="313" y1="120" x2="327" y2="120" stroke="#6750a4" strokeWidth="1.5" />
        </g>
        <g className="animate-sparkle-2">
          <circle cx="90" cy="140" r="2.5" fill="#ffd8e4" />
          <line x1="90" y1="134" x2="90" y2="146" stroke="#ffd8e4" strokeWidth="1.5" />
          <line x1="84" y1="140" x2="96" y2="140" stroke="#ffd8e4" strokeWidth="1.5" />
        </g>
        <g className="animate-sparkle-3">
          <circle cx="280" cy="340" r="2" fill="#eaddff" />
          <line x1="280" y1="335" x2="280" y2="345" stroke="#eaddff" strokeWidth="1" />
          <line x1="275" y1="340" x2="285" y2="340" stroke="#eaddff" strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}
