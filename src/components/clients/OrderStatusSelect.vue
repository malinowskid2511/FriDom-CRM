<script setup lang="ts">
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types'
import BaseSelect from '@/components/ui/BaseSelect.vue'

defineProps<{
  modelValue: OrderStatus
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: OrderStatus]
}>()

const options: OrderStatus[] = ['waiting_for_data', 'in_progress', 'ready']
</script>

<template>
  <BaseSelect
    id="order-status"
    :model-value="modelValue"
    label="Status zlecenia"
    :disabled="disabled"
    @update:model-value="$emit('update:modelValue', $event as OrderStatus)"
  >
    <option v-for="status in options" :key="status" :value="status">
      {{ ORDER_STATUS_LABELS[status] }}
    </option>
  </BaseSelect>
</template>
