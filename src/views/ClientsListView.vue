<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { ROUTES } from '@/lib/routes'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ClientsTable from '@/components/clients/ClientsTable.vue'
import ClientCard from '@/components/clients/ClientCard.vue'
import { useClients } from '@/composables/useClients'

const { clients, loading, error, fetchClients } = useClients()
const search = ref('')

let debounceTimer: ReturnType<typeof setTimeout>

watch(search, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchClients(search.value), 300)
})

onMounted(() => fetchClients())
</script>

<template>
  <AppShell>
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Klienci</h1>
          <p class="text-sm text-brand-black/70 mt-1">
            Lista klientów i ich budynków
          </p>
        </div>
        <RouterLink :to="ROUTES.clientNew">
          <BaseButton>Nowy klient</BaseButton>
        </RouterLink>
      </div>

      <BaseInput
        id="client-search"
        v-model="search"
        placeholder="Szukaj po nazwie, e-mailu, telefonie lub adresie..."
      />

      <p v-if="loading" class="text-sm text-brand-black/60">Ładowanie...</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="clients.length === 0" class="text-sm text-brand-black/60 border border-dashed border-brand-black/30 p-8 text-center">
        {{ search ? 'Brak wyników wyszukiwania.' : 'Brak klientów. Dodaj pierwszego klienta.' }}
      </p>

      <template v-else>
        <ClientsTable :clients="clients" />
        <div class="md:hidden grid gap-3">
          <ClientCard v-for="client in clients" :key="client.id" :client="client" />
        </div>
      </template>
    </div>
  </AppShell>
</template>
