export interface PosterDesignConfig {
  aspectRatio: '1:1' | '9:16' | '4:5' | '16:9';
  theme: string; // 'sunset_blaze' | 'cyber_neon' | 'midnight_luxury' | 'emerald_glow' | 'rose_gold' | 'royal_amethyst' | 'crimson_flame' | 'slate_minimal'
  accentColor: string;
  bgColor1: string;
  bgColor2: string;
  bgOverlayDarkness: number; // 0 to 0.8
  headline: string;
  headlineFont: 'display' | 'sans' | 'serif' | 'mono';
  headlineSize: number;
  headlineColor: string;
  subhead: string;
  subheadColor: string;
  badgeText: string;
  badgeStyle: 'starburst' | 'pill' | 'ribbon' | 'neon' | 'stamp';
  badgeBgColor: string;
  badgeTextColor: string;
  productImage: string;
  productScale: number; // 0.7 to 1.4
  productOffsetY: number; // -100 to 100
  productShadow: boolean;
  showPrice: boolean;
  salePrice: string;
  originalPrice: string;
  currency: string;
  ctaText: string;
  ctaStyle: 'pill' | 'rect' | 'gradient' | 'outline';
  ctaColor: string;
  ctaTextColor: string;
  storeName: string;
  website: string;
  showRating: boolean;
  ratingValue: string;
  showGuarantee: boolean;
  showUrgencyBadge: boolean;
  urgencyText: string;
}

export const ASPECT_RATIO_DIMENSIONS = {
  '1:1': { width: 1080, height: 1080, label: 'Square (1:1)', desc: 'Instagram & Facebook Feed' },
  '9:16': { width: 1080, height: 1920, label: 'Story (9:16)', desc: 'Instagram Story, TikTok, Reels' },
  '4:5': { width: 1080, height: 1350, label: 'Portrait (4:5)', desc: 'Instagram Optimized Feed' },
  '16:9': { width: 1200, height: 675, label: 'Landscape (16:9)', desc: 'Twitter/X & Facebook Cover' },
};

/**
 * Loads an image safely with crossOrigin support
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback placeholder image if external image fails cross-origin or network
      const fallback = new Image();
      fallback.onload = () => resolve(fallback);
      fallback.onerror = (e) => reject(e);
      fallback.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
          <rect width="400" height="400" fill="#1e293b"/>
          <circle cx="200" cy="180" r="80" fill="#334155"/>
          <text x="200" y="310" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle">Product Showcase</text>
        </svg>
      `);
    };
    img.src = src;
  });
}

/**
 * Draws starburst polygon
 */
function drawStarburst(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

/**
 * Draws rounded rectangle
 */
function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Main function to render design onto canvas
 */
export async function renderPosterToCanvas(
  canvas: HTMLCanvasElement,
  config: PosterDesignConfig
): Promise<string> {
  const { width, height } = ASPECT_RATIO_DIMENSIONS[config.aspectRatio];
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Draw Background Gradient
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, config.bgColor1);
  grad.addColorStop(1, config.bgColor2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative ambient circles
  ctx.save();
  const radGlow1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 10, width * 0.8, height * 0.2, width * 0.6);
  radGlow1.addColorStop(0, config.accentColor + '55');
  radGlow1.addColorStop(1, 'transparent');
  ctx.fillStyle = radGlow1;
  ctx.fillRect(0, 0, width, height);

  const radGlow2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 10, width * 0.2, height * 0.8, width * 0.5);
  radGlow2.addColorStop(0, config.bgColor1 + '88');
  radGlow2.addColorStop(1, 'transparent');
  ctx.fillStyle = radGlow2;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Subtle grid lines / geometric accents
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // Darkness overlay
  if (config.bgOverlayDarkness > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${config.bgOverlayDarkness})`;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Top Store Branding & Trust Badges
  ctx.save();
  const topPadding = height * 0.05;
  // Store Name
  ctx.font = 'bold 26px "Inter", "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(config.storeName.toUpperCase(), width * 0.07, topPadding + 20);

  // Rating Stars
  if (config.showRating) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`★ ★ ★ ★ ★  ${config.ratingValue}`, width * 0.93, topPadding + 20);
  }

  // Top divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width * 0.07, topPadding + 36);
  ctx.lineTo(width * 0.93, topPadding + 36);
  ctx.stroke();
  ctx.restore();

  // 3. Draw Urgency Banner if active
  if (config.showUrgencyBadge) {
    ctx.save();
    const urgencyY = topPadding + 52;
    const badgeW = width * 0.4;
    const badgeH = 34;
    drawRoundedRect(ctx, width * 0.07, urgencyY, badgeW, badgeH, 17);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ ${config.urgencyText.toUpperCase()}`, width * 0.07 + badgeW / 2, urgencyY + 22);
    ctx.restore();
  }

  // 4. Draw Product Image
  let imgObj: HTMLImageElement | null = null;
  try {
    imgObj = await loadImage(config.productImage);
  } catch (err) {
    console.warn('Image load error, falling back', err);
  }

  if (imgObj) {
    ctx.save();
    // Center product coordinates
    const pCx = width * 0.5;
    const pCy = height * 0.52 + config.productOffsetY;
    const baseSize = Math.min(width, height) * 0.52;
    const pW = baseSize * config.productScale;
    const pH = (baseSize * (imgObj.height / (imgObj.width || 1))) * config.productScale;

    // Product drop shadow
    if (config.productShadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 25;
    }

    // Glow background behind product
    const glowGrad = ctx.createRadialGradient(pCx, pCy, 20, pCx, pCy, pW * 0.65);
    glowGrad.addColorStop(0, config.accentColor + '40');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(pCx, pCy, pW * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // Draw image clipped to rounded rect or natural
    drawRoundedRect(ctx, pCx - pW / 2, pCy - pH / 2, pW, pH, 24);
    ctx.clip();
    ctx.drawImage(imgObj, pCx - pW / 2, pCy - pH / 2, pW, pH);
    ctx.restore();
  }

  // 5. Draw Discount Badge (Starburst / Pill / Ribbon)
  ctx.save();
  const badgeCx = width * 0.82;
  const badgeCy = height * 0.28;

  if (config.badgeStyle === 'starburst') {
    ctx.fillStyle = config.badgeBgColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;
    drawStarburst(ctx, badgeCx, badgeCy, 16, 75, 55);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = config.badgeTextColor;
    ctx.font = '900 24px "Inter", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.badgeText, badgeCx, badgeCy);
  } else if (config.badgeStyle === 'pill') {
    const pillW = 180;
    const pillH = 56;
    ctx.shadowColor = config.badgeBgColor + '88';
    ctx.shadowBlur = 25;
    drawRoundedRect(ctx, badgeCx - pillW / 2, badgeCy - pillH / 2, pillW, pillH, 28);
    ctx.fillStyle = config.badgeBgColor;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = config.badgeTextColor;
    ctx.font = '900 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.badgeText, badgeCx, badgeCy);
  } else if (config.badgeStyle === 'stamp') {
    ctx.save();
    ctx.translate(badgeCx, badgeCy);
    ctx.rotate(-0.15);
    const boxW = 190;
    const boxH = 64;
    ctx.strokeStyle = config.badgeBgColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);
    ctx.fillStyle = config.badgeBgColor + '33';
    ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);

    ctx.fillStyle = config.badgeTextColor;
    ctx.font = '900 26px "Impact", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.badgeText, 0, 0);
    ctx.restore();
  }
  ctx.restore();

  // 6. Draw Headline & Subhead (Poster Typography)
  ctx.save();
  const headlineY = height * 0.18;

  // Font family resolution
  let fontFamily = '"Arial Black", "Impact", sans-serif';
  if (config.headlineFont === 'sans') fontFamily = '"Montserrat", "Inter", sans-serif';
  if (config.headlineFont === 'serif') fontFamily = '"Playfair Display", "Georgia", serif';
  if (config.headlineFont === 'mono') fontFamily = '"JetBrains Mono", "Courier New", monospace';

  ctx.font = `900 ${config.headlineSize}px ${fontFamily}`;
  ctx.fillStyle = config.headlineColor;
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 18;
  ctx.fillText(config.headline.toUpperCase(), width * 0.07, headlineY);

  // Subhead
  ctx.shadowBlur = 0;
  ctx.font = '600 24px "Inter", sans-serif';
  ctx.fillStyle = config.subheadColor;
  ctx.fillText(config.subhead, width * 0.07, headlineY + 40);
  ctx.restore();

  // 7. Draw Pricing Section
  if (config.showPrice) {
    ctx.save();
    const priceY = height * 0.77;
    ctx.textAlign = 'left';

    // Original strike-through price
    if (config.originalPrice) {
      const origText = `${config.currency}${config.originalPrice}`;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(origText, width * 0.07, priceY);

      const textMetrics = ctx.measureText(origText);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width * 0.07 - 4, priceY - 9);
      ctx.lineTo(width * 0.07 + textMetrics.width + 4, priceY - 9);
      ctx.stroke();
    }

    // Big Discount Sale Price
    ctx.font = '900 52px "Inter", "Arial Black", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = config.accentColor + '88';
    ctx.shadowBlur = 20;
    const saleText = `${config.currency}${config.salePrice}`;
    ctx.fillText(saleText, width * 0.07, priceY + 54);
    ctx.restore();
  }

  // 8. Draw Call To Action Button (CTA)
  ctx.save();
  const ctaW = 240;
  const ctaH = 68;
  const ctaX = width * 0.93 - ctaW;
  const ctaY = height * 0.77 + 4;

  ctx.shadowColor = config.ctaColor + '88';
  ctx.shadowBlur = 30;

  if (config.ctaStyle === 'pill') {
    drawRoundedRect(ctx, ctaX, ctaY, ctaW, ctaH, ctaH / 2);
    ctx.fillStyle = config.ctaColor;
    ctx.fill();
  } else if (config.ctaStyle === 'gradient') {
    const ctaGrad = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaW, ctaY + ctaH);
    ctaGrad.addColorStop(0, config.ctaColor);
    ctaGrad.addColorStop(1, config.accentColor);
    drawRoundedRect(ctx, ctaX, ctaY, ctaW, ctaH, 16);
    ctx.fillStyle = ctaGrad;
    ctx.fill();
  } else {
    drawRoundedRect(ctx, ctaX, ctaY, ctaW, ctaH, 14);
    ctx.fillStyle = config.ctaColor;
    ctx.fill();
  }

  ctx.shadowBlur = 0;
  ctx.fillStyle = config.ctaTextColor;
  ctx.font = 'bold 22px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${config.ctaText.toUpperCase()} →`, ctaX + ctaW / 2, ctaY + ctaH / 2);
  ctx.restore();

  // 9. Draw Footer Website & Guarantee
  ctx.save();
  const footerY = height * 0.93;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width * 0.07, footerY - 20);
  ctx.lineTo(width * 0.93, footerY - 20);
  ctx.stroke();

  // Website watermark
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.textAlign = 'left';
  ctx.fillText(`🌐 ${config.website}`, width * 0.07, footerY + 8);

  // Guarantee badge
  if (config.showGuarantee) {
    ctx.textAlign = 'right';
    ctx.font = '600 17px sans-serif';
    ctx.fillStyle = '#34d399';
    ctx.fillText(`✓ 100% Quality Guarantee & Fast Express Delivery`, width * 0.93, footerY + 8);
  }
  ctx.restore();

  return canvas.toDataURL('image/png', 0.95);
}
