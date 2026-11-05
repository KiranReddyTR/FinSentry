/**
 * Responsive layout utilities for ScamShield AI
 *
 * Breakpoints (matches common device widths):
 *   mobile  : < 600px   → single column, bottom tabs
 *   tablet  : 600–1024px → two columns, bottom tabs still, wider content
 *   desktop : > 1024px  → sidebar nav, three columns, max-width container
 */

import { Dimensions, useWindowDimensions } from 'react-native';

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const BP = {
  mobile: 600,
  tablet: 1024,
} as const;

// ─── Static helpers (safe outside components) ─────────────────────────────────

export function getBreakpoint(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width >= BP.tablet) return 'desktop';
  if (width >= BP.mobile) return 'tablet';
  return 'mobile';
}

export function isMobileWidth(width: number) { return width < BP.mobile; }
export function isTabletWidth(width: number) { return width >= BP.mobile && width < BP.tablet; }
export function isDesktopWidth(width: number) { return width >= BP.tablet; }

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface LayoutInfo {
  width: number;
  height: number;
  bp: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Horizontal padding for the content container */
  contentPx: number;
  /** Max width for centred content (desktop) */
  maxContentWidth: number;
  /** Number of columns for grid layouts */
  cols: number;
  /** Sidebar width on desktop */
  sidebarWidth: number;
  /** Usable content width after sidebar */
  contentWidth: number;
}

export function useLayout(): LayoutInfo {
  const { width, height } = useWindowDimensions();
  const bp = getBreakpoint(width);

  const isMobile  = bp === 'mobile';
  const isTablet  = bp === 'tablet';
  const isDesktop = bp === 'desktop';

  const sidebarWidth     = isDesktop ? 220 : 0;
  const contentPx        = isDesktop ? 32 : isTablet ? 24 : 16;
  const maxContentWidth  = isDesktop ? 1200 : width;
  const cols             = isDesktop ? 3 : isTablet ? 2 : 1;
  const contentWidth     = width - sidebarWidth;

  return {
    width,
    height,
    bp,
    isMobile,
    isTablet,
    isDesktop,
    contentPx,
    maxContentWidth,
    cols,
    sidebarWidth,
    contentWidth,
  };
}

// ─── Layout container style helper ───────────────────────────────────────────

/**
 * Returns inline style for a centred, max-width page container.
 * Use this on the ScrollView's contentContainerStyle for desktop views.
 */
export function containerStyle(layout: LayoutInfo, extraPb = 40) {
  return {
    paddingHorizontal: layout.contentPx,
    paddingBottom: extraPb,
    maxWidth: layout.maxContentWidth,
    width: '100%' as const,
    alignSelf: 'center' as const,
  };
}
