import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProfileState, UserProfile } from './types';

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updatePreferences: (preferences) =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                preferences: {
                  ...state.profile.preferences,
                  ...preferences,
                },
              }
            : null,
        })),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'user-profile',
    }
  )
);