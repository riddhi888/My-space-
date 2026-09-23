import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.resolve('assets');
const publicDir = path.resolve('public');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Background SVG (1024x1024)
// Rich dark cosmic theme (#090714) with glowing radial nebula gradients matching the MySpace aesthetic
const backgroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgBase" cx="50%" cy="46%" r="75%">
      <stop offset="0%" stop-color="#191136"/>
      <stop offset="42%" stop-color="#0e0a22"/>
      <stop offset="100%" stop-color="#070512"/>
    </radialGradient>
    <radialGradient id="centerNebula" cx="50%" cy="45%" r="52%">
      <stop offset="0%" stop-color="#9333ea" stop-opacity="0.32"/>
      <stop offset="36%" stop-color="#3b82f6" stop-opacity="0.20"/>
      <stop offset="70%" stop-color="#06b6d4" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#070512" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="bottomNeon" cx="50%" cy="92%" r="45%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.18"/>
      <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#070512" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="edgeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.15"/>
      <stop offset="50%" stop-color="#818cf8" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.15"/>
    </linearGradient>
  </defs>

  <!-- Deep cosmic background -->
  <rect width="1024" height="1024" fill="url(#bgBase)"/>
  <rect width="1024" height="1024" fill="url(#centerNebula)"/>
  <rect width="1024" height="1024" fill="url(#bottomNeon)"/>

  <!-- Subtle ambient outer rim halo -->
  <rect x="8" y="8" width="1008" height="1008" rx="220" fill="none" stroke="url(#edgeGlow)" stroke-width="6"/>
</svg>
`;

// 2. Foreground SVG (1024x1024) - Transparent background with custom MySpace emblem
// Features: Two humanoid figures forming the "M", angled neon orbital ring, 4-pointed sparkle star, and "Myspace" wordmark
const foregroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Left figure cyan gradient -->
    <linearGradient id="leftCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="45%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>

    <!-- Right figure magenta/purple gradient -->
    <linearGradient id="rightMagentaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f472b6"/>
      <stop offset="40%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </linearGradient>

    <!-- Orbital ring gradient -->
    <linearGradient id="orbitRingGrad" x1="0%" y1="70%" x2="100%" y2="30%">
      <stop offset="0%" stop-color="#00f0ff"/>
      <stop offset="30%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#ff3388"/>
    </linearGradient>

    <!-- Glowing filters -->
    <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur1"/>
        <feMergeNode in="blur2"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="starGlow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <filter id="emblemShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="#a855f7" flood-opacity="0.35"/>
    </filter>

    <!-- Clipping for 3D orbital wrap effect -->
    <clipPath id="backRingClip">
      <rect x="0" y="0" width="1024" height="435"/>
    </clipPath>
    <clipPath id="frontRingClip">
      <rect x="0" y="435" width="1024" height="589"/>
    </clipPath>
  </defs>

  <g transform="translate(0, -10)">
    <!-- 1. BACK SECTION OF ORBITAL RING (passes behind heads) -->
    <g clip-path="url(#backRingClip)">
      <ellipse cx="512" cy="460" rx="325" ry="105"
               fill="none" stroke="url(#orbitRingGrad)" stroke-width="26"
               transform="rotate(-18 512 460)"
               filter="url(#ringGlow)" stroke-linecap="round" opacity="0.85"/>
    </g>

    <!-- 2. TWO FIGURES FORMING THE ICONIC 'M' -->
    <g filter="url(#emblemShadow)">
      <!-- Left Cyan Figure Head -->
      <circle cx="395" cy="295" r="62" fill="url(#leftCyanGrad)"/>
      <circle cx="395" cy="295" r="62" fill="#ffffff" opacity="0.15"/>
      <circle cx="395" cy="295" r="63" fill="none" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.5"/>

      <!-- Right Purple/Magenta Figure Head -->
      <circle cx="629" cy="295" r="62" fill="url(#rightMagentaGrad)"/>
      <circle cx="629" cy="295" r="62" fill="#ffffff" opacity="0.15"/>
      <circle cx="629" cy="295" r="63" fill="none" stroke="#f472b6" stroke-width="2" stroke-opacity="0.5"/>

      <!-- Left Figure Torso / M left wing -->
      <path d="
        M 310 590
        C 305 445, 342 368, 395 368
        C 438 368, 468 422, 512 485
        C 512 515, 502 538, 472 490
        C 442 435, 412 435, 384 435
        C 358 490, 338 595, 338 595
        C 324 605, 310 600, 310 590 Z
      " fill="url(#leftCyanGrad)"/>

      <!-- Right Figure Torso / M right wing -->
      <path d="
        M 512 485
        C 556 422, 586 368, 629 368
        C 682 368, 719 445, 714 590
        C 714 600, 700 605, 686 595
        C 666 490, 640 435, 612 435
        C 582 435, 552 490, 512 540
        Z
      " fill="url(#rightMagentaGrad)"/>

      <!-- Center seamless joint bridge -->
      <path d="
        M 488 470
        C 502 458, 522 458, 536 470
        C 542 505, 520 535, 512 540
        C 504 535, 482 505, 488 470 Z
      " fill="#9d4edd" opacity="0.85"/>
    </g>

    <!-- 3. FRONT SECTION OF ORBITAL RING (sweeps in front of figures) -->
    <g clip-path="url(#frontRingClip)">
      <!-- Glowing base band -->
      <ellipse cx="512" cy="460" rx="325" ry="105"
               fill="none" stroke="url(#orbitRingGrad)" stroke-width="26"
               transform="rotate(-18 512 460)"
               filter="url(#ringGlow)" stroke-linecap="round"/>
      <!-- Brilliant white core highlight line -->
      <ellipse cx="512" cy="460" rx="325" ry="105"
               fill="none" stroke="#ffffff" stroke-width="8" stroke-opacity="0.9"
               transform="rotate(-18 512 460)" stroke-linecap="round"/>
    </g>

    <!-- 4. 4-POINTED SPARKLE STAR (Upper Right) -->
    <g transform="translate(768, 255)" filter="url(#starGlow)">
      <!-- Diamond Star Glow Halo -->
      <path d="M 0 -42 Q 0 0 42 0 Q 0 0 0 42 Q 0 0 -42 0 Q 0 0 0 -42 Z" fill="#c084fc" opacity="0.85"/>
      <!-- Inner Brilliant Core -->
      <path d="M 0 -26 Q 0 0 26 0 Q 0 0 0 26 Q 0 0 -26 0 Q 0 0 0 -26 Z" fill="#ffffff"/>
      <!-- Center Star Sparkle -->
      <circle cx="0" cy="0" r="6" fill="#ffffff"/>
    </g>

    <!-- 5. "Myspace" WORDMARK -->
    <g>
      <!-- Shadow layer for high-contrast visibility -->
      <text x="512" y="736"
            text-anchor="middle"
            font-family="'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif"
            font-size="78"
            font-weight="800"
            letter-spacing="-1.2"
            fill="#000000"
            opacity="0.75">
        Myspace
      </text>
      <!-- Crisp White Brand Title matching the reference logo -->
      <text x="512" y="732"
            text-anchor="middle"
            font-family="'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif"
            font-size="78"
            font-weight="800"
            letter-spacing="-1.2"
            fill="#ffffff">
        Myspace
      </text>
    </g>
  </g>
</svg>
`;

// 3. Full Combined Master Icon SVG (1024x1024)
const fullIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${backgroundSvg.replace('<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
  ${foregroundSvg.replace('<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
</svg>
`;

async function main() {
  console.log('Generating 1024x1024 PNG source assets for Capacitor Android...');
  
  // 1. icon-background.png (1024x1024)
  await sharp(Buffer.from(backgroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-background.png'));
  console.log('Created assets/icon-background.png (1024x1024)');

  // 2. icon-foreground.png (1024x1024) - with transparent background
  await sharp(Buffer.from(foregroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-foreground.png'));
  console.log('Created assets/icon-foreground.png (1024x1024)');

  // 3. icon-only.png (1024x1024) - full composite icon for legacy non-adaptive icon generation
  await sharp(Buffer.from(fullIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-only.png'));
  console.log('Created assets/icon-only.png (1024x1024)');

  // 4. icon.png (1024x1024) - master icon
  await sharp(Buffer.from(fullIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('Created assets/icon.png (1024x1024)');

  // 5. logo.png (1024x1024) - master logo
  await sharp(Buffer.from(fullIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'logo.png'));
  console.log('Created assets/logo.png (1024x1024)');

  // Also sync to public directory for web favicon & PWA
  fs.copyFileSync(path.join(assetsDir, 'icon.png'), path.join(publicDir, 'icon.png'));
  fs.copyFileSync(path.join(assetsDir, 'logo.png'), path.join(publicDir, 'logo.png'));

  // Generate responsive PWA icons
  await sharp(path.join(assetsDir, 'icon.png'))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  fs.copyFileSync(path.join(publicDir, 'icon-192.png'), path.join(publicDir, 'pwa-192x192.png'));

  await sharp(path.join(assetsDir, 'icon.png'))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  fs.copyFileSync(path.join(publicDir, 'icon-512.png'), path.join(publicDir, 'pwa-512x512.png'));

  await sharp(path.join(assetsDir, 'icon.png'))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  const innerSize = Math.round(512 * 0.76);
  const resizedInner = await sharp(path.join(assetsDir, 'icon.png'))
    .resize(innerSize, innerSize, { fit: 'contain' })
    .toBuffer();
  const maskableBg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" fill="#090714"/></svg>`;
  await sharp(Buffer.from(maskableBg))
    .composite([{ input: resizedInner, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  console.log('Synchronized public/ icons and generated PWA responsive icons');

  // 6. splash.png (2732x2732)
  const splashSvg = `
<svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="splashBg" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#1e1442"/>
      <stop offset="50%" stop-color="#0d0a1d"/>
      <stop offset="100%" stop-color="#05040a"/>
    </radialGradient>
    <radialGradient id="splashGlow" cx="50%" cy="45%" r="42%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.32"/>
      <stop offset="60%" stop-color="#8b5cf6" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="2732" height="2732" fill="url(#splashBg)"/>
  <rect width="2732" height="2732" fill="url(#splashGlow)"/>
  <g transform="translate(854, 854)">
    ${foregroundSvg.replace('<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
  </g>
</svg>
  `;

  await sharp(Buffer.from(splashSvg))
    .resize(2732, 2732)
    .png()
    .toFile(path.join(assetsDir, 'splash.png'));
  console.log('Created assets/splash.png (2732x2732)');

  console.log('All source assets generated successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
