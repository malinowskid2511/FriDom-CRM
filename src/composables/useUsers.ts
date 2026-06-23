import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoMode } from '@/lib/config'
import { demoStore } from '@/lib/demo-store'
import type { Profile, UserRole } from '@/types'

export function useUsers() {
  const users = ref<Profile[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    loading.value = true
    error.value = null
    try {
      if (demoMode) {
        users.value = await demoStore.getUsers()
      } else {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true })
        if (fetchError) throw fetchError
        users.value = (data ?? []) as Profile[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd pobierania'
    } finally {
      loading.value = false
    }
  }

  async function updateUserRole(userId: string, role: UserRole) {
    if (demoMode) return demoStore.updateUserRole(userId, role)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
    if (updateError) throw new Error(updateError.message)
  }

  async function inviteUser(
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ) {
    if (demoMode) return demoStore.inviteUser(email, password, fullName, role)

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Brak sesji')

    const response = await fetch(`${supabaseUrl}/functions/v1/invite-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error ?? 'Błąd zaproszenia użytkownika')
    }
    return result
  }

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserRole,
    inviteUser,
  }
}
