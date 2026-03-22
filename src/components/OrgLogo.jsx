import { useState } from 'react';

// BGCA knuckle/fist SVG logo (navy blue, matches their brand)
function BgcaLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="100" height="100" rx="20" fill="#003865" />
      {/* Stylized fist/knuckle shape representing BGCA */}
      {/* Four finger knuckles */}
      <rect x="18" y="38" width="14" height="16" rx="7" fill="white" />
      <rect x="35" y="33" width="14" height="21" rx="7" fill="white" />
      <rect x="52" y="33" width="14" height="21" rx="7" fill="white" />
      <rect x="69" y="38" width="14" height="16" rx="7" fill="white" />
      {/* Palm */}
      <rect x="18" y="50" width="65" height="20" rx="6" fill="white" />
      {/* Thumb */}
      <rect x="8" y="45" width="14" height="12" rx="6" fill="white" transform="rotate(-20 8 45)" />
      {/* Red accent bar */}
      <rect x="18" y="72" width="65" height="6" rx="3" fill="#E8192C" />
    </svg>
  );
}

// Shows the real logo, falls back through multiple sources, then SVG, then emoji.
export default function OrgLogo({ nonprofit, size = 14, className = '', rounded = '2xl' }) {
  const px = size * 4;
  const [urlIndex, setUrlIndex] = useState(0);

  // Build fallback chain
  const urls = [
    nonprofit.logoUrl,
    nonprofit.logoFallbackUrl,
  ].filter(Boolean);

  // Inline SVG override (for logos we know won't load from CDN)
  if (nonprofit.logoSvg === 'bgca') {
    return (
      <div
        className={`flex items-center justify-center overflow-hidden rounded-${rounded} ${className}`}
        style={{ width: px, height: px, minWidth: px }}
      >
        <BgcaLogo size={px} />
      </div>
    );
  }

  if (urls.length > 0 && urlIndex < urls.length) {
    return (
      <div
        className={`flex items-center justify-center bg-white overflow-hidden rounded-${rounded} ${className}`}
        style={{ width: px, height: px, minWidth: px, padding: '10%' }}
      >
        <img
          src={urls[urlIndex]}
          alt={nonprofit.name}
          className="w-full h-full object-contain"
          onError={() => setUrlIndex(i => i + 1)}
        />
      </div>
    );
  }

  // Final emoji fallback
  return (
    <div
      className={`flex items-center justify-center rounded-${rounded} ${className}`}
      style={{ width: px, height: px, minWidth: px, background: nonprofit.brand?.accentLight ?? '#f3f4f6' }}
    >
      <span style={{ fontSize: px * 0.45 }}>{nonprofit.logo}</span>
    </div>
  );
}
