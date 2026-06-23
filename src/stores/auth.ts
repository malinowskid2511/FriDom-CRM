import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { demoMode, skipAuth } from '@/lib/config'
import type { Profile, UserRole } from '@/types'

const DEV_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@fridom.pl',
  full_name: demoMode ? 'Antonina Frieske (podgląd)' : 'Tryb bez logowania',
  role: 'admin',
  created_at: new Date().toISOString(),
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => skipAuth || !!session.value)
  const isAdmin = computed(() => skipAuth || profile.value?.role === 'admin')
  const role = computed<UserRole | null>(() =>
    skipAuth ? 'admin' : (profile.value?.role ?? null),
  )
  const fullName = computed(() =>
    skipAuth ? DEV_PROFILE.full_name : (profile.value?.full_name ?? user.value?.email ?? ''),
  )

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Błąd pobierania profilu:', error.message)
      profile.value = null
      return
    }

    profile.value = data as Profile
  }

  async function init() {
    loading.value = true

    if (skipAuth) {
      profile.value = DEV_PROFILE
      loading.value = false
      return
    }

    const { data: { session: currentSession } } = await supabase.auth.getSession()
    session.value = currentSession
    user.value = currentSession?.user ?? null

    if (currentSession?.user) {
      await fetchProfile(currentSession.user.id)
    }

    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      if (newSession?.user) {
        await fetchProfile(newSession.user.id)
      } else {
        profile.value = null
      }
    })

    loading.value = false
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) await fetchProfile(data.user.id)
    return data
  }

  async function signOut() {
    if (skipAuth) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    profile.value = null
  }

  return {
    session,
    user: computed(() => (skipAuth ? { id: DEV_PROFILE.id, email: DEV_PROFILE.email } : user.value)),
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    role,
    fullName,
    skipAuth,
    demoMode,
    init,
    signIn,
    signOut,
    fetchProfile,
  }
})
