/**
 * Mobile Store - Zustand store for mobile UI state management
 * Handles mobile drawer, menu states, and mobile-specific UI interactions
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type MobileMenuSection = 'discover' | 'tools' | 'about' | null;

interface MobileState {
  // Navigation state
  isDrawerOpen: boolean;
  activeSection: MobileMenuSection;

  // Search overlay state
  isSearchOverlayOpen: boolean;

  // Touch interaction state
  isScrolling: boolean;
  lastScrollPosition: number;

  // Actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  setActiveSection: (section: MobileMenuSection) => void;
  toggleSection: (section: MobileMenuSection) => void;

  openSearchOverlay: () => void;
  closeSearchOverlay: () => void;

  setScrolling: (isScrolling: boolean) => void;
  setScrollPosition: (position: number) => void;

  // Reset all mobile state
  reset: () => void;
}

const initialState = {
  isDrawerOpen: false,
  activeSection: null,
  isSearchOverlayOpen: false,
  isScrolling: false,
  lastScrollPosition: 0,
};

export const useMobileStore = create<MobileState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Drawer actions
        openDrawer: () => {
          set({ isDrawerOpen: true }, false, 'mobile/openDrawer');
          // Prevent body scroll when drawer is open
          document.body.style.overflow = 'hidden';
        },

        closeDrawer: () => {
          set({ isDrawerOpen: false, activeSection: null }, false, 'mobile/closeDrawer');
          // Restore body scroll
          document.body.style.overflow = '';
        },

        toggleDrawer: () => {
          const { isDrawerOpen } = get();
          if (isDrawerOpen) {
            get().closeDrawer();
          } else {
            get().openDrawer();
          }
        },

        // Section accordion actions
        setActiveSection: (section) => {
          set({ activeSection: section }, false, 'mobile/setActiveSection');
        },

        toggleSection: (section) => {
          const { activeSection } = get();
          set(
            { activeSection: activeSection === section ? null : section },
            false,
            'mobile/toggleSection'
          );
        },

        // Search overlay actions
        openSearchOverlay: () => {
          set({ isSearchOverlayOpen: true }, false, 'mobile/openSearchOverlay');
          document.body.style.overflow = 'hidden';
        },

        closeSearchOverlay: () => {
          set({ isSearchOverlayOpen: false }, false, 'mobile/closeSearchOverlay');
          document.body.style.overflow = '';
        },

        // Scroll state actions
        setScrolling: (isScrolling) => {
          set({ isScrolling }, false, 'mobile/setScrolling');
        },

        setScrollPosition: (position) => {
          set({ lastScrollPosition: position }, false, 'mobile/setScrollPosition');
        },

        // Reset
        reset: () => {
          set(initialState, false, 'mobile/reset');
          document.body.style.overflow = '';
        },
      }),
      {
        name: 'mobile-storage',
        // Only persist activeSection for better UX
        partialize: (state) => ({
          activeSection: state.activeSection,
        }),
      }
    ),
    { name: 'MobileStore' }
  )
);

// Selector hooks for optimized re-renders
export const useMobileDrawerOpen = () => useMobileStore((state) => state.isDrawerOpen);
export const useMobileActiveSection = () => useMobileStore((state) => state.activeSection);
export const useMobileSearchOverlay = () => useMobileStore((state) => state.isSearchOverlayOpen);
