import { useState, useEffect } from 'react';

/**
 * Tailwind breakpoints matching tailwind.config.js
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  breakpoint: Breakpoint | 'xs';
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Custom hook for responsive viewport detection
 * Returns current viewport dimensions and responsive breakpoint states
 *
 * @example
 * const { isMobile, isTablet, width } = useViewport();
 *
 * if (isMobile) {
 *   return <MobileComponent />;
 * }
 */
export function useViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : BREAKPOINTS.lg;
    const height = typeof window !== 'undefined' ? window.innerHeight : 768;

    return {
      width,
      height,
      isMobile: width < BREAKPOINTS.md,
      isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
      isDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
      isLargeDesktop: width >= BREAKPOINTS.xl,
      breakpoint: getBreakpoint(width),
      isPortrait: height > width,
      isLandscape: width > height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
        isLargeDesktop: width >= BREAKPOINTS.xl,
        breakpoint: getBreakpoint(width),
        isPortrait: height > width,
        isLandscape: width > height,
      });
    };

    // Debounce resize events for better performance
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, []);

  return viewport;
}

/**
 * Determine current breakpoint based on width
 */
function getBreakpoint(width: number): Breakpoint | 'xs' {
  if (width >= BREAKPOINTS['2xl']) return '2xl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Hook to check if viewport matches a specific breakpoint
 *
 * @example
 * const isMobileOrTablet = useBreakpoint(['xs', 'sm', 'md']);
 */
export function useBreakpoint(breakpoints: Array<Breakpoint | 'xs'>): boolean {
  const { breakpoint } = useViewport();
  return breakpoints.includes(breakpoint);
}

/**
 * Hook to get minimum touch target size (44x44px for mobile)
 */
export function useTouchTargetSize(): { minWidth: number; minHeight: number } {
  const { isMobile } = useViewport();
  return {
    minWidth: isMobile ? 44 : 40,
    minHeight: isMobile ? 44 : 40,
  };
}
