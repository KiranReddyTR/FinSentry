// Color palette and design tokens for FinSentry AI — Premium Light Theme

export const Colors = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  background: '#FFFFFF',          // main white canvas
  surface: '#F5F8FC',             // sidebar, secondary sections (light blue-grey)
  surfaceElevated: '#EEF3FB',     // slightly elevated surfaces
  card: '#FFFFFF',                // card background
  cardBorder: '#D6E4F7',          // visible but soft card border

  // ── Primary palette ──────────────────────────────────────────────────────
  blue: '#1769E8',                // primary CTA blue
  blueDark: '#1255C0',            // pressed/darker blue
  blueLight: '#EBF3FF',           // very light blue tint for backgrounds
  teal: '#00BFA5',                // teal accent
  tealDark: '#008F72',            // darker teal
  tealLight: '#E0F7F4',           // light teal tint
  cyan: '#00A6D6',                // cyan accent
  cyanLight: '#E0F5FB',           // light cyan tint

  // ── Semantic ──────────────────────────────────────────────────────────────
  danger: '#E53935',
  dangerDark: '#C0392B',
  dangerBg: '#FFF0F0',
  warning: '#E69500',
  warningDark: '#B86E00',
  warningBg: '#FFF8E6',
  success: '#16A34A',
  successDark: '#0F7A38',
  successBg: '#EDFAF3',

  // ── Text ──────────────────────────────────────────────────────────────────
  textPrimary: '#14213D',         // dark navy — headings, labels
  textSecondary: '#52627A',       // readable slate-grey — body text
  textMuted: '#8A99B3',           // hints, timestamps
  textInverse: '#FFFFFF',         // text on coloured backgrounds

  // ── Card surface tints (colourful but subtle) ────────────────────────────
  cardBlue: '#EBF3FF',            // light blue card bg
  cardMint: '#EDFAF3',            // mint green card bg
  cardLavender: '#F3F0FF',        // lavender card bg
  cardCyan: '#E0F5FB',            // pale cyan card bg
  cardAmber: '#FFF8E6',           // pale amber card bg

  // ── Gradients ─────────────────────────────────────────────────────────────
  gradientPrimary: ['#1769E8', '#00A6D6'] as const,    // blue → cyan
  gradientTeal: ['#00BFA5', '#00A6D6'] as const,       // teal → cyan
  gradientDanger: ['#E53935', '#C0392B'] as const,
  gradientWarning: ['#E69500', '#B86E00'] as const,
  gradientSuccess: ['#16A34A', '#0F7A38'] as const,
  gradientCard: ['#FFFFFF', '#F5F8FC'] as const,
  gradientHero: ['#1B3A6B', '#0D2240'] as const,       // deep navy hero

  // ── Risk levels ───────────────────────────────────────────────────────────
  riskLow: '#16A34A',
  riskMedium: '#E69500',
  riskHigh: '#E53935',

  // ── Misc ──────────────────────────────────────────────────────────────────
  border: '#D6E4F7',
  divider: '#E8EEF8',
  overlay: 'rgba(0,0,0,0.35)',
  transparent: 'transparent',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#1769E8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  strong: {
    shadowColor: '#14213D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 8,
  },
  button: {
    shadowColor: '#1769E8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
};
