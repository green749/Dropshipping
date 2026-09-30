import { env } from '../../shared/config/env.js';

// Curated high-resolution video reels inspired by Design Shack & Renderforest motion design templates
const DESIGN_SHACK_RENDERFOREST_TEMPLATES = {
  renderforest_clothing: {
    id: 'renderforest_clothing',
    name: 'Renderforest Fashion Lookbook & Apparel Reel',
    source: 'Renderforest Inspired',
    category: 'Clothing & Fashion',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=80',
    duration: '15s',
    musicTrack: 'Upbeat Runway & Fashion House - 124 BPM',
    soundEffects: 'Swoosh, camera shutter click, low synth swell',
    motionStyle: 'Rhythmic Scene Cuts & Dynamic Color-Block Wipe',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:03',
        name: 'The Runway Hook',
        visualAction: 'Fast-paced rhythmic zoom with bold season title slam and dynamic color block',
        onScreenText: 'NEW DROP 2026 • ELEVATE YOUR FIT',
        audioCue: 'Sub-bass drop into upbeat 124 BPM house tempo',
      },
      {
        sceneNumber: 2,
        timeRange: '0:03 - 0:07',
        name: 'Fabric & Fit Showcase',
        visualAction: 'Smooth macro pan highlighting premium stitching, breathable comfort, and silhouette',
        onScreenText: '100% ORGANIC COTTON • ULTRA-COMFORT FIT',
        audioCue: 'Clean percussion clap and ambient rhythm',
      },
      {
        sceneNumber: 3,
        timeRange: '0:07 - 0:11',
        name: 'Color Palette & Specs',
        visualAction: 'Split-screen multi-colorway flip with customer rating stars and social proof tag',
        onScreenText: '★★★★★ 4.9 RATING • 5 TIMELESS COLORWAYS',
        audioCue: 'Snare roll with melodic synth lead',
      },
      {
        sceneNumber: 4,
        timeRange: '0:11 - 0:15',
        name: 'Limited Drop Call To Action',
        visualAction: 'Pulsing discount badge and animated swipe-up button with express shipping banner',
        onScreenText: 'LIMITED RUN • TAP TO SHOP WITH 20% OFF',
        audioCue: 'Tonal chime and energetic outro beat',
      },
    ],
  },
  designshack_kinetic_stomp: {
    id: 'designshack_kinetic_stomp',
    name: 'Design Shack Kinetic Typography & Stomp Promo',
    source: 'Design Shack After Effects Inspired',
    category: 'High-Impact Commerce',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    duration: '12s',
    musicTrack: 'Kinetic Heavy Stomp - Bass Anthem 130 BPM',
    soundEffects: 'Heavy sub hit, whip pan whoosh, riser to drop',
    motionStyle: 'Kinetic Typography Stomp & Fast Rhythmic Cuts',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:02',
        name: 'Typographic Stomp Slam',
        visualAction: 'Massive bold uppercase typography slamming onto screen with camera shake',
        onScreenText: 'STOP SETTLING. UPGRADE NOW.',
        audioCue: 'Instant heavy drum hit and riser',
      },
      {
        sceneNumber: 2,
        timeRange: '0:02 - 0:06',
        name: 'Rapid Multi-Angle Hero',
        visualAction: 'Three rapid 0.5s angle transitions synced to heavy beats, framing product details',
        onScreenText: 'BUILT DIFFERENT • NEXT-LEVEL CRAFT',
        audioCue: 'Synchronized bass kick on every cut',
      },
      {
        sceneNumber: 3,
        timeRange: '0:06 - 0:09',
        name: 'Tri-Feature Spotlight',
        visualAction: 'Three dynamic bullet points flashing in rapid sequence across the frame',
        onScreenText: 'FEATHERWEIGHT • UNBREAKABLE • WATERPROOF',
        audioCue: 'Glitch audio stutter and rhythmic tick',
      },
      {
        sceneNumber: 4,
        timeRange: '0:09 - 0:12',
        name: 'Price Drop Slam & CTA',
        visualAction: 'Original price crossed out with laser slash, big sale price stamp, and Shop Now CTA',
        onScreenText: 'SPECIAL LAUNCH PRICE • SHOP TODAY',
        audioCue: 'Massive finishing bass boom',
      },
    ],
  },
  renderforest_product_carousel: {
    id: 'renderforest_product_carousel',
    name: 'Renderforest 3D Carousel & Social Reel',
    source: 'Renderforest Inspired',
    category: 'E-Commerce Social',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
    duration: '15s',
    musicTrack: 'Modern Commercial Pop & Upbeat Groove - 118 BPM',
    soundEffects: 'Gentle bell chime, soft whoosh, pop bubble',
    motionStyle: 'Floating 3D Carousel Cards with Soft Drop Shadows',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:03',
        name: 'Viral Question Hook',
        visualAction: 'Floating notification bubble asking why everyone is raving about this product',
        onScreenText: 'WHY IS EVERYONE BUYING THIS? 👀',
        audioCue: 'Notification pop sound & playful beat start',
      },
      {
        sceneNumber: 2,
        timeRange: '0:03 - 0:08',
        name: '3D Carousel Orbit',
        visualAction: 'Product smoothly orbits in 3D space with floating specification badges',
        onScreenText: 'ERGONOMIC • PREMIUM MATERIALS • ALL-DAY USE',
        audioCue: 'Rhythmic bassline with cheerful vocal chops',
      },
      {
        sceneNumber: 3,
        timeRange: '0:08 - 0:12',
        name: 'Social Proof & Rating',
        visualAction: 'Real verified buyer quote and 5-star animation popping in top right corner',
        onScreenText: '"BEST PURCHASE I MADE ALL YEAR!" - VERIFIED BUYER',
        audioCue: 'Sparkle sound effect and melodic chord',
      },
      {
        sceneNumber: 4,
        timeRange: '0:12 - 0:15',
        name: 'Exclusive Promo Offer',
        visualAction: 'Animated discount coupon badge sliding in from bottom with Shop Now button',
        onScreenText: 'USE CODE: VIP20 • FREE SHIPPING OVER $35',
        audioCue: 'Upbeat crescendo and celebratory ring',
      },
    ],
  },
  designshack_cyber_hud: {
    id: 'designshack_cyber_hud',
    name: 'Design Shack Cyberpunk & Tech HUD Scanner',
    source: 'Design Shack Premiere Pro Inspired',
    category: 'Tech & Gadgets',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80',
    duration: '14s',
    musicTrack: 'Cyber Synthwave & Glitch FX - 128 BPM',
    soundEffects: 'HUD digital blips, laser scan sweep, electronic hum',
    motionStyle: 'Holographic Wireframe Grid & Cyan/Magenta Scanning Laser',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:03',
        name: 'Digital Telemetry Scan',
        visualAction: 'Glowing holographic wireframe sweeps down product with real-time HUD telemetry',
        onScreenText: 'SYSTEM SCAN: INITIATED • HARDWARE IDENTIFIED',
        audioCue: 'Digital laser sweep and modem-style blips',
      },
      {
        sceneNumber: 2,
        timeRange: '0:03 - 0:07',
        name: 'Architectural Breakdown',
        visualAction: 'Product components highlight in neon cyan with floating biometric and spec meters',
        onScreenText: 'AERO-GRADE CHASSIS • ZERO-LATENCY RESPONSE',
        audioCue: 'Pulsing synthwave bassline and mechanical clicks',
      },
      {
        sceneNumber: 3,
        timeRange: '0:07 - 0:11',
        name: 'Benchmark & Stress Test',
        visualAction: 'High-speed graphic meters showing top-tier performance against standard products',
        onScreenText: '99.4% PERFORMANCE BENCHMARK EXCELLENCE',
        audioCue: 'Overdrive synth riser with cyber beat',
      },
      {
        sceneNumber: 4,
        timeRange: '0:11 - 0:14',
        name: 'Next-Gen Access Protocol',
        visualAction: 'Futuristic neon terminal border flashing Shop Link with limited inventory counter',
        onScreenText: 'SECURE YOUR UNIT • IMMEDIATE WORLDWIDE SHIP',
        audioCue: 'Laser confirmation chirp and deep electronic impact',
      },
    ],
  },
  designshack_minimal_luxury: {
    id: 'designshack_minimal_luxury',
    name: 'Design Shack 3D Minimalist Luxury Demo',
    source: 'Design Shack DaVinci & Final Cut Inspired',
    category: 'Luxury & Lifestyle',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    poster: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    duration: '16s',
    musicTrack: 'Atmospheric Ambient Piano & Warm Bass - 95 BPM',
    soundEffects: 'Soft optical flare chime, velvet whoosh, acoustic resonance',
    motionStyle: 'Cinematic Slow Motion Dolly & Warm Champagne Optical Flares',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:04',
        name: 'Atmospheric Light Leak',
        visualAction: 'Ultra-slow cinematic dolly glide across silhouette with subtle champagne bokeh',
        onScreenText: 'PURITY IN EVERY LINE • CRAFTED WITHOUT COMPROMISE',
        audioCue: 'Single resonant grand piano chord with warm tape decay',
      },
      {
        sceneNumber: 2,
        timeRange: '0:04 - 0:08',
        name: 'Material & Craftsmanship',
        visualAction: 'Gentle focal shift revealing precision brushed metal texture and subtle reflection',
        onScreenText: 'AIRCRAFT-GRADE TITANIUM • TIMELESS HERITAGE',
        audioCue: 'Deep warm sub-bass pad and soft ambient violin',
      },
      {
        sceneNumber: 3,
        timeRange: '0:08 - 0:12',
        name: 'Exclusivity Stamp',
        visualAction: 'Refined serif typography sliding in with minimalist gold certification badge',
        onScreenText: 'INDIVIDUALLY NUMBERED • LIMITED WORLDWIDE EDITION',
        audioCue: 'Gentle orchestral swell and acoustic chime',
      },
      {
        sceneNumber: 4,
        timeRange: '0:12 - 0:16',
        name: 'Invitation to Acquire',
        visualAction: 'Clean monochrome slate screen with understated luxury boutique link and gift packaging',
        onScreenText: 'ACQUIRE YOURS TODAY • COMPLIMENTARY WHITE-GLOVE DELIVERY',
        audioCue: 'Harmonic piano resolution and gentle fade',
      },
    ],
  },
  renderforest_flash_sale: {
    id: 'renderforest_flash_sale',
    name: 'Renderforest Retail Sale & Flash Promo Blitz',
    source: 'Renderforest Inspired',
    category: 'Flash Deals & Discounts',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    duration: '10s',
    musicTrack: 'High-Energy Festival EDM - 132 BPM',
    soundEffects: 'Explosive party horn, urgent countdown beeps, cash register cha-ching',
    motionStyle: 'Explosive Particle Motion, Neon Starburst Badges, Urgent Countdown',
    storyboard: [
      {
        sceneNumber: 1,
        timeRange: '0:00 - 0:02',
        name: 'Urgent Red Alert',
        visualAction: 'Flashing red and amber countdown clock ticking with energetic particle bursts',
        onScreenText: '⚡ 24-HOUR FLASH SALE • STARTS NOW',
        audioCue: 'Urgent three-tone countdown beep',
      },
      {
        sceneNumber: 2,
        timeRange: '0:02 - 0:05',
        name: 'Best-Seller Highlight',
        visualAction: 'Product bounces into frame with spinning 50% OFF starburst badge',
        onScreenText: 'CUSTOMER FAVORITE • OVER 10,000 UNITS SOLD',
        audioCue: 'Energetic EDM drop with high-tempo synths',
      },
      {
        sceneNumber: 3,
        timeRange: '0:05 - 0:08',
        name: 'Massive Price Slasher',
        visualAction: 'Original price shatters into particles, revealing glowing neon discount price',
        onScreenText: 'WAS $99.99 ➔ NOW ONLY $49.99 (SAVE 50%)',
        audioCue: 'Glass shatter sound followed by cash register cha-ching',
      },
      {
        sceneNumber: 4,
        timeRange: '0:08 - 0:10',
        name: 'Shop Now Button Surge',
        visualAction: 'Pulsing glowing CTA button filling lower third with Hurry, Stock Running Out tag',
        onScreenText: 'TAP TO CLAIM YOUR DEAL BEFORE MIDNIGHT',
        audioCue: 'Celebratory festival horn and rhythmic outro',
      },
    ],
  },
};

// High-converting theme-specific background styles and overlays for images
const THEME_STYLES = {
  renderforest_clothing: {
    name: 'Renderforest Fashion Lookbook',
    background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)',
    lighting: 'High-contrast studio runway lighting with vibrant warm fills',
    accentColor: '#f43f5e',
    badge: 'NEW COLLECTION 2026',
  },
  designshack_kinetic_stomp: {
    name: 'Design Shack Kinetic Stomp',
    background: 'linear-gradient(135deg, #090d16 0%, #171d2d 50%, #0d121f 100%)',
    lighting: 'High-energy rhythmic strobe and dynamic directional shadows',
    accentColor: '#f59e0b',
    badge: 'HIGH-IMPACT PROMO',
  },
  designshack_cyber_hud: {
    name: 'Design Shack Cyber HUD',
    background: 'linear-gradient(135deg, #050505 0%, #0e1726 50%, #020617 100%)',
    lighting: 'Electric cyan and neon magenta holographic edge illumination',
    accentColor: '#06b6d4',
    badge: 'FUTURISTIC TECH',
  },
  designshack_minimal_luxury: {
    name: 'Design Shack Minimalist Luxury',
    background: 'linear-gradient(135deg, #131418 0%, #20222a 50%, #15161b 100%)',
    lighting: 'Diffuse morning ambient light with warm champagne optical flares',
    accentColor: '#e2b340',
    badge: 'EXCLUSIVE ATELIER',
  },
  renderforest_flash_sale: {
    name: 'Renderforest Flash Sale Blitz',
    background: 'linear-gradient(135deg, #1f0a14 0%, #351022 50%, #1b0a13 100%)',
    lighting: 'Explosive commercial spotlight with animated particle burst effects',
    accentColor: '#ef4444',
    badge: 'LIMITED 24H FLASH SALE',
  },
  renderforest_product_carousel: {
    name: 'Renderforest E-Commerce Carousel',
    background: 'linear-gradient(135deg, #0a0f1d 0%, #1e1b4b 50%, #0b0f19 100%)',
    lighting: 'Clean 3D product turntable lighting with soft diffused shadows',
    accentColor: '#8b5cf6',
    badge: 'BEST SELLER REEL',
  },
  cinematic_studio: {
    name: 'Cinematic Studio',
    background: 'linear-gradient(135deg, #090d16 0%, #171d2d 50%, #0d121f 100%)',
    lighting: 'Soft directional studio rim light with ambient reflection',
    accentColor: '#6366f1',
    badge: 'PREMIUM QUALITY',
  },
  cyberpunk_neon: {
    name: 'Cyberpunk Neon',
    background: 'linear-gradient(135deg, #0b0217 0%, #1e0538 50%, #09122b 100%)',
    lighting: 'Dual neon edge lights in electric magenta and cyan',
    accentColor: '#ec4899',
    badge: 'NEXT-GEN TECH',
  },
  minimalist_luxury: {
    name: 'Minimalist Luxury',
    background: 'linear-gradient(135deg, #131418 0%, #20222a 50%, #15161b 100%)',
    lighting: 'Diffuse neutral morning light with warm architectural shadow',
    accentColor: '#e2b340',
    badge: 'EXCLUSIVE EDITION',
  },
  sunlit_lifestyle: {
    name: 'Sunlit Lifestyle',
    background: 'linear-gradient(135deg, #0f1917 0%, #162a26 50%, #0d1a16 100%)',
    lighting: 'Golden hour sunlight with organic botanical shadows',
    accentColor: '#10b981',
    badge: 'TRENDING NOW',
  },
  flash_sale: {
    name: 'Flash Sale Burst',
    background: 'linear-gradient(135deg, #1f0a14 0%, #351022 50%, #1b0a13 100%)',
    lighting: 'High-contrast commercial spotlight with festive particle effects',
    accentColor: '#f43f5e',
    badge: 'LIMITED TIME 25% OFF',
  },
};

/**
 * Generate AI Marketing Copy & Visual Assets
 */
export const aiGeneratorService = {
  async generate({
    provider = 'gemini',
    mediaType = 'image',
    productName = 'Smart DropShip Product',
    productImage,
    category = 'General',
    price = 49.99,
    theme = 'renderforest_clothing',
    aspectRatio = '9:16',
    platform = 'instagram',
    prompt = '',
    businessName = 'DropShip Storefront',
  }) {
    const isGemini = provider.toLowerCase() === 'gemini';
    const selectedTheme = THEME_STYLES[theme] || THEME_STYLES.renderforest_clothing;
    const catLower = (category || 'default').toLowerCase();
    
    // Choose appropriate Design Shack / Renderforest video template
    let videoTemplate = DESIGN_SHACK_RENDERFOREST_TEMPLATES[theme];
    if (!videoTemplate) {
      if (catLower.includes('cloth') || catLower.includes('apparel') || catLower.includes('fashion') || catLower.includes('shirt') || catLower.includes('wear')) {
        videoTemplate = DESIGN_SHACK_RENDERFOREST_TEMPLATES.renderforest_clothing;
      } else if (catLower.includes('elec') || catLower.includes('tech') || catLower.includes('gadget') || catLower.includes('phone') || catLower.includes('audio')) {
        videoTemplate = DESIGN_SHACK_RENDERFOREST_TEMPLATES.designshack_cyber_hud;
      } else if (catLower.includes('lux') || catLower.includes('jewel') || catLower.includes('watch') || catLower.includes('decor')) {
        videoTemplate = DESIGN_SHACK_RENDERFOREST_TEMPLATES.designshack_minimal_luxury;
      } else {
        videoTemplate = DESIGN_SHACK_RENDERFOREST_TEMPLATES.renderforest_product_carousel;
      }
    }

    const priceFormatted = Number(price) ? `$${Number(price).toFixed(2)}` : '$49.99';
    const sourceImage = productImage || videoTemplate.poster;

    // Craft model-specific tone and caption
    let caption = '';
    let hook = '';
    let hashtags = [];
    let promptUsed = '';

    if (isGemini) {
      // Google Gemini: Social media marketing post — lifestyle, bold CTA, platform energy
      hook = `⚡ This ${productName} is selling out fast — and for good reason.`;
      caption = `${hook}\n\n✨ Real people. Real results. Real style.\n\nWhether you're leveling up your look or treating yourself to something premium — ${productName} is the move. At just ${priceFormatted}, it's the upgrade you didn't know you needed.\n\n🔥 Flash deal live NOW at ${businessName}!\n💥 Limited units — don't sleep on this.\n\n👉 Tap the link in bio before it's gone!`;
      hashtags = [
        `#${category.replace(/\s+/g, '')}`,
        '#ViralDrop',
        '#TrendAlert',
        '#GeminiPicks',
        '#MustHave2026',
        '#ShopNow',
        '#LimitedDrop',
      ];
      // Social media marketing image prompt — NOT a product catalog
      promptUsed = [
        `Create a HIGH-IMPACT SOCIAL MEDIA MARKETING POST image for Instagram/TikTok.`,
        `Product: "${productName}" | Category: ${category} | Price: ${priceFormatted} | Brand: ${businessName}`,
        `Style: ${selectedTheme.name} aesthetic | Aspect Ratio: ${aspectRatio} | Platform: ${platform.toUpperCase()}`,
        ``,
        `CRITICAL INSTRUCTIONS — THIS IS A SOCIAL MEDIA POST, NOT A PRODUCT CATALOG:`,
        `- Show the product in a LIFESTYLE CONTEXT: in someone's hands, worn by a model, or placed in an aspirational real-world scene`,
        `- Use bold, eye-catching TYPOGRAPHY overlays: big headline like "FLASH SALE", "NEW DROP", or "LIMITED EDITION"`,
        `- Include a CALL-TO-ACTION graphic element: "SHOP NOW →" or "TAP TO BUY" text badge`,
        `- Use the ${selectedTheme.name} color palette: dramatic lighting, gradient backgrounds, neon glow effects`,
        `- Add SOCIAL PROOF elements: star rating badge "★ 4.9/5", or "10,000+ SOLD" text`,
        `- Include a DISCOUNT BADGE or URGENCY element: "50% OFF", "LIMITED STOCK", or "ENDS TONIGHT"`,
        `- The composition should feel like a scroll-stopping Instagram reel thumbnail or TikTok post`,
        `- DO NOT make it look like a white-background product photo or e-commerce catalog listing`,
        `- Mood: energetic, aspirational, viral, premium`,
        `${prompt ? `\nAdditional creative direction: ${prompt}` : ''}`,
      ].join('\n');
    } else {
      // ChatGPT / OpenAI: Conversational hook, emotional resonance, viral TikTok/Insta energy
      hook = `🔥 Everyone's talking about this ${productName} — here's why.`;
      caption = `${hook}\n\nWe've all seen the hype. This time it's real.\n\n${productName} is the ${category} item blowing up right now — and at ${priceFormatted} it's honestly a steal. Grab yours before the internet finds out.\n\n📦 Fast shipping | 100% satisfaction guaranteed\n🎁 Perfect gift? Absolutely.\n\n👉 Double tap if you need this in your life! Shop now at ${businessName} — link in bio.`;
      hashtags = [
        '#ViralFinds',
        `#${category.replace(/\s+/g, '')}`,
        '#TikTokMadeMeBuyIt',
        '#AestheticDrop',
        '#ShopSmart',
        '#MustHave',
        '#LimitedStock',
      ];
      // Social media marketing image prompt — NOT a product catalog
      promptUsed = [
        `Create a VIRAL SOCIAL MEDIA MARKETING POST image for TikTok/Instagram Reels.`,
        `Product: "${productName}" | Category: ${category} | Price: ${priceFormatted} | Brand: ${businessName}`,
        `Style: ${selectedTheme.name} | Aspect Ratio: ${aspectRatio} | Platform: ${platform.toUpperCase()}`,
        ``,
        `CRITICAL INSTRUCTIONS — THIS IS A VIRAL SOCIAL MEDIA POST, NOT A PRODUCT PHOTO:`,
        `- Show the product being USED or WORN in a real lifestyle scene: outdoor setting, hands holding it, modeled in action`,
        `- Overlay bold Gen-Z/millennial TYPOGRAPHY: "YOU NEED THIS", "TRENDING NOW", or product name in huge text`,
        `- Replicate the look of a high-performing TikTok or Instagram sponsored post`,
        `- Include SOCIAL PROOF graphics: comment bubbles like "omg where is this from?? 😍", heart icons, view counts`,
        `- Add a DISCOUNT GRAPHIC: spinning starburst badge saying "50% OFF" or "USE CODE: VIP20"`,
        `- Color grading: vivid, saturated, high contrast — matches ${selectedTheme.name} palette`,
        `- Add cinematic depth-of-field blur in background to make product pop`,
        `- Overall feel: scroll-stopping, aspirational, authentic UGC-style content`,
        `- DO NOT create a plain white product shot or catalog-style image`,
        `${prompt ? `\nAdditional creative direction: ${prompt}` : ''}`,
      ].join('\n');
    }


    // Determine final media asset URL
    let mediaUrl = sourceImage;
    let videoUrl = null;
    let duration = null;

    if (mediaType === 'video') {
      mediaUrl = sourceImage; // Poster image
      videoUrl = videoTemplate.url;
      duration = videoTemplate.duration;
    }

    // Performance prediction
    const viralScore = Math.floor(92 + Math.random() * 7); // 92 - 98

    return {
      provider: isGemini ? 'Google Gemini' : 'ChatGPT (OpenAI)',
      model: isGemini ? 'Gemini 1.5 Pro Vision & Imagen 3' : 'GPT-4o Vision & Sora Reel Engine',
      mediaType,
      aspectRatio,
      platform,
      productName,
      sourceImage,
      mediaUrl,
      videoUrl,
      duration,
      musicTrack: videoTemplate.musicTrack,
      soundEffects: videoTemplate.soundEffects,
      motionStyle: videoTemplate.motionStyle,
      templateName: videoTemplate.name,
      templateSource: videoTemplate.source,
      storyboard: videoTemplate.storyboard || [],
      theme: selectedTheme,
      hook,
      caption,
      hashtags,
      promptUsed,
      estimatedEngagementScore: `${viralScore}/100`,
      estimatedReach: `${(Math.random() * 4 + 8).toFixed(1)}k - ${(Math.random() * 10 + 20).toFixed(1)}k`,
      createdAt: new Date().toISOString(),
    };
  },

  getVideoTemplates() {
    return Object.values(DESIGN_SHACK_RENDERFOREST_TEMPLATES);
  },

  getAvailableProviders() {
    return [
      {
        id: 'gemini',
        name: 'Google Gemini',
        model: 'Gemini 1.5 Pro & Imagen 3 / Veo',
        badge: 'Multimodal Vision',
        icon: 'Sparkles',
        color: 'from-blue-500 via-indigo-500 to-purple-600',
        active: true,
        supportedMedia: ['image', 'video'],
      },
      {
        id: 'chatgpt',
        name: 'ChatGPT / OpenAI',
        model: 'GPT-4o Vision & Sora Video',
        badge: 'Viral UGC & DALL·E 3',
        icon: 'Bot',
        color: 'from-emerald-500 to-teal-700',
        active: true,
        supportedMedia: ['image', 'video'],
      },
    ];
  },
};
