<script setup lang="ts">
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/types'

defineProps<{
  status: OrderStatus
}>()

const badgeClass: Record<OrderStatus, string> = {
  waiting_for_data: 'border-amber-600 text-amber-800 bg-amber-50',
  in_progress: 'border-blue-600 text-blue-800 bg-blue-50',
  ready: 'border-green-700 text-green-800 bg-green-50',
}
</script>

<template>
  <span
    class="inline-block text-xs border px-2 py-0.5 font-medium whitespace-nowrap"
    :class="badgeClass[status]"
  >
    {{ ORDER_STATUS_LABELS[status] }}
  </span>
</template>
