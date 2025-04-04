import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: {
        username: '',
        role: '',
        mode: '',
      },
      setUser: (userData) => set({ user: userData }),
      clearUser: () =>
        set({
          user: {
            username: '',
            role: '',
            mode: '',
          },
        }),
    }),
    {
      name: 'auth-store', // key used in localStorage
    }
  )
);

export default useAuthStore;
