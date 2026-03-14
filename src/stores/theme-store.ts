import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        isDark: true,
        toggleTheme: () => set((state) => ({ isDark: !state.isDark }), false, 'toggleTheme'),
      }),
      { name: 'vladi-theme' },
    ),
    { name: 'ThemeStore' },
  ),
);
