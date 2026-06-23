import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoMode } from '@/lib/config'
import { demoStore } from '@/lib/demo-store'
import { logActivity } from '@/lib/activity-log'
import { defaultChecklistTitles } from '@/lib/checklist-defaults'
import type { Building, BuildingFormData } from '@/types'

export function useBuildings() {
  const buildings = ref<Building[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBuildings(clientId: string) {
    loading.value = true
    error.value = null
    try {
      if (demoMode) {
        buildings.value = await demoStore.getBuildings(clientId)
      } else {
        const { data, error: fetchError } = await supabase
          .from('buildings')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
        if (fetchError) throw fetchError
        buildings.value = (data ?? []) as Building[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd pobierania'
    } finally {
      loading.value = false
    }
  }

  async function createBuilding(
    clientId: string,
    form: BuildingFormData,
    userId?: string | null,
  ) {
    if (demoMode) return demoStore.createBuilding(clientId, form)

    const { data, error: createError } = await supabase
      .from('buildings')
      .insert({
        client_id: clientId,
        address: form.address.trim(),
        building_type: form.building_type,
        notes: form.notes.trim() || null,
      })
      .select()
      .single()
    if (createError) throw new Error(createError.message)

    const building = data as Building
    const checklistRows = defaultChecklistTitles().map((title, index) => ({
      building_id: building.id,
      client_id: clientId,
      title,
      sort_order: index,
    }))
    await supabase.from('checklist_items').insert(checklistRows)

    await logActivity({
      clientId,
      action: 'building_added',
      description: `Dodano budynek: ${form.address.trim()}`,
      userId,
      entityId: building.id,
    })
    await logActivity({
      clientId,
      action: 'checklist_item_added',
      description: `Utworzono checklistę materiałów (${checklistRows.length} pozycji)`,
      userId,
      entityId: building.id,
    })

    return building
  }

  async function updateBuilding(
    id: string,
    form: BuildingFormData,
    clientId?: string,
    userId?: string | null,
  ) {
    if (demoMode) return demoStore.updateBuilding(id, form)
    const { data, error: updateError } = await supabase
      .from('buildings')
      .update({
        address: form.address.trim(),
        building_type: form.building_type,
        notes: form.notes.trim() || null,
      })
      .eq('id', id)
      .select()
      .single()
    if (updateError) throw new Error(updateError.message)

    if (clientId) {
      await logActivity({
        clientId,
        action: 'building_updated',
        description: `Zaktualizowano budynek: ${form.address.trim()}`,
        userId,
        entityId: id,
      })
    }

    return data as Building
  }

  async function deleteBuilding(id: string) {
    if (demoMode) return demoStore.deleteBuilding(id)
    const { error: deleteError } = await supabase.from('buildings').delete().eq('id', id)
    if (deleteError) throw new Error(deleteError.message)
  }

  return {
    buildings,
    loading,
    error,
    fetchBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
  }
}
