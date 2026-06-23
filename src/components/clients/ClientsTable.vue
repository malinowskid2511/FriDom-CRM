<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Client } from '@/types'
import { ROUTES } from '@/lib/routes'

defineProps<{
  clients: Client[]
}>()
</script>

<template>
  <div class="hidden md:block border border-brand-black bg-brand-white overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b border-brand-black bg-brand-gray">
          <th class="text-left px-4 py-3 font-semibold">Nazwa</th>
          <th class="text-left px-4 py-3 font-semibold">Telefon</th>
          <th class="text-left px-4 py-3 font-semibold">E-mail</th>
          <th class="text-left px-4 py-3 font-semibold">Aktualizacja</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="client in clients"
          :key="client.id"
          class="border-b border-brand-black/20 hover:bg-brand-gray transition-colors"
        >
          <td class="px-4 py-3">
            <RouterLink :to="ROUTES.client(client.id)" class="font-medium hover:underline">
              {{ client.name }}
            </RouterLink>
          </td>
          <td class="px-4 py-3">{{ client.phone ?? '—' }}</td>
          <td class="px-4 py-3">{{ client.email ?? '—' }}</td>
          <td class="px-4 py-3 text-brand-black/60">
            {{ new Date(client.updated_at).toLocaleDateString('pl-PL') }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
