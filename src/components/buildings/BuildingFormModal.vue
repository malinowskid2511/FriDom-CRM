<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Building, BuildingFormData, BuildingType } from '@/types'
import { BUILDING_TYPE_LABELS } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  open: boolean
  building?: Building | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: BuildingFormData]
}>()

const form = ref<BuildingFormData>({
  address: '',
  building_type: 'dom_jednorodzinny',
  notes: '',
})

const buildingTypes = Object.entries(BUILDING_TYPE_LABELS) as [BuildingType, string][]

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    if (props.building) {
      form.value = {
        address: props.building.address,
        building_type: props.building.building_type,
        notes: props.building.notes ?? '',
      }
    } else {
      form.value = { address: '', building_type: 'dom_jednorodzinny', notes: '' }
    }
  },
)

function handleSubmit() {
  if (!form.value.address.trim()) return
  emit('save', { ...form.value })
}
</script>

<template>
  <BaseModal
    :open="open"
    :title="building ? 'Edytuj budynek' : 'Dodaj budynek'"
    @close="$emit('close')"
  >
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <BaseInput
        id="building-address"
        v-model="form.address"
        label="Adres"
        placeholder="np. ul. Kwiatowa 12, 66-470 Kostrzyn nad Odrą"
        required
      />
      <BaseSelect id="building-type" v-model="form.building_type" label="Typ budynku" required>
        <option v-for="[value, label] in buildingTypes" :key="value" :value="value">
          {{ label }}
        </option>
      </BaseSelect>
      <BaseTextarea
        id="building-notes"
        v-model="form.notes"
        label="Notatki"
        placeholder="Opcjonalne uwagi..."
      />
      <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <BaseButton type="button" variant="secondary" class="flex-1" @click="$emit('close')">
          Anuluj
        </BaseButton>
        <BaseButton type="submit" class="flex-1">
          {{ building ? 'Zapisz' : 'Dodaj' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
