import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoMode } from '@/lib/config'
import { demoStore } from '@/lib/demo-store'
import type { ActivityLogEntry } from '@/types'

export function useActivityLog() {
  const entries = ref<ActivityLogEntry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchActivityLog(clientId: string) {
    loading.value = true
    error.value = null
    try {
      if (demoMode) {
        entries.value = await demoStore.getActivityLog(clientId)
      } else {
        const { data, error: fetchError } = await supabase
          .from('activity_log')
          .select('*, user:profiles(full_name, email)')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
        if (fetchError) throw fetchError
        entries.value = (data ?? []).map((row) => ({
          ...(row as ActivityLogEntry),
          user: normalizeProfile(row.user),
        }))
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd pobierania aktywności'
    } finally {
      loading.value = false
    }
  }

  return {
    entries,
    loading,
    error,
    fetchActivityLog,
  }
}

function normalizeProfile(
  user: { full_name: string; email: string } | { full_name: string; email: string }[] | null,
) {
  if (!user) return null
  return Array.isArray(user) ? user[0] ?? null : user
}
