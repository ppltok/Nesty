interface WaveDividerProps {
    color?: string
    bgColor?: string
    flip?: boolean
    className?: string
}

export default function WaveDivider({
    color = '#ffffff',
    bgColor = 'transparent',
    flip = false,
    className = '',
}: WaveDividerProps) {
    return (
        <div
            className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''} ${className}`}
            style={{ backgroundColor: bgColor }}
        >
            <svg
                viewBox="0 0 1440 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto block"
                preserveAspectRatio="none"
            >
                <path
                    d="M0 60L48 55C96 50 192 40 288 42C384 44 480 58 576 65C672 72 768 72 864 65C960 58 1056 44 1152 40C1248 36 1344 42 1392 45L1440 48V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z"
                    fill={color}
                    className="animate-wave-morph"
                />
                <path
                    d="M0 80L48 76C96 72 192 64 288 62C384 60 480 64 576 70C672 76 768 84 864 82C960 80 1056 68 1152 62C1248 56 1344 56 1392 56L1440 56V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V80Z"
                    fill={color}
                    opacity="0.5"
                    className="animate-wave-morph-2"
                />
            </svg>
        </div>
    )
}
