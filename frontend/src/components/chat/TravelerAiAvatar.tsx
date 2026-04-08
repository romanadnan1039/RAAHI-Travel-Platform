import { useId } from 'react'

const sizeMap = { sm: 36, md: 44, lg: 56 }

type Props = {
  size?: keyof typeof sizeMap
  className?: string
  showBadge?: boolean
  /** Label next to the avatar, e.g. "AI Assistant" */
  title?: string
  /** Second line under title */
  subtitle?: string
  /** `pill` = white text on green launcher; `panel` = cream/gray on dark chat header */
  variant?: 'pill' | 'panel'
}

/**
 * Cartoon traveler — backpack, hat, map. Animations are CSS (`index.css`) so production
 * bundles match localhost (Framer `motion.*` inside SVG can be inconsistent when minified).
 */
export default function TravelerAiAvatar({
  size = 'md',
  className = '',
  showBadge = false,
  title,
  subtitle,
  variant = 'pill',
}: Props) {
  const px = sizeMap[size]
  const uid = useId().replace(/:/g, '')
  const hatId = `th-${uid}`
  const skinId = `ts-${uid}`
  const packId = `tp-${uid}`

  const avatarFigure = (
    <>
      <div className="traveler-avatar-float relative" style={{ width: px, height: px }}>
        <svg
          viewBox="0 0 64 64"
          className="h-full w-full overflow-visible drop-shadow-md"
          aria-hidden
        >
          <defs>
            <linearGradient id={hatId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A67C52" />
              <stop offset="100%" stopColor="#6B4E3D" />
            </linearGradient>
            <linearGradient id={skinId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFDCC4" />
              <stop offset="100%" stopColor="#E8B896" />
            </linearGradient>
            <linearGradient id={packId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#5C4033" />
              <stop offset="100%" stopColor="#3D2918" />
            </linearGradient>
          </defs>

          <ellipse cx="20" cy="46" rx="12" ry="9" fill={`url(#${packId})`} opacity={0.95} />
          <ellipse cx="44" cy="46" rx="12" ry="9" fill={`url(#${packId})`} opacity={0.95} />
          <rect x="18" y="40" width="8" height="6" rx="1" fill="#FFFAC3" opacity={0.35} />

          <path d="M 22 38 L 42 38 L 45 54 L 19 54 Z" fill="#566614" />
          <path d="M 28 40 L 36 40 L 35 48 L 29 48 Z" fill="#FFFAC3" opacity={0.25} />

          <circle cx="32" cy="26" r="14" fill={`url(#${skinId})`} />

          <path d="M 16 20 Q 32 6 48 20 L 46 22 Q 32 12 18 22 Z" fill={`url(#${hatId})`} />
          <ellipse cx="32" cy="20" rx="15" ry="4.5" fill="#8B6914" opacity={0.85} />

          <circle className="traveler-eye" cx="26" cy="26" r="2.2" fill="#1f2937" />
          <circle className="traveler-eye" cx="38" cy="26" r="2.2" fill="#1f2937" />

          <path
            d="M 26 31 Q 32 36 38 31"
            fill="none"
            stroke="#8B4513"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          <g className="traveler-map-sway">
            <rect x="43" y="32" width="14" height="11" rx="1.5" fill="#FFFAC3" stroke="#566614" strokeWidth="0.9" />
            <path d="M 46 35 H 54 M 46 38 H 52" stroke="#566614" strokeWidth="0.6" strokeLinecap="round" />
            <circle cx="50" cy="36" r="1" fill="#566614" opacity={0.5} />
          </g>

          <g className="traveler-star-pulse">
            <path
              d="M 52 14 L 53.5 17.5 L 57 18 L 53.5 18.5 L 52 22 L 50.5 18.5 L 47 18 L 50.5 17.5 Z"
              fill="#FFFAC3"
              opacity={0.95}
            />
          </g>
        </svg>
      </div>
      {showBadge && !title ? (
        <span className="mt-0.5 rounded-full bg-[#566614]/90 px-1.5 py-px text-[7px] font-extrabold uppercase tracking-wide text-[#FFFAC3]">
          AI
        </span>
      ) : null}
    </>
  )

  if (title) {
    return (
      <div className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
        <div className="flex shrink-0 flex-col items-center" style={{ width: px, minWidth: px }}>
          {avatarFigure}
        </div>
        <div className="min-w-0 text-left">
          <p
            className={`truncate text-[11px] font-bold uppercase leading-tight tracking-wide drop-shadow-sm sm:text-xs ${
              variant === 'panel' ? 'text-[#FFFAC3]' : 'text-white'
            }`}
            style={{ fontFamily: 'LEMON MILK, sans-serif' }}
          >
            {title}
          </p>
          {subtitle ? (
            <p
              className={`mt-0.5 text-[10px] leading-snug ${
                variant === 'panel' ? 'text-gray-400' : 'text-white/75'
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative inline-flex flex-col items-center ${className}`}
      style={{ width: px, minWidth: px }}
    >
      {avatarFigure}
    </div>
  )
}
