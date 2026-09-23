import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const assetsDir = path.resolve('assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Background SVG (1024x1024)
// Rich dark theme matching the app's aesthetic (#090714) with subtle glowing radial gradients
const backgroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="40%" r="75%">
      <stop offset="0%" stop-color="#1c133a"/>
      <stop offset="45%" stop-color="#0f0c24"/>
      <stop offset="100%" stop-color="#070510"/>
    </radialGradient>
    <radialGradient id="neonGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gridGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.12"/>
    </linearGradient>
  </defs>

  <!-- Deep cosmic background -->
  <rect width="1024" height="1024" fill="url(#bgGrad)"/>
  <rect width="1024" height="1024" fill="url(#neonGlow)"/>

  <!-- Subtle ambient rings for 2008 retro-futuristic depth -->
  <circle cx="512" cy="450" r="320" fill="none" stroke="url(#gridGlow)" stroke-width="2" stroke-dasharray="8 12"/>
  <circle cx="512" cy="450" r="380" fill="none" stroke="url(#gridGlow)" stroke-width="1.5" stroke-opacity="0.5"/>
</svg>
`;

// 2. Foreground SVG (1024x1024) - Adaptive Icon Safe Zone is within central 66% (diameter ~676px)
// MySpace 2008 classic 3-person silhouette emblem + "myspace" text
const foregroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Vibrant MySpace 2008 neon gradient -->
    <linearGradient id="bodyGradCenter" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff3b88"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#00d2ff"/>
    </linearGradient>
    
    <linearGradient id="bodyGradSide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#7c3aed" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.85"/>
    </linearGradient>

    <!-- Gloss highlight filter -->
    <linearGradient id="glossGrad" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      <feDropShadow dx="0" dy="0" stdDeviation="20" flood-color="#a855f7" flood-opacity="0.4"/>
    </filter>
    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>

  <g filter="url(#softShadow)">
    <!-- LEFT COMPANION (Silhouette 1) -->
    <g opacity="0.92">
      <!-- Head -->
      <circle cx="340" cy="345" r="62" fill="url(#bodyGradSide)"/>
      <circle cx="340" cy="345" r="62" fill="url(#glossGrad)"/>
      <!-- Shoulders / Torso -->
      <path d="M 235 480 C 235 410, 275 390, 340 390 C 405 390, 445 410, 445 480 L 445 525 C 445 535, 437 540, 425 540 L 255 540 C 243 540, 235 535, 235 525 Z"
            fill="url(#bodyGradSide)"/>
      <path d="M 235 480 C 235 410, 275 390, 340 390 C 405 390, 445 410, 445 480 L 445 525 C 445 535, 437 540, 425 540 L 255 540 C 243 540, 235 535, 235 525 Z"
            fill="url(#glossGrad)"/>
    </g>

    <!-- RIGHT COMPANION (Silhouette 3) -->
    <g opacity="0.92">
      <!-- Head -->
      <circle cx="684" cy="345" r="62" fill="url(#bodyGradSide)"/>
      <circle cx="684" cy="345" r="62" fill="url(#glossGrad)"/>
      <!-- Shoulders / Torso -->
      <path d="M 579 480 C 579 410, 619 390, 684 390 C 749 390, 789 410, 789 480 L 789 525 C 789 535, 781 540, 769 540 L 599 540 C 587 540, 579 535, 579 525 Z"
            fill="url(#bodyGradSide)"/>
      <path d="M 579 480 C 579 410, 619 390, 684 390 C 749 390, 789 410, 789 480 L 789 525 C 789 535, 781 540, 769 540 L 599 540 C 587 540, 579 535, 579 525 Z"
            fill="url(#glossGrad)"/>
    </g>

    <!-- CENTER HERO (Silhouette 2) -->
    <g>
      <!-- Head -->
      <circle cx="512" cy="295" r="82" fill="url(#bodyGradCenter)"/>
      <circle cx="512" cy="295" r="82" fill="url(#glossGrad)"/>
      <!-- Subtle head outline/ring for crisp separation -->
      <circle cx="512" cy="295" r="83" fill="none" stroke="#ffffff" stroke-width="3" stroke-opacity="0.6"/>
      
      <!-- Torso with iconic smooth shoulders -->
      <path d="M 375 470 C 375 375, 430 350, 512 350 C 594 350, 649 375, 649 470 L 649 535 C 649 548, 638 555, 624 555 L 400 555 C 386 555, 375 548, 375 535 Z"
            fill="url(#bodyGradCenter)"/>
      <path d="M 375 470 C 375 375, 430 350, 512 350 C 594 350, 649 375, 649 470 L 649 535 C 649 548, 638 555, 624 555 L 400 555 C 386 555, 375 548, 375 535 Z"
            fill="url(#glossGrad)"/>
      <!-- Separation outline -->
      <path d="M 375 470 C 375 375, 430 350, 512 350 C 594 350, 649 375, 649 470"
            fill="none" stroke="#ffffff" stroke-width="3" stroke-opacity="0.6"/>
    </g>
  </g>

  <!-- Sparkle star accents (matching MySpace 2008 & App branding) -->
  <g fill="#ffffff">
    <!-- Star 1 top right -->
    <path d="M 740 240 Q 740 260 760 260 Q 740 260 740 280 Q 740 260 720 260 Q 740 260 740 240 Z" fill="#38bdf8" opacity="0.9"/>
    <!-- Star 2 top left -->
    <path d="M 280 265 Q 280 278 293 278 Q 280 278 280 291 Q 280 278 267 278 Q 280 278 280 265 Z" fill="#f472b6" opacity="0.9"/>
  </g>

  <!-- "myspace" wordmark badge -->
  <g filter="url(#textGlow)">
    <!-- Pill background for typography -->
    <rect x="292" y="605" width="440" height="74" rx="37" fill="#0b0819" stroke="url(#bodyGradCenter)" stroke-width="3"/>
    
    <text x="512" y="654" text-anchor="middle" font-family="'Outfit', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" letter-spacing="-1">
      <tspan fill="#f43f5e">my</tspan><tspan fill="#ffffff">space</tspan><tspan fill="#38bdf8" font-size="28" font-weight="600" dx="4">®</tspan>
    </text>
  </g>
</svg>
`;

// 3. Combined Full Icon SVG (1024x1024)
// Background + Emblem for legacy icon generation & app store previews
const fullIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${backgroundSvg.replace('<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
  ${foregroundSvg.replace('<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">', '').replace('</svg>', '')}
</svg>
`;

async function main() {
  console.log('Generating 1024x1024 PNG source assets...');
  
  // icon-background.png (1024x1024)
  await sharp(Buffer.from(backgroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-background.png'));
  console.log('Created assets/icon-background.png (1024x1024)');

  // icon-foreground.png (1024x1024)
  await sharp(Buffer.from(foregroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-foreground.png'));
  console.log('Created assets/icon-foreground.png (1024x1024)');

  // icon-only.png (1024x1024)
  await sharp(Buffer.from(foregroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-only.png'));
  console.log('Created assets/icon-only.png (1024x1024)');

  // icon.png (1024x1024)
  await sharp(Buffer.from(fullIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon.png'));
  console.log('Created assets/icon.png (1024x1024)');

  // logo.png (1024x1024)
  await sharp(Buffer.from(fullIconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'logo.png'));
  console.log('Created assets/logo.png (1024x1024)');

  // Also create splash.png (2732x2732)
  const splashSvg = `
<svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="splashBg" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="#1e1442"/>
      <stop offset="50%" stop-color="#0d0a1d"/>
      <stop offset="100%" stop-color="#05040a"/>
    </radialGradient>
    <radialGradient id="splashGlow" cx="50%" cy="45%" r="40%">
      <stop offset="0%" stop-color="#ec4899" stop-opacity="0.35"/>
      <stop offset="60%" stop-color="#8b5cf6" stop-opacity="0.15"/>
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
