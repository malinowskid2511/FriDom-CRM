<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Certificate } from '@/types'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  open: boolean
  certificate: Certificate | null
}>()

const emit = defineEmits<{
  close: []
  save: [cost: string]
}>()

const cost = ref('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen || !props.certificate) return
    cost.value = props.certificate.cost != null ? String(props.certificate.cost) : ''
  },
)

function handleSubmit() {
  emit('save', cost.value)
}
</script>

<template>
  <BaseModal :open="open" title="Koszt świadectwa" @close="$emit('close')">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <p v-if="certificate" class="text-sm text-brand-black/70">
        {{ certificate.certificate_number ?? 'Certyfikat' }}
      </p>
      <BaseInput
        id="cert-cost-edit"
        v-model="cost"
        label="Koszt (PLN)"
        type="number"
        placeholder="np. 450"
        step="0.01"
        min="0"
      />
      <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <BaseButton type="button" variant="secondary" class="flex-1" @click="$emit('close')">
          Anuluj
        </BaseButton>
        <BaseButton type="submit" class="flex-1">Zapisz</BaseButton>
      </div>
    </form>
  </BaseModal>
</template>
