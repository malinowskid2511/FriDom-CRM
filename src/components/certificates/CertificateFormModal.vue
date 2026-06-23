<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Building, CertificateFormData } from '@/types'
import { ENERGY_CLASSES } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PdfUpload from '@/components/certificates/PdfUpload.vue'

const props = defineProps<{
  open: boolean
  buildings: Building[]
}>()

const emit = defineEmits<{
  close: []
  save: [data: CertificateFormData, file: File]
}>()

const form = ref<CertificateFormData>({
  building_id: '',
  certificate_number: '',
  issue_date: '',
  expiry_date: '',
  energy_class: '',
  cost: '',
  notes: '',
})

const file = ref<File | null>(null)
const saving = ref(false)

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    form.value = {
      building_id: '',
      certificate_number: '',
      issue_date: '',
      expiry_date: '',
      energy_class: '',
      cost: '',
      notes: '',
    }
    file.value = null
    saving.value = false
  },
)

function handleSubmit() {
  if (!file.value) return
  saving.value = true
  emit('save', { ...form.value }, file.value)
}
</script>

<template>
  <BaseModal :open="open" title="Dodaj certyfikat energetyczny" @close="$emit('close')">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <BaseSelect id="cert-building" v-model="form.building_id" label="Budynek (opcjonalnie)">
        <option value="">— Cały klient —</option>
        <option v-for="b in buildings" :key="b.id" :value="b.id">
          {{ b.address }}
        </option>
      </BaseSelect>
      <BaseInput
        id="cert-number"
        v-model="form.certificate_number"
        label="Numer certyfikatu"
        placeholder="np. CEEB/..."
      />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput id="cert-issue" v-model="form.issue_date" label="Data wydania" type="date" />
        <BaseInput id="cert-expiry" v-model="form.expiry_date" label="Data ważności" type="date" />
      </div>
      <BaseSelect id="cert-class" v-model="form.energy_class" label="Klasa energetyczna">
        <option value="">— Wybierz —</option>
        <option v-for="cls in ENERGY_CLASSES" :key="cls" :value="cls">{{ cls }}</option>
      </BaseSelect>
      <BaseInput
        id="cert-cost"
        v-model="form.cost"
        label="Koszt (PLN)"
        type="number"
        placeholder="np. 450"
        step="0.01"
        min="0"
      />
      <BaseTextarea id="cert-notes" v-model="form.notes" label="Notatki" />
      <div>
        <p class="text-sm font-medium mb-2">Plik PDF <span class="text-red-600">*</span></p>
        <PdfUpload v-model="file" />
      </div>
      <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <BaseButton type="button" variant="secondary" class="flex-1" @click="$emit('close')">
          Anuluj
        </BaseButton>
        <BaseButton type="submit" class="flex-1" :disabled="!file || saving">
          {{ saving ? 'Zapisywanie...' : 'Dodaj certyfikat' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
