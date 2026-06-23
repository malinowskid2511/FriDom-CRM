<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Client } from '@/types'
import { ROUTES } from '@/lib/routes'

defineProps<{
  client: Client
}>()
</script>

<template>
  <RouterLink
    :to="ROUTES.client(client.id)"
    class="block border border-brand-black bg-brand-white p-4 hover:bg-brand-gray transition-colors"
  >
    <h3 class="font-semibold text-base">{{ client.name }}</h3>
    <div class="mt-2 space-y-1 text-sm text-brand-black/70">
      <p v-if="client.phone">{{ client.phone }}</p>
      <p v-if="client.email">{{ client.email }}</p>
      <p v-if="!client.phone && !client.email" class="italic">Brak danych kontaktowych</p>
    </div>
  </RouterLink>
</template>
