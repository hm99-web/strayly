import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
  session: Session | null;
  /** False until the persisted session has been loaded on startup. */
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  initialized: false,
  setSession: (session) => set({ session }),
  setInitialized: () => set({ initialized: true }),
}));
