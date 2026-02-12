/**
 * Mobile Navigation Hook
 * Combines viewport detection with mobile navigation state management
 * Handles drawer, sections, and mobile-specific interactions
 */

import { useEffect, useCallback } from 'react';
import { useViewport } from './useViewport';
import { useMobileStore, MobileMenuSection } from '@/store/mobileStore';

export interface MobileNavigationHook {
  // Viewport state
  isMobile: boolean;
  isTablet: boolean;

  // Navigation state
  isDrawerOpen: boolean;
  activeSection: MobileMenuSection;

  // Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setActiveSection: (section: MobileMenuSection) => void;
  toggleSection: (section: MobileMenuSection) => void;

  // Search overlay
  isSearchOverlayOpen: boolean;
  openSearchOverlay: () => void;
  closeSearchOverlay: () => void;
}

/**
 * Hook for mobile navigation state and actions
 * Automatically closes drawer when switching to desktop viewport
 *
 * @example
 * const { isMobile, isDrawerOpen, toggleDrawer } = useMobileNavigation();
 *
 * return (
 *   <>
 *     {isMobile && <button onClick={toggleDrawer}>Menu</button>}
 *     <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
 *   </>
 * );
 */
export function useMobileNavigation(): MobileNavigationHook {
  const { isMobile, isTablet } = useViewport();

  const {
    isDrawerOpen,
    activeSection,
    isSearchOverlayOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    setActiveSection,
    toggleSection,
    openSearchOverlay,
    closeSearchOverlay,
  } = useMobileStore();

  // Auto-close drawer when switching to desktop
  useEffect(() => {
    if (!isMobile && !isTablet && isDrawerOpen) {
      closeDrawer();
    }
  }, [isMobile, isTablet, isDrawerOpen, closeDrawer]);

  // Auto-close search overlay when switching to desktop
  useEffect(() => {
    if (!isMobile && !isTablet && isSearchOverlayOpen) {
      closeSearchOverlay();
    }
  }, [isMobile, isTablet, isSearchOverlayOpen, closeSearchOverlay]);

  // Handle escape key to close drawer/overlay
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isSearchOverlayOpen) {
          closeSearchOverlay();
        } else if (isDrawerOpen) {
          closeDrawer();
        }
      }
    };

    if (isDrawerOpen || isSearchOverlayOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isDrawerOpen, isSearchOverlayOpen, closeDrawer, closeSearchOverlay]);

  return {
    isMobile,
    isTablet,
    isDrawerOpen,
    activeSection,
    isSearchOverlayOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    setActiveSection,
    toggleSection,
    openSearchOverlay,
    closeSearchOverlay,
  };
}

/**
 * Hook for swipe gestures (swipe-to-close drawer)
 */
interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger swipe
}

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function useSwipe(config: SwipeConfig): SwipeHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
  } = config;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Determine if swipe was more horizontal or vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }

    // Reset values
    touchStartX = 0;
    touchStartY = 0;
    touchEndX = 0;
    touchEndY = 0;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
