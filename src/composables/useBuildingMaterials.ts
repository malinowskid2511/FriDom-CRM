import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { demoMode } from '@/lib/config'
import { demoStore } from '@/lib/demo-store'
import { resolveMimeType, validateBuildingMaterialFile } from '@/lib/file-upload'
import { logActivity } from '@/lib/activity-log'
import type { BuildingMaterial, BuildingMaterialFormData } from '@/types'

export function useBuildingMaterials() {
  const materials = ref<BuildingMaterial[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  function forBuilding(buildingId: string) {
    return materials.value.filter((m) => m.building_id === buildingId)
  }

  async function fetchMaterials(clientId: string) {
    loading.value = true
    error.value = null
    try {
      if (demoMode) {
        materials.value = await demoStore.getBuildingMaterials(clientId)
      } else {
        const { data, error: fetchError } = await supabase
          .from('building_materials')
          .select('*')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
        if (fetchError) throw fetchError
        materials.value = (data ?? []) as BuildingMaterial[]
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Błąd pobierania materiałów'
    } finally {
      loading.value = false
    }
  }

  async function uploadMaterial(
    clientId: string,
    buildingId: string,
    form: BuildingMaterialFormData,
    file: File,
    userId: string | undefined,
  ) {
    const validationError = validateBuildingMaterialFile(file)
    if (validationError) throw new Error(validationError)

    const title = form.title.trim()
    if (!title) throw new Error('Podaj nazwę materiału')

    if (demoMode) {
      return demoStore.uploadBuildingMaterial(clientId, buildingId, form, file)
    }

    const mimeType = resolveMimeType(file)

    const { data: row, error: insertError } = await supabase
      .from('building_materials')
      .insert({
        building_id: buildingId,
        client_id: clientId,
        title,
        file_path: 'pending',
        file_name: file.name,
        mime_type: mimeType || null,
        notes: form.notes.trim() || null,
        uploaded_by: userId ?? null,
      })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)

    const material = row as BuildingMaterial
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${clientId}/${buildingId}/${material.id}/${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('building-materials')
      .upload(filePath, file, { upsert: false })

    if (uploadError) {
      await supabase.from('building_materials').delete().eq('id', material.id)
      throw new Error(uploadError.message)
    }

    const { data: updated, error: updateError } = await supabase
      .from('building_materials')
      .update({ file_path: filePath })
      .eq('id', material.id)
      .select()
      .single()

    if (updateError) {
      await supabase.storage.from('building-materials').remove([filePath])
      await supabase.from('building_materials').delete().eq('id', material.id)
      throw new Error(updateError.message)
    }

    await logActivity({
      clientId,
      action: 'material_uploaded',
      description: `Dodano materiał: ${title}`,
      userId,
      entityId: material.id,
    })

    return updated as BuildingMaterial
  }

  async function downloadMaterial(material: BuildingMaterial) {
    if (demoMode) {
      alert(`Tryb podglądu — plik „${material.file_name}” jest symulowany.`)
      return
    }

    const { data, error: downloadError } = await supabase.storage
      .from('building-materials')
      .createSignedUrl(material.file_path, 60)

    if (downloadError) throw new Error(downloadError.message)
    if (!data?.signedUrl) throw new Error('Nie udało się wygenerować linku')

    const link = document.createElement('a')
    link.href = data.signedUrl
    link.download = material.file_name
    link.target = '_blank'
    link.click()
  }

  async function deleteMaterial(material: BuildingMaterial, userId?: string | null) {
    if (demoMode) return demoStore.deleteBuildingMaterial(material.id)

    if (material.file_path && material.file_path !== 'pending') {
      await supabase.storage.from('building-materials').remove([material.file_path])
    }

    const { error: deleteError } = await supabase
      .from('building_materials')
      .delete()
      .eq('id', material.id)

    if (deleteError) throw new Error(deleteError.message)

    await logActivity({
      clientId: material.client_id,
      action: 'material_deleted',
      description: `Usunięto materiał: ${material.title}`,
      userId,
      entityId: material.id,
    })
  }

  return {
    materials,
    loading,
    error,
    forBuilding,
    fetchMaterials,
    uploadMaterial,
    downloadMaterial,
    deleteMaterial,
  }
}
