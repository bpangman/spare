/**
 * CoinLogo — logo image + optional "Cacheable" wordmark.
 *
 * Props:
 *   size      — pixel width of the logo image (default 180)
 *   animate   — unused (kept for API compatibility)
 *   showName  — whether to render the "Cacheable" cursive wordmark below (default true)
 *   className — extra CSS classes
 */
import logo from '../assets/logo.png';

export default function CoinLogo({ size = 180, animate = true, showName = true, className = '' }) {
  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      style={{ gap: showName ? 8 : 0 }}
    >
      <img
        src={logo}
        alt="Cacheable logo"
        width={size}
        height={size}
        style={{ objectFit: 'contain' }}
        draggable={false}
      />

      {showName && (
        <svg
          width={Math.round((150 / 180) * size)}
          height={Math.round((54 / 180) * size)}
          viewBox="0 0 150 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Shadow layer — offset duplicate for depth */}
          <text
            x="77"
            y="42"
            textAnchor="middle"
            fontSize="42"
            fontWeight="bold"
            fontFamily="'Pacifico', 'Comic Neue', 'Brush Script MT', 'Dancing Script', cursive"
            fill="#c8710a"
            letterSpacing="0.5"
          >
            Cacheable
          </text>
          {/* Main bubbly text */}
          <text
            x="75"
            y="40"
            textAnchor="middle"
            fontSize="42"
            fontWeight="bold"
            fontFamily="'Pacifico', 'Comic Neue', 'Brush Script MT', 'Dancing Script', cursive"
            fill="#FF9F43"
            stroke="#2D3436"
            strokeWidth="3"
            strokeLinejoin="round"
            paintOrder="stroke"
            letterSpacing="0.5"
          >
            Cacheable
          </text>
        </svg>
      )}
    </div>
  );
}
