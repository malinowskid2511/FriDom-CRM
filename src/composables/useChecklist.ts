import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoMode } from '@/lib/config'
import { demoStore } from '@/lib/demo-store'
import { logActivity } from '@/lib/activity-log'
import { defaultChecklistTitles } from '@/lib/checklist-defaults'
import type { ChecklistItem } from '@/types'

export function useChecklist() {
  const items = ref<ChecklistItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchChecklist(clientId: string) {
    loading.value = true
    error.value = null
    try {
      if (demoMode) {
        items.value = await demoStore.getChecklistItems(clientId)
      } else {
        const { data, error: fetchError } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('client_id', clientId)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true })
        if (fetchError) throw fetchError
        items.value = (data ?? []) as ChecklistItem[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd pobierania checklisty'
    } finally {
      loading.value = false
    }
  }

  async function createDefaultChecklist(
    clientId: string,
    buildingId: string,
    userId?: string | null,
  ) {
    if (demoMode) {
      return demoStore.createDefaultChecklist(clientId, buildingId, userId)
    }

    const rows = defaultChecklistTitles().map((title, index) => ({
      building_id: buildingId,
      client_id: clientId,
      title,
      sort_order: index,
    }))

    const { data, error: insertError } = await supabase
      .from('checklist_items')
      .insert(rows)
      .select()

    if (insertError) throw new Error(insertError.message)

    await logActivity({
      clientId,
      action: 'checklist_item_added',
      description: `Utworzono checklistę materiałów (${rows.length} pozycji)`,
      userId,
      entityId: buildingId,
    })

    return (data ?? []) as ChecklistItem[]
  }

  async function addChecklistItem(
    clientId: string,
    buildingId: string,
    title: string,
    userId?: string | null,
  ) {
    const trimmed = title.trim()
    if (!trimmed) throw new Error('Podaj nazwę pozycji')

    if (demoMode) {
      return demoStore.addChecklistItem(clientId, buildingId, trimmed, userId)
    }

    const maxOrder =
      items.value
        .filter((item) => item.building_id === buildingId)
        .reduce((max, item) => Math.max(max, item.sort_order), -1) + 1

    const { data, error: insertError } = await supabase
      .from('checklist_items')
      .insert({
        building_id: buildingId,
        client_id: clientId,
        title: trimmed,
        sort_order: maxOrder,
      })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)

    await logActivity({
      clientId,
      action: 'checklist_item_added',
      description: `Dodano pozycję checklisty: „${trimmed}"`,
      userId,
      entityId: data.id,
    })

    return data as ChecklistItem
  }

  async function toggleChecklistItem(
    item: ChecklistItem,
    userId?: string | null,
  ) {
    const nextDone = !item.is_done

    if (demoMode) {
      return demoStore.toggleChecklistItem(item.id, nextDone, userId)
    }

    const { data, error: updateError } = await supabase
      .from('checklist_items')
      .update({ is_done: nextDone })
      .eq('id', item.id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)

    await logActivity({
      clientId: item.client_id,
      action: 'checklist_item_toggled',
      description: nextDone
        ? `Oznaczono jako dostarczone: „${item.title}"`
        : `Cofnięto dostarczenie: „${item.title}"`,
      userId,
      entityId: item.id,
    })

    return data as ChecklistItem
  }

  async function deleteChecklistItem(item: ChecklistItem) {
    if (demoMode) return demoStore.deleteChecklistItem(item.id)

    const { error: deleteError } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', item.id)

    if (deleteError) throw new Error(deleteError.message)
  }

  return {
    items,
    loading,
    error,
    fetchChecklist,
    createDefaultChecklist,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  }
}
