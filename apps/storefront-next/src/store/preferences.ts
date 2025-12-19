import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GridMode = 'grid' | 'list';

interface StorefrontPrefs {
  preferredCurrency: string;
  gridMode: GridMode;
  setPreferredCurrency: (currency: string) => void;
  setGridMode: (mode: GridMode) => void;
}

export const useStorefrontPrefs = create<StorefrontPrefs>()(
  persist(
    (set) => ({
      preferredCurrency: 'USD',
      gridMode: 'grid',
      setPreferredCurrency: (currency) => set({ preferredCurrency: currency }),
      setGridMode: (mode) => set({ gridMode: mode }),
    }),
    {
      name: 'storefront-preferences',
    },
  ),
);
