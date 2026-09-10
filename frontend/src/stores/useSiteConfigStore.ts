import { create } from 'zustand';

interface SiteConfigState {
  configs: Record<string, string>;
  darkMode: boolean;
  setConfigs: (configs: Record<string, string>) => void;
  toggleDarkMode: () => void;
}

export const useSiteConfigStore = create<SiteConfigState>((set, get) => ({
  configs: {},
  darkMode: localStorage.getItem('darkMode') === 'true',
  setConfigs: (configs) => set({ configs }),
  toggleDarkMode: () => {
    const dark = !get().darkMode;
    set({ darkMode: dark });
    localStorage.setItem('darkMode', String(dark));
    document.documentElement.classList.toggle('dark', dark);
  },
}));

// Init dark mode
if (typeof window !== 'undefined') {
  document.documentElement.classList.toggle(
    'dark',
    localStorage.getItem('darkMode') === 'true'
  );
}
