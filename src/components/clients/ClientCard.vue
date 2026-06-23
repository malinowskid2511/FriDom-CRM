<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Client } from '@/types'
import { ROUTES } from '@/lib/routes'
import OrderStatusBadge from '@/components/clients/OrderStatusBadge.vue'

defineProps<{
  client: Client
}>()
</script>

<template>
  <RouterLink
    :to="ROUTES.client(client.id)"
    class="block border border-brand-black bg-brand-white p-4 hover:bg-brand-gray transition-colors"
  >
    <div class="flex items-start justify-between gap-3">
      <h3 class="font-semibold text-base">{{ client.name }}</h3>
      <OrderStatusBadge :status="client.order_status" />
    </div>
    <div class="mt-2 space-y-1 text-sm text-brand-black/70">
      <p v-if="client.phone">{{ client.phone }}</p>
      <p v-if="client.email">{{ client.email }}</p>
      <p v-if="!client.phone && !client.email" class="italic">Brak danych kontaktowych</p>
    </div>
  </RouterLink>
</template>
