import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthState {
  isAuthenticated: boolean
  phoneNumber: string | null
  userId: string | null
  isPINSet: boolean
  login: (phone: string) => void
  setAuthenticated: (isAuth: boolean, userId: string) => void
  setPINSet: (isPINSet: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      phoneNumber: null,
      userId: null,
      isPINSet: false,

      login: (phone: string) => {
        set({ phoneNumber: phone })
        console.log('[v0] User logged in with phone:', phone)
      },

      setAuthenticated: (isAuth: boolean, userId: string) => {
        set({ isAuthenticated: isAuth, userId })
        console.log('[v0] Authentication state updated:', isAuth)
      },

      setPINSet: (isPINSet: boolean) => {
        set({ isPINSet })
        console.log('[v0] PIN set:', isPINSet)
      },

      logout: () => {
        set({
          isAuthenticated: false,
          phoneNumber: null,
          userId: null,
          isPINSet: false,
        })
        console.log('[v0] User logged out')
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)
