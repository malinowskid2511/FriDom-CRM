<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Building, BuildingMaterialFormData } from '@/types'
import { BUILDING_MATERIAL_PRESETS } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import FileUpload from '@/components/ui/FileUpload.vue'
import {
  BUILDING_MATERIAL_ACCEPT,
  validateBuildingMaterialFile,
} from '@/lib/file-upload'

const props = defineProps<{
  open: boolean
  building: Building | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: BuildingMaterialFormData, file: File]
}>()

const preset = ref('')
const customTitle = ref('')
const form = ref<BuildingMaterialFormData>({ title: '', notes: '' })
const file = ref<File | null>(null)
const saving = ref(false)

const resolvedTitle = computed(() => {
  if (preset.value === 'custom') return customTitle.value.trim()
  return preset.value
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    preset.value = ''
    customTitle.value = ''
    form.value = { title: '', notes: '' }
    file.value = null
    saving.value = false
  },
)

function handleSubmit() {
  const title = resolvedTitle.value
  if (!title || !file.value) return
  saving.value = true
  emit('save', { title, notes: form.value.notes }, file.value)
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="building ? `Dodaj materiał — ${building.address}` : 'Dodaj materiał'"
    @close="$emit('close')"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <BaseSelect id="material-preset" v-model="preset" label="Rodzaj materiału">
        <option value="">— Wybierz —</option>
        <option v-for="item in BUILDING_MATERIAL_PRESETS" :key="item" :value="item">
          {{ item }}
        </option>
        <option value="custom">Inne (wpisz własne)</option>
      </BaseSelect>

      <BaseInput
        v-if="preset === 'custom'"
        id="material-custom-title"
        v-model="customTitle"
        label="Nazwa materiału"
        placeholder="np. Protokół odbioru"
        required
      />

      <BaseTextarea id="material-notes" v-model="form.notes" label="Notatki (opcjonalnie)" />

      <div>
        <p class="text-sm font-medium mb-2">Plik <span class="text-red-600">*</span></p>
        <FileUpload
          v-model="file"
          :accept="BUILDING_MATERIAL_ACCEPT"
          hint="PDF, JPG, PNG, WEBP, DOC, DOCX — maks. 10 MB"
          :validate="validateBuildingMaterialFile"
        />
      </div>

      <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <BaseButton type="button" variant="secondary" class="flex-1" @click="$emit('close')">
          Anuluj
        </BaseButton>
        <BaseButton
          type="submit"
          class="flex-1"
          :disabled="!preset || (preset === 'custom' && !customTitle.trim()) || !file || saving"
        >
          {{ saving ? 'Zapisywanie...' : 'Dodaj materiał' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
