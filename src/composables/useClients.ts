import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoMode } from '@/lib/config'
import { demoStore } from '@/lib/demo-store'
import type { Client, ClientFormData } from '@/types'

export function useClients() {
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchClients(search?: string) {
    loading.value = true
    error.value = null
    try {
      if (demoMode) {
        clients.value = await demoStore.getClients(search)
      } else if (search?.trim()) {
        const term = `%${search.trim()}%`

        const [clientsRes, buildingsRes] = await Promise.all([
          supabase
            .from('clients')
            .select('*')
            .or(`name.ilike.${term},email.ilike.${term},phone.ilike.${term}`),
          supabase.from('buildings').select('client_id').ilike('address', term),
        ])

        if (clientsRes.error) throw clientsRes.error
        if (buildingsRes.error) throw buildingsRes.error

        const byId = new Map<string, Client>()
        for (const row of clientsRes.data ?? []) {
          byId.set(row.id, row as Client)
        }

        const extraIds = [
          ...new Set(
            (buildingsRes.data ?? [])
              .map((b) => b.client_id)
              .filter((id) => !byId.has(id)),
          ),
        ]

        if (extraIds.length > 0) {
          const { data: extraClients, error: extraError } = await supabase
            .from('clients')
            .select('*')
            .in('id', extraIds)
          if (extraError) throw extraError
          for (const row of extraClients ?? []) {
            byId.set(row.id, row as Client)
          }
        }

        clients.value = [...byId.values()].sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
      } else {
        const { data, error: fetchError } = await supabase
          .from('clients')
          .select('*')
          .order('updated_at', { ascending: false })
        if (fetchError) throw fetchError
        clients.value = (data ?? []) as Client[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd pobierania'
    } finally {
      loading.value = false
    }
  }

  async function fetchClient(id: string): Promise<Client | null> {
    try {
      if (demoMode) return demoStore.getClient(id)
      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError
      return data as Client
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd pobierania'
      return null
    }
  }

  async function createClient(form: ClientFormData, userId: string | undefined) {
    if (demoMode) return demoStore.createClient(form)
    const { data, error: createError } = await supabase
      .from('clients')
      .insert({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
        created_by: userId ?? null,
      })
      .select()
      .single()
    if (createError) throw new Error(createError.message)
    return data as Client
  }

  async function updateClient(id: string, form: ClientFormData) {
    if (demoMode) return demoStore.updateClient(id, form)
    const { data, error: updateError } = await supabase
      .from('clients')
      .update({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw new Error(updateError.message)
    return data as Client
  }

  async function deleteClient(id: string) {
    if (demoMode) return demoStore.deleteClient(id)
    const { error: deleteError } = await supabase.from('clients').delete().eq('id', id)
    if (deleteError) throw new Error(deleteError.message)
  }

  async function getClientsCount(): Promise<number> {
    if (demoMode) return (await demoStore.getStats()).clientsCount
    const { count, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
    if (countError) throw new Error(countError.message)
    return count ?? 0
  }

  return {
    clients,
    loading,
    error,
    fetchClients,
    fetchClient,
    createClient,
    updateClient,
    deleteClient,
    getClientsCount,
  }
}
