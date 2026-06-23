<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ROUTES } from '@/lib/routes'
import { useClients } from '@/composables/useClients'
import { useCertificates } from '@/composables/useCertificates'
import { formatCost } from '@/lib/format'
import type { DashboardStats, RecentCertificate } from '@/types'

const { getClientsCount } = useClients()
const { getCertificatesCount, getExpiringCount, getRecentCertificates } = useCertificates()

const stats = ref<DashboardStats>({
  clientsCount: 0,
  certificatesCount: 0,
  expiringCount: 0,
})
const recentCertificates = ref<RecentCertificate[]>([])
const loading = ref(true)
const recentError = ref<string | null>(null)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  try {
    const [clientsCount, certificatesCount, expiringCount, recent] = await Promise.all([
      getClientsCount(),
      getCertificatesCount(),
      getExpiringCount(90),
      getRecentCertificates(10),
    ])
    stats.value = { clientsCount, certificatesCount, expiringCount }
    recentCertificates.value = recent
  } catch (e) {
    recentError.value = e instanceof Error ? e.message : 'Błąd pobierania listy'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppShell>
    <div class="space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold">Panel główny</h1>
          <p class="text-sm text-brand-black/70 mt-1">
            Zarządzanie klientami i certyfikatami energetycznymi
          </p>
        </div>
        <RouterLink :to="ROUTES.clientNew">
          <BaseButton>Nowy klient</BaseButton>
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="border border-brand-black bg-brand-white p-6">
          <p class="text-sm text-brand-black/70">Klienci</p>
          <p class="text-3xl font-semibold mt-2">
            {{ loading ? '—' : stats.clientsCount }}
          </p>
        </div>
        <div class="border border-brand-black bg-brand-white p-6">
          <p class="text-sm text-brand-black/70">Certyfikaty</p>
          <p class="text-3xl font-semibold mt-2">
            {{ loading ? '—' : stats.certificatesCount }}
          </p>
        </div>
        <div class="border border-brand-black bg-brand-white p-6">
          <p class="text-sm text-brand-black/70">Wygasające (90 dni)</p>
          <p
            class="text-3xl font-semibold mt-2"
            :class="stats.expiringCount > 0 ? 'text-amber-700' : ''"
          >
            {{ loading ? '—' : stats.expiringCount }}
          </p>
        </div>
      </div>

      <div class="border border-brand-black bg-brand-white">
        <div class="px-6 py-4 border-b border-brand-black">
          <h2 class="font-semibold">Ostatnie świadectwa charakterystyki energetycznej</h2>
          <p class="text-sm text-brand-black/70 mt-1">
            Najnowsze certyfikaty według daty utworzenia
          </p>
        </div>

        <p v-if="loading" class="px-6 py-8 text-sm text-brand-black/60">Ładowanie...</p>
        <p v-else-if="recentError" class="px-6 py-8 text-sm text-red-600">{{ recentError }}</p>
        <p
          v-else-if="recentCertificates.length === 0"
          class="px-6 py-8 text-sm text-brand-black/60 text-center"
        >
          Brak certyfikatów. Dodaj pierwszy certyfikat u klienta.
        </p>

        <template v-else>
          <div class="md:hidden divide-y divide-brand-black/20">
            <RouterLink
              v-for="cert in recentCertificates"
              :key="cert.id"
              :to="ROUTES.client(cert.client_id)"
              class="block px-6 py-4 hover:bg-brand-gray transition-colors"
            >
              <p class="font-medium">{{ cert.client_name }}</p>
              <p class="text-sm text-brand-black/70 mt-1">{{ cert.address ?? '—' }}</p>
              <p class="text-sm mt-1">{{ formatCost(cert.cost) }}</p>
              <p class="text-xs text-brand-black/50 mt-2">{{ formatDate(cert.created_at) }}</p>
            </RouterLink>
          </div>

          <div class="hidden md:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-brand-black bg-brand-gray">
                  <th class="text-left px-6 py-3 font-semibold">Data utworzenia</th>
                  <th class="text-left px-6 py-3 font-semibold">Imię i nazwisko</th>
                  <th class="text-left px-6 py-3 font-semibold">Adres</th>
                  <th class="text-left px-6 py-3 font-semibold">Koszt</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="cert in recentCertificates"
                  :key="cert.id"
                  class="border-b border-brand-black/20 hover:bg-brand-gray transition-colors"
                >
                  <td class="px-6 py-3 text-brand-black/80 whitespace-nowrap">
                    {{ formatDate(cert.created_at) }}
                  </td>
                  <td class="px-6 py-3">
                    <RouterLink
                      :to="ROUTES.client(cert.client_id)"
                      class="font-medium hover:underline"
                    >
                      {{ cert.client_name }}
                    </RouterLink>
                  </td>
                  <td class="px-6 py-3">{{ cert.address ?? '—' }}</td>
                  <td class="px-6 py-3 whitespace-nowrap">{{ formatCost(cert.cost) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <div class="border border-brand-black bg-brand-white p-6">
        <h2 class="font-semibold mb-4">Szybkie akcje</h2>
        <div class="flex flex-col sm:flex-row flex-wrap gap-3">
          <RouterLink :to="ROUTES.clients">
            <BaseButton variant="secondary">Przeglądaj klientów</BaseButton>
          </RouterLink>
          <RouterLink :to="ROUTES.earnings">
            <BaseButton variant="secondary">Podsumowanie zarobków</BaseButton>
          </RouterLink>
          <RouterLink :to="ROUTES.clientNew">
            <BaseButton>Dodaj klienta</BaseButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </AppShell>
</template>
