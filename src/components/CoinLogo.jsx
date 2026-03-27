/**
 * CoinLogo — logo image + optional "Cache" wordmark.
 *
 * Props:
 *   size      — pixel width of the logo image (default 180)
 *   animate   — unused (kept for API compatibility)
 *   showName  — whether to render the "Cache" cursive wordmark below (default true)
 *   className — extra CSS classes
 */
import logo from '../assets/logo.png';

export default function CoinLogo({ size = 180, animate = true, showName = true, className = '' }) {
  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      style={{ gap: showName ? Math.round(size * 0.08) : 0 }}
    >
      <img
        src={logo}
        alt="Cache logo"
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        draggable={false}
      />
      {showName && (
        <svg
          width={Math.round(size * 0.7)}
          height={Math.round(size * 0.28)}
          viewBox="0 0 140 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          {/* "Cache" in Pacifico cursive */}
          <text
            x="70"
            y="38"
            textAnchor="middle"
            fontSize="40"
            fontWeight="bold"
            fontFamily="'Pacifico', cursive"
            fill="white"
            letterSpacing="1"
          >
            Cache
          </text>
          {/* Diagonal cents-symbol line through the C */}
          <line
            x1="18" y1="40"
            x2="32" y2="4"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
