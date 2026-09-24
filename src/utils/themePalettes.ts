import { ThemePalette } from '../types';

export interface PaletteConfig {
  id: ThemePalette;
  name: string;
  tagline: string;
  description: string;
  bgHex: string;
  cardBgHex: string;
  cardSurfaceHex: string;
  navBgHex: string;
  accentGoldHex: string;
  accentSecondaryHex: string;
  accentMutedHex: string;
  textPrimaryHex: string;
  textMutedHex: string;
  borderHex: string;
  glowRgba: string;
  gradientAccent: string;
  btnTextHex: string;
  previewGradient: string;
}

export const THEME_PALETTES: PaletteConfig[] = [
  {
    id: 'gold',
    name: 'Obsidian & Gold',
    tagline: 'Signature Flagship',
    description: 'Deep midnight obsidian paired with warm brushed gold and champagne accents. The ultimate prestige aesthetic.',
    bgHex: '#090807',
    cardBgHex: '#14120E',
    cardSurfaceHex: '#1C1812',
    navBgHex: 'rgba(18, 16, 12, 0.94)',
    accentGoldHex: '#D4AF37',
    accentSecondaryHex: '#F5D77F',
    accentMutedHex: '#AA7C11',
    textPrimaryHex: '#EDE8D0',
    textMutedHex: '#A8A193',
    borderHex: 'rgba(212, 175, 55, 0.28)',
    glowRgba: 'rgba(212, 175, 55, 0.35)',
    gradientAccent: 'linear-gradient(135deg, #AA7C11 0%, #D4AF37 50%, #F5D77F 100%)',
    btnTextHex: '#090807',
    previewGradient: 'from-[#D4AF37] to-[#8C6B13]',
  },
  {
    id: 'emerald',
    name: 'Royal Emerald & Bronze',
    tagline: 'Aristocratic Vitality',
    description: 'Deep velvet spruce green infused with radiant emerald and burnished antique bronze. Inspires natural growth and calm determination.',
    bgHex: '#04140E',
    cardBgHex: '#0B2219',
    cardSurfaceHex: '#112E23',
    navBgHex: 'rgba(11, 34, 25, 0.94)',
    accentGoldHex: '#10B981',
    accentSecondaryHex: '#6EE7B7',
    accentMutedHex: '#047857',
    textPrimaryHex: '#E6FAF1',
    textMutedHex: '#80AC9B',
    borderHex: 'rgba(16, 185, 129, 0.3)',
    glowRgba: 'rgba(16, 185, 129, 0.35)',
    gradientAccent: 'linear-gradient(135deg, #047857 0%, #10B981 50%, #6EE7B7 100%)',
    btnTextHex: '#04140E',
    previewGradient: 'from-[#10B981] to-[#047857]',
  },
  {
    id: 'sapphire',
    name: 'Midnight Sapphire & Platinum',
    tagline: 'Executive Focus',
    description: 'Deep celestial oceanic navy illuminated by electric ice sapphire and polished platinum. Engineered for deep clarity and razor focus.',
    bgHex: '#050D1C',
    cardBgHex: '#0B1B36',
    cardSurfaceHex: '#12274D',
    navBgHex: 'rgba(11, 27, 54, 0.94)',
    accentGoldHex: '#38BDF8',
    accentSecondaryHex: '#93C5FD',
    accentMutedHex: '#1D4ED8',
    textPrimaryHex: '#E0F2FE',
    textMutedHex: '#7C96B8',
    borderHex: 'rgba(56, 189, 248, 0.3)',
    glowRgba: 'rgba(56, 189, 248, 0.35)',
    gradientAccent: 'linear-gradient(135deg, #1D4ED8 0%, #38BDF8 50%, #93C5FD 100%)',
    btnTextHex: '#050D1C',
    previewGradient: 'from-[#38BDF8] to-[#1D4ED8]',
  },
  {
    id: 'amethyst',
    name: 'Imperial Amethyst & Rose Gold',
    tagline: 'Mystic Prestige',
    description: 'Deep nocturnal plum complemented by ethereal royal violet and soft rose gold. Evokes sovereign poise, reflection, and mindful elegance.',
    bgHex: '#13071F',
    cardBgHex: '#200E33',
    cardSurfaceHex: '#2E1647',
    navBgHex: 'rgba(32, 14, 51, 0.94)',
    accentGoldHex: '#C084FC',
    accentSecondaryHex: '#F472B6',
    accentMutedHex: '#7E22CE',
    textPrimaryHex: '#F5ECFF',
    textMutedHex: '#A58AB8',
    borderHex: 'rgba(192, 132, 252, 0.3)',
    glowRgba: 'rgba(192, 132, 252, 0.35)',
    gradientAccent: 'linear-gradient(135deg, #7E22CE 0%, #C084FC 50%, #F472B6 100%)',
    btnTextHex: '#13071F',
    previewGradient: 'from-[#C084FC] to-[#7E22CE]',
  },
  {
    id: 'ivory',
    name: 'Champagne & Ivory Luxury',
    tagline: 'Daylight Editorial',
    description: 'Warm Italian alabaster paired with rich antique bronze and slate inking. Crisp, clean, and effortlessly sophisticated in daylight.',
    bgHex: '#F6F4EE',
    cardBgHex: '#FFFFFF',
    cardSurfaceHex: '#EFECE3',
    navBgHex: 'rgba(255, 255, 255, 0.95)',
    accentGoldHex: '#B8933C',
    accentSecondaryHex: '#8C6B13',
    accentMutedHex: '#6B4E0A',
    textPrimaryHex: '#1E293B',
    textMutedHex: '#64748B',
    borderHex: 'rgba(184, 147, 60, 0.32)',
    glowRgba: 'rgba(184, 147, 60, 0.25)',
    gradientAccent: 'linear-gradient(135deg, #8C6B13 0%, #B8933C 50%, #E5C158 100%)',
    btnTextHex: '#FFFFFF',
    previewGradient: 'from-[#B8933C] to-[#E5C158]',
  },
];

export function applyPaletteToDOM(paletteId: ThemePalette = 'gold') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;
  const config = THEME_PALETTES.find(p => p.id === paletteId) || THEME_PALETTES[0];

  root.setAttribute('data-palette', paletteId);
  if (body) {
    body.setAttribute('data-palette', paletteId);
    body.style.backgroundColor = config.bgHex;
    body.style.color = config.textPrimaryHex;
  }

  root.style.setProperty('--apex-bg', config.bgHex);
  root.style.setProperty('--apex-card-bg', config.cardBgHex);
  root.style.setProperty('--apex-card-surface', config.cardSurfaceHex);
  root.style.setProperty('--apex-nav-bg', config.navBgHex);
  root.style.setProperty('--apex-accent', config.accentGoldHex);
  root.style.setProperty('--apex-accent-bright', config.accentSecondaryHex);
  root.style.setProperty('--apex-accent-muted', config.accentMutedHex);
  root.style.setProperty('--apex-text', config.textPrimaryHex);
  root.style.setProperty('--apex-text-muted', config.textMutedHex);
  root.style.setProperty('--apex-border', config.borderHex);
  root.style.setProperty('--apex-glow', config.glowRgba);
  root.style.setProperty('--apex-gradient-accent', config.gradientAccent);
  root.style.setProperty('--apex-btn-text', config.btnTextHex);

  // Update meta theme-color tag for browser & PWA status bar
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', config.bgHex);
  }
}
